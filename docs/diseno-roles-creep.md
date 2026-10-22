# Diseño de habilidades de creep, rol por rol

> Hoja de trabajo (dueño, 2026-10-21). Sigue a la auditoría de [`auditoria-skills-creep.md`](auditoria-skills-creep.md) (lo hecho, con sus
> números) y a la lista [`pruebas-en-el-mapa.md`](pruebas-en-el-mapa.md) («Auditoría de creeps: para probar»).

## Forma de trabajo

- **Se rota rol por rol**: una habilidad de un rol, después una del siguiente, y así. No se va estado por estado.
- **Al entrar a un rol, primero la lista completa de conceptos de ese rol** (dueño, 2026-10-21: «siempre que vayamos a encarar un nuevo rol, primero vemos
  la lista»): familias, ✦ = acelera la pelea, ✅ = ya cubierto. Si la lista no está completa, se completa acá antes. Después se elige la habilidad. Cada
  lista se retoma cada vez que se vuelve al rol.
- Lo que el dueño define («queda así») se programa, pasa las pruebas automáticas, se sube y se anota «para probar»; las pruebas en el mapa se corren
  todas juntas cuando él lo pide.
- Una habilidad puede servir a más de un rol, y puede tener su versión de bestia y de humanoide (o una sola para los dos).

## Los roles

1. **Choque pesado**: tanque y warrior (muchas habilidades les sirven a uno, al otro o a los dos).
2. **Choque liviano**: salto, ladrón, armas punzantes, venenos, estados.
3. **Rango**: daño concentrado, crítico y las mecánicas del rango. Con su variante **Hunter**: pasa del rango al toque, juega con trampas y, quizás,
   alguna invocación (para un creep tiene que justificarse mucho, para no alargar los combates).
4. **Casters**: **debuffer**, **support** y **mago** (el del daño más directo).

## Más adelante: el Jefe

Transversal (fases, refuerzos, la furia del jefe): se evalúa cuando haya unos básicos de cada rol (dueño, 2026-10-21).

## 1. Choque pesado — las ideas del rol

**Son conceptos de diseño** (dueño, 2026-10-21): cada vez que toque una habilidad de choque pesado se explora uno y se marca ✅. ✦ = acelera la pelea.
Sirven al warrior (pegar fuerte), al tanque (aguantar y controlar) o a los dos.

**A. Pegar fuerte** (warrior)
1. ✅ **Más daño en un golpe**: Golpe fuerte (+1 dado), Puño de roca (+2 y Demora), Zarpazo.
2. ✅ **Golpe que se anuncia** ✦ (2026-10-21): **El que avisa no traiciona** / **Zarpazo erguido** — un turno lo carga a la vista de todos (a quién apunta),
   al siguiente +3 dados, sin Parry y empuja 2; si el objetivo pegado se aleja, sale de oportunidad; si le hacen daño, se le cae.
3. **Remate** ✦: pega más fuerte a quien ya está herido (Remate, Golpe de gracia).
4. **Varios golpes**: dos ataques en uno, con menos puntería cada uno (Golpe doble, Ráfaga de golpes).
5. **Golpe que sigue** ✦: si tumba a alguien, vuelve a atacar a otro de al lado.
6. ✅ **Partir la armadura**: **Romper armadura** / **Arrancar la coraza** y **Golpe demoledor** / **Mandíbula trituradora** (2026-10-21). Queda: perforar.
7. **Furia** ✦: pega más fuerte a cambio de defenderse peor (Furia, Frenesí, Ataque de furia).
8. **Frenesí que crece** ✦: cada golpe que da en el combate le suma daño al siguiente.

**B. Pegarle a varios**
9. ✅ **Barrido**: Barrido y Coletazo (todos los de al lado).
10. **Torbellino de acero**: el barrido fuerte, moviéndose antes (como el Remolino).
11. **Hendidura**: un golpe en línea que alcanza también al de atrás.
12. **Pisotón**: una onda alrededor que tira Sentado, sin saltar.

**C. Llegar a la pelea**
13. ✅ **Empujar y tomar carrera**: Cornada.
14. ✅ **Caer desde arriba**: Salto aplastante.
15. **Carga que derriba**: llega corriendo y lo tira Sentado.
16. **Arrastrar**: lo trae hacia él (una cadena, un gancho, la lengua).
17. **Lanzar**: agarra a un rival y lo tira dos casilleros (con daño de colisión, también contra otro).

