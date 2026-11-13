# Inventario: Resistencia a crítico (paso 1 del plan, 2026-11-04)

> Paso 1 de [`plan-resistencia-critico.md`](plan-resistencia-critico.md): **solo mirar, sin cambiar nada**. Todo lo que toca el crítico en el
> catálogo, las habilidades, los estados, las pasivas, los creeps y los personajes del grupo, con lo que valía con la regla vieja y lo que vale
> ahora.

## Conclusiones (lo importante)
1. **Cada punto de Resistencia a crítico vale mucho menos que antes.** Antes, ×1 contra una Tipo 4 pedía 8 de diferencia para el primer
   crítico (+4); ahora pide 5 (+1). Contra una Tipo 10, antes +10; ahora +1. **Cuanto más grande el arma, más se nota la caída.**
2. **El catálogo se armó con «×1» como unidad de protección fuerte:** de 98 piezas que dan Resistencia, 95 dan ×1 y solo 3 dan ×2. Con la regla
   vieja, ×1 ya cortaba un crítico entero; ahora es un retoque chico.
3. **Casi toda la Resistencia es contra Tipo 4** (68 piezas), bastante menos contra Tipo 6 (20), poca contra 8 (8) y 10 (9), y
   **ninguna contra Tipo 12**. Un personaje acorazado al máximo junta: **con Comunes, T4 ×7, T6 ×3, T8 ×1, T10 ×1**; con Buenas, **T4 ×8, T6 ×4,
   T8 ×2, T10 ×2**. Con la regla vieja, T4 ×7 lo volvía **inmune** a los críticos de dagas y arcos (hacía falta 32 de diferencia); ahora pide 11.
4. **Lo que «ignora» resistencia perdió casi todo su valor:** «Ignora 1» antes salteaba un nivel entero de crítico; ahora resta 1 punto al rango.
   Lo llevan 10 armas Raras y Excepcionales (Katana, Rompemalla, Misericordia, Perforacotas, Estoque del campeón…) y **Tiro certero** (ignora 2).
   Se pagaron caras por algo que hoy vale poco.
5. **Lo mismo con los estados que suben o bajan la resistencia en todos los Tipos:** Piel de hierro, Endurecido/Endurecimiento, Estoicismo,
   Temple y Piel resistente (+1), y **Punto débil** (−1: Aguja siniestra, Carga elemental). Antes eran ±1 nivel entero; ahora ±1 al rango.
6. **El Crítico frecuente no cambió** (sigue bajando el rango 1 punto por punto). Ahora **se compensa exacto con la Resistencia**: +1 frecuente
   anula ×1 de resistencia. Antes, ×1 de resistencia valía tanto como 4 a 10 puntos de frecuente. **El Crítico potente y el d20 extra no cambian.**
7. **Los creeps** (pool esencial) llevan poca Resistencia: entre 0 y ×2, casi siempre contra Tipo 4. **Los personajes del grupo** de El origen,
   entre 0 y ×2 (Rockardo, ×1 contra 4, 6, 8 y 10). Con la regla nueva, a todos les entran críticos bastante más seguido que cuando se diseñaron.
8. **Lo más llamativo:** el texto de la habilidad de clase **Temple** todavía dice «cada punto le quita un nivel al crítico» (la regla vieja); y las
   armas Excepcionales con «Ignora 2» (2.000+ de oro) hoy valen, en ese rasgo, lo mismo que +2 de Crítico frecuente, que traen armas Buenas de 160.

## Tabla de referencia: diferencia (PdG − Evasión) que hace falta para el 1.º · 2.º · 3.º nivel de crítico
Sin Crítico frecuente. Vieja: cada punto de resistencia restaba un nivel entero (hacía falta llegar a {R + nivel} × Tipo). Nueva: el rango es
Tipo + Resistencia, y cada nivel es un rango más.

