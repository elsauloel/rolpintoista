# Ideas para arcos, flechas y el carcaj (lluvia de ideas, 2026-10-09)

> Guardada a pedido del dueño («guardala porque es espectacular la lista, se abrió todo un universo de diseño con las flechas»). Para podar
> después: el dueño dice cuáles van. Marcas: ✔ ya existe en el juego · ⚙ hay que programar algo chico · 🔧 hay que programar una pieza nueva.
> Lo ya decidido y programado de los arcos: [`rework-armas-rango.md`](rework-armas-rango.md) y [`balance-combate.md`](balance-combate.md).

## Lo que eligió el dueño de entrada: flechas especiales y el carcaj (a desarrollar)

- **Las flechas comunes son ilimitadas**; las **especiales** se compran en la **Talabartería** (y salen de botín), cada una con su calidad, su
  valor en oro y su efecto. «Abre todo un universo de posibilidades.»
- **Todo arco que se compra viene con un carcaj con lugar para 10 flechas especiales.**
- **Propuesta de Claude (falta la confirmación del dueño; respondió «Esto también», sin el resto):**
  1. El carcaj es **una pieza aparte** (su lugar en el equipo, como el cinturón), que viene gratis con el arco; en la Talabartería, **carcajes
     mejores** (de 15, de saque rápido, con bolsillo protegido…). Las flechas de la mochila no se disparan: se pasan al carcaj (fuera de combate
     gratis; en combate, como sacar del cinturón).
  2. Elegir la flecha **no cuesta No2** (sacarla es parte del disparo); un carcaj barato podría cobrar 1 como debilidad.
  3. La flecha **se pierde siempre**, pegue o no.
  4. Al atacar con un arco: **«¿Qué flecha?»** (la común o una del carcaj, con lo que hace cada una); su efecto va al duelo (el bono del tiro,
     efectos al golpear, daño elemental).
  5. Precio: la calculadora, como una fracción del efecto (es de un solo uso).
  6. Tandas: (1) el tipo «flecha» y el carcaj (lugar, el que viene con el arco, pasar de la mochila, la Talabartería); (2) «¿Qué flecha?» y su
     efecto en el duelo (personajes, creeps, invocaciones); (3) el catálogo de flechas y sus precios; después, las que hacen algo en el mapa.
- **Qué pueden hacer las flechas:** efecto al golpear (sangrado, veneno, marcado, cascabel, derribar, silbadora, clavar); daño elemental aparte
  (fuego, hielo, rayo, ácido: el daño híbrido; más fuerte cuanto más calidad); precisión o crítico (punta de aguja que perfora, balanceada +PdG, de
  caza +crítico); en el mapa (humo, luz, soga, señuelo).

## Perfora N (ignora N de Defensa) — dueño, 2026-10-09, a diseñar

- Un arma que **ignora 1, 2 o 3 puntos de Defensa** (no toda). «Tiene que ser un efecto bueno.» **Su casa: las punzantes** (en muchas), en
  **alguna cortante**, en **algunas flechas** y es **la marca distintiva de los virotes de ballesta**.
- **La casa de diseño de la ballesta va a ser Rompe armadura** (anotarlo para cuando se diseñen las ballestas).
- **Perfora N como bono de las armas chicas y medianas (Tipo 4 y 6)** (dueño, 2026-10-09, a desarrollar): «hay que tener cuidado de combinarla con
  los efectos que solo se activan cuando pasa el daño» (Veneno, Sangrado, Lisiado…): perforar hace que el daño entre más seguido, así que la
  combinación es fuerte. En la calculadora: **la combinación vale más que la suma de las partes** (un recargo de sinergia aparte del de combo).
- Medida (criterio de Claude, a confirmar con la herramienta): un punto de Perfora vale como mucho +1 de daño fijo, y un poco menos (solo sirve
  en un golpe sin crítico que llega a la armadura; el crítico ya ignora la Defensa entera). Propuesta: **0,8 de lo que vale +1 de daño fijo por
  punto** en `calculadora_armas.py`; en el duelo, se resta de la Defensa al guardar el daño (como `--perfora` de `balance_combate.py`).

## La lista completa (para podar)

