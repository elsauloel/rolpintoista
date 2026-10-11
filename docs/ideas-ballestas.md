# Ballestas y virotes — lluvia de ideas (para podar)

> Arrancó el 2026-10-10. La base ya está decidida en [`rework-armas-rango.md`](rework-armas-rango.md) (no suman Fuerza, Recarga 1/2/3 con cobro
> N, 2N, 3N…, pasan la armadura, las «de mano» a una mano, disparan pegadas, sin tiro alto, virotes comunes que no se cuentan y especiales como las
> flechas). Esto es la lista amplia para elegir: el dueño poda, y lo que quede se mide y se diseña. Mismo método que [`ideas-arcos-flechas.md`](ideas-arcos-flechas.md).
> Lo que se programa reusa lo que ya existe (marcado con ♻).

## Rasgos de ballesta (lo que trae el arma)

**De la mecánica (cargar y disparar)**
1. **Llega cargada:** el primer disparo del combate (o el primero después de un turno sin disparar) cuesta 0 No2. La ballesta se carga antes; lo
   lento es volver a cargarla. Premia la emboscada y el primer golpe.
2. **Recargar en vez de disparar:** gastar No2 en un turno sin disparar deja la próxima «cargada» (cuesta 0). Un ritmo: un turno carga, el otro dispara.
3. **Apuntada (mira):** si no te moviste en el turno, +2 PdG. El francotirador quieto contra el que se mueve.
4. **Doble carga:** dispara dos virotes juntos contra el mismo objetivo (dos tiradas de daño) por el doble de No2. Para pasar la armadura dos veces.
5. **De repetición (Recarga 1):** muchos tiros chicos (medido: solo sirve contra lo liviano). ♻ el cobro de las varitas.
6. **De asedio (Recarga 3)** y **emplazada:** no se puede mover y disparar en el mismo turno, pero con PdG o Perfora de más.

**De la distancia**
7. **A quemarropa:** pegada al objetivo (distancia 1), +2 de daño fijo o Perfora +2. La ballesta es la que dispara pegada: que lo aproveche.
8. **Alcance largo con caída:** más Rango, pero −1 de daño fijo por cada casillero más allá de la mitad del alcance.

**Contra la armadura y el escudo (su identidad)**
9. **Rompe armadura** (50 %, 25 %…) ♻ el efecto al golpear que ya existe.
10. **Atraviesa escudos:** si te paran con escudo, el escudo se rompe un poco (Armadura rota al que lo para) o el Parry cuesta más No2.
11. **Perfora N** en el arma (no solo en el virote) ♻.

**De mano y combinadas**
12. **Desenfunde rápido:** cambiar a la ballesta de mano cuesta 0 No2 (en combate cambiar de arma cuesta).
13. **Un par de ballestas de mano:** una en cada mano; la segunda dispara como «otro arma» (con su propio cobro).
14. **Ballesta-escudo:** una ballesta de mano montada en un escudo chico (Parry de escudo + disparo).
15. **Ballesta con bayoneta:** se puede pegar cuerpo a cuerpo con ella (como un arma Tipo 4 floja).

**En el mapa**
16. **Ballesta de muralla (torreta):** no se lleva encima; se coloca en el mapa como un elemento y la puede usar cualquiera que esté al lado.
    Defender un fortín, una almena. ♻ los elementos del mapa.
17. **Silenciosa:** disparar no rompe el sigilo (los arcos sí rompen). El asesino de lejos. Ver P184.
18. **Arpón / garfio con soga:** el virote lleva soga: tirás al objetivo 1 casillero hacia vos, o te tirás vos hacia un Sólido (movilidad).

## Virotes especiales (como las flechas; se comparten mecánicas ♻ «¿Qué flecha?», el carcaj, `limpiarEfectosFlecha`)

**Contra la armadura (la marca de la casa)**
1. **Virote perforante:** Perfora +2 (la base de los especiales).
2. **Virote de punta de diamante:** ignora toda la Defensa (de alta calidad, caro en No2: «nitros muy preciados»).
3. **Virote rompe-corazas:** Rompe armadura 100 % si entra.

**De control**
4. **Virote de plomo:** sin punta, golpe sordo: Aturdir 25 % o Derribar.
5. **Virote de clavo:** si el objetivo tiene un Sólido detrás, queda **clavado** (Inmovilizado 1 turno). Mira el mapa ♻ `solidosSet()`.
6. **Virote de red:** se abre en el aire: Inmovilizado 1 turno, sin daño.
7. **Virote de garfio:** la soga del rasgo 18, pero como munición.

**Elementales** (híbridos, igual que las flechas: el daño físico critea, el elemental es directo) ♻ `dn.magico`
8. Incendiario, de escarcha, eléctrico (con salto ♻ `flechaSalto`), ácido (Rompe armadura elemental).