**D. Controlar el frente** (tanque)
18. **Provocar**: obliga a los jugadores a ocuparse de él (¡Tu vieeeja! ya existe en el Bosque).
19. **Zona de control**: alejarse de su lado cuesta más No2, o le da una oportunidad de más.
20. **Muralla**: nadie pasa por las casillas de al lado sin frenarse.
21. ✅ **Atrapar**: Mordisco feroz, Agarrón, Abrazo aplastante.
22. **Derribar**: un golpe que deja Sentado.
23. **Aturdir**: un golpe que deja Pajaritos o Stun.

**E. Aguantar**
24. ✅ **Guardia**: Aguante (+2 Defensa y Def.Esp, y devuelve los golpes).
25. **Segundo aliento**: se cura una vez por combate (Segundo aliento, Regeneración rápida).
26. **Piel de piedra**: resistencia a crítico o a un elemento por unos turnos.
27. **Inamovible**: no lo empujan ni lo derriban por unos turnos.
28. **Última resistencia**: al caer, aguanta un turno más en pie (Segunda fase).

**F. Proteger**
29. **Proteger a un aliado**: recibe el golpe por otro creep.
30. **Cubrir al de atrás**: los aliados detrás de él ganan Defensa.
31. **Interponerse**: se mueve gratis para tapar a un aliado al que van a atacar.

**G. Castigar a quien le pega**
32. ✅ en parte: **Aguante** (los golpes que recibe vuelven como dados).
33. **Espinas o contraataque**: le devuelve parte del golpe, o pega de vuelta.
34. **Represalia**: si le pegan a un aliado de al lado, ataca gratis.
35. ✅ **Desarmar** (2026-10-21): Flash en el Bloqueo, atacando o defendiendo; el arma o el escudo vuela 2 casillas (con ruleta). Botón instantáneo 🤺.
    (2026-10-22: solo con un Parry ganado; defendiendo, si paró con el arma, no con el escudo; una bestia también desarma, pero lo natural no se
    le cae; se elige adentro del paso 3 del duelo.)

**H. Apuestas** ✦
36. **Todo o nada**: un golpe enorme, pero si falla queda Expuesto.
37. **Sangre por sangre**: pierde vida para pegar más fuerte.
38. **Berserker**: con poca vida, pega mucho más.

## 2. Choque liviano — las ideas del rol

Ya cubierto al entrar (2026-10-21): golpes precisos (Tajo veloz, Estocada, Zarpazo), las variantes del Sangrado y su versión fuerte, el Rengo (Golpe a la
rodilla, Tarascón al tobillo), las redes; y en el mapa, el sigilo, el +1 por la espalda y Robar.

**Son conceptos de diseño** (dueño, 2026-10-21): cada vez que toque una habilidad de choque liviano se explora uno y se marca ✅. ✦ = acelera la pelea.

**A. Golpes rápidos y precisos**
1. ✅ **Golpe preciso**: Tajo veloz, Estocada, Zarpazo.
2. **Dos cortes rápidos** ✦: dos golpes en uno, con menos daño cada uno.
3. ✅ **Ráfaga de cortes** ✦: **Ráfaga de cortes** y **Ráfaga de zarpazos** (2026-10-21: +2 dados, los efectos del arma ×3 y la Perfora en cada corte).
4. **Punto débil**: perfora parte de la Defensa.
5. **Buscar el crítico**: Crítico frecuente +2 en ese golpe.

**B. Desangrar y envenenar**
6. ✅ **Sangrado**: todas sus variantes y la versión fuerte.
7. **Veneno**: golpes que envenenan, con variantes como el sangrado.
8. **Veneno que paraliza**: chance de Parálisis.
9. **Veneno que debilita**: el envenenado pega menos.
10. ✅ **Abrir la herida** ✦ (2026-10-21): **Sal en la herida** / **Morder la herida** — si no sangra, lo hace sangrar; si ya sangra, +2 dados y le sube el sangrado.

**C. Moverse y pegar**
11. ✅ **Golpear y alejarse**: Hit and run.
12. ✅ **Salto**: Salto (y su versión pesada, Salto aplastante).
13. **Pasar por al lado**: lo cruza, le pega y queda a su espalda.
14. **Danza de cuchillas** ✦: se mueve y le pega a dos en el camino.
15. **Voltereta**: se mueve gratis, sin dar oportunidad.