| Arma | Res. | Regla vieja | Regla nueva |
|---|---|---|---|
| Tipo 4 | 0 | 4 · 8 · 12 | 4 · 8 · 12 |
| Tipo 4 | 1 | 8 · 12 · 16 | 5 · 10 · 15 |
| Tipo 4 | 2 | 12 · 16 · 20 | 6 · 12 · 18 |
| Tipo 4 | 3 | 16 · 20 · 24 | 7 · 14 · 21 |
| Tipo 4 | 4 | 20 · 24 · 28 | 8 · 16 · 24 |
| Tipo 6 | 0 | 6 · 12 · 18 | 6 · 12 · 18 |
| Tipo 6 | 1 | 12 · 18 · 24 | 7 · 14 · 21 |
| Tipo 6 | 2 | 18 · 24 · 30 | 8 · 16 · 24 |
| Tipo 6 | 3 | 24 · 30 · 36 | 9 · 18 · 27 |
| Tipo 6 | 4 | 30 · 36 · 42 | 10 · 20 · 30 |
| Tipo 8 | 0 | 8 · 16 · 24 | 8 · 16 · 24 |
| Tipo 8 | 1 | 16 · 24 · 32 | 9 · 18 · 27 |
| Tipo 8 | 2 | 24 · 32 · 40 | 10 · 20 · 30 |
| Tipo 8 | 3 | 32 · 40 · 48 | 11 · 22 · 33 |
| Tipo 8 | 4 | 40 · 48 · 56 | 12 · 24 · 36 |
| Tipo 10 | 0 | 10 · 20 · 30 | 10 · 20 · 30 |
| Tipo 10 | 1 | 20 · 30 · 40 | 11 · 22 · 33 |
| Tipo 10 | 2 | 30 · 40 · 50 | 12 · 24 · 36 |
| Tipo 10 | 3 | 40 · 50 · 60 | 13 · 26 · 39 |
| Tipo 10 | 4 | 50 · 60 · 70 | 14 · 28 · 42 |
| Tipo 12 | 0 | 12 · 24 · 36 | 12 · 24 · 36 |
| Tipo 12 | 1 | 24 · 36 · 48 | 13 · 26 · 39 |
| Tipo 12 | 2 | 36 · 48 · 60 | 14 · 28 · 42 |
| Tipo 12 | 3 | 48 · 60 · 72 | 15 · 30 · 45 |
| Tipo 12 | 4 | 60 · 72 · 84 | 16 · 32 · 48 |

**Cómo leerla:** con una Tipo 8 contra alguien con ×2, antes hacía falta 24 de diferencia para el primer crítico; ahora, 10.
Con Crítico frecuente ×F, al rango se le resta F (en las dos reglas; mínimo 2). «Ignora N» resta N a la resistencia antes de la cuenta.

## 1. Ítems del catálogo
Sin los archivados ni los viejos (`legacy`). Total del catálogo activo: 1.188 ítems.

### 1a. Los que dan Resistencia a crítico (98 piezas: 40 Comunes, 57 Buenas, 1 Rara)
- **Valores:** 102 bonos de ×1 y 3 de ×2 (Gambesón acolchado de doble capa y Jubón de cuero tachonado, Buenos; Bacinete de recluta, Común, T4 ×2).
  7 piezas Buenas dan dos Tipos a la vez (×1 en cada uno).
- **Por Tipo:** T4 68 piezas · T6 20 · T8 8 · T10 9 · T12 0.
- **Lo que no da ninguna:** anillos, collares, talismanes, mochilas, cinturones y armas. Toda la Resistencia sale de la armadura y los escudos.

**Cuánta Resistencia junta un personaje con todo puesto** (la mejor pieza de cada lugar: cabeza, torso, escudo, manos, piernas, pies):

| Con… | Tipo 4 | Tipo 6 | Tipo 8 | Tipo 10 | Tipo 12 |
|---|---|---|---|---|---|
| Solo Comunes | ×7 (cabeza 2, torso, escudo, manos, piernas, pies) | ×3 (torso, manos, piernas) | ×1 (escudo) | ×1 (cabeza) | — |
| Comunes y Buenas | ×8 (cabeza 2, torso 2, escudo, manos, piernas, pies) | ×4 (torso, escudo, manos, piernas) | ×2 (torso, escudo) | ×2 (cabeza, escudo) | — |