**En el mapa**
9. **Virote explosivo:** área de diámetro 3 (flor de 7) donde cae, daño de fuego. ♻ las zonas.
10. **Virote de humo:** nube de diámetro 3 que tapa la línea de tiro 2 turnos. ♻ los Sólidos temporales.
11. **Virote de luz:** bengala, diámetro 3 (flor de 7), alumbra la niebla. ♻ las luces.
12. **Virote silbador:** avisa a los aliados (señal en la Mesa y en el mapa).

**Raros**
13. **Virote de rebote:** si falla, rebota a otro objetivo pegado al primero (la mitad del daño). Lo físico del «salto» eléctrico.
14. **Virote de sangre:** Sangrado 2 stacks.
15. **Virote envenenado:** Perfora 1 + Veneno (la flecha envenenada ♻).

## Ballestas con nombre (ideas para la lista, mitad clásico, mitad criollo)
- Ballesta de mano · de cazador · de estribo (Común) · de guardia · de fortín · de tranquera (Buena) · de guerra · pesada · de repetición (Rara) ·
  de asedio · del alguacil (Excepcional) · una Legendaria con un rasgo único (por ejemplo, «llega cargada» + «atraviesa escudos»).

## Para medir antes de elegir
- «Llega cargada» y «Apuntada»: cuánto suben el daño por turno (un disparo gratis por combate es mucho al principio y poco en un combate largo).
- «Doble carga» y «Un par de ballestas»: cuidado con duplicar el daño por turno.
- Los de control (Aturdir, Inmovilizado) van con porcentaje y en virotes caros: «la ballesta pasa la armadura», no es la reina del control.

## 2026-10-10 · Primera poda (dueño)
- **Silenciosa (17): en espera** hasta definir el dilema del rango con sigilo (P184).
- **Arpón / garfio con soga (18 y virote 7): no se descarta, pero va primero como ítem de utilería** — un **garfio con soga** (grappling hook) que
  se vende en la **Talabartería**, no un arma. Como arma habría que buscarle la vuelta (una tirada de Fuerza contra la Constitución del objetivo, etc.).
- **Virotes especiales:** se pueden **repetir muchos efectos de las flechas** sin problema; los que propuso Claude «están muy bien».
- **Virotes de control:** se ven caso por caso.
- Con esto «ya tenemos un panorama»: lo que sigue es elegir qué entra a la lista por calidad y medirlo.

## 2026-10-10 · Lluvia de ideas de BONOS de ballesta (para elegir una por una y decir en qué calidad va)
> Pedido del dueño: «muchas, muchas ideas de bonos de ballesta; yo después te digo: esta me gusta, esta en Común, esta en Buena…».
> ✅ = ya existe (se puede usar ya) · ⚙ = hay que programarla.

**Ritmo y recarga**
1. ✅ Recarga 1 / 2 / 3 (rápida, común, de asedio).
2. ✅ Llega cargada: el primer disparo del turno es gratis si no disparaste el turno anterior.
3. ✅ Primer disparo −1 No2.
4. ⚙ Cargador: 2 disparos «cargados» por combate (los dos primeros gratis), después recarga normal.
5. ⚙ Doble cuerda: el segundo disparo del turno cuesta como el primero (2, 2, 6…).
6. ⚙ Recarga rápida tras matar: si el disparo voltea al blanco, el siguiente es gratis.
7. ⚙ Manivela: gastar 1 No2 sin disparar deja la próxima «cargada» (gratis).

**Puntería**
8. ✅ PdG +N.
9. ✅ Apuntada +N (sin moverse en el turno).
10. ⚙ Mira de lejos: +1 PdG por cada 3 casilleros de distancia.
11. ⚙ Mira de cerca: +2 PdG a 1–3 casilleros.
12. ✅ Distancia ideal (franja con PdG, daño o crítico).
13. ⚙ Al acecho: +2 PdG contra un rival que no te vio este turno (sigilo/niebla).
14. ⚙ Marcar: el blanco queda Marcado 1 turno (lo ven todos, no se esconde).
15. ⚙ Tirador de apoyo: +1 PdG a los aliados que ataquen al mismo blanco este turno.

**Contra la armadura (la casa)**
16. ✅ Perfora N.
17. ✅ Rompe armadura N % (y ×2 stacks).
18. ✅ Atraviesa escudos (abolla el escudo que lo para).
19. ⚙ Punta de diamante: contra Defensa 12 o más, Perfora +2.
20. ⚙ Remachadora: cada golpe al mismo blanco en el combate suma +1 Perfora (hasta +3).
21. ⚙ Desarma: 25 % de que el escudo del blanco caiga al piso (Desarmado del escudo).
22. ⚙ Ignora la Defensa especial (el virote encantado).

