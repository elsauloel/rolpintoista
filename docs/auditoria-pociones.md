# Auditoría de las pociones (2026-10-20)

> Pedido del dueño: «vamos por las pociones, auditemos todas». Hoja de trabajo (P212): lo que hay, lo que está fuera de lugar y las propuestas.
> Mismo criterio que [`auditoria-pergaminos.md`](auditoria-pergaminos.md). Nada se cambió todavía.

## Lo que hay (89, contando curas y elixires)

- **Bonos de 4 turnos, +1 / +2 / +3** (17 familias): las de stats secundarios a 30 / 60 / 90 (Buena, Buena, Rara) y las de atributos (Fuerza del
  Toro, Manos Ligeras, Piel de Roble, Pies Veloces, Clarividencia) a 75 / 150 / 225 (Buena, Rara, Excepcional). Vitalidad Extendida (+10/20/30
  de vida máxima) y Reserva Ampliada (+1/2/3 de SP máximo) van con las de stats secundarios.
- **Estados de 3 turnos, Raros a 75**: Blindaje, Buena Fortuna, Escudo Especial (10), Espinas, Espejo, Hypeado, Inmunidad a CC; Invulnerabilidad a 180.
- **Curación**: Poción de HP (Común 25: 25 de vida), mayor (Rara 100: 100), las «grandes» de 3 cargas (HP 3×25 Rara 80, HP mayor 3×100
  Excepcional 130), Regeneración (Común 25: 10 por turno 5 turnos), mayor (Buena 75: 20 por turno), grande (3 cargas, Rara 80), mayor grande
  (3 cargas, Excepcional 130), Sifón de soda (Común 10: 10 de vida).
- **SP**: Poción de SP (Buena 30: la mitad del SP) y grande (Buena 60: todo).
- **Curas de estados**: Vendas, Antídoto, Té de tilo, Sales aromáticas, Ungüento de la Turca, Mate cebado (Comunes, 25) y Cura Plus (Buena 120).
- **Legendarias**: Elixir de Fénix (450: 150 de vida), Elixir de piedra eterna (440: Defensa +6, Res.CC +3, Res.Esp +4, 3 turnos), Sangre de
  dragón (500: Fuerza +2 y Constitución +2 todo el combate), Poción de segundo aire (420: 60 de vida, Iniciativa +5 y Movimiento +3, 3 turnos).

## Lo que está fuera de lugar

1. **Sangre de dragón «todo el combate» no termina nunca** (el mismo error de los pergaminos): falta `efectoFinCombate`.
2. **Movimiento y Acciones ya no existen: dan No2.** Piernas de Viento (+1/+2/+3 No2 por 30/60/90), Ímpetu (+1/+2 por 50/100) y el Movimiento
   +3 de Segundo aire. Y **Hypeado** (+⅓ de los No2, ~+2) a 75 en poción y 125 en pergamino, más barato que Ímpetu.
3. **Ojo del Verdugo**: hasta +3 de Crítico frecuente (en los pergaminos quedó tope +2).
4. **Buena Fortuna, Inmunidad a CC y Blindaje** a 75, solo para quien la toma: el pergamino ahora da lo mismo a todo el grupo por 125.
5. **Escudo Especial** (un escudo de 10 por 3 turnos) a 75 Rara, cuando Vitalidad Extendida da +10 de vida máxima por 30.
6. **Invulnerabilidad**: nada de daño 3 turnos, Rara a 180. Muy fuerte para Rara.
7. **Las «grandes» de 3 cargas**: la de HP (3×25 por 80) está bien de precio, pero es Rara siendo 3 Comunes; la de HP mayor (3×100 por 130)
   y la de Regeneración mayor (3×100 por 130) son baratísimas (tres sueltas valen 300 y 225).
8. **Elixir de Fénix**: 150 de vida por 450, cuando la Poción de HP mayor da 100 por 100. Con ese nombre, ¿no debería revivir?
9. **No hay SP Común**: un mago de nivel bajo no tiene cómo recuperar SP barato (y el botín de los magos en Común no tiene SP).

## Propuestas
1. ✅ **Regla (dueño, 2026-10-20): una poción dura X turnos; un pergamino, todo el combate o X turnos para todo el grupo.** Sangre de dragón:
   Fuerza +3 y Constitución +2, 3 turnos, Excepcional 300 (era +2/+2 todo el combate, Legendaria 500). Pergamino del Velo Eterno: lo mismo de
   antes (Defensa +5, Def.Esp +5, Evasión +2, 3 turnos) pero para todo el grupo; sigue Legendario a 480.
2. ✅ (dueño, 2026-10-20) Piernas de Viento, archivadas. **Ímpetu, 3 turnos y +1 No2 por tier**: +1 Común 60, +2 Buena 120, +3 Rara 200,
   +4 Excepcional 320 («suprema», nueva). Segundo aire: el Movimiento +3 pasó a +2 No2. **Hypeado** (poción y pergamino), archivados: «medio
   redundante; tenía sentido con las acciones» (el estado queda para habilidades).
3. ✅ (dueño, 2026-10-20) Ojo del Verdugo sin tope (la poción dura turnos; el tope era para el pergamino, que dura todo el combate), con
   precio no lineal: +1 Buena 40, +2 Buena 100, +3 Rara 300; duran **3 turnos** (antes 4).
4. ✅ (dueño, 2026-10-20) Buena Fortuna (ahora **Félix Felicis**), Inmunidad a CC y Blindaje: Buena calidad, 50. **Blindado, automatizado en el
   duelo**: un golpe que iba a ser crítico entra como uno normal («🛡 CRÍTICO ANULADO»); lo usa el pergamino de grupo. **La Poción de Blindaje**,
   en cambio (dueño: «más fácil y menos OP»), da **+1 a la resistencia a todos los tipos de crítico**, 3 turnos.
5. ✅ (dueño, 2026-10-20) Escudo Especial y Vitalidad Extendida, archivadas. En su lugar, **escudos de poción** (vida extra que se va al
   gastarse o al pasar el día): Cuero Duro (solo físico) 15 Común 20 / 25 Buena 45; Piel de Cristal (solo especial) 15 Común 20 / 25 Buena 45;
   del Aguante (todo daño) 15 Buena 40 / 25 Rara 90 («gastar un No2 por curarse 10 es poco»: el piso es 15). Nuevo set de crítico, **Mano Pesada**
   (3 turnos): Crítico frecuente +1 y potente +1 / +2 / +3, Buena 70 / Buena 130 / Rara 250. Las de Voluntad de Hierro (Res.CC) pasaron a
   llamarse **contra el Mal de Ojo** (dueño).
6. ✅ (dueño, 2026-10-20) Invulnerabilidad: sigue Rara a 180, dura **2 turnos** (antes 3).
7. ✅ (dueño, 2026-10-20) **Las de 3 cargas: el precio de 3 sueltas + 5 por carga, y un escalón de calidad arriba de la suelta** (lo que ganan
   es lugar en el cinturón): HP grande Buena 90, HP mayor grande Excepcional 315, Regeneración grande Buena 90, Regeneración mayor grande Rara 240.
8. Elixir de Fénix: que reviva (como el Revive: a un aliado caído, o a uno mismo desde el cinturón, como el Ankh) con toda la vida y Titilando.
9. Una **Poción de SP menor**, Común 15: un cuarto del SP.

## Lo que está bien
Los bonos de 4 turnos (30/60/90 y los de atributo 75/150/225), las curas de estados, la Cura Plus, las de SP, las de HP y Regeneración sueltas,
Espinas, Espejo, el Elixir de piedra eterna y el Sifón de soda.