**D. Sigilo y espalda**
16. ✅ **Puñalada**: Puñalada por la espalda, Mordida a traición, Puñalada trapera (y la pasiva Paso ligero).
17. **Desaparecer en la pelea**: vuelve al sigilo a mitad del combate (humo, sombras).
18. **Golpe desde las sombras**: al salir del sigilo, su primer golpe va con más crítico.

**E. Esquivar y reaccionar**
19. **Esquivar**: Evasión extra hasta su próximo turno.
20. **Reflejos**: un dodge roll gratis cuando lo atacan.
21. **Contraataque al esquivar**: si gana la Evasión, pega de vuelta (como el Warrior).
22. **Finta**: el rival no puede usar Parry contra su próximo golpe.

**F. Trabar al rival**
23. ✅ **Rengo**: Golpe a la rodilla, Tarascón al tobillo.
24. ✅ **Redes**: Red, Tela de araña.
25. **Golpe a la mano**: Desarmado.
26. **Tajo a los ojos**: Ceguera.
27. **Zancadilla**: Sentado.

**G. Jugar sucio**
28. **Arena a los ojos**: Ceguera breve, sin daño.
29. ✅ en parte: **Robar** (ya existe en el mapa; falta auditar la habilidad del Ladrón).
30. **Burla**: lo provoca para que lo persiga (un Provocar liviano).

**H. En grupo** ✦
31. **Rodear**: pega más fuerte si otro aliado también está pegado al objetivo.
32. ✅ **Manada** ✦ (2026-10-21): **Patotear** / **Jauría** — +1 dado por cada aliado pegado al objetivo, hasta +3.
33. **Distraer**: el objetivo pierde su ataque de oportunidad contra los aliados.

**I. Apuestas** ✦
34. **Todo al ataque**: pega mucho más, sin Evasión hasta su próximo turno.
35. **Golpe desesperado**: con poca vida, un golpe con mucho más crítico.

## 3. Rango y Hunter — las ideas del rol

Ya cubierto al entrar (2026-10-21): Tiro a la rodilla (Rengo), la Red (Hunter); y en el mapa, la línea de tiro, el tiro alto, la distancia ideal, Tensar,
las flechas especiales y el Marcado.

**Son conceptos de diseño** (dueño, 2026-10-21, como los del Support): cada vez que toque una habilidad de rango se explora uno y se marca ✅.
✦ = acelera la pelea. Lo que ya existe en el mapa se puede reusar: la línea de tiro, el tiro alto, la distancia ideal, el largo alcance, Tensar, Apuntar,
la emboscada, matabestias, la espalda a distancia, la recarga, el proyectil perforante, la repetición, Marcar, la Vigilancia y las flechas especiales
(veneno, fuego, salto eléctrico, humo, luz, red, explota, clava).

**A. Puntería y preparación**
1. ✅ **Tiro apuntado** — **Tiro a la cabeza** (2026-10-21: un turno apunta; el próximo disparo +2 PdG, Crítico frecuente +1 y potente +1; si le hacen daño
   antes, lo pierde).
2. **Tensar al máximo**: si no se movió, el disparo pega más fuerte (el Tensar de los arcos).
3. **Ojo de halcón**: sin la penalidad del tiro alto, o más alcance por un turno.
4. **Tiro certero**: ignora parte de la Defensa (Perfora) o de la Resistencia a crítico.

**B. Volumen de fuego** ✦
5. **Disparo doble**: dos disparos con menos puntería cada uno.
6. **Ráfaga**: tres disparos, cada uno a un objetivo distinto.
7. **Lluvia de flechas**: un área (flor) donde caen flechas, con dodge roll.
8. **Abanico**: un cono de flechas al frente.
9. **Atravesar**: el disparo sigue de largo y le pega al de atrás (el Proyectil perforante del Shooter).

**C. Distancia y movimiento**
10. **Retroceder y disparar**: se aleja uno o dos casilleros gratis y dispara.
11. **Disparar y reposicionarse**: el Hit and run del arquero (dispara y se mueve gratis, sin oportunidad).
12. **Tiro en carrera**: se mueve y dispara sin perder la puntería.
13. **Mantener a raya** ✦: el disparo deja Lento o Rengo, para que no lo alcancen.

