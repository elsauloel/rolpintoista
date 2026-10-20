# Auditoría de los pergaminos (2026-10-19)

> Pedido del dueño: «los pergaminos los creé hace siglos: pegate una auditada a ver qué te parecen, si hay algo muy fuera de lugar en
> cuanto a balance y efecto». Hoja de trabajo: lo que hay, lo que está fuera de lugar y las preguntas (P211).

**Decidido y hecho (dueño, 2026-10-19):** (1) los de «todo el combate» se van solos al «Finalizar combate» (`efectoFinCombate` → estado
`finCombate`; js/25 `pergaminosAlTerminar`; el descanso también los saca). (2) Una sola familia de No2: Ímpetu +1 Rara 200, +2 Excepcional 400
(stat `nitros`); Piernas de Viento, archivados. (3) Ojo del Verdugo, tope +2 (+1 Rara 120, +2 Excepcional 180; el +3 archivado). (4) Buena
Fortuna, Inmunidad a CC y Blindaje: 3 turnos **a todo el grupo** (`efectoParty`: el mapa se lo pasa a los aliados, js/25 `bnEfectoAlGrupo`).
(7) Velo Eterno: Defensa especial +5 en vez de Res.Esp. Los seis «de crafteo»: sin el texto del crafteo; sombras, ventriloquía y tentáculo,
✋ a mano. **De paso:** cinco pergaminos y cinco pociones (Buena Fortuna, Blindaje, Inmunidad a CC, Escudo Especial, Sangre Pura,
Invulnerabilidad) ponían un estado con nombre propio sin su mecánica (no daban ventaja ni inmunidad): ahora llevan `efectoPreset`.
**Segunda tanda (dueño, el mismo día):** Regeneración = 10 por turno, 3 turnos, a todo el grupo (y una **menor**, Común a 60: 5 por turno, 3 turnos, a todo el grupo). Escudo Especial = 3 que se recarga entero
cada turno, hasta el fin del combate (`efectoRecarga`). **Pergaminos Comunes:** 12 «Pergamino grupal de …», el +1 de los de Buena calidad
(Escudo Arcano, Foco Arcano, Furia Arcana, Furia de Combate, Muralla Personal, Paso Fantasma, Puntería Certera, Rango Extendido, Reflejo de
Acero, Reserva Ampliada, Vitalidad Extendida, Voluntad de Hierro) para todo el grupo durante 3 turnos, a 60 (la equivalencia simple del dueño:
uno solo todo el combate ≈ todo el grupo 3 turnos).
**Tercera tanda (dueño, 2026-10-20), uno por uno:** ✅ **Red Nerubian**: a un rival dentro de tu Rango, tu PdG.Esp contra su Evasión; si pega,
Inmovilizado hasta 3 turnos. Al empezar cada turno del atrapado, la tirada de Fuerza contra tu Efecto especial aparece sola (no cuesta No2;
`soltar.alEmpezar`, vtt-hexgrid/js/54); un aliado pegado puede ayudarlo con 1 No2 y su propia Fuerza (`soltar.ayuda`: botón en su Botonera o
Acciones). Buena a 50 (como la Flecha de arpón).
✅ **Luz cegadora**: destello en flor de diámetro 3 con el centro dentro de tu Rango; cada rival adentro tira Res.CC contra tu Efecto especial y el
que pierde queda con Ceguera 1 turno; quien gana no se ciega (área sin dodge roll: `sinDodge`); los aliados no. Buena a 50. **De paso, la Ceguera
nueva** (dueño): ve 2 casillas, no apunta más lejos (avisa), la mitad del PdG y del PdG.Esp, y su Evasión a la mitad contra un ataque a distancia;
todo «Cegado» entra como esta Ceguera. Flecha y Virote cegador, de 35 a 45. Probado en el mapa.
✅ **Sombras chinescas**: queda a mano (se usa sobre todo en el modo narrativo, dueño): una figura de sombra en una casilla dentro de tu Rango, una escena
(en combate, 3 turnos), sin daño ni bloqueo; Percepción contra tu Efecto especial para darse cuenta. Buena a 30.
✅ **Tentáculo sombrío**: a mano, a criterio de la mesa (narrativo): sale de una superficie dentro de tu Rango, una escena (en combate, 3 turnos), mueve
u agarra cosas livianas; si agarra a alguien, Fuerza contra tu Efecto especial. Buena a 30.
✅ **Ventriloquía**: a mano (narrativo): un sonido o una voz desde un punto dentro de tu Rango, una escena (en combate, 3 turnos); Percepción contra tu
Efecto especial para saber de dónde viene. Buena a 30. Para eso, un consumible ahora puede tener su Ejecución ✨ (`duelo`
en el ítem, `Combatiente.habDeConsumible`): el objetivo se elige en el mapa y va al cuadro del duelo. Probado en el mapa.
**Pendiente:** el ojo de Kicillof como invocación de 3 turnos
(Movimiento 5, invisible, sin mareo; solo revela y despeja) y automatizar la red y la luz cegadora; ¿algún pergamino Común?

## Lo que hay

59 pergaminos publicados, en tres grupos:

- **53 de bonos «todo el combate»**: el par de cada poción de bonos, que dura 4 turnos. Precio = el doble de la poción del mismo número
  (+1 Buena 60, +2 Rara 120, +3 Excepcional 180, contra 30 / 60 / 90 de la poción). Familias: Furia de Combate (Daño), Puntería Certera
  (PdG), Ojo del Verdugo (Crítico frecuente), Paso Fantasma (Evasión), Reflejo de Acero (Parry), Muralla Personal (Bloqueo), Rango
  Extendido (Rango), Vitalidad Extendida (vida máxima +10/20/30), Voluntad de Hierro (Res.CC), Escudo Arcano (Res.Esp), Foco Arcano
  (PdG.Esp), Furia Arcana (Ef.Esp), Reserva Ampliada (SP máximo), Piernas de Viento (Movimiento), Ímpetu (Acciones). Y los de estados,
  Raros a 125: Blindaje, Buena Fortuna, Coagulación, Espinas, Espejo, Hypeado, Inmunidad a CC, Sangre Pura, Escudo Especial, Regeneración.
