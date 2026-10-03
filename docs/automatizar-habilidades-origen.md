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
| Aurelius Risus | Invi | 🔲 Le falta el SP (el texto dice 5). Duda: ¿«invisible» = el Sigilo del mapa? |
| Aurelius Risus | Backstab | ✅ 2026-10-02: modo ✨, 2 SP + los No2 de un ataque; ataque con el arma con +5 de daño fijo e ignora 1 punto de resistencia a crítico del rival; «por la espalda» lo define la mesa (nota ✋ en el cuadro del ataque); sin «(Sin auditar)». |
| Larry | Drenar Vida | 🔲 Falta construir: daño «la diferencia» en un ataque directo y curarse lo drenado (tope +50 %); puente ✋. |
| Larry | Pedos Tóxicos | 🔲 Casi todo existe (zona persistente con daño «la diferencia» y 1d20 que se tira solo); la tabla del 1d20 aplica el estado a mano. Duda: ¿la nube sigue a Larry? |

**Construido para esto:** «🔮 Invoca» en la Ejecución de una habilidad (2026-10-02): `h.invoca = {invId}`;
`FichaAcciones.invocarConHab` despierta la invocación (o una copia «… 2», con `copiaDe`) y el mapa pide dónde aparece
(`invocacion-habilidad`, js/13 `invocacionDeHabilidad`), con la Crónica. **Falta probarlo en vivo en una partida de prueba.**