(Son máximos por Tipo, cada uno por separado: no se juntan todos a la vez, porque cada lugar lleva una sola pieza. Desde el 2026-11-03 un
personaje puede llevar además un escudo atado al antebrazo: el Escudo de brazo del capitán, Raro, suma T4 ×1 más.)

**Qué significa:** T4 ×7, antes = 32 de diferencia para el primer crítico de una daga (en la práctica, inmune); ahora = 11. T6 ×3, antes 24;
ahora 9. Contra Tipo 8, 10 y 12 casi nadie tiene nada, igual que antes.

| Pieza | Lugar | Calidad | Precio | Res. a crítico |
|---|---|---|---|---|
| Campera de cuero con tachas | Torso blando | Común | 110 | T4 ×1 |
| Jubón de cuero curtido | Torso blando | Común | 110 | T4 ×1 |
| Abrigo de piel de oso | Torso blando | Buena | 185 | T4 ×1 |
| Abrigo de púas de puercoespín gigante | Torso blando | Buena | 185 | T4 ×1 |
| Capa de escamas de pez espejo | Torso blando | Buena | 185 | T4 ×1 |
| Chaleco de kevlar | Torso blando | Buena | 170 | T4 ×1 |
| Gambesón acolchado de doble capa | Torso blando | Buena | 200 | T4 ×2 |
| Jubón de cuero de búfalo | Torso blando | Buena | 200 | T4 ×1 |
| Jubón de cuero tachonado | Torso blando | Buena | 200 | T4 ×2 |
| Armadura de hojalata | Torso rígido | Común | 110 | T4 ×1 |
| Armadura pesada de hierro | Torso rígido | Común | 60 | T4 ×1 |
| Coraza de cuero hervido | Torso rígido | Común | 110 | T4 ×1 |
| Coraza de guardia de cuartel | Torso rígido | Común | 85 | T6 ×1 |
| Coraza de puerta | Torso rígido | Común | 105 | T4 ×1 |
| Cota de malla de hierro | Torso rígido | Común | 70 | T6 ×1 |
| Peto de hierro viejo | Torso rígido | Común | 110 | T6 ×1 |
| Peto de placas de aprendiz | Torso rígido | Común | 110 | T4 ×1 |
| Puerta de auto ajustada con alambre | Torso rígido | Común | 110 | T4 ×1 |
| Armadura compuesta | Torso rígido | Buena | 200 | T4 ×1, T6 ×1 |
| Armadura de placas | Torso rígido | Buena | 185 | T4 ×1, T6 ×1 |
| Brigantina remachada | Torso rígido | Buena | 200 | T4 ×1, T8 ×1 |
| Coraza de acero pulido | Torso rígido | Buena | 200 | T4 ×1 |
| Coraza de bandas remachadas | Torso rígido | Buena | 190 | T4 ×1 |
| Coraza de escamas de obsidiana | Torso rígido | Buena | 185 | T4 ×1 |
| Coraza de hierro batido | Torso rígido | Buena | 170 | T4 ×1, T8 ×1 |
| Coraza de láminas | Torso rígido | Buena | 200 | T8 ×1 |
| Coraza de pinchos | Torso rígido | Buena | 185 | T4 ×1 |
| Coraza del guardián | Torso rígido | Buena | 185 | T4 ×1 |
| Cota de malla fina | Torso rígido | Buena | 200 | T6 ×1 |
| Media armadura de escudero | Torso rígido | Buena | 200 | T4 ×1 |
| Placas antibala | Torso rígido | Buena | 185 | T4 ×1 |
| Bacinete de recluta | Cabeza | Común | 50 | T4 ×2 |
| Casco de cuero endurecido | Cabeza | Común | 60 | T4 ×1 |
| Casco de moto vintage pintado a mano | Cabeza | Común | 60 | T4 ×1 |
| Cofia de anillas sueltas | Cabeza | Común | 60 | T4 ×1 |
| Olla Essen heredada de la abuela | Cabeza | Común | 60 | T10 ×1 |
| Olla de cocina | Cabeza | Común | 60 | T4 ×1 |
| Yelmo de herrero con nasal | Cabeza | Común | 60 | T10 ×1 |
| Yelmo de hierro | Cabeza | Común | 60 | T4 ×1 |
| Capacete de hierro | Cabeza | Buena | 100 | T4 ×1 |
| Capellina de hierro | Cabeza | Buena | 85 | T4 ×1 |
| Casco de bandas remachadas | Cabeza | Buena | 100 | T4 ×1 |
| Casco de fundición | Cabeza | Buena | 100 | T10 ×1 |
| Morrión de hierro | Cabeza | Buena | 100 | T10 ×1 |
| Yelmo cerrado de torneo | Cabeza | Buena | 85 | T10 ×1 |
| Yelmo de cubo | Cabeza | Buena | 85 | T10 ×1 |
| Yelmo de nasal | Cabeza | Buena | 85 | T4 ×1 |
| Yelmo de vigía | Cabeza | Buena | 100 | T4 ×1 |
| Broquel de esgrima | Escudo | Común | 85 | T4 ×1 |
| Disco de arado | Escudo | Común | 80 | T8 ×1 |
| Escudo de chapa remachada | Escudo | Común | 85 | T8 ×1 |
| Escudo de cuero endurecido | Escudo | Común | 90 | T4 ×1 |
| Escudo de hierro macizo | Escudo | Común | 90 | T4 ×1 |
| Rodela tachonada | Escudo | Común | 90 | T4 ×1 |
| Broquel de hierro | Escudo | Buena | 140 | T6 ×1 |
| Broquel de parada rápida | Escudo | Buena | 135 | T4 ×1 |
| Escudo de acero laminado | Escudo | Buena | 150 | T8 ×1 |
| Escudo de corteza | Escudo | Buena | 150 | T4 ×1 |
| Escudo de cuero de búfalo | Escudo | Buena | 140 | T8 ×1 |
| Escudo de escamas | Escudo | Buena | 150 | T4 ×1, T6 ×1 |
| Escudo de puerta de fortín | Escudo | Buena | 130 | T4 ×1 |
| Escudo grande | Escudo | Buena | 135 | T10 ×1 |
| Escudo romano | Escudo | Buena | 150 | T4 ×1 |
| Escudo triangular | Escudo | Buena | 150 | T4 ×1 |
| Guardamano de duelista | Escudo | Buena | 120 | T4 ×1 |
| Rodela de hierro forjado | Escudo | Buena | 150 | T8 ×1 |
| Rodela de roble herrada | Escudo | Buena | 140 | T10 ×1 |
| Tapa de aljibe | Escudo | Buena | 120 | T10 ×1 |
| Escudo de brazo del capitán | Escudo | Raro | 320 | T4 ×1 |
| Garfios de estibador | Manos | Común | 40 | T4 ×1 |
| Guanteletes de cazador | Manos | Común | 50 | T4 ×1 |
| Guanteletes de hierro | Manos | Común | 50 | T6 ×1 |
| Manoplas de hojalata | Manos | Común | 35 | T4 ×1 |
| Manoplas de trabajo de fragua | Manos | Común | 50 | T4 ×1 |
| Guanteletes de acero templado | Manos | Buena | 70 | T4 ×1 |
| Guanteletes de placas | Manos | Buena | 70 | T6 ×1 |
| Manoplas de cota | Manos | Buena | 70 | T6 ×1 |
| Mitones de malla | Manos | Buena | 70 | T4 ×1 |
| Canilleras de milicia | Piernas | Común | 35 | T6 ×1 |
| Grebas de anillas cosidas | Piernas | Común | 50 | T6 ×1 |
| Grebas de cuero | Piernas | Común | 50 | T4 ×1 |
| Grebas de hojalata | Piernas | Común | 50 | T4 ×1 |
| Pantalón acolchado de aprendiz | Piernas | Común | 50 | T4 ×1 |
| Perneras de cuero hervido | Piernas | Común | 50 | T4 ×1 |
| Rodilleras de hueso | Piernas | Común | 50 | T6 ×1 |
| Grebas de acero templado | Piernas | Buena | 85 | T6 ×1 |
| Grebas de bandas articuladas | Piernas | Buena | 85 | T4 ×1, T6 ×1 |
| Grebas de placas | Piernas | Buena | 85 | T6 ×1 |
| Perneras de escamas | Piernas | Buena | 85 | T4 ×1, T6 ×1 |
| Perneras de malla | Piernas | Buena | 85 | T6 ×1 |
| Polainas tachonadas de taller | Piernas | Buena | 85 | T4 ×1 |
| Quijotes de hierro | Piernas | Buena | 85 | T6 ×1 |
| Borceguíes de recluta | Pies | Común | 50 | T4 ×1 |
| Botas de buzo de plomo | Pies | Común | 40 | T4 ×1 |
| Botas de cuero de vaca | Pies | Común | 50 | T4 ×1 |
| Borceguíes de punta de acero | Pies | Buena | 70 | T4 ×1 |
| Escarpes de hierro | Pies | Buena | 70 | T4 ×1 |
| Sabatones de acero templado | Pies | Buena | 70 | T4 ×1 |

