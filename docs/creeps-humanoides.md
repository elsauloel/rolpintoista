# Creeps humanoides nuevos, rol por rol y nivel por nivel

> Hoja de trabajo (dueño, 2026-10-26: «un set de creeps nuevos basados enteramente en las nuevas habilidades y con un nuevo criterio. Los viejos los
> vamos a dejar para reworkearlos manteniendo los conceptos»). Se retoma desde acá en cualquier conversación. Las habilidades salen del catálogo
> auditado ([`diseno-roles-creep.md`](diseno-roles-creep.md), los «20 por rol»); los creeps base viejos (`comun/creeps-base.js`) y sus skills
> **no son referencia**.

## La idea

Un pool de **creeps humanoides predeterminados**, listos para usar, pensados de a uno: cada creep es una **línea** que va del nivel 1 al 5, y en
cada nivel se optimizan juntos el equipo, las habilidades y cómo interactúan (sinergias).

- **Habilidades por nivel**: nivel 1 con **2**, y **+1 por nivel** (nivel 5 con 6). Subir de nivel = actualizar los atributos y sumar una habilidad.
- **Atributos**: el presupuesto de siempre, **33 en nivel 1 y +3 por nivel** (45 en nivel 5). La vida sale sola de la Constitución (Con × 5 + bonos).
- **Equipo**: «buenos equipos en general». En cada nivel se suma una pieza o se mejora la calidad de alguna (tabla de abajo). Con la regla nueva del
  botín, el GM elige qué ofrece y lo que no ofrece pasa a despojos. **Tope: Buena calidad** (dueño, 2026-10-26: «por ahora no vamos a usar armas
  raras… las raras que están cargadas todavía no están del todo auditadas»).
- **Se diseñan armas y armaduras nuevas** cuando hagan falta (dueño, 2026-10-26: «aprovechemos para diseñar distintos tipos de armas y de
  armaduras, pero todo pensando en sinergia interna, que se aprovechen las mecánicas y los potenciales de cada rol»): si el catálogo no tiene la
  pieza que le sirve al creep, se diseña (Común o Buena calidad, con el criterio del rework del catálogo) y entra al catálogo.
- **Humanoides**: tipo humano o humanoide (oro sugerido y consumible al azar como siempre).
- Lo que se suma en cada nivel se piensa con lo anterior: la habilidad nueva tiene que **combinar** con las que ya tiene o con su equipo.

## Las líneas (36)

| Rol | Cuántos | Qué los define |
|---|---|---|
| ⚔ **Warrior** | 4 | Pegar fuerte: daño, romper la defensa, rematar |
| 🛡 **Tanque** | 4 | Aguantar y controlar: Defensa alta, frenar, desarmar, cuidar al de al lado |
| 🪓 **Choque pesado híbrido** | 4 | Entre warrior y tanque: aguanta y pega |
| 🗡 **Choque liviano** | 8 | Rápidos, cada uno con un estilo distinto, para probar combinaciones de skills |
| 🏹 **Rango y Hunter** | 4 | Daño concentrado a distancia, crítico, trabar; el Hunter pasa al toque y pone trampas |
| ✨ **Mago** | 4 | Daño mágico directo y en área (arcano, fuego, hielo, rayo, ácido) |
| 💚 **Support** | 4 | Potenciar y curar a los suyos (luz) |
| 🧿 **Debuffer** | 4 | Maldecir, cegar, drenar, envenenar (siniestro y tóxico) |

(Los roles que faltaban, sumados por el dueño el 2026-10-26: «te faltaron los roles de casters y de rango y support, todos los roles que ya
estuvimos trabajando para los skills». 4 de cada uno, como el resto, salvo que el dueño pida otra cantidad.)

### Estilos propuestos (punto de partida: cada uno se confirma cuando le toca)

