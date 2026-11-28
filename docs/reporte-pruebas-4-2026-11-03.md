# Pruebas en el mapa, tanda 4 — 2026-11-03

Todo en «Claude · pruebas», a 1920×1080, con las cuentas GM, Jugador 1 (Prueba Uno) y Jugador 2 (Prueba Dos), **con clics**. Por código solo
preparé: los dos Sólidos y tres tokens de prueba, darle al Maldito el Escalofrío y la Espina tóxica (como «+ Habilidad»), mover los creeps nuevos a
su lugar, devolverles cooldown y No2 para repetir una tirada, una Piel de hierro y una Res.Esp alta de prueba a Prueba Dos, y el orden de turnos. Al
final restauré todo: la comparación con la copia de antes dio **0 diferencias** (fichas de Prueba Uno y Dos, tokens, elementos, orden de turnos,
niebla, duelos, estados y momentos; los 4 creeps de prueba borrados desde GM Tools con sus tokens). «El origen de las especies» no lo toqué.
Capturas en `/home/user/capturas/`, con el prefijo `t4-1103-`.

## 1. 👁 Sólidos «Se ve entero», con las reglas pegadas — ✅

- El GM abrió el ⚙ de un Sólido, tildó **«👁 Se ve entero»** y apretó Guardar: **se guardó sin error** (quedó `verEntero` en la partida).
- Desde Jugador 1, con niebla: el Sólido tildado se ve **entero**; el otro, sin tildar, solo el borde (el interior gris). Un token **detrás** de cada
  uno y otro **adentro** del tildado siguen tapados.
- Crear uno nuevo desde Formas libres con «Sólido» y «Se ve entero» tildados: se guarda con la marca.

## 2. ⚡ Aguja siniestra rápida — ✅

- El Maldito agregado del Pool esencial la trae con **espera 2**; usarla cobró **1 No2** (6 → 5) y la dejó en espera 2.
- Basilio (un creep viejo con la Aguja) se puso al día solo: espera 2, 1 No2.
- La espera **baja 1 al empezar el turno del creep** (lo vi con la Espina: 2 → 1 → 0 en dos turnos del Maldito).

## 3. 🥶 Escalofrío — ✅ (con un arreglo)

- Contra Prueba Dos: PdG.Esp contra su Res.Mt; al ganar, **1d4 siniestro directo** (4 de daño, 30 → 26) y **Herida sombría**.
- **−2 PdG**: en su Botonera, Atacar decía «Escalofrío −2», y su tirada en el duelo salió con ese −2.
- **Cuánto dura**: siguió todo su turno siguiente y se fue al empezar el otro (con la Herida sombría).
- **Arreglado**: el ícono alrededor del token salía con la inicial «E»; ahora es 🥶 (`vtt-hexgrid/js/88-iconos-estados.js`, commit `dfbe4182`).

## 4. 🧪 Espina tóxica — ✅

- **No tolera**: contra Prueba Dos con Piel de hierro (Defensa 6, Def. especial 6): el daño entró **entero** (2, 15 → 13: no le restó ninguna Defensa)
  y la tirada de aguante salió en la Mesa («Res.Esp (tolerar Veneno)», 2 contra 13): le quedó **Veneno 2**. Otra vez, 13 contra 13 (empate: gana quien
  atacó) → Veneno de 2 a 4.
- **Tolera**: con una Res.Esp de prueba alta, 19 contra 13: **«lo toleró»**, el Veneno no subió y el daño entró igual.
- **Contra un creep** (el Escudero): el daño entró entero (60 → 57) y la tirada de aguante la hizo la pantalla del GM con la Res.Esp del creep
  (1d12 → 1 contra 13): Veneno 2.

## 5. 🏹 Tirador de precisión — ✅

- Del Pool esencial salió con su equipo y la **Flecha perforante** en el cinturón.
- **Tiro a la cabeza**: −1 No2, espera 3, estado «Apuntando a la cabeza». El disparo siguiente salió con **+4 PdG** (cabeza + Respiración contenida del
  arco), Crítico frecuente y potente +1: crítico ×3 contra Prueba Uno. El estado se gastó.