### 1b. Los que mejoran el crítico del que ataca (72 ítems: 20 Comunes, 14 Buenos, 22 Raros, 16 Excepcionales)
Crítico frecuente (`crit`), Crítico potente (`critpot`), «Ignora N de Res. a crítico», d20 extra (`critD20`) y efectos al golpear que dependen del
crítico. **Qué cambió:** solo el «Ignora N» (antes ≈ N niveles enteros; ahora N puntos de rango). El frecuente, el potente, el d20 extra y los
efectos «seguro/solo si es crítico» funcionan igual, aunque ahora los críticos salen más seguido, así que los «solo si es crítico» se activan
más.

| Ítem | Calidad | Tipo | Precio | Crít. frecuente | Crít. potente | Ignora Res. | d20 extra | Depende del crítico |
|---|---|---|---|---|---|---|---|---|
| Aguja de la envenenadora | Común | T4 | 65 | — | — | — | — | Envenenar (seguro si es crítico) |
| Arco de cazador de pájaros | Común | T4 | 85 | — | — | — | — | Lisiado (seguro si es crítico) |
| Arco de la víbora | Común | T4 | 65 | — | — | — | — | Envenenar (seguro si es crítico) |
| Arco de pastor | Común | T4 | 100 | — | +1 | — | — | — |
| Arco del cazador de recompensas | Común | T4 | 100 | — | — | — | — | Lisiado (seguro si es crítico) |
| Arco del forastero | Común | T4 | 100 | — | — | — | — | Envenenar (solo si es crítico) |
| Arco petizo | Común | T4 | 65 | — | +1 | — | — | — |
| Ballesta de filo fino | Común | T4 | 80 | — | +2 | — | — | — |
| Ballesta de la grieta | Común | T4 | 80 | — | — | — | — | Rompe armadura (seguro si es crítico) |
| Ballesta del herrero | Común | T4 | 65 | — | — | — | — | Rompe armadura (seguro si es crítico) |
| Chuza | Común | T4 | 85 | — | +1 | — | — | — |
| Espada del afilador | Común | T6 | 65 | — | +2 | — | — | — |
| Espada del duelista novato | Común | T6 | 95 | +1 | — | — | — | — |
| Estileto | Común | T4 | 65 | — | +1 | — | — | — |
| Facón del matrero | Común | T6 | 90 | +1 | — | — | — | — |
| Punzón de hielo | Común | T4 | 80 | — | +2 | — | — | — |
| Punzón de matarife | Común | T4 | 65 | — | — | — | — | Lisiado (seguro si es crítico) |
| Sable del tahúr | Común | T6 | 75 | +1 | — | — | — | — |
| Sable fino | Común | T6 | 90 | — | +2 | — | — | — |
| Tenedor de asado | Común | T4 | 80 | — | +1 | — | — | — |
| Aguja de la vigilia | Buena | T4 | 160 | +1 | — | — | — | — |
| Aguja del boticario | Buena | T4 | 150 | — | — | — | — | Envenenar (seguro si es crítico) |
| Arco de puntería | Buena | T4 | 150 | — | +2 | — | — | — |
| Arco de tirador fino | Buena | T4 | 150 | +1 | — | — | — | — |
| Daga de duelo | Buena | T4 | 160 | — | +2 | — | — | — |
| Espada de la guardia | Buena | T6 | 180 | — | +2 | — | — | — |
| Espada del Jefe de los Mil Caminos | Buena | T6 | 100 | — | +3 | — | — | — |
| Espada del timbero | Buena | T6 | 160 | +2 | — | — | — | — |
| Espada larga | Buena | T6 | 150 | — | +2 | — | — | — |
| Estilete de competencia | Buena | T4 | 130 | +1 | — | — | — | — |
| Guantes del verdugo | Buena | — | 80 | — | +1 | — | — | — |
| Hacha con pico | Buena | T8 | 150 | +1 | — | — | — | — |
| Lanza de montería | Buena | T4 | 110 | — | — | — | — | Lisiado (seguro si es crítico) |
| Puñal de sombra | Buena | T4 | 200 | — | +2 | — | — | — |
| Aguja de la vigilia eterna | Raro | T4 | 350 | +1 | — | +1 | — | — |
| Aguja del alquimista | Raro | T4 | 350 | — | — | — | — | Envenenar (seguro si es crítico) |
| Cimitarra del corsario | Raro | T6 | 210 | — | +2 | — | — | — |
| Daga de escolta | Raro | T4 | 220 | — | — | — | — | Sangrado (solo si es crítico) |
| Daga del cirujano | Raro | T4 | 200 | — | +1 | — | — | Lisiado (seguro si es crítico) |
| Daga del comodoro | Raro | T4 | 400 | +1 | — | — | — | — |
| Espada bastarda del Espectro | Raro | T6 | 280 | — | +2 | — | — | Sangrado (solo si es crítico) |
| Estilete de maestro | Raro | T4 | 450 | — | — | — | — | Lisiado (solo si es crítico) |
| Estoque de duelista | Raro | T4 | 290 | — | — | +1 | — | — |
| Estoque de esgrima | Raro | T4 | 260 | +1 | +2 | — | — | Envenenar (solo si es crítico) |
| Facón de oro | Raro | T6 | 230 | +1 | — | — | — | — |
| Katana | Raro | T6 | 240 | — | +3 | +1 | — | — |
| Katana de maestro | Raro | T6 | 550 | +1 | — | — | — | Sangrado (seguro si es crítico) |
| Katana del cazarrecompensas | Raro | T6 | 260 | +2 | — | — | — | — |
| Lanza del montero mayor | Raro | T4 | 230 | — | +1 | — | — | Lisiado (seguro si es crítico) |
| Misericordia | Raro | T4 | 300 | — | +3 | +1 | — | Sangrado (solo si es crítico) |
| Puñal de la frontera | Raro | T4 | 220 | — | +1 | — | — | — |
| Puñal del sereno | Raro | T4 | 300 | — | +3 | — | — | — |
| Puñal envenenado | Raro | T4 | 450 | — | +3 | — | — | — |
| Rompemalla | Raro | T4 | 300 | — | — | +1 | — | — |
| Sable del comandante | Raro | T6 | 500 | — | — | — | — | Rengo (solo si es crítico) |
| Sable del general | Raro | T6 | 550 | — | — | — | — | Rengo (seguro si es crítico) |
| Aguijón de la Reina Avispa | Excepcional | T4 | 850 | +1 | +4 | — | — | — |
| Aguja de escarcha | Excepcional | T4 | 1900 | — | +3 | — | — | Rengo (solo si es crítico) |
| Aguja de los mil años | Excepcional | T4 | 2100 | +1 | — | +2 | — | — |
| Beso de la viuda | Excepcional | T4 | 600 | — | — | — | — | Veneno severo (solo si es crítico) |
| Bisturí del anatomista | Excepcional | T4 | 850 | — | +2 | — | — | Lisiado (seguro si es crítico) |
| Colmillo del conde | Excepcional | T4 | 800 | — | — | — | — | Drena vida (solo si es crítico) |
| Colmillo dientes de sable | Excepcional | T4 | 1400 | — | +3 | — | — | — |
| Daga del almirante | Excepcional | T4 | 1700 | +2 | — | — | — | — |
| Estilete del gran maestro | Excepcional | T4 | 2200 | +1 | — | — | — | Lisiado (solo si es crítico) |
| Estoque del campeón | Excepcional | T4 | 2000 | — | — | +2 | — | — |
| Florete del maestro de armas | Excepcional | T4 | 1400 | +2 | +3 | — | +1 | Sangrado (solo si es crítico), Lisiado (solo si es crítico) |
| Lanza del alba | Excepcional | T4 | 1100 | — | +2 | — | — | — |
| Lanza del cazador de dragones | Excepcional | T4 | 650 | — | +3 | — | — | Rengo (seguro si es crítico) |
| Misericordia del verdugo | Excepcional | T4 | 2100 | — | +4 | +2 | +1 | Sangrado (solo si es crítico) |
| Perforacotas | Excepcional | T4 | 1000 | — | — | +1 | — | — |
| Puñal de la noche sin luna | Excepcional | T4 | 1700 | — | +4 | — | — | — |