**D. Control a distancia**
14. ✅ **Tiro a la rodilla** (Rengo).
15. **Tiro que derriba**: Sentado.
16. **Tiro que empuja**: lo corre uno o dos casilleros (con daño de colisión).
17. **Tiro al arma**: Desarmado (el arma cae al piso).
18. **Clavar a la pared**: si hay un Sólido o una pared detrás, queda Inmovilizado.
19. ✅ **Red** y Tela de araña (Inmovilizado).
20. **Tiro cegador**: Ceguera (una flecha de luz o tierra a los ojos).
21. **Cortina de humo**: una nube que tapa la vista (para cubrirse o cubrir a los suyos).

**E. Marcar y coordinar** ✦
22. **Marcar la presa**: bonos propios contra un solo objetivo.
23. ✅ **Señalar para todos**: **Disparo señalador** (2026-10-21: Presa —Evasión −1 y +2 al daño de todos sus rivales— y Marcado, 2 turnos).
24. **Fuego de supresión**: una línea o zona donde quien entra recibe un disparo o pierde No2.
25. **Fuego de cobertura**: mientras dispara, un aliado se mueve sin dar oportunidad.

**F. Reacciones**
26. ✅ **Vigilancia**.
27. **Contradisparo**: cuando un rival le dispara, le responde (Flash).
28. **Tiro de advertencia**: el objetivo pierde su próximo movimiento o su ataque de oportunidad.

**G. Disparos con efecto** (las flechas especiales, como habilidad del creep)
29. **Flecha envenenada**: Veneno.
30. **Flecha incendiaria**: Quemadura o terreno incendiado.
31. **Flecha eléctrica**: el salto del rayo.
32. **Flecha explosiva**: un área chica.
33. **Flecha de hielo**: Escarcha.
34. **Flecha que sangra**: Sangrado.

**H. Contra lo que se esconde**
35. **Flecha de luz**: revela a los que están en sigilo en un área.
36. **Tiro a ciegas**: dispara a una casilla de niebla o a alguien en sigilo, con menos puntería.

**I. Hunter**
37. **Trampas** (ya hay muchas): colocar una y llevar a los rivales hacia ella.
38. **Golpe con el arco y salto atrás**: pega cuerpo a cuerpo y se aleja.
39. **Compañero animal**: un halcón que marca, distrae o pica (una invocación justificada).
40. **Rastrear**: ve a los que están en sigilo cerca (Ve lo oculto por un rato).
41. **Cebo**: atrae a un rival a una casilla (a una trampa).

**J. Apuestas** ✦
42. **A quemarropa**: dispara pegado a un rival sin la penalidad, y con más daño.
43. **Último disparo**: con poca vida, un disparo con mucho más daño.

## 4. Casters — las ideas del rol

Ya cubierto al entrar (2026-10-21): ninguna habilidad de caster auditada; en el mapa, los hechizos dirigidos y de área (cascada, dodge roll), conos,
líneas, zonas, el rayo en cadena y los charcos, los controles mentales.