**Daño y crítico**
23. ✅ Daño fijo +N · Crítico frecuente +N · Crítico potente +N · ignora N de Res. crítico.
24. ⚙ Golpe de gracia: +3 de daño contra un blanco con la mitad de la vida o menos.
25. ⚙ Primer disparo del combate: +1 dado.
26. ⚙ Virote pesado: +2 de daño pero −1 Rango.
27. ⚙ Daño elemental de la ballesta (+1d4 fuego / hielo / rayo / ácido), sin virote especial.
28. ⚙ Doble virote: dispara dos virotes juntos al mismo blanco, dos tiradas de daño, por el doble de No2.

**Control**
29. ✅ Lisiado · Derribar · Sangrado · Veneno · Veneno severo · Demora · Rengo · Prende fuego (con %).
30. ⚙ Empujón: el blanco retrocede 1 casillero (2 con Recarga 3).
31. ⚙ Clavar al suelo: 25 % Inmovilizado 1 turno sin necesitar pared.
32. ⚙ Silbido: Demora + avisa a los aliados (mesa).
33. ⚙ Aturdir 20 % en un crítico.
34. ⚙ Desequilibra: el blanco queda Sentado si estaba corriendo (se movió 3 o más este turno).

**Posición y movimiento**
35. ✅ A quemarropa (+N pegado).
36. ✅ Oportunidad sin No2 · ⚙ Oportunidad con +2 PdG.
37. ⚙ Disparo en retirada: alejarse 1 casillero después de disparar no provoca ataque de oportunidad.
38. ⚙ Tiro alto (como el arco) en una ballesta de cuerda larga.
39. ⚙ Trípode: si no te moviste, Recarga −1 en ese turno.
40. ⚙ Desde lo alto: +2 PdG si estás en una casilla elevada (cuando exista la altura en el mapa).

**Defensa y mano libre**
41. ✅ Una mano (escudo u otra arma en la otra).
42. ⚙ Ballesta-escudo: hace de escudo chico (Parry contra disparos con −2).
43. ⚙ Bayoneta: se puede pegar cuerpo a cuerpo con ella (Tipo 4 flojo) y parrear.
44. ⚙ Disparo de cobertura: si un aliado pegado a vos es atacado, podés gastar tu disparo para darle −2 al PdG del atacante.

**Mapa y utilería**
45. ⚙ Garfio con soga (la utilería de la Talabartería, o como rasgo).
46. ⚙ Ballesta de muralla (torreta que usa cualquiera que esté al lado).
47. ⚙ Linterna en la culata: luz de diámetro 3 alrededor del tirador.
48. ⚙ Silenciosa (espera al sigilo, P184).
49. ⚙ Señalizadora: el virote marca la casilla para los aliados (dibujo en el mapa 2 turnos).

**Carcaj y virotes**
50. ⚙ Carcaj integrado: +3 lugares de virotes especiales.
51. ⚙ Virote recuperable: el virote especial que erra no se rompe nunca contra un obstáculo.
52. ⚙ Ahorro: 50 % de que el virote especial no se gaste.
53. ⚙ Afinidad: un tipo de virote (fuego, veneno…) hace +1 de su efecto con esta ballesta.

**Debilidades que la abaratan (para diseñar barato)**
54. ⚙ Pesada: −1 Evasión mientras está equipada.
55. ⚙ Ruidosa: disparar rompe el sigilo de los que están cerca tuyo.
56. ⚙ Frágil: −50 % de durabilidad.
57. ⚙ Lenta de montar: no se puede disparar en el mismo turno que te moviste más de 2 casilleros.
58. ⚙ Corto alcance: Rango −1.

## Tercera ronda: mecánicas de ballesta (2026-10-11, lluvia de ideas para podar)
Pedido del dueño, después de la segunda ronda de los arcos: «lo mismo con las ballestas; no importa si algunas se superponen con el arco». No repite
las dos listas de arriba (rasgos y bonos del 10-10). (≈ arco) = la versión de ballesta de una idea que el dueño eligió para los arcos.
Recordatorio de la base: no suma Fuerza, Recarga N (N, 2N, 3N…), dispara pegada, sin tiro alto, su casa es Perfora y **Rompe armadura (exclusivo)**.

