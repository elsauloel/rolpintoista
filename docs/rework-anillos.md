# Rework de los anillos — hoja de trabajo

> Pedido del dueño (2026-10-10, `pendientes.md`): «ameritan un rework, fueron hechos muy a ojo». Arrancado el 2026-10-18, después de los
> talismanes. Mismo método que el rework de armas (`rework-armas.md`): primero lo que hay y los criterios, después la lista nueva, y recién con
> el OK del dueño se reemplaza en `comun/catalogo.js`. Calidad por calidad: primero Común, después Buena; Rara para arriba, cuando lo pida.

## Lo que ya estaba decidido

- **P114 (dueño, 2026-09-25):** los anillos son **mágicos**, **uno por mano** (2 lugares en la ficha, `max: 2`). Dan **más libertad de
  efectos**, pero tienen que ser **más escasos y caros** que el resto del equipo. (También en `guia-de-diseno.md`.)
- **P196 (en pausa):** el Anillo de armadura indestructible está archivado hasta revisar si es demasiado poderoso.
- **Nitros muy preciados** (criterio de diseño): lo que da No2 vale mucho.
- Redondeo: los buffs, para arriba.

## Cómo están hoy (2026-10-18)

- **35 anillos, todos Comunes** (uno archivado). **Ninguno de Buena calidad ni más.**
- **Precios de 40 a 70**: lo mismo que un casco Común (35–60) o unos guantes Comunes (20–50). El precepto P114 dice «más caros».
- **En las tiendas:** el Bazar arcano tiene una receta con **22 % de anillos** (`comun/generador-tiendas.js`): uno de cada cinco ítems del
  bazar es un anillo. El precepto dice «más escasos».
- **Los precios no siguen al valor:** Daño +1 (en cada golpe), Vida +5, Res.Esp +1 y Visión +2 cuestan todos 70; la Calma (1 No2 por turno si
  no atacaste) también 70; los cuatro de «una vez por combate +2» cuestan 40; SP máximo +1 (casi nada) 60.
- **Nombres mezclados:** unos con mayúsculas a la inglesa («Anillo de Furia de Combate», «Reserva Ampliada») y otros no. El renombrado está en
  pausa (lo retoca el dueño); acá solo se marca.

## Los 35, por familia, con la propuesta (Común)

Propuesta de escala para los Comunes: **80 a 120** según lo que valga el efecto (por encima de un casco Común, como pide P114). Lo muy fuerte
pasa a Buena (150–200).

### Un número fijo
| Anillo | Hoy → propuesta |
|---|---|
| Anillo de Furia de Combate | Daño +1 · 70 → **120** (suma en cada golpe: el más fuerte de los fijos) |
| Anillo maldito del berserker | Daño +2 · Vida −5 · 70 → **110** |
| Anillo de Furia Arcana | Ef.Esp +1 · 70 → **100** |
| Anillo de Reflejo de Acero | Parry +1 · 70 → **100** |
| Anillo de Vitalidad Extendida | Vida +5 · 70 → **100** |
| Anillo de Escudo Arcano | Res.Esp +1 · 70 → **90** |
| Anillo de Tenacidad | Res.CC +1 · 70 → **90** |
| Anillo de Voluntad de Hierro | Res.Mt +2 · 70 → **90** |
| Anillo de Muralla Personal | Bloqueo +1 · 70 → **90** |
| Anillo de malla fina | Res. crítico Tipo 4 +1 · 70 → **90** |
| Anillo de ojo atento | Percepción +2 · 70 → **90** (la Percepción del grupo es baja: sirve contra trampas) |
| Anillo de vista aguda | Visión +2 · 70 → **80** |
| Anillo de luz | Luz +4 · 70 → **80** |
| Anillo de Reserva Ampliada | SP máximo +1 · 60 → **SP máximo +3, 80** (+1 no se nota) |

### Con condición (ya automatizados)
| Anillo | Hoy → propuesta |
|---|---|
| Anillo de la calma | +1 No2 al terminar el turno si no atacaste · 70 → **Buena, 170** (No2 gratis cada turno: muy fuerte) |
| Anillo del primer golpe | Defensa +1 contra el primer golpe del turno · 60 → **90** |
| Anillo de Foco Arcano | PdG.Esp +1 si no te moviste · 70 → **90** |
| Anillo de Puntería Certera | PdG +1 si no te moviste · 70 → **90** |
| Anillo de Paso Fantasma | Evasión +1 si te moviste 3+ casilleros · 70 → **90** |
| Anillo de cáscara protectora | Vida extra 3 al empezar el combate · 70 → **90** |
| Anillo de primera sangre | +2 de daño en el primer ataque del combate · 60 → **80** |
| Anillo de boticario | Cada poción cura 3 más · 50 → **80** |

### Una vez por combate, +2 a una tirada (como la Polilla)
| Anillo | Hoy → propuesta |
|---|---|
| Fuerza del Toro · Manos Ligeras · Clarividencia · Piel de Roble | +2 a tu última tirada de Fuerza / Destreza / Especial / Constitución · 40 → **80** |

### Movimiento y resistencias
| Anillo | Hoy → propuesta |
|---|---|
| Anillo de Piernas de Viento | Levitar 2 · 40 → **100** (saltea terreno lento y trampas en los dos primeros casilleros) |
| Anillo cambiante | Res. fuego, hielo o eléctrica +1 a elección al empezar el combate · 40 → **80** |

