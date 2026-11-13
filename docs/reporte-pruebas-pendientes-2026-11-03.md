# Pruebas pendientes en el mapa — 2026-11-03

Todo en «Claude · pruebas», a 1920×1080, con las cuentas GM, Jugador 1 (Prueba Uno) y Jugador 2 (Prueba Dos), **con clics**. Por código
solo preparé (dar ítems, mover tokens, poner No2 o vida, darle una habilidad a un creep) y restauré. Al final, la comparación con la copia
de antes dio **0 diferencias** (a Rockardo no lo toqué: lo revisaba la otra tanda). «El origen de las especies» no lo toqué.
Capturas en `/home/user/capturas/`, con el prefijo `pend-1103-`.

## 6. 💸 No2 en negativo — ✅

- **Un creep contraataca desde 0 No2:** Prueba Uno le pegó al Goblin picapiedras; el Goblin hizo Parry y Bloqueo y contraatacó con 0 No2. Se
  hizo igual y quedó en **−4** («contraataque −4 No2 (lo de un primer ataque) · quedan −4»), con el aviso de la deuda. ✅
- **Un personaje contraataca desde 0:** en ese contraataque, Prueba Uno (1 No2) hizo Parry (quedó en 0), ganó el Bloqueo y contraatacó: quedó
  en **−3**, con su aviso. ✅
- **En negativo no se puede más:** el Goblin en −4 ya no puede hacer Parry (el botón aparece apagado: «Ya está en No2 negativos») y Prueba
  Uno en −3 no puede pagar un ataque («ya está en No2 negativos: no puede gastar más No2 hasta recargar»). ✅
- **Una invocación:** la Abeja de prueba en −1 no puede atacar (mismo cartel). Con 0, pregunta «¿Atacar igual?» (gasta lo que tiene). ✅
- **Arreglado:** el aviso de la deuda decía «igual se hace, porque es una defensa» también en el contraataque y en la oportunidad. Ahora
  dice «porque es una reacción fuera de tu turno y no estabas en negativo», y en la Crónica, «reaccionó sin Nitros».

## 7. 🤝 Pasar ítems — ✅, con un arreglo importante

- **Desde la ficha suelta:** Prueba Uno le ofreció la Daga (de la mochila) a Prueba Dos. A Prueba Dos le llegó «Equipármelo · 1 / A la
  vaina / correa · 1 / A la mochila · 2 / Rechazar»; eligió la vaina: Prueba Uno pagó 2, Prueba Dos 1, y la Daga quedó «a mano». ✅
- **Un caído que da:** Prueba Uno en 0 de vida, desde la ficha suelta: el botón dice «vos 0: caído» y sale el cartel «😵 Estás
  inconsciente… ¿Querés hacerlo igual?». Con «Sí, igual» pasó las pociones; no pagó nada, Prueba Dos pagó 1 (al cinturón). ✅
- **Un caído que recibe, con la 🤝 del mapa:** Prueba Dos tocó a Prueba Uno (caído) → 🤝 → «Darle un ítem» → la Daga de su vaina (1 No2).
  A Prueba Uno le salió todo con «0 No2 (caído)» y la guardó en su vaina desde la ficha suelta. ✅
- **🐞 Bug encontrado y arreglado: el ítem se duplicaba.** Con el mismo personaje abierto en el mapa **y** en la ficha suelta, al aceptar el
  otro, una pantalla sacaba el ítem y la otra creía que la oferta se había perdido y lo devolvía a la mochila: quedaba en los dos
  personajes. Ahora la otra pantalla espera un momento y mira la mochila guardada antes de devolverlo. Lo repetí con el arreglo: el ítem se
  fue y no volvió (lo miré 24 segundos). `comun/intercambio.js`.

## 🛡 Protección de jefe con Miedo de 2 turnos — ✅

El GM le puso Miedo de 2 turnos a Basilio (jefe) con «+ Estado». Salió el cartel «Miedo 2 turnos → 1 turno (jefe)» con «Aplicar la regla
(1 turno)» y «Aplicar completo (2 turnos)». Completo → quedó Miedo 2 y la Mesa lo dice; con la regla → Miedo 1. ✅

## 🌺 Malviaje contra un aliado — ✅