**Efectos al golpear**
1. ✔ Sangrado doble (2 stacks por flecha).
2. ✔ Sangrado seguro si es crítico.
3. ✔ Veneno que se acumula fuerte (×3, ×4) a cambio de poco daño.
4. ✔ Pajaritos (la flecha que pega en el casco).
5. ✔ Rompe armadura (punta de acero; raro en un arco, de calidad alta).
6. ✔ Rengo (flecha a la pierna).
7. ✔ Quemadura (daño por turno), distinta de Prende fuego (terreno incendiado).
8. ⚙ Cegar: −Visión o −PdG un turno.
9. ⚙ Silenciar: sin habilidades con SP un turno.
10. ⚙ Desarmar: chance de que suelte el arma (ya existe en varitas).
11. ⚙ Miedo: en su turno tiene que alejarse del arquero, o pierde No2.

**Elementales y daño híbrido (desde Rara)**
12. ✔ Fuego, hielo, rayo, tóxico o ácido como dado aparte que ignora la Defensa.
13. ⚙ Ácido que además deja Armadura rota.
14. ⚙ Rayo que salta con crítico (rayo en cadena).
15. ⚙ Hielo que congela con crítico (Inmovilizado 1 turno).
16. ⚙ Fuego que se contagia (Quemadura a los de al lado).

**Posición y distancia**
17. ✔ Distancia ideal con un efecto distinto por franja.
18. ⚙ Tirador quieto: +PdG si no se movió.
19. ⚙ Tiro en movimiento / disparo gratis al terminar de moverse (arco de jinete).
20. ⚙ Disparo de retirada: un paso atrás gratis después de disparar.
21. ⚙ Altura: +PdG desde un elemento alto (cuando haya alturas).
22. ⚙ Contra el que está quieto: +PdG si el objetivo no se movió.
23. 🔧 Más allá del alcance, con −PdG por casillero.

**Crítico**
24. ✔ Ojo de halcón: +1 d20 en el crítico.
25. ✔ Ignora Resistencia a crítico (puntas perforantes).
26. ⚙ Crítico que no gasta: si sale crítico, ese disparo no cuesta No2.
27. ⚙ Crítico que marca.
28. ⚙ Primer disparo del combate: Crítico frecuente +2.

**Ritmo y No2**
29. ✔ Primer disparo del turno −1 No2.
30. ⚙ Tiro rápido: todos los siguientes −1 No2.
31. 🔧 Apuntar: gastar No2 antes de disparar para sumar PdG (¿firma de todos los arcos?).
32. 🔧 Disparo doble: dos flechas con la mitad de los dados.
33. 🔧 Ráfaga: tres flechas con −2 PdG cada una.

**Táctica y control**
34. ✔ Silbadora (Demora).
35. ⚙ Flecha que clava: Inmovilizado; más fuerte contra una pared.
36. ⚙ Empuje 1 casillero.
37. 🔧 Flecha que atraviesa: sigue al siguiente de la línea.
38. 🔧 Garfio: atrae al objetivo o lleva al arquero.
39. ⚙ Fuego de cobertura: el aliado cubierto suma +1 Evasión hasta el próximo turno del arquero.
40. ⚙ Tiro de aviso: el rival elige entre alejarse o perder No2.

**Sigilo, trampas e invocaciones (para el Cazador)**
41. ⚙ Disparo silencioso: tirada para no ser escuchado (P184).
42. ⚙ Detonador: disparar a una trampa propia la dispara a distancia.
43. ⚙ Flecha con cascabel: no puede entrar en sigilo por 3 turnos.
44. ⚙ Vínculo con la invocación: +PdG o +daño si tu invocación está al lado del objetivo.
45. ⚙ Señuelo: un ruido en una casilla; los creeps cercanos giran hacia ahí.

**Utilidad fuera del golpe**
46. ✔ Mira: +Visión o +Percepción.
47. ⚙ Flecha de luz: ilumina una flor de 7 y revela lo oculto.
48. ⚙ Flecha de humo: nube que tapa la vista.
49. ⚙ Flecha con soga (narrativo, ✋ a mano).
50. 🔧 Flechas especiales como consumible del carcaj (elegido por el dueño: ver arriba).