| Línea | Estilo | Skills candidatas (del catálogo auditado) |
|---|---|---|
| W1 | Hachero: romper la armadura y castigarla | Romper armadura, Golpe fuerte, Golpe demoledor, Remate, Barrido |
| W2 | Berserker: cuanto más herido, más peligroso | Furia, Golpe desesperado, Aguante, Golpe fuerte |
| W3 | Martillero: golpes que atontan y derriban | Puño de roca, Pisotón, Salto aplastante, Golpe fuerte |
| W4 | Verdugo: el golpe anunciado y el remate | El que avisa no traiciona, Remate, Golpe demoledor, Furia |
| T1 | Escudero: escudo, aguantar y desarmar | Aguante, Desarmar, Pisotón |
| T2 | Muralla con púas: castiga al que le pega | Aguante, Coraza de púas, Envión |
| T3 | Guardaespaldas: cuida a los suyos | Envión, ¡Al frente!, Desarmar, Tirar la bronca |
| T4 | Peleador de control: empujar, tirar, demorar | Takle, Pisotón, Puño de roca |
| H1 | Embestidor: entra corriendo y pega | Takle, Golpe fuerte, Salto aplastante |
| H2 | Saltador: cae en el medio y barre | Salto aplastante, Barrido, Aguante |
| H3 | Duelista pesado: desarma y remata | Desarmar, Remate, Romper armadura |
| H4 | Bruto que aguanta: se la banca y devuelve | Aguante, Golpe desesperado, Furia |
| L1 | Sangrador | Golpe que sangra, Sal en la herida, Corte profundo |
| L2 | Envenenador | Hoja envenenada, Tajo veloz, Corte certero |
| L3 | Asesino de las sombras | Bomba de humo, Puñalada por la espalda, Puñalada trapera |
| L4 | Hostigador: pica y se va | Hit and run, Tajo veloz, Dash |
| L5 | Duelista: finta y estocada | Finta, Estocada, Ojo de asesino |
| L6 | Patotero: pelea en grupo | Patotear, Golpe a la rodilla, Tajo de carnicero |
| L7 | Degollador: busca al herido | Ojo de asesino, Degollar, Remate |
| L8 | Acróbata: se mueve y corta | Dash, Salto, Ráfaga de cortes |
| R1 | Tirador de precisión | Tiro certero, Tiro a la cabeza, Vigilancia |
| R2 | Hostigador a distancia: dispara y se va | Disparo y repliegue, Ráfaga encadenada, Mantener a raya |
| R3 | Trabador: frena y clava | Tiro a la rodilla, Clavar a la pared, Red |
| R4 | Hunter: trampas y toque | Tiro que derriba, Abanico, trampas (a definir) |
| M1 | Piromante | Misiles elementales, Meteoro, muro de fuego |
| M2 | Mago de escarcha | Hálito polar, Lluvia de escarcha, Prisión de hielo |
| M3 | Mago del rayo | Zap, rayo en cadena, Descarga arcana |
| M4 | Arcano: control y movilidad | Tormenta arcana, Nova arcana, Parpadeo, Cascotazo |
| S1 | Sanador | Sanar, Oleada sanadora, Purificar, Luz para los suyos |
| S2 | Abanderado: potencia al grupo | Estandarte de guerra, ¡A la carga!, Redoble de tambores |
| S3 | Armero: arma elemental y bendiciones | Arma ígnea / helada / eléctrica, Bendecir el arma, Armas perforantes |
| S4 | Protector: escudos y empuje | Envión, Coraza de púas, Velo espejado, Empuje |
| D1 | Maldito: bajar defensas | Maldición de la coraza, Maldición debilitante, Aguja siniestra |
| D2 | Tóxico | Nube tóxica, Corroer, Maldición de la sequía |
| D3 | Ladrón de fuerzas | Robar el aliento, Extenuar, sanguijuela |
| D4 | Control mental y ceguera | Confusión, Cegar, Grito de pánico, Tótem de silencio |

**Huecos del pool**: el Tanque tenía pocas skills propias auditadas (Aguante, Desarmar, Pisotón, Takle). ✅ **Tanda Choque pesado definida el
2026-10-27**: 14 nuevas para quedar en 10 warrior · 10 tanque · 10 ambiguas («Tanda Choque pesado 10 · 10 · 10» en `diseno-roles-creep.md`);
falta programarlas. Los estilos de abajo se repasan con ellas al llegar a cada línea. Si otra línea necesita una
skill que no existe, se diseña en el momento con el método de siempre.

