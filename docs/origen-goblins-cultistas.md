# «El origen de las especies»: los goblins de la Grieta (rework de los kobolds)

> Hoja de trabajo (dueño, 2026-10-27). Se retoma desde acá en cualquier conversación. Método: [`metodo-diseno-encuentros.md`](metodo-diseno-encuentros.md)
> (grupo → creeps → progresión → botín). Se diseña primero y se programa después.

## Lo que pidió el dueño (2026-10-27)

- «Los kobolds ya no van a existir… los vamos a usar como base, pero van a ser goblins… que tienen algún tipo de control mental, maldición, por
  parte de unos cultistas.»
- «Reworkearlos para que sean más poderosos que los de la última pelea, que fue bastante aburrida… los creeps no le hicieron prácticamente nada a
  los jugadores. Los jugadores no subieron de nivel.»
- **Tres encuentros**, con **goblins de nivel 2 o 3** acompañados de **humanos**: los goblins son la base, los humanos los comandantes, «más astutos».
- Primer encuentro, en función de los jugadores: **algo que le pase la armadura a Petro**, **tiradores que aparezcan por los costados y apunten a
  Larry**, puede haber **magia**, **alguien que ponga trampas**.
- **Solo habilidades auditadas** (las de estos días, `HABILIDADES_CREEP_CATALOGO`); las demás quedan archivadas como referencia.

## El grupo (leído de la partida el 2026-10-27, solo lectura)

| | Petro (Rockardo, Tanque N2) | Larry (Debuffer N2) | Bizzante (Asalto/Summoner N2) |
|---|---|---|---|
| Vida | 35 (Regeneración) | 20 | 25 (+2 por turno, Túnica) |
| Defensa / Def.Esp | **12** / 0 | 4 / 0 | 5 / 1 |
| Evasión / Parry / Bloqueo | 7 / 8 / 9 | 4 / 5 / 4 | 8 / 8 / 6 |
| Res.Esp / Res.CC / Res.Mt | 7 / 7 / **5** | **4** / 5 / **19** | 5 / 5 / 9 |
| Res. a crítico (T4…T12) | 1·1·1·1·0 | 0 | 2·0·0·0·0 |
| Ataque | Maza 3d10 + 10 (Tipo 10), 9 No2 | Drenar Vida, Pedos Tóxicos (zona), 57 SP, Rango 5, 4 No2 | Machete 1d6 + 6 (Rompe armadura), 2 Abejas (10 HP) |
| Cinturón | nada | nada | 1 Poción de HP, Antorcha |

Lectura: a Petro no le entra un arma común (Defensa 12); su punto flaco es la **Res.Mt 5** (control mental) y la Def.Esp 0. Larry es frágil (20 HP,
Evasión 4, Res.Esp 4), pero con Res.Mt 19 el control mental no le hace nada; si los goblins se amontonan, los Pedos los barren. Bizzante es el blando
del cuerpo a cuerpo; sus abejas caen con cualquier área.

(También están en la partida «Estrella culona», la ficha de prueba del dueño, y «Aurelius Risus, el mago sonriente», Asesino N1: falta confirmar si juega.)

## De kobold a goblin (los conceptos que se conservan)

| Kobold de antes | Goblin nuevo | Rol (línea de `creeps-humanoides.md`) | Encuentro |
|---|---|---|---|
| Kobold Rabioso | Goblin rompecorazas | Warrior — Hachero (W1) | 1 |
| Kobold ballestero / de ojo fino | Goblin ballestero ×2 | Rango — Tirador (R1) y Trabador (R3) | 1 |
| Kobold boom boom | Goblin trampero | Hunter (R4) | 1 |
| Kobold maldiciente | (lo reemplaza el cultista humano) | Debuffer (D1) | 1 |
| Kobold escudero de barril | Goblin escudero | Tanque | 2 |
| Kobold farolero | Goblin farolero | Mago — Piromante (M1) | 2 |
| Kobold hongero | Goblin hongero | Support — Sanador (S1) | 2 |
| Kobold tunelero | Goblin tunelero | Choque liviano (Excavar todavía no está auditada) | 2 o 3 |
| Capataz kobold | Capataz goblin (lugarteniente) | Jefe de los goblins | 3 |

## Encuentro 1 — la composición del dueño (2026-10-27)

Dueño: «un choque pesado, un choque liviano, dos shooters, uno humano y uno goblin, el humano con arco, el goblin con ballesta, y el humano jefe que
sea mago de buffer… en nivel 1 tenés 2 skills, a partir de nivel 2, 3, 4, un skill más por nivel. Pensémoslos para que generen sinergia consigo
mismos y entre sí.» (La primera propuesta —cultista Debuffer, rompecorazas, dos ballesteros, trampero— quedó descartada.)

Propuesta de skills (esperando el OK; todas auditadas):

- 👑 **Jefe humano, mago buffer (Support), nivel 3 — 4 skills**: Armas perforantes · Señalar la presa · ¡A la carga! · Bendecir el arma (Flash).
- 🏹 **Arquero humano (Rango, tirador), nivel 3 — 4 skills**: Tiro certero · Tiro a la cabeza · Ráfaga encadenada · Vigilancia.
- 🏹 **Ballestero goblin (Rango, trabador), nivel 2 — 3 skills**: Tiro a la rodilla · Clavar a la pared · Red tendida.
- 🛡 **Choque pesado goblin, nivel 3 — 4 skills**: Provocar · Romper armadura · Golpe demoledor · Piel de hierro.
- 🗡 **Choque liviano goblin (sangrador), nivel 2 — 3 skills**: Golpe que sangra · Sal en la herida · Hit and run.

Sinergias: la Presa del jefe sobre Larry (−2 Evasión, +4 de daño de cada golpe) la cobran los dos tiradores y el liviano; las Armas perforantes
(3 puntos pasan siempre la Defensa) hacen que el Sangrado del liviano le entre a Petro; el pesado provoca a Petro (Res.Mt 5) y le rompe la armadura;
la Red y la Vigilancia frenan a Petro si va por los tiradores; ¡A la carga! suma a todos. Riesgo a simular: Ráfaga encadenada sobre una Presa puede
tirar a Larry en un turno.