**Debilidades (para abaratar)**
51. ✔ Sin tiro alto.
52. ✔ Frágil.
53. ⚙ Lento de tensar: el primer disparo del turno +1 No2.
54. ⚙ Ruidoso: rompe el sigilo siempre, sin tirada.
55. ⚙ Pesado: −1 Evasión equipado (ya se puede con un bono negativo).
56. ⚙ Corto alcance: Rango −1.
57. ⚙ Impreciso de lejos: −PdG fuera de la distancia ideal.

**De la primera tanda (anteriores):** flecha que marca ✔, de hielo ✔, relámpago ✔, daño híbrido desde Rara ✔, que derriba ✔, Veneno severo ✔,
Drena vida ✔, Resistente ✔, Matabestias / matagente ⚙, contra lo que levita ⚙, efecto solo en la distancia ideal ⚙, comba (P185).

## Decidido y programado (2026-10-09)
- **Carcaj**: pieza aparte, **viene con todo arco (10 lugares)**; se compran mejores (de cazador 15, **veloces**: las primeras N flechas especiales del turno que cuestan No2 tiran
  una moneda, 2 = no cobran su No2 (dueño: «la primera es la que vale más»; de saque rápido Buena N=1, del jinete Rara N=2 y 12 lugares, del
  viento Excepcional N=3 y 15 lugares), de la guardia 20 con PdG a distancia +1). Pasar flechas de la mochila al carcaj: gratis fuera de combate.
- **Las flechas compradas no trabajan con %** (dueño: «es muy decepcionante gastar plata, tiempo, espacio en el carcaj para que el dado falle»): sus
  efectos son **siempre** que pegan; lo fuerte se paga con **No2 extra** (0 lo leve, 1 un estado o daño elemental, 2 control fuerte, 3 el Stun) y oro.
- **Si erra, queda en el suelo siempre** (en la casilla más lejana del alcance, siguiendo la línea), salvo que choque contra algo con colisión: ahí
  50 % de romperse.
- **Todo creep que pelea con arco deja siempre una flecha especial** como botín.
- **Perfora N** (ignora N de Defensa): programado para las flechas (la Perforante 1, la de acero templado 2).
- Las 21 flechas cargadas: Balanceada, Perforante, Marcadora, Silbadora, De caza, De punta roma (Comunes); De aguja, Envenenada, De fuego, De
  escarcha, Relámpago, De ácido, Cegadora, De arpón (Buenas); Del rastreador, De acero templado, De fuego vivo, De hielo negro, Aulladora,
  Silenciadora, De tormenta (Raras).
- **Las flechas elementales son siempre híbridas** (dueño, 2026-10-09; descartadas las puramente especiales porque se pisan con las varitas): el
  daño del arco (físico: resta la Defensa, critea) + un daño elemental aparte, directo (no resta la Defensa ni la Defensa especial, solo la
  resistencia a ese elemento; no se multiplica con el crítico) + el efecto que les da identidad. Identidad de cada una (dueño, 2026-10-09): **fuego** el daño que sigue
  (Quemadura); **hielo** Escarcha 1 turno, que entra aunque la armadura pare el golpe; **ácido** Armadura rota; **eléctrico**: la Relámpago (Buena, +1 No2,
  $45) no tiene daño extra: Parálisis 1 turno garantizada y salta una vez (50 % de Parálisis al segundo); la de Tormenta (Rara, +3 No2, $150): +2d4
  eléctrico que salta a la mitad (con 1 se corta), Parálisis al blanco y 50 % / 25 % a los dos siguientes. **Envenenada**: Perfora 1 + Veneno ×3 (el
  veneno sigue necesitando que pase el daño: para eso perfora).

## Segunda ronda: mecánicas de arco (2026-10-11, lluvia de ideas para podar)
El dueño: «siento que es más acotado en efectos que otras armas». Mismo protocolo que con las armas cuerpo a cuerpo: el dueño marca **sí / no /
desde tal calidad**. ✔ = la mecánica ya existe en el juego (solo falta ponerla en un arco).