**Rasgos condicionales de los arcos** (no son mods, van en el texto): *Emboscada: Crítico frecuente/potente* (Arco de pastor, del monte, de
acecho, petizo, de la sombra; Ballesta de acecho), *Distancia ideal: Crítico potente* (Arco de liebrero, de emboscada), *Racha* (Arco de tiro
ligero) y *Flecha de aguja* (Buena, ignora 1). No cambian, salvo la Flecha de aguja.

## 2. Habilidades, estados y pasivas
| Qué | Dónde | Efecto | Antes | Ahora |
|---|---|---|---|---|
| **Piel de hierro** | creep (Tanque) y estado | +1 Res. a todos los Tipos, 2 turnos (+Def y Def.Esp) | +1 nivel de crítico menos | +1 al rango |
| **Endurecido / Endurecimiento** | estado; clase | +1 Res. a todos los Tipos (+3 Def, +3 Def.Esp) | +1 nivel menos | +1 al rango |
| **Estoicismo** | clase (Warrior), estado | +1 Res. a todos los Tipos (+2 Def por rival pegado) | +1 nivel menos | +1 al rango |
| **Temple** | clase | +1 Res. a todos los Tipos, 2 turnos | +1 nivel menos | +1 al rango — **el texto todavía dice la regla vieja** |
| **Piel resistente** | clase | +1 Res. a todos los Tipos (+Def.Esp 5) | +1 nivel menos | +1 al rango |
| **Punto débil** | estado (Aguja siniestra de creep; Carga elemental de clase) | −1 Res. a todos los Tipos, 2 turnos | 1 nivel de crítico más | −1 al rango |
| **Tiro certero** | creep (Rango) | ignora 2 de Res. del objetivo (+1 PdG, Perfora 3) | ≈ 2 niveles | 2 al rango |
| Crítico frecuente +1 | Tajo veloz, Corte certero, Tajo de carnicero, Zarpa certera, Destripar, Salto, Excavar (creep); Tajear, Lisiar, Excavar (clase); Golpe desesperado (+1/+2 según la vida) | −1 al rango | igual | igual |
| Frecuente + potente | Golpe brutal, Degollar, Finta, Ojo de asesino, Tiro a la cabeza (creep); Golpe brutal, Degollar, Ojo de asesino, Headshot, Marcar (clase); Ojo certero (+2/+2, Support) | — | igual | igual |
| Crítico potente | Zarpazo (+2), Apuntar (+X) | — | igual | igual |
| **Ojo crítico** | pasiva | +1 Crítico frecuente | igual | igual (ahora anula exacto ×1 de resistencia) |
| Estados de fábrica *Crítico frecuente* / *Crítico potente* | estado | +1 | igual | igual |