Los Casters (Mago, Support, Debuffer) usan armas especiales (varitas, báculos) y orbes o talismanes; el Rango, arcos, ballestas y hondas, con sus
flechas o virotes en el cinturón. Su equipo se elige por lo que potencia sus skills (Ef.Esp, PdG.Esp, Res., distancia ideal, flechas especiales).

## Atributos de partida (reparto sugerido, se ajusta a mano)

Con los repartos por rol del asistente de creeps (`Combatiente.PESOS_ROL`), en el orden Con · Fue · Agl · Des · Esp:

| Rol | Nivel 1 (33) | Nivel 5 (45) |
|---|---|---|
| Warrior (brutal) | 9 · 10 · 4 · 6 · 4 | 12 · 14 · 6 · 7 · 6 |
| Tanque | 12 · 9 · 3 · 3 · 6 | 17 · 12 · 4 · 5 · 7 |
| Choque liviano (rápido) | 6 · 6 · 10 · 8 · 3 | 7 · 8 · 14 · 11 · 5 |
| Híbrido | entre warrior y tanque, a mano | |
| Rango, Mago, Support, Debuffer | con su reparto (`rango`, `mago`, `apoyo`, `debuffer`) | |

Si una skill tira un atributo (el Takle tira Constitución, el Pisotón Fuerza, una habilidad mágica Especial), ese atributo se sube un poco.

## Equipo por nivel (propuesta)

| Nivel | Equipo |
|---|---|
| 1 | Arma Común + 3 piezas Comunes (torso, cabeza y una más según el estilo: escudo, piernas, manos) |
| 2 | + 1 pieza Común (5 en total) |
| 3 | El arma pasa a Buena calidad + 1 pieza de Buena calidad |
| 4 | 2 piezas más pasan a Buena calidad; puede sumar un anillo o un talismán |
| 5 | Todo de Buena calidad (sin Raro por ahora: las Raras no están del todo auditadas) |

Cada pieza se elige porque hace algo con sus skills (un hacha con Rompe armadura para el Hachero, un escudo con Parada fácil para el Escudero).

## Forma de trabajo

0. **Antes**: la tanda de skills de Tanque (`diseno-roles-creep.md`).
1. **Rotación**: un creep de un rol, después uno del siguiente: Warrior → Tanque → Híbrido → Liviano → Liviano → Rango → Mago → Support → Debuffer →
   (de nuevo) Warrior… Así, en cada vuelta salen 9 (dos livianos). Con 4 vueltas quedan los 36 de nivel 1.
2. **Por cada creep**: concepto y nombre → atributos → arma y equipo → las 2 skills de nivel 1 y por qué combinan → botín (oro, qué ofrecer) → OK del
   dueño → queda anotado acá.
3. **Nivel 2 en adelante**: se recorren las mismas 20 líneas en el mismo orden: +3 atributos, +1 skill, la mejora de equipo del nivel.
4. **Se diseña primero y se programa después** (el mismo método que con las skills): se programa cuando el dueño lo pida (por ejemplo, al cerrar
   los 20 de nivel 1), se prueba en el mapa y se sigue.

## Estado

| Línea | Nivel 1 | Nivel 2 | Nivel 3 | Nivel 4 | Nivel 5 |
|---|---|---|---|---|---|
| W1 | | | | | |
| T1 | | | | | |
| H1 | | | | | |
| L1 | | | | | |
| L2 | | | | | |
| R1 | | | | | |
| M1 | | | | | |
| S1 | | | | | |
| D1 | | | | | |
| W2 | | | | | |
| T2 | | | | | |
| H2 | | | | | |
| L3 | | | | | |
| L4 | | | | | |
| R2 | | | | | |
| M2 | | | | | |
| S2 | | | | | |
| D2 | | | | | |
| W3 | | | | | |
| T3 | | | | | |
| H3 | | | | | |
| L5 | | | | | |
| L6 | | | | | |
| R3 | | | | | |
| M3 | | | | | |
| S3 | | | | | |
| D3 | | | | | |
| W4 | | | | | |
| T4 | | | | | |
| H4 | | | | | |
| L7 | | | | | |
| L8 | | | | | |
| R4 | | | | | |
| M4 | | | | | |
| S4 | | | | | |
| D4 | | | | | |

## Los creeps (cada uno se completa al diseñarlo)

_(vacío: el primero es W1, nivel 1)_
