# Pruebas en el mapa — noche del 2026-11-03

Todo en «Claude · pruebas», a 1920×1080, con las cuentas GM, Jugador 1 (Prueba Uno) y Jugador 2 (Prueba Dos), **con clics**: elegir la
habilidad en Acciones o en la Botonera, apuntar con el mouse, tirar y aplicar en el cuadro del duelo, «▶ Siguiente», «Terminar turno». Por
código solo preparé (mover tokens, curar, dar un ítem o un estado de prueba) y restauré. Después de cada prueba volví todo a como estaba
(fichas, creeps, tokens, duelos, estados, orden de turnos): la comparación final dio **0 diferencias**. «El origen de las especies» no lo toqué.

## 1. 📌 Clavar a la pared — ✅ funciona, con un arreglo

**El arreglo (importante):** el empujón **rodeaba** la pared o el token que tenía atrás: elegía cualquier casilla más lejana que estuviera
libre, así que casi nunca chocaba y Clavar a la pared casi nunca clavaba. Ahora el empujón va **en línea recta** desde el tirador: si lo que
tiene atrás es un Sólido, una pared o un token, choca ahí. Vale para todos los empujones (Empujón, Takle, el viento…). Commit `c5231732`.

Los 8 casos, con el Goblin ballestero tirándole a Prueba Uno:
1. **Sin nada atrás:** lo empujó 3 casilleros en línea recta. No quedó clavado. ✅
2. **Con un Sólido atrás:** salió 1 casillero, chocó (4 de daño de choque) y quedó **Inmovilizado 3 turnos**, con el aviso «se suelta con
   Fuerza contra 5 (el PdG con que le pegaron)». ✅
3. **Contra otro token** (Prueba Dos atrás): chocaron los dos (3 y 5 de daño) y **no** quedó clavado. ✅
4. **Soltarse:** al empezar su turno salió «🔓 Prueba Uno: ¿se suelta?» → «Tirar Fuerza». Solo, sacó 3 contra 5 y siguió atrapado. ✅
5. **La ayuda del aliado:** con Prueba Dos pegada, a Jugador 2 le salió «🤝 Sí, ayudar (Fuerza, 1 No2)». Se suman: la primera vez 1 + 3 = 4
   contra 5 (no se soltó); la segunda 3 + 3 = **6 contra 5: se soltó**. ✅
6. **Los 3 turnos:** sin soltarse («Ahora no»), bajó 3 → 2 → 1 al terminar cada turno y después se fue solo. ✅
7. **El +3 a la PdG:** se ve en la declaración del duelo («+3 PdG»). ✅
8. **Si lo esquiva:** no lo empuja. ✅

## 2. 🚫 Anulación — ✅ lo probado funciona, con un arreglo

- **La inconsistencia del Ef.Esp, arreglada:** el pergamino tira con un **mínimo por calidad** (un Raro, 11): por eso el duelo tiraba 1d10+1
  aunque la ficha diga 3. Las zonas y las invocaciones usaban el 3. Ahora usan el mismo número que el duelo. Prueba automática nueva; las
  715 en verde. Commit `fc6ec8a0`. En la Mesa ya se ve parejo: «anuló 4 casillas… (Ef.Esp 13 contra la Res.Mt 3 del Arquero)».
- **La habilidad del Debuffer de jugador:** se la agregué a Prueba Dos **por la ficha** (+ Habilidad → Debuffer → Agregar). Contra el Goblin
  picapiedras (Shield, Bendecido y Arma luminosa): ganó, salió la ventana para elegir y se fue **solo el Arma luminosa**. ✅
- **La Varita de la anulación** (Prueba Uno, desde la Botonera):
  - contra el picapiedras: empate → «Par/Impar» → ganó el creep, no sacó nada (el flujo anda). ✅
  - **sobre una casilla con una nube** de un creep (sin rival encima): la tirada la resolvió la pantalla del GM; la primera vez ganó el
    creador; con un Ef.Esp de prueba alto, **la nube se fue entera** (7 casillas). ✅
- **El pergamino recortando una zona, ganando contra el creador:** la nube pasó de 7 casillas a 3 (solo las de adentro). ✅
- **No probé:** una invocación de un creep (no hay creeps con invocaciones en el mapa), una trampa mágica, un portal y el Ojo de Kicillof.
- **Para que decidas:** la varita **no** tiene el mínimo de Ef.Esp por calidad que sí tienen los pergaminos (tiró 1d3). ¿Lo querés igual?