## 3. Creeps
### Pool esencial (29)
| Creep | Res. a crítico (del equipo) | Su arma |
|---|---|---|
| T1 Escudero | T4 ×1 | Hacha de piedra (T8) |
| T2 Muralla con púas | T4 ×1 | Hacha con garfio (T8) |
| T3 Guardaespaldas | T4 ×2 | Espada del comisario (T6) |
| W1 Hachero | T4 ×1, T6 ×1 | Hacha (T8) |
| W2 Berserker | T4 ×1 | Sable del tahúr (T6, frecuente +1) + Facón de paisano (T4) |
| W3 Martillero | T4 ×2 | Martillo del herrero de pueblo (T10) |
| H1 Embestidor | — | Hacha de verdugo de pueblo (T8) |
| H2 Saltador | T4 ×2 | Hacha de vikingo (T8) |
| H3 Duelista pesado | T4 ×2 | Facón largo (T6) |
| L1 Sangrador | — | Cuchilla del frigorífico (T6) |
| L2 Envenenador | — | Daga ritual (T4) |
| L3 Asesino de las sombras | — | Punzón de hielo (T4, potente +2) |
| L4 Hostigador con trampas | — | Cortaplumas (T4) |
| L5 Duelista | T4 ×1 | Sable del club de barrio (T6) |
| R1 Tirador de precisión | T4 ×1 | Arco de la espera (T4) |
| R2 Hostigador a distancia | — | Arco de tiro ligero (T4) |
| R3 Trabador | T4 ×1 | Ballesta del baqueano (T4) |
| M1 Piromante | T4 ×1 | varita |
| M2, M3, M4 (magos) | — | varitas |
| S1 Sanador, S4 Protector | — | varita |
| S2 Abanderado | — | Lanza corta (T4) |
| S3 Armero | T4 ×1 | Hacha del herrero de pueblo (T8) |
| D1–D4 (debuffers) | — | varitas |

