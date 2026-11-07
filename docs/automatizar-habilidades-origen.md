# Automatizar las habilidades de «El origen de las especies» (hoja de ruta, desde 2026-10-02)

Pedido del dueño (GM de la partida): repasar una por una las habilidades de los personajes (todos menos **Estrella culona**,
que es su personaje de prueba) y dejarlas automatizadas; donde haya un obstáculo, resolverlo o dejar un puente a mano (✋).
**Regla de trabajo:** antes de cambiar una habilidad se muestra cómo está cargada y se acuerda; recién con el OK del dueño se
cambia. Se escribe en la partida real (`1Fag8T0EDUsYiUdm136T`) con la cuenta del dueño (elsaulo, GM), parte
`fichas/<id>/partes/habilidades`, con una transacción que solo toca la habilidad acordada.

| Personaje | Habilidad | Estado |
|---|---|---|
| Bizzante | Invocar Abeja | ⏸ **En espera: el dueño lo ve con Seba.** Propuesta: ✨ con la opción nueva «Invoca» (ya construida, ver abajo). Dudas: la habilidad «Cansar» de las abejas (no está en la lista del texto), borrar «Abeja (copia)», qué es «Elije 1 stat que sea INT». |
| Bizzante | Robar SP | ⏸ **En espera (Seba).** Propuesta: ataque con arreglos + «+2 SP por crítico» (no existe un efecto «al hacer crítico»: falta construirlo; puente ✋ mientras). Duda: ¿cada crítico o uno por ataque? |
| Petro EskanderSon | Blindaje | ✅ 2026-10-02: modo ✨ fijo, costo en turno ajeno 2 SP (el cartelito pregunta y cobra), texto sin «pagá a mano», sacado el estado viejo «Barrera» repetido (queda el de la Ejecución: escudo 8, 1 turno). *(El «⚡ Flash» de la Ejecución es sumar a una tirada, no sirve para un escudo.)* |
| Petro EskanderSon | Shockwave | ✅ 2026-10-02: revisada con el dueño (Pajaritos **2 turnos** está bien); modo ✨ fijo, sin «(Sin auditar)», el texto aclara el costo en turno ajeno (8). |
| Aurelius Risus | Invi | ⏭ Salteada por el dueño (2026-10-02). Le falta el SP (el texto dice 5); duda abierta: ¿«invisible» = el Sigilo del mapa? |
| Aurelius Risus | Backstab | ✅ 2026-10-02: modo ✨, 2 SP + los No2 de un ataque; ataque con el arma con +5 de daño fijo e ignora 1 punto de resistencia a crítico del rival; «por la espalda» lo define la mesa (nota ✋ en el cuadro del ataque); sin «(Sin auditar)». |
| Larry | Drenar Vida | ✅ 2026-10-02: ✨ contra un enemigo, X SP + 2 No2, tira X + 1dX (fórmula propia) contra Res.Esp; daño = la diferencia (arcano, directo a la vida) y **drena** (Larry se cura lo mismo; lo que pasa del máximo queda como Excedente de vida, hasta +50 %). Construido para esto: «la diferencia» en habilidades dirigidas y «drena» (paso Daño del editor). Probado en vivo en «Claude · pruebas» desde el mapa con la Botonera (diferencia 1 y 10; cura, Excedente 7). ✋ «X no puede ser mayor que su Especial» (no hay tope de X por habilidad). |
| Larry | Pedos Tóxicos | ✅ 2026-10-02: la versión del pool (zona persistente de radio 2 por 2 turnos, Ef.Esp contra Res.Esp, daño tóxico = la diferencia, 1d20 que se tira solo si hay daño) con los **2 No2** de Larry. Se marca el centro (para «alrededor», su propio token; que siga a Larry no existe). ✋ aplicar Pajaritos / Stun / desmayo según el 1d20. |

**Construido para esto:** «🔮 Invoca» en la Ejecución de una habilidad (2026-10-02): `h.invoca = {invId}`;
`FichaAcciones.invocarConHab` despierta la invocación (o una copia «… 2», con `copiaDe`) y el mapa pide dónde aparece
(`invocacion-habilidad`, js/13 `invocacionDeHabilidad`), con la Crónica. **Falta probarlo en vivo en una partida de prueba.**

**Encontrado probando (2026-10-02):** el tirador de dados perdía un número fijo escrito adelante del dado («6+1d6» daba solo 1d6) — arreglado en `comun/tiradas.js`. Pendiente chico: el cartel del costo X aparece arriba de todo en la Botonera del mapa y, si estás abajo, no se ve.