- **1 Legendario**: Velo Eterno (480): Defensa +5, Res.Esp +5 y Evasión +2 durante 3 turnos.
- **6 «de crafteo»** (Buena, 30): luz cegadora, ojo de Kicillof, red Nerubian, sombras chinescas, tentáculo sombrío, ventriloquía.

No hay ningún pergamino Común.

## Lo que está fuera de lugar

### 1. «Todo el combate» no termina nunca (es un error, no de balance)
Los 53 se guardan como estado **permanente**: no se van al terminar el combate ni al pasar el día (`terminaAlPasarDia` deja los
permanentes). Un pergamino usado hoy sigue sumando en todas las peleas siguientes hasta que alguien lo saque a mano. **Propuesta:** una marca
«hasta el fin del combate» que se saque sola con «Finalizar combate» (`finCombateMomento`, js/25) y, por las dudas, al descansar.

### 2. Movimiento e Ímpetu ya no existen: hoy dan No2
`mov` y `accionesmax` son stats viejos que el juego convierte a **No2 máximos** al cargar. Así, el Pergamino de Piernas de Viento superior
da **+3 No2 todo el combate** (180) y el de Ímpetu mayor +2 (150); y son dos familias que hacen lo mismo. Con el criterio «los No2 son muy
preciados» quedan baratísimos. El Hypeado (+⅓ de los No2) también es No2, Raro a 125. **Propuesta:** una sola familia de No2 (Ímpetu):
+1 Rara, +2 Excepcional, bastante más caras; Piernas de Viento sale (o pasa a ser otra cosa: casilleros gratis al moverse).
(Las pociones de Piernas de Viento e Ímpetu tienen el mismo problema; ya estaban en «Revisar los consumibles».)

### 3. Ojo del Verdugo: +3 de Crítico frecuente todo el combate
Baja el rango del crítico en 3 (un arma de Tipo 6 critica con 3 de diferencia). En las armas, +1 de Crítico frecuente ya es un rasgo
fuerte. **Propuesta:** tope +2 (+1 Rara, +2 Excepcional), o dejarlo solo en poción.

### 4. Estados muy fuertes para un combate entero, a 125
- **Buena Fortuna**: todas las tiradas de PdG, Parry y Evasión con ventaja, toda la pelea.
- **Inmunidad a CC**: ningún Stun ni control en toda la pelea (le saca la gracia al jefe).
- **Blindaje**: inmune a críticos (sigue «a mano»).
**Propuesta:** Excepcionales y más caros (250–300), o que duren menos (5 turnos) y valgan lo que valen.

### 5. Los que quedaron flojos
- **Regeneración**: 5 de vida por turno, Rara a 125. La Poción de Regeneración Común (25) cura 50 en 5 turnos. **Propuesta:** 10 por turno,
  o bajarla a Buena y ~50.
- **Escudo Especial**: un escudo de 10 que no se recarga, Raro a 125, cuando Vitalidad Extendida da +10 de vida máxima por 60.
  (Además el estado se llama «Vida extra», no «Escudo especial».) **Propuesta:** escudo de 15–20, o Buena a ~60.

### 6. Los seis «de crafteo» no hacen nada definido
Dicen «Requiere: 1 Pergamino + 1 Loot mágico (costo de crafteo 20)» —un sistema de crafteo que no existe— y no dicen cuánto dura, a qué
distancia ni contra qué se tira; tampoco llevan ⚙/✋. **Propuesta:** rehacerlos como pergaminos de efecto (encajan con la idea anotada en la
hoja de ruta: «pergaminos con efectos fuera de combate»): la red Nerubian = Inmovilizado y la luz cegadora = Ceguera, automatizables con la
Ejecución ✨; el ojo, las sombras, la ventriloquía y el tentáculo, ✋ a mano con un texto claro (duración, alcance). Sacar lo del crafteo.

### 7. Velo Eterno
El único Legendario y el único con turnos: Defensa +5, Res.Esp +5, Evasión +2, 3 turnos, 480. Razonable. Duda: ¿Res.Esp o Def.Esp
(la «Defensa especial», que frena el daño mágico)? Con «Velo» suena más a Def.Esp.

## Lo que está bien
Los de bonos de +1 a +3 (Daño, PdG, Evasión, Parry, Bloqueo, Rango, vida, resistencias, SP máximo, PdG.Esp, Ef.Esp) siguen una regla
pareja: el doble de la poción por durar todo el combate. Si una pelea dura 4–6 rondas, rinden un poco más que la poción por el doble del
precio: está bien. Espinas, Espejo, Coagulación y Sangre Pura todo el combate a 125 también están en su lugar.

## Preguntas (P211)
1. ¿Arreglamos que «todo el combate» termine con «Finalizar combate»?
2. No2: ¿una sola familia (Ímpetu +1 / +2, más caras) y Piernas de Viento sale o cambia?
3. Ojo del Verdugo: ¿tope +2?
4. Buena Fortuna, Inmunidad a CC y Blindaje: ¿más caros o más cortos?
5. Regeneración y Escudo Especial: ¿los subimos?
6. Los seis de crafteo: ¿los rehacemos como pergaminos de efecto?
7. Velo Eterno: ¿Res.Esp o Def.Esp?
8. ¿Hace falta algún pergamino Común?