Prueba Uno con Malviaje atacó a Prueba Dos: primero el cartel «Prueba Dos es un aliado… ¿Igual atacarlo?»; en el duelo, «−2 PdG y −2 de
daño» y la tirada «1d3 −2 → 0». ✅ (Sigue diciendo «😱 con miedo» aunque sea Malviaje: es solo el texto.)

## 🚫 Anulación sobre lo que faltaba

- **El Ojo de Kicillof:** Prueba Dos leyó un Pergamino de ojo y lo puso al lado del Arquero del culto. El Arquero (le di la habilidad
  Anulación para la prueba) apuntó a esa casilla: **el Ojo se cerró**. ✅ (Arreglé el texto de la Mesa: decía «anuló cerró Ojo…».)
- **Una invocación de un jugador:** el Arquero contra la Abeja de prueba: la primera vez Prueba Dos la sostuvo (Res.Mt 7 contra Ef.Esp 1);
  con un Ef.Esp alto de prueba, «se desvanece» y el token se fue. ✅
- **Una trampa mágica de un creep:** Prueba Uno leyó el Pergamino de anulación sobre ella: se fue. ✅
- **Un portal de un creep:** ❌ **no se pudo sacar**: las reglas de Firebase no dejaban que un jugador sacara un portal ajeno. Lo agregué
  a `firebase/firestore.rules` (un portal que no sea Town Portal se puede sacar, como las trampas). **Hay que pegar las reglas** y volver a probar.
- Una «invocación de un creep» como tal no existe: los creeps llaman refuerzos, que son creeps; la Anulación va contra las invocaciones de
  los jugadores.

## No llegué

- Las pruebas de humo en el mapa de los creeps esenciales (la Piel de hierro del Escudero, la Lengua de fuego del Piromante).
- El resto de la lista de `pruebas-en-el-mapa.md` (la Prisa al ordenar, que pide El origen; la IA de Proponer creeps; el glosario).

## Cosas que vi

- **El Parry o el Bloqueo escrito a mano («✍ Elegir manualmente») no cobra el No2 del Parry.** Puede ser a propósito (es la salida a
  mano), pero conviene saberlo.
- **La Mesa sigue poniendo a veces el nombre de otro jugador en tiradas de personajes:** el PdG de Prueba Uno salió como «Prueba Uno
  (Jugador 2)». Lo de los creeps ya lo arregló la otra tanda; con personajes pasa igual.
- Después de revivir, Prueba Uno quedó con «Invulnerable», que no deja aplicar estados: es la regla, pero sorprende si uno no lo sabe.

## Commits

- `5a18df8e` — 🤝 el ítem que se duplicaba; ⚠ el texto de la deuda de No2 (`comun/intercambio.js`, `vtt-hexgrid/js/04-…`, versiones).
- `56ae58e2` — 🚫 portal en las reglas (`firebase/firestore.rules`, **pegar**), texto del Ojo (`vtt-hexgrid/js/13-…`), `pruebas-en-el-mapa.md`.

## Capturas (las mejores)

1. `pend-1103-6a-4-contra-pagado-GM.png` — el Goblin contraataca con 0 y queda en −4.
2. `pend-1103-6b-2-aviso-deuda-J1.png` — el aviso de la deuda de Prueba Uno (−3).
3. `pend-1103-6b-3-creep-negativo-sin-parry-GM.png` — en negativo, el Parry apagado.
4. `pend-1103-6d-3-abeja-cero-pregunta-J2.png` — la invocación con 0: «¿Atacar igual?».
5. `pend-1103-7a-2-aviso-recibir-J2.png` — Equipármelo / vaina / mochila con sus costos.
6. `pend-1103-7b-1-inconsciente-J1.png` — «😵 Estás inconsciente».
7. `pend-1103-7c-3-caido-recibe-ficha-J1.png` — el caído recibe: todo a 0 No2.
8. `pend-1103-jefe-2-cartel-un-turno-GM.png` — Protección de jefe: Miedo 2 → 1.
9. `pend-1103-mv-2-contacto-aliado-J1.png` — Malviaje contra un aliado: −2.
10. `pend-1103-anul-3-ojo-GM.png` — el Ojo cerrado.
11. `pend-1103-anul-5-invocacion-se-va-GM.png` — la invocación se desvanece.
12. `pend-1103-anul-7-perg-fin-J1.png` — la trampa se fue; el portal, a mano (faltan las reglas).