**A. Ritmo y tensar:** 1 Tensar (1 No2 extra antes de disparar: +2 PdG o +1 dado) · 2 Disparo doble (dos flechas al mismo objetivo, −2 PdG cada
una) · 3 Ráfaga (una flecha a cada uno de hasta 3 objetivos en un cono, una sola PdG) · 4 Tiro rápido (los disparos después del primero −1 No2) ·
5 Llega cargado (si no disparó el turno anterior, el primero suma +2 de daño) · 6 ✔ Primer disparo del turno −1 No2.
**B. Distancia y posición:** 7 ✔ Tirador quieto (+PdG si no se movió) · 8 Disparo de retirada (un paso atrás gratis, sin oportunidad) · 9 Tiro en
movimiento (disparar a mitad del movimiento) · 10 Largo alcance (más allá del Rango con −1 PdG por casillero) · 11 ✔ Distancia ideal con dos franjas
distintas · 12 Contra el que se acerca (+PdG contra un rival que se movió hacia vos este turno) · 13 Distancia mínima menor (tira con 1 casillero
libre en el medio) · 14 Altura (+PdG desde un elemento alto, cuando haya alturas).
**C. Crítico y precisión:** 15 ✔ +1 d20 en el crítico · 16 ✔ Ignora Resistencia a crítico · 17 Emboscada (primer disparo del combate: Crítico
frecuente +2) · 18 El crítico no cuesta No2 · 19 ✔ El crítico marca · 20 A la articulación (con crítico, Rengo o Lisiado seguro) · 21 Paciencia
(+1 PdG por turno sin disparar, hasta +3).
**D. Sobre el objetivo:** 22 Matabestias (+daño contra bestias) · 23 Contra lo que vuela o levita (+PdG) · 24 Contra el Marcado (+PdG o +daño) ·
25 Contra el que estaba en sigilo y lo acaban de descubrir (+daño) · 26 Empuje 1 casillero · 27 ✔ Clava contra una pared (Inmovilizado) ·
28 ✔ Silbadora (Demora) · 29 ✔ Derriba (Sentado) con crítico.
**E. Cobertura y defensa:** 30 Fuego de cobertura (un aliado al lado del objetivo suma +1 Evasión hasta tu próximo turno) · 31 Supresión (si
pega, el objetivo paga +1 No2 por casillero para acercarse a vos en su turno) · 32 Guardia (+1 Evasión con el arco en las manos si no disparaste
este turno) · 33 Arco con hojas (rompe la regla: deja pegar cuerpo a cuerpo con el arco, débil).
**F. Sigilo y caza:** 34 Disparo silencioso (disparar no rompe el sigilo, o con tirada) · 35 Por la espalda a distancia (el primer disparo desde el
sigilo cuenta como por la espalda) · 36 Rastro (el objetivo queda a la vista en la niebla N turnos) · 37 Detonador (disparar a una trampa propia
la dispara) · 38 Señuelo (una flecha que suena en una casilla: los creeps de cerca miran hacia ahí).
**G. Utilidad:** 39 ✔ Mira (+Visión o +Percepción) · 40 ✔ Iniciativa +N · 41 Garfio o soga (moverse hasta un punto) · 42 ✔ Disparo de señal (luz).
**H. El arco y sus flechas:** 43 Afinidad (con un tipo de flecha, su efecto +1) · 44 Recupera (una flecha especial que erra vuelve al carcaj con
moneda) · 45 Arco rúnico (sus flechas comunes hacen daño elemental, desde Rara) · 46 Doble carga (dos flechas especiales a la vez).
**I. Identidad del arco:** 47 Arco de guerra (suma la Fuerza entera) · 48 Arco compuesto (suma la mitad de la Destreza en vez de la Fuerza: el arco
del Shooter) · 49 Arco arcano (suma la mitad del Efecto especial) · 50 Arco de mano (Tipo 4, una mano) · 51 Arco maldito (+daño, pero −1 HP por
disparo) · 52 Arco que se calienta (+1 de daño por cada rival que cae en el combate).
**J. Debilidades (abaratan):** 53 Ruidoso (rompe el sigilo siempre) · 54 ✔ Frágil · 55 Pesado (−1 Evasión equipado) · 56 Corto alcance (Rango −2) ·
57 Cuerda floja (si todos los dados salen 1, se corta: 1 No2 para arreglarla) · 58 ✔ Sin tiro alto.