## 3. 🌺 Malviaje de floripondio — ✅

- En un duelo del Goblin picapiedras (con Malviaje) contra Prueba Uno: «−2 PdG y −2 de daño» en la declaración y la tirada («1d8 −2 → 5»). ✅
- Moviéndolo arrastrando: el casillero junto a otros costó **2 No2** en lugar de 1 (6 → 4). ✅
- Detalle de texto: en el duelo dice «😱 con miedo» aunque sea Malviaje. Es cosmético.
- No probé el −2 contra un aliado en un duelo real (el creep no puede atacar a un aliado desde el cuadro).

## 4. 🛡 Protección de jefe desde un duelo — ✅

- Prueba Uno tiró un **Polvo de adormidera** sobre Basilio (jefe): ganó la tirada y, al aplicar, al GM le salió el cartel «Protección de
  jefe: Sueño → inmune» con «Aplicar la regla (no entra)» / «Aplicar igual». Con la regla, no entró. ✅
- El Miedo de 2 turnos no se puede probar: el Miedo de fábrica dura 1 turno.

## 5. 💉 Adrenalina — ✅

- En Prueba Dos: «Adrenalina: 2 → 1 turno» al empezar su turno y «1 → 0, se terminó» al siguiente. Se fue sola. ✅
- Pila pila desde la pantalla de un jugador: no aplica (es una habilidad de creep).

## 8. 🗡 Pasiva Perforante — ✅

- El Goblin scout (con Perforante) contra Prueba Uno con Defensa 25: «La Defensa (25) frenaba más: pasan 2 por la Perfora» → entraron 2. ✅

## 9. 🎯 Débil / Resistente — ✅

- Prueba Uno apuntando la Varita del destello (área de luz) cerca de un creep no-muerto: sobre el creep, «✳ DÉBIL A LA LUZ». ✅

## No llegué (quedan para otra tanda)

- 6. No2 negativos: el contraataque con 0 No2 y la invocación en negativo.
- 7. El intercambio desde la ficha suelta y el botón de la mochila con un caído.
- 10. El resto de la lista de pendientes del mapa.

## Cosas que vi y no son de estas pruebas

- **Otra sesión trabajando en la misma partida:** en la Mesa aparecen «Escudero (prog)» con Piel de hierro «+4 (3 + su nivel)». Al restaurar
  dejé intacto todo lo que no era mío.
- **Rockardo:** al mover el orden de turnos para probar, se le aplicó una vez el inicio de su turno (regeneración, se le terminó el
  Invulnerable). Lo devolví a 8 de vida con Invulnerable, pero no sé cuántos turnos le quedaban: le puse 3. Revisalo si importa.
- En la Mesa, la tirada de PdG de un creep a veces figura con el nombre «Jugador 1» (la anota la pantalla del jugador que defiende).
- En el cuadro del duelo, un efecto dice «Armadura rota ×2 ×2» (el ×2 repetido).

## Capturas (en `/home/user/capturas/`)

- `noche-1103-clav2-pared-fin-GM.png` — clavado contra el Sólido, con la Mesa.
- `noche-1103-clav5-ayuda2-0-4-J1.png` — «se soltó (3 + Prueba Dos 3 = 6 contra 5, con ayuda)».
- `noche-1103-clav4-soltar-0-0-J1.png` — el cartel «¿se suelta?».
- `noche-1103-clav5-ayuda2-0-2-J1.png` — la ayuda de Prueba Dos.
- `noche-1103-clav3-token-fin-GM.png` — el choque contra otro token.
- `noche-1103-clav1-libre-fin-GM.png` — el duelo, con el +3 PdG.
- `noche-1103-anul-hab-rival-fin-J2.png` — la ventana para elegir el estado.
- `noche-1103-anul-varita-zona2-fin-GM.png` — la nube que se fue entera.
- `noche-1103-anul-perg-recorte-fin-GM.png` — la nube recortada.
- `noche-1103-mv-rival-d0-GM.png` — Malviaje: −2 en el duelo.
- `noche-1103-mv-mover-estela.png` — Malviaje: el casillero que cuesta 2.
- `noche-1103-debil-luz-j1-1-apuntar.png` — «DÉBIL A LA LUZ».