**A. Recarga y mecanismo:** 1 Tensar a fondo (≈ arco: 1 No2 extra antes de disparar → +2 de daño fijo; en la ballesta el bono va al daño) ·
2 Tiro rápido (≈ arco: el 2.º disparo del turno cuesta N+1 en vez de 2N) · 3 Engranajes (la Recarga no sube: N, N, N; a cambio, Rango −2) ·
4 En guardia (si no disparaste en tu turno, dejás la ballesta apuntando a una línea o cono: el primer rival que entra recibe el disparo, pagando la
Recarga en ese momento) · 5 Palanca de pie de cabra (la Fuerza no suma daño pero ayuda a cargar: Recarga −1 con Fuerza alta).
**B. Puntería y distancia:** 6 Largo alcance (≈ arco: más allá del Rango, −1 o −2 PdG por casillero) · 7 Mira telescópica (+1 PdG por cada
casillero más allá de 4, hasta +3; +Visión) · 8 Emboscada (≈ arco: primer disparo del combate, Crítico frecuente +2) · 9 Por la espalda a
distancia (≈ arco) · 10 Contra el que carga (+PdG o +daño contra un rival que se movió hacia vos este turno: la ballesta frena la carga) ·
11 Tiro raso (un aliado en el medio no tapa la línea de tiro).
**C. Contra la armadura (la casa):** 12 Atraviesa cuerpos (el virote pasa al de atrás en la misma línea, con la mitad del daño) · 13 Contra lo
pesado (+1 de daño por cada 2 de Defensa del blanco por encima de 6, hasta +3) · 14 Clavo en la grieta (Perfora +1 por cada stack de Armadura rota
que ya tenga el blanco: combina con Rompe armadura) · 15 Rompe armadura doble con crítico · 16 Contra escudos (+PdG contra un rival con escudo
equipado) · 17 Revienta barreras (el daño contra un Escudo especial o una Barrera cuenta doble).
**D. Daño y crítico:** 18 Pega parejo (los dados de daño nunca salen menos de la mitad de sus caras: poca varianza, la identidad de la ballesta) ·
19 Matagigantes (≈ Matabestias: +daño contra un tipo de criatura; para la ballesta, constructos o gigantes) · 20 Que se calienta (≈ arco: +1 por
rival caído, +3 si lo volteó ella) · 21 Remate (contra un blanco Sentado o Inmovilizado, Crítico frecuente +1).
**E. Control:** 22 Clavar la ropa (con crítico, Inmovilizado 1 turno sin necesitar pared) · 23 Estampar (si el Empujón lo choca contra un Sólido,
+2 de daño) · 24 Desarmar a distancia (con crítico, el arma del blanco cae al piso) · 25 Tiro al brazo (el blanco tiene −2 PdG hasta su próximo
turno) · 26 Supresión (≈ arco: si pega, acercarse a vos le cuesta +1 No2 por casillero en su turno) · 27 Cortar la retirada (si pega, el blanco no
puede alejarse más de 2 casilleros en su turno).
**F. Posición y cobertura:** 28 Apoyada (+1 PdG si tenés un Sólido o un aliado al lado: apoyás la ballesta) · 29 Pavés (un escudo grande que se
planta en el mapa como Sólido de 1 casilla y tapa los disparos de los rivales; el ballestero dispara desde atrás) · 30 Moverse después de disparar
sin perder la Apuntada del próximo turno.
**G. Sigilo y caza:** 31 Ballesta trampera (se coloca como trampa real: queda armada en el mapa y dispara a quien cruza una línea) ·
32 Virote que marca (≈ arco: deja Marcado) · 33 Silenciosa (sigue en espera, P184).
**H. Manos:** 34 Con escudo (la de dos manos se puede usar con escudo, pero la Recarga sube 1) · 35 Culatazo (se puede pegar cuerpo a cuerpo con la
culata: contundente Tipo 4, Demora con %).
**I. Virotes y carcaj:** 36 Afinidad elemental (≈ arco: +1 al efecto de los virotes elementales) · 37 Ballesta rúnica (≈ arco: sus virotes comunes
hacen daño elemental, desde Rara) · 38 Cargador (los 2 primeros virotes especiales del combate no cobran su No2 extra) · 39 Pesado o liviano (cada
disparo se elige: virote pesado +2 de daño y −2 Rango, o liviano +2 Rango y −1 de daño) · 40 Recuperar virotes (al terminar el combate, cada virote
especial que pegó vuelve con una moneda).
**J. Identidad:** 41 De cranequín (suma la mitad de la Destreza al daño: la de un tirador; cuidado, como el arco compuesto) · 42 Arcana (suma la
mitad del Efecto especial) · 43 Maldita (≈ arco: +daño, pero −1 HP por disparo).
**K. Debilidades (abaratan):** 44 Corto alcance (≈ arco: Rango −2) · 45 Se traba (si todos los dados del PdG salen 1, se traba: 1 No2 para
destrabarla) · 46 Lenta de apuntar (−2 PdG si te moviste en el turno) · 47 Cuerda que se afloja (desde el 3.er disparo del combate, −1 de daño hasta
pagar 1 No2 para tensarla).
