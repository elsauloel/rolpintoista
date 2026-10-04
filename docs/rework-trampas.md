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
- **Identidad:** daño físico (se resta la Defensa); lo propio: Sentado (caer), Sangrado (cortes), Rengo (pincharse el pie). ~~Se evita con Evasión~~ (2026-10-04: no se esquiva; se resiste el efecto).
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
| Veneno, Sangrado, Quemadura, Escarcha | **Res.Esp** (dueño: no Constitución) |
| Sueño, confusión, discordia (la cabeza) | Res.Mt |
| Maldiciones de runa, succión arcana, teleport | Res.Esp |

✅ (dueño, 2026-10-04). Cada trampa puede traer **su propio texto para cuando la resisten** (`salvacion.logra`), y el cuadro y la Crónica lo
dicen tal cual («Res.CC 8 contra 7 → lo resistió: se agarra del borde y no queda Sentado»); el cartel grande dice «¡LO RESISTIÓ!».

**Comunes cargadas (2026-10-04)** — en el catálogo, el ítem `-r2` de cada una (los «menor» y «mayor» se reemplazan cuando se definan Buena y Rara):
- **🗡 Foso con estacas** ✅: 1 casilla · solo quien lo pisa · no se esquiva · 3d6 (menos su Defensa) · Sentado (hasta que se pare) · **Res.CC 7**
  resiste caer: «se agarra del borde y no queda Sentado» (el daño entra igual) · detectarla 8 · 30.
- **🪤 Trampa de oso** ✅: 1 casilla · solo quien la pisa · no se esquiva ni se resiste (el cepo agarra) · 2d6 (menos su Defensa) · **Inmovilizado
  1 turno** · 🔓 Soltarse: Fuerza 6, 2 No2 · detectarla 8 · 30. **Mejor calidad = más daño y más turnos** (dueño).

El daño de las dos queda provisorio hasta revisar el catalogo defensivo.

## Las 39 trampas reimaginadas (2026-10-04, pedido del dueño: «reimaginá todas y reemplazalas; ninguna de más de 7 casilleros; después las audito»)

Reemplazan a las 72 de antes (24 × menor/normal/mayor). Común / Buena / Rara por **calidad**, no por tamaño: la dificultad sube 7 → 9 → 11 y la detección 8 → 10 → 12. Casi ninguna se esquiva: se **resiste el efecto** (tabla de arriba); la excepción son las explosivas (Evasión: se tira al piso, la mitad). Lo de área tiene fuego amigo. **Pendiente de auditar por el dueño.** Después: regenerar desde acá el catálogo de trampas del mapa (`comun/trampas-base.js`), el menú «trampa conocida» y las trampas de las habilidades de creep.

**Nombres (dueño, 2026-10-04):** la ventana del centro, paso a paso, es **el Anuncio**; la esquina, **la Crónica**. Cada efecto de una trampa tiene su momento en el Anuncio (lo que le deja, lo que va a mano, el muro, la nube: «▶ Seguir»).

**Pilar / muro con alguien encima:** sale despedido a una vecina libre (tira 1d6: las 6 vecinas en ronda, la 1 hacia el frente; si está ocupada, la siguiente libre) y recibe 1d6 directo. Sin vecina libre, ahí no sale.