### Elementales (nuevos del 2026-10-18, de los talismanes)
| Anillo | Hoy → propuesta |
|---|---|
| Brasa · Escarcha · Chispa · Miasma · Ácido | +2 al daño de su elemento · 50 → **90** |
| Anillo de tormenta | El salto del rayo de 4 a 5 casillas · 60 → **80** |

### En pausa
| Anillo | Estado |
|---|---|
| Anillo de armadura indestructible | Archivado (P196): absorbe la primera Armadura rota de cada combate. Falta decidir si se baja o se saca. |

## Decidido (dueño, 2026-10-18: «de las respuestas 1 a 5 voy a seguir todas tus sugerencias»)

Aplicado en `comun/catalogo.js` y `comun/generador-tiendas.js`: los precios de la tabla (80–120), la Calma a Buena (170), Daño +1 Común a 120, Reserva Ampliada a SP máximo +3 (80) y el Bazar arcano con 10 % de anillos (antes 22). Quedan 34 Comunes y 1 de Buena. Siguiente: la lluvia de ideas de anillos nuevos (`ideas-anillos.md`).

## Preguntas para el dueño (2026-10-18)

1. **Precio:** ¿subimos los Comunes a 80–120 como en la tabla (por encima de un casco Común)?
2. **Escasez en las tiendas:** ¿bajamos los anillos del Bazar arcano de 22 % a ~10 % (uno de cada diez ítems)?
3. **La Calma** (No2 gratis cada turno que no atacás): ¿pasa a Buena (170) o se cambia el efecto?
4. **Daño +1 en un anillo** (Furia de Combate): ¿queda Común a 120, o pasa a Buena?
5. **Reserva Ampliada:** ¿SP máximo +3?
6. **Buena calidad:** hoy no hay ningún anillo de Buena. ¿Armamos una tanda (efectos mejores o dos efectos juntos) después de cerrar los Comunes?
7. **Armadura indestructible (P196):** ¿la vemos ahora o sigue en pausa?

## Anillos nuevos (2026-10-18)

De la lluvia de ideas (`ideas-anillos.md`), el dueño eligió cuatro y quedaron cargados y probados: **del pantano** (Buena, 170), **del último aliento** (Raro, 350: el primer anillo Raro), **del trébol** (Buena, 160) y **del alquimista** (Buena, 150). Hoy hay 39 anillos: 34 Comunes, 4 de Buena (con la Calma), 1 Raro y 1 archivado (la armadura indestructible, P196).

## Cambios del dueño (2026-10-19)

- **Nuevo: Anillo del canalizador** (Buena, 150): Ef.Esp +2 · SP máximo −3 (lo que da un punto de Especial: el SP es Especial × 3).
- **Nuevo: Anillo de la defensa** (Común, 120): Defensa +1.
- **Anillo de malla fina** (Res. crítico Tipo 4 +1): se quita (archivado: quien ya lo tenga lo conserva).
- **Anillo del primer golpe**: Defensa +2 contra el primer golpe que recibís en la **ronda** (antes +1 en el turno), 110. La regla de `defprimer`
  pasó a ser por ronda para todos (personajes, creeps e invocaciones: `primerGolpeDeRonda`, vtt-hexgrid/js/10); hoy solo la usa este anillo.
- **Anillo de Foco Arcano**: PdG.Esp +2 si no te moviste ni en esta ronda ni en la anterior (antes +1 en este turno). El Pulso quieto (Puntería
  certera) sigue siendo de este turno.
- **Anillo de boticario**: en una poción de regeneración, los +3 van en la primera vez que regenera, no en cada turno (`curaExtraPrimera` en el
  estado; `Combatiente.dispararEstados`).
- Probado en el mapa: el primer golpe (dos golpes de 6 contra Defensa 3: 1 y después 3) y el Boticario (Poción de Regeneración: la primera vez 13).
- Aclarado el **Levitar** (pregunta del dueño): cubre los primeros N casilleros que te movés en tu turno; con Levitar 2 y 3 casilleros, el 1 y el
  2 van por el aire y el 3 se pisa; si terminás el turno en un casillero que pasaste levitando, al terminarlo tocás el piso (una trampa salta ahí).
- **Anillo de cuero de troll** (Común, 80; reemplaza a la Armadura indestructible, P196 cerrada): al terminar el combate, una pieza que elegís
  recupera 1 de durabilidad. **Primera sangre: +5** (antes +2).
- **Lo de «al terminar el combate» arranca con «Finalizar combate»** (dueño): el GM, al abrirlo, deja un momento `fin-combate`; cada pantalla
  resuelve el cuero de troll, la piel de troll, la Polilla y Desarmar trampas, y recién después el jugador ve el botín (vtt-hexgrid/js/25).
- **Anillo de la siesta** (Buena, 150): cada descanso (todo «Pasar de día» es al menos el normal, el de 1 wildcard), Vida extra 10 que no se
  recarga por turno. Lluvia de ideas de anillos «por día» en `ideas-anillos.md` §E.
- Probado en el mapa: canalizador y defensa (Botonera «SP 6/6 · Def 4»), Foco (+2 tras dos rondas quieta; sin efecto si se movió la anterior),
  Primera sangre (+5 en la declaración), cuero de troll (al apretar Finalizar, una sola vez) y las teclas + / −.