- **Flecha perforante**: al Atacar, «🏹 Flecha común / ✨ Flecha especial ▾» → la perforante («perfora 1» en el duelo); se gastó del cinturón.
- **Tiro certero**: en el duelo, «+1 PdG · ignora 2 de Res. a crítico · perfora 3» (contra el Escudero, que lo esquivó).
- La línea de tiro estaba tapada por una pared: salió «🏹 La línea de tiro está tapada» con «Ignorar obstáculo (lo decide la mesa)».

## 6. 🪓 Hachero — ✅

- Del Pool esencial con **Fue 9 · Con 7 · Agi 6 · Des 7 · Esp 4**, vida 35.
- Prueba Dos le pegó (1 de daño tras su cota). Él le pegó a ella **1d8 + 9 = 11** (26 → 15) con 4 No2.

## ⚔ Resumen del duelo en la Mesa — ✅ (con un arreglo)

Duelo completo Hachero → Escudero: contacto con **Parry con el escudo**, empate resuelto con par o impar, **Bloqueo** (Fuerza del golpe 8 contra 2: pasa
la mitad), daño (15 − 5 ÷ 2 = 5), la durabilidad del escudo y el efecto **Rompe armadura** (50 %, salió). En la Mesa, del GM y de Jugador 1, una sola
línea: **«⚔ Hachero atacó a Escudero con Hacha. Pasó la mitad del golpe. Le bajó 5 de vida. Quedó con Armadura rota.»** y el plegable **«🔍 Ver detalle
del duelo»** con el paso a paso (contacto, Bloqueo, daño, durabilidad, el efecto y el resultado). También el del Tirador: «¡Crítico ×3! Le bajó 18 de
vida. Prueba Uno cayó.».
- **Arreglado**: decía «Quedó Rompe armadura» (el nombre del efecto del arma); ahora dice el estado que quedó, «Quedó con Armadura rota» (`comun/duelo.js`,
  commit `409a2328`; la prueba automática de la frase, ajustada).

## Cosas que vi

- La tirada de aguante de un personaje, cuando la hace la pantalla del GM, sale en la Mesa como «Prueba Dos (Claude (pruebas))» (la cuenta del GM entre
  paréntesis); cuando la hace la del jugador, «Prueba Dos (Jugador 2)». Es el mismo detalle de nombres de otras tiradas sueltas (no del duelo).
- La tolerancia la tiró una vez la pantalla del GM con un dado chico (1d6) y otra la del jugador con su Res.Esp completa; las dos veces bien contra 13.
- «Le bajó 18 de vida» cuando Prueba Uno tenía 6: la frase cuenta el golpe, no lo que le quedaba.
- En consola, «Failed to load resource: 400» al aplicar algunos estados; no se notó nada roto.

## Commits

- `dfbe4182` — 🥶 ícono del Escalofrío (`vtt-hexgrid/js/88-iconos-estados.js`, `vtt-hexgrid/mapa.html`).
- `409a2328` — ⚔ la frase del resumen con el nombre del estado (`comun/duelo.js`, `comun/pruebas.html` y las versiones `?v=`).
- `acd83fc9` — `docs/pruebas-en-el-mapa.md`.

## Capturas (las mejores)

1. `t4-1103-02-sol-editor-tildado-GM.png` — el ⚙ del Sólido con «Se ve entero» tildado.
2. `t4-1103-03-sol-se-ve-entero-J1-recorte.png` — desde Jugador 1: el marrón entero, el gris solo el borde.
3. `t4-1103-09-aguja-resuelta-GM.png` — la Aguja siniestra resuelta.
4. `t4-1103-10-escalofrio-dano-GM.png` — Escalofrío: daño siniestro directo y el estado para aplicar.
5. `t4-1103-13-escalofrio-pdg-menos2-J2.png` — el ataque de Prueba Dos con el −2.
6. `t4-1103-16-espina-veneno-GM.png` — Espina tóxica: el Veneno aplicado.
7. `t4-1103-24-tirador-disparo-GM.png` — Tirador: +4 apuntando, Flecha perforante.
8. `t4-1103-14-hachero-golpe-GM.png` — el golpe del Hachero.
9. `t4-1103-duelo-resumen-GM.png` / `t4-1103-duelo-resumen-J1.png` — el resumen del duelo en la Mesa.
10. `t4-1103-duelo-detalle-GM.png` / `t4-1103-duelo-detalle-J1.png` / `t4-1103-duelo-critico-J1.png` — «🔍 Ver detalle del duelo» desplegado.