| Trampa · calidad · precio | Qué hace |
|---|---|
| **Foso con estacas** · C · 30 | 1 casilla. 3d6 de daño (menos su Defensa) y Sentado. Res.CC contra 7: se agarra del borde y no queda Sentado. Detectarla 8. |
| **Piso de púas** · B · 50 | flor de 7 → a todos encima. 3d6 de daño (menos su Defensa) y Rengo 2 turnos. Res.CC contra 9: pisa entre las púas sin clavarse el pie. Detectarla 10. |
| **Cuchillas de guadaña** · R · 90 | línea de 5 → a todos encima. 5d6 de daño (menos su Defensa) y Sangrado. Res.Esp contra 11: el corte no abre la herida y no sangra. Detectarla 12. |
| **Trampa de oso** · C · 30 | 1 casilla. 2d6 de daño (menos su Defensa) y Inmovilizado 1 turno. No se esquiva ni se resiste. Para salir antes: 🔓 Soltarse, Fuerza contra 6 · 2 No2. Detectarla 8. |
| **Cepo reforzado** · B · 50 | 1 casilla. 3d6 de daño (menos su Defensa) y Inmovilizado 2 turnos. No se esquiva ni se resiste. Para salir antes: 🔓 Soltarse, Fuerza contra 8 · 2 No2. Detectarla 10. |
| **Cepo de dientes de sierra** · R · 85 | 1 casilla. 4d6 de daño (menos su Defensa) y Inmovilizado 3 turnos. No se esquiva ni se resiste. Para salir antes: 🔓 Soltarse, Fuerza contra 10 · 2 No2. Detectarla 12. |
| **Red de caza** · C · 25 | 1 casilla → alcanza 7 alrededor. Inmovilizado 1 turno. Res.CC contra 7: se escurre antes de que la red caiga. Para salir antes: 🔓 Soltarse, Fuerza contra 6 · 1 No2. Detectarla 8. |
| **Arena movediza** · B · 45 | flor de 7 → a todos encima. Inmovilizado **1 turno**. No se esquiva ni se resiste. 🔓 Soltarse: Fuerza contra 8 · 1 No2; **si falla, se hunde más: +1 turno** (dueño, 2026-10-04: como en los dibujitos de los 80 y 90, si te resistís en la arena movediza te hundís más rápido; `soltar.hunde`, `Combatiente.hundirSiFalla`, vale para personajes, invocaciones y creeps). Detectarla 10. |
| **Aceite resbaladizo** · C · 20 | flor de 7 → a todos encima. Sentado. Res.CC contra 7: mantiene el equilibrio y no se cae. Detectarla 8. |
| **Brea pegajosa** · C · 20 | flor de 7 → a todos encima. Rengo 2 turnos. Res.CC contra 7: despega los pies a tiempo. Detectarla 8. |
| **Cola de carpintero** · B · 45 | flor de 7 → a todos encima. Inmovilizado 1 turno. Res.CC contra 9: arranca los pies antes de que fragüe. Para salir antes: 🔓 Soltarse, Fuerza contra 8 · 1 No2. Detectarla 10. |
| **Resina de árbol negro** · R · 75 | flor de 7 → a todos encima. Inmovilizado 2 turnos. Res.CC contra 11: arranca los pies antes de que la resina lo atrape. Para salir antes: 🔓 Soltarse, Fuerza contra 10 · 2 No2. Detectarla 12. |
| **Dardos envenenados** · C · 30 | línea de 3. 1d6 de daño (menos su Defensa) y Veneno ×3. Res.Esp contra 7: el dardo pega, pero el veneno no entra. Detectarla 8. |
| **Aguja emponzoñada** · B · 50 | 1 casilla. 1d6 de daño (menos su Defensa) y Veneno ×5. Res.Esp contra 9: la aguja pincha, pero el veneno no hace efecto. Detectarla 10. |
| **Espina de mantícora** · R · 85 | 1 casilla. 2d6 de daño (menos su Defensa) y Veneno severo. Res.Esp contra 11: el cuerpo rechaza el veneno. Detectarla 12. |
| **Gas adormecedor** · C · 30 | 1 casilla → alcanza 7 alrededor. Cansado 2 turnos. Res.Mt contra 7: se sacude el sopor. Detectarla 8. |
| **Gas somnífero** · B · 50 | 1 casilla → alcanza 7 alrededor. Exhausto 2 turnos. Res.Mt contra 9: aguanta despierto. Detectarla 10. |
| **Nube de veneno** · B · 55 | flor de 7 → a todos encima. Veneno ×3. Res.Esp contra 9: aguanta la respiración y el veneno no entra. Queda como nube 2 turnos. Detectarla 10. |
| **Bomba de esporas** · R · 90 | flor de 7 → a todos encima. 2d6 de daño directo a la vida y Veneno ×4. Res.Esp contra 11: aguanta la respiración y las esporas no prenden. Queda como nube 3 turnos. Detectarla 12. |
| **Petardo trampa** · C · 30 | 1 casilla → alcanza 7 alrededor. 2d6 de daño directo a la vida. Evasión contra 7: se tira al piso: recibe la mitad del daño. Detectarla 8. |
| **Mina explosiva** · B · 55 | 1 casilla → alcanza 7 alrededor. 3d6 de daño directo a la vida y Pajaritos 2 turnos. Evasión contra 9: se tira al piso: recibe la mitad del daño. Detectarla 10. |
| **Barril de pólvora** · R · 90 | 1 casilla → alcanza 7 alrededor. 5d6 de daño directo a la vida y Pajaritos 3 turnos. Evasión contra 11: se tira al piso: recibe la mitad del daño. Detectarla 12. |
| **Derrumbe** · B · 60 | 1 casilla → alcanza 7 alrededor. 3d6 de daño (menos su Defensa) y Sentado. Res.CC contra 9: aguanta el golpe de pie. Detectarla 10. |
| **Llamarada** · C · 30 | 1 casilla. 2d6 de daño directo a la vida y Quemadura (1 de daño por turno) 2 turnos. Res.Esp contra 7: apaga las llamas de la ropa a tiempo. Detectarla 8. |
| **Trampa de escarcha** · C · 30 | 1 casilla. 2d6 de daño directo a la vida y Escarcha 2 turnos. Res.Esp contra 7: se sacude la escarcha. Detectarla 8. |
| **Descarga eléctrica** · B · 55 | 1 casilla → alcanza 7 alrededor. 3d6 de daño directo a la vida y Stun 1 turno. Res.CC contra 9: los músculos aguantan la descarga. Detectarla 10. |
| **Géiser de fuego** · R · 90 | 1 casilla → alcanza 7 alrededor. 4d6 de daño directo a la vida y Quemadura (2 de daño por turno) 3 turnos. Res.Esp contra 11: apaga las llamas de la ropa a tiempo. Detectarla 12. |
| **Tumba de hielo** · R · 85 | 1 casilla. 3d6 de daño directo a la vida y Inmovilizado 2 turnos. Res.CC contra 11: rompe el hielo antes de que lo cierre. Para salir antes: 🔓 Soltarse, Fuerza contra 10 · 2 No2. Detectarla 12. |
| **Runa de debilidad** · C · 30 | 1 casilla. Debilidad (-1 PdG, -1 Evasión, -1 Dmg) 2 turnos. Res.Esp contra 7: la runa se apaga sin tocarlo. Detectarla 8. |
| **Runa de silencio** · B · 50 | 1 casilla. Silencio 1 turno. Res.Esp contra 9: la runa no le cierra la boca. No puede usar habilidades con SP mientras dure (a mano). Detectarla 10. |
| **Succión arcana** · B · 50 | 1 casilla. Res.Esp contra 9: la runa no le saca nada. Pierde 2d6 de SP si no la resiste (a mano). Detectarla 10. |
| **Niebla de confusión** · B · 55 | 1 casilla → alcanza 7 alrededor. Confusión 2 turnos. Res.Mt contra 9: no se deja confundir. Antes de cada acción tira 1d4: 1 elige el GM, 2 pierde la acción, 3 al azar, 4 normal (a mano). Detectarla 10. |
| **Espejo de discordia** · R · 85 | 1 casilla → alcanza 7 alrededor. Pajaritos 2 turnos. Res.Mt contra 11: no se deja engañar por el espejo. Ve a sus aliados como enemigos hasta su próximo turno (a mano). Detectarla 12. |
| **Portal cósmico** · R · 90 | 1 casilla. Pajaritos 1 turno. Res.Esp contra 11: se aferra al suelo y el portal no lo lleva. Lo teletransporta hasta 10 casillas, adonde elija el GM (a mano). Detectarla 12. |
| **Cable de alarma** · C · 15 | línea de 5. Suena: alerta a los enemigos a 8 casillas (a mano). Detectarla 8. |
| **Cable con campanas** · B · 30 | línea de 7. Sentado. Res.CC contra 9: salta el cable sin caerse. Suena: alerta a los enemigos a 8 casillas (a mano). Detectarla 10. |
| **Pilar de piedra** · C · 20 | 1 casilla. Levanta un pilar justo delante de quien la pisa, por 4 turnos. Detectarla 8. |
| **Muro de piedra** · B · 45 | 1 casilla. Levanta un muro de 3 casillas justo delante de quien la pisa, por 4 turnos. Detectarla 10. |
| **Muralla repentina** · R · 75 | 1 casilla. Levanta un muro de 5 casillas justo delante de quien la pisa, por 5 turnos. Detectarla 12. |