**Lo que se ve:** los tanques del pool tienen, como mucho, T4 ×2. Con la regla vieja eso cortaba dos niveles de crítico de una daga (12 de
diferencia); ahora pide 6. Nadie tiene resistencia contra Tipo 8 o más, que es justo lo que usan los warriors.

### Creeps de fábrica (los 269 de Referencia, sin auditar)
89 tienen Resistencia de base (`crit`): casi todos ×1 contra Tipo 4 (29) o contra Tipo 6 (35); los más fuertes llegan a T4 ×3 / T6 ×2. Por
nivel no crece: los de nivel 3 y 4 casi no tienen. Como están sin auditar, quedan para cuando se revisen.

## 4. Personajes del grupo (leído, sin tocar nada)
| Personaje | Nivel | Res. a crítico | Su arma |
|---|---|---|---|
| **El origen** · Bizzante | 2 | T4 ×2 | Machete (T6) y Lanza corta (T4) |
| **El origen** · Rockardo | 2 | T4 ×1, T6 ×1, T8 ×1, T10 ×1 | Maza (T10) |
| **El origen** · Estrella culona | 2 | — | — |
| **El origen** · Aurelius Risus | 1 | T6 ×2, T8 ×1 | Martillo de sargento (T10) |
| **El origen** · Larry | 2 | T4 ×1 | — |
| **Claude · pruebas** · Prueba Uno, Prueba Dos, juan, Clementino | 1–4 | — | (juan: Arco de las brasas, T4) |

Ninguno tiene Crítico frecuente ni potente puesto ni «Ignora». Con la regla vieja, Rockardo era casi inmune al primer crítico de cualquier arma
hasta Tipo 10 (pedía el doble de diferencia); ahora le cuesta 1 punto más.

## 5. Para el paso 2 (medición) y el 3 (criterios)
- Medir cuánta diferencia PdG − Evasión sale de verdad en las peleas típicas (nivel 1 a 3), para saber cuántos críticos salen hoy.
- Decidir cuánto debería valer un punto de Resistencia (¿se suben los valores de las piezas? ¿×2 en Buenas?), qué hacer con «Ignora N» (¿lo
  convertimos en otra cosa, o lo subimos?), y si conviene sumar resistencia contra Tipo 8, 10 y 12.
- Texto a corregir cuando se decida: Temple (dice la regla vieja).