- **Mago (daño directo):** proyectil mágico, ✅ **Bola de fuego** (2026-10-21), cono de frío, ✅ **Cadena de rayos** (2026-10-21), muro de fuego.
- **Debuffer:** ver el listado completo abajo (§ 6).
- **Support:** ver el listado completo abajo (§ 5).
- **El costo de las que suman Efecto especial:** P216 (la página para la mesa: https://claude.ai/artifact/C7VPwWPg9BpWfF1L1hUGb6).

## 5. Support — el listado completo (2026-10-21)

**Son conceptos de diseño** (dueño, 2026-10-21): cada vez que toque una habilidad de support se explora uno de estos (y se marca ✅ el que quede
cubierto). Pedido del dueño: arrancar por las que **aceleran la pelea** (que se resuelva atacando, no aguantando), sin curar ni proteger; y tener a mano todas
las posibilidades del rol. ✦ = acelera la pelea. Lo que ya existe en el mapa para personajes (Empower, Re-roll, Enyetar, Marcado, Turno libre,
Llamar refuerzos) se puede reusar. Hoy ninguna habilidad de support de creep está auditada; las que hay son casi todas «a mano».

**▶ La próxima vez que toque Support** (dueño, 2026-10-21): un buff que le da a un aliado **Espinas** (devuelve parte del golpe) y otro que le da
**Espejo** (los dos, como buffs de support). Ya cubierto: ✅ **Arma elemental** (concepto 3, 2026-10-21: Arma ígnea, helada, eléctrica, ácida y venenosa).

**A. Potenciar el golpe de los aliados** ✦
1. **Grito de guerra**: los aliados cercanos pegan más fuerte unos turnos (hoy Aullido de manada, Grito de ánimo, a mano).
2. **Bendecir el arma**: el próximo golpe de un aliado suma un dado.
3. ✅ **Arma elemental**: el arma de un aliado pega de fuego, hielo o rayo por unos turnos — **Arma ígnea / helada / eléctrica / ácida / venenosa**
   (2026-10-21: +1d4 del elemento por golpe, 3 turnos, y lo de la Carga Elemental).
4. **Filo envenenado / sangrante**: los golpes de un aliado dejan Veneno o Sangrado.
5. **Ojo certero**: un aliado gana Crítico frecuente o potente.
6. **Abrir la guardia**: el próximo golpe de los aliados contra un objetivo perfora N de Defensa.
7. **Empujón de creep** (el Empower de los personajes): +3 a la tirada de un aliado, en el momento, mirando el resultado.

**B. Concentrar el fuego** ✦
8. **Señalar la presa**: marca a un rival; todos los aliados le pegan más y no se puede esconder — el estado **Presa** ya existe (lo deja el Disparo
   señalador del rango, 2026-10-21): falta la versión de Support, sin disparo (PdG.Esp contra Res.Esp, a su Rango).
9. **Sed de sangre**: el aliado que derriba a alguien vuelve a atacar.
10. **Remate en grupo**: más daño contra un rival herido o que ya recibió un golpe esta ronda.

**C. Más acciones** ✦
11. **Orden de ataque**: un aliado ataca ya, fuera de su turno (o su próximo ataque no cuesta No2).
12. **Redoble de tambores**: +No2 a los aliados cercanos.
13. **Adrenalina**: a un aliado se le baja el cooldown de una habilidad (vuelve a usar la fuerte).
14. **Canalizar**: le pasa SP a un aliado caster.
15. **¡Ahora!**: un aliado juega justo después del support en el orden de turnos (sube su iniciativa; hoy Emboscada de manada).
16. **Prisa**: un aliado se mueve gratis unos casilleros y ataca más barato.

**D. Debilitar para que rematen los otros** ✦
17. **Exponer**: el objetivo pierde Defensa o Evasión contra todos unos turnos.
18. **Disipar**: le saca a un rival el Escudo especial o un buff.
19. **Sin escapatoria**: el objetivo no se puede alejar (Rengo, o la oportunidad le sale a todos).

**E. Apuestas** ✦
20. **Frenesí inducido**: un aliado pega mucho más pero se defiende peor.
21. **Pacto de sangre**: un aliado gana daño y pierde vida cada turno.
22. **Compartir fuerza**: el support da vida, No2 o SP propios a un aliado (hoy, a mano).
23. **Último aliento**: un aliado que cae hace un último ataque.
24. **Martirio**: si cae el support, los aliados entran en furia.

**F. Auras, estandartes y tótems**
25. **Aura de mando**: los aliados cerca del support pegan mejor mientras esté de pie (hoy, a mano) ✦.
26. **Estandarte de guerra / Tótem**: coloca un objeto que potencia a los aliados cercanos mientras exista; los jugadores lo pueden romper (otro
    objetivo, y la pelea se apura) ✦.
27. **Lazo**: cuando un aliado vinculado pega, el support se cura (o al revés).

**G. Reacciones (en el turno del rival)**
28. **¡Ahora, dale!**: cuando un aliado acierta, el support le suma un dado al daño (Flash) ✦.
29. **¡Cuidado!**: cuando un aliado es atacado, le suma Evasión.

**H. Curar y proteger** (para más adelante)
30. Curar a uno, en área o por turno (Curación menor y mayor, Canto revitalizante, Polen sanador, Zona sagrada, Aura sanadora).
31. Escudo especial a un aliado, Formación, Círculo de protección, Aura de protección.
32. Recibir el golpe por otro (también es del tanque).
33. Limpiar estados de un aliado.
34. Levantar a un caído (con Titilando, como el ✚ Revivir).
35. Inmunidad a control por un turno.

**I. Llamar y reacomodar**
36. Llamar refuerzos (ya automatizado), Brotes.
37. Cambiar de lugar con un aliado, llevarlo al lado de un rival ✦, Señal de retirada.

## 6. Debuffer — el listado completo (2026-10-21)

**Son conceptos de diseño** (dueño, 2026-10-21): cada vez que toque una habilidad de debuffer se explora uno y se marca ✅. ✦ = acelera la pelea (le abre
la puerta a los demás). Los estados que ya existen y se pueden usar: Debilitado, Extenuado, Atormentado, Maldito, Silencio, Ceguera, Miedo, Pajaritos,
Lisiado, Expuesto, Marcado, Presa, Lento, Cansado, Exhausto, Escarcha, Armadura rota, Veneno, Sangrado, Quemadura, Confusión, Stun, Parálisis, Demora,
Inmovilizado, Rengo, Desarmado; y, de personajes, Enyetar.

**A. Bajar números**
1. **Debilitar**: el objetivo pega menos (Debilitado, que se apila).
2. **Torpeza**: menos Probabilidad de Golpe.
3. **Exponer** ✦: la Evasión a la mitad y sin reacciones que cuesten No2 (Expuesto).
4. **Maldición de la coraza** ✦: menos Defensa y Defensa especial unos turnos.
5. **Mano temblorosa**: menos Crítico frecuente y potente.

**B. Quitarle recursos**
6. **Drenar No2**: pierde No2 (y si queda en 0, Sentado, como el Sonic Boom).
7. **Extenuar**: todo lo que cuesta No2 le cuesta 1 más (Extenuado).
8. **Drenar SP**: pierde SP, y el debuffer quizás lo gana.
9. **Atormentar**: cada acción que cuesta No2 le saca vida (Atormentado).
10. **Maldición de la sangre**: usar algo que cuesta SP le saca vida (Maldito).

**C. Control mental**
11. ✅ **Confusión** (2026-10-21).
12. **Susurros de locura**: Confusión en un área.
13. **Grito de pánico**: Miedo a los que tiene alrededor.
14. **Palabra de silencio**: no puede usar habilidades (Silencio).
15. **Sueño**: no actúa hasta que le peguen o pase su turno.
16. **Dominar**: el GM decide su próxima acción (a mano; muy caro).

**D. Daño que dura**
17. **Veneno a distancia**: un dardo o un hechizo que envenena.
18. **Plaga**: un veneno que al empezar su turno contagia al que tiene al lado.
19. **Maldición que quema**: Quemadura que no se apaga con agua.

**E. Los sentidos**
20. **Cegar**: Ceguera (ve 2 casillas; su PdG a la mitad).
21. **Ensordecer**: no oye a los que vienen por la espalda (sin el aviso de darse vuelta).
22. **Bruma**: una nube que tapa la vista.

**F. Contra el sigilo**
23. **Revelar**: los que están en sigilo en un área quedan Marcados.
24. **Aura de silencio**: en el aura no se puede usar sigilo.

**G. El orden de turnos**
25. **Retrasar**: baja uno o dos lugares en el orden (Demora a distancia).
26. **Ralentizar**: Lento (el primer casillero doble).
27. **Robar el turno**: pierde su próximo turno (muy caro).

**H. Romper lo que lo protege** ✦
28. **Disipar**: le saca un buff o el Escudo especial.
29. **Corroer**: Armadura rota a distancia (ácido).
30. **Quebrar la guardia**: no puede hacer Parry ni Bloqueo hasta su turno.

**I. Auras**
31. **Aura de miedo**: los que entran se asustan.
32. **Aura de pestilencia**: los de al lado pierden No2 al empezar su turno.
33. **Aura de debilidad**: los de adentro pegan menos.

**J. Maleficios y apuestas** ✦
34. ✅ **Mal de ojo** (2026-10-21): después de que tira, su tirada se repite y queda la peor (el Enyetar de los personajes, para creeps), con Flash y el
    botón 🧿 del GM.
35. **Maldición del espejo**: parte del daño que hace le vuelve.
36. **Lazo de dolor**: el debuffer le pasa al objetivo parte del daño que recibe.
37. **Marca de muerte** ✦: si cae mientras está marcado, el debuffer recupera vida o SP.

