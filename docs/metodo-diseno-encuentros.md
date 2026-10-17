# Método para diseñar encuentros y dungeons

> Establecido con el dueño el 2026-10-14, a partir de lo que se hizo con las **Minas** (la mina de los kobolds de «El origen de las especies»)
> y para seguir con el **Bosque**. Es una guía, no una regla: la mesa decide (ver la esencia del proyecto en el `CLAUDE.md` de la raíz).
> Cuando el dueño dice «hagamos lo mismo que con las minas» o «diseñemos el encuentro de X», se sigue esto, paso por paso, y se le pregunta
> lo que es suyo de decidir (en texto, no en cuadros de diálogo).

## 1. Mirar al grupo primero

Antes de tocar un creep, leer a los personajes que van a jugar (GM Tools → 🔎 Escanear grupo, o `EscaneoGrupo.perfil` / `lectura`):

- **Quiénes van** (los que el dueño confirma) y su clase y rol.
- **Números que importan**: vida, Defensa, Defensa especial, Evasión, Parry, Bloqueo, Res.Esp, Res.CC, resistencia a crítico por Tipo,
  resistencias elementales, PdG / PdG.Esp, daño, alcance, No2 y SP, invocaciones.
- **Puntos fuertes** (lo que va a hacer que el encuentro sea fácil: un tanque con mucha Defensa, un caster con mucho PdG.Esp…) y **puntos
  débiles** (poca vida, Defensa 1, nadie con Defensa especial, nadie a distancia, nadie que resista un elemento…).
- **Equipo**: qué tiene puesto cada uno, **qué ranuras tiene vacías** y cuáles podría **mejorar** (para pensar el botín, punto 6).

## 2. Auditar cada creep que ya existe

Uno por uno, con el dueño (como en la auditoría de skills: el texto original primero, después la propuesta):

- **Atributos**: el presupuesto es 33 + 3 por cada nivel después del primero (`CreepCalculo.presupuesto`); que no falten ni sobren, y que
  el reparto tenga sentido con el rol (un chamán con Especial, un tirador con Destreza).
- **Tipo de criatura** cargado (humano, humanoide, bestia…): cambia el oro sugerido y la chance de soltar un consumible.
- **Arma**: Tipo, daño, alcance (cuerpo a cuerpo, de rango, arco, honda), efectos al golpear. Si es parte del cuerpo, «natural».
- **Equipo** del catálogo actual, de la rareza que sugiere su nivel, que tenga sentido con el personaje (y que sirva o no al grupo como
  botín, a propósito). Si se le quiere dar una pieza sin regalarla, marcarla 🐾 natural.
- **Habilidades**: una **rápida** (cooldown 2) y una **lenta** (cooldown 3 a 6, arranca activa). **Automatizar todo lo que se pueda**
  (✨ Ejecución: ataque con el arma con arreglos, área, onda, cono, zona, trampa, estado sobre sí o un aliado) y aclarar lo que queda
  a mano (⚙ / ✋ en la descripción). Si hace falta una mecánica nueva, se construye en el motor común (vale para todos) y se prueba.
- **No repetir jugadas**: que cada creep del encuentro haga algo distinto (uno rompe armadura, otro demora, otro ciega, otro sienta…).

## 3. Pensar el encuentro contra el grupo

- **Roles**: frente (aguanta o controla), atacante (presiona al más débil), control o apoyo (buffs a los suyos, debuffs a los otros),
  distancia (molesta y obliga a correr), jefe (la mecánica que hace girar la pelea).
- **La mayor variedad de roles y mecánicas posible, por diversión** (dueño, 2026-10-17; recordatorio, no regla estricta): alguien que ponga
  trampas, un caster con magia elemental (para que las resistencias elementales tengan sentido), alguien que haga otra magia, alguien a
  distancia y cuerpo a cuerpo de por lo menos dos roles (uno tanque y otro de daño; puede haber uno balanceado, tipo guerrero). Al auditar
  un encuentro que ya existe, mirar qué rol o mecánica falta.
- **Cada fortaleza del grupo tiene una respuesta** (al tanque: Armadura rota, Demora, Perfora, ataques que lo saltean; al caster: alguien
  que llega por atrás; a las invocaciones: un área) **y cada debilidad tiene una amenaza** (pero sin que un mal turno mate a alguien sin
  chance: mirar el daño máximo de una ronda contra la vida del más frágil).
- **El terreno**: sólidos, paredes, niebla, luz, trampas puestas de antemano.

## 4. La progresión (un dungeon de varios encuentros)

- **Tres encuentros (o más)** que escalan: el primero **presenta** la mecánica del lugar, el segundo **la combina** con otra, el último
  es el **jefe** con su propia mecánica.
- **Entre encuentros**, respiros y recursos (curarse, encontrar luces o consumibles, una pista del jefe).
- Cada encuentro, su **mapa** y sus creeps (GM Tools: un mapa por encuentro; los tokens, ocultos hasta que aparezcan).

## 5. Armar lo que falta

- Crear los creeps nuevos (ocultos en su mapa), con atributos, arma, equipo y habilidades; los nombres, a gusto del dueño.
- Las piezas nuevas que hagan falta (un arma de jefe, un consumible temático) van al catálogo (`comun/catalogo.js`).

## 6. El botín

- **💰 Botín estimado** del mapa (GM Tools): oro, lo que vale el equipo vendido, los consumibles al azar esperados, la experiencia; y cuánto
  le toca a cada uno.
- **Cruzarlo con las ranuras del grupo**: qué ranuras vacías pueden llenar y qué pueden mejorar (y qué no da el lugar).
- **Drops fijos** temáticos (`sc.dropsFijos`: la Grapa del capataz, una luz en la cueva) y **equipo natural** para lo que no se suelta.
- No inflar: muchas piezas repetidas van para vender.

## 7. Probar y anotar

- **Cada creep contra cada personaje** (dueño, 2026-10-16; también en el manual, «Tips para el GM»): el ataque básico y cada habilidad,
  simulados con las fichas reales y las reglas del duelo (sin combates en la partida real). Se presenta **creep por creep, de nivel más bajo a
  más alto**, con una tabla por rival (pega, daño por golpe, daño medio por intento, si entra el efecto) y opciones a/b/c; el dueño elige.
  **Formato (dueño, 2026-10-16):** primero la **ficha completa** del creep (nivel, vida, atributos, Defensa/Evasión/No2, arma, equipo, nota) y
  **cada habilidad con su texto tal cual**, costo, cooldown (y si es lenta) y qué hace; recién después la tabla de números y las opciones.
  **Ninguna acción puede quedar en cero contra todos**: que sea mejor contra uno y peor contra otro está bien. Ojo: Rengo, Lisiado, Sangrado y
  Envenenar necesitan que el golpe haga daño. Hecho así con el Bosque (`bosque.md`, «Auditoría de habilidades»).

- Lo nuevo (una mecánica, una skill automatizada) se prueba en el mapa de **«Claude · pruebas»** con una copia del creep y capturas
  (`docs/pruebas-en-el-mapa.md`); en la partida real no se hacen combates de prueba.
- Las ideas que aparecen, a `docs/pendientes.md`; las preguntas de diseño, a `docs/preguntas-abiertas.md`.

## Hechos con este método

- **Minas** (2026-10-13/14): 14 creeps (kobolds, ratas, el Capataz jefe); botín ~1.950 DDE para 3.
- **Bosque** (2026-10-14, en curso): del primer mapa (7 creeps) a un dungeon de tres encuentros.
