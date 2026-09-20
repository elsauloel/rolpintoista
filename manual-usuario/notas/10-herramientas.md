+++
capitulo: Las herramientas
icono: 🧰
resumen: Un recorrido por cada herramienta del sitio: la ficha, la Botonera, el mapa, la bitácora y el resto.
+++

+++
titulo: Inicio y partidas
alias: [Partida, Partidas, Cuenta, Iniciar sesión, Menú, Home, Sitio web]
tags: [herramientas, empezar]
estado: borrador
+++
El sitio vive en **elsauloel.github.io/rolpintoista**. Es una página web común: no se instala nada.

## Tu cuenta
Entrás con **Google**, o con **email y contraseña** (te llega un link para confirmar). El sitio arranca pidiendo iniciar sesión.

## Las partidas
Después ves **todas las partidas del grupo** y te unís a una con un clic, o **creás una nueva** (y así te convertís en su GM). Cada partida es un mundo aparte: sus personajes, mapas, tiendas y bitácora no se mezclan con los de otra.

- **El nombre se elige al entrar a cada partida** (es cómo te ven los demás).
- **Un jugador puede tener varios personajes.**
- El **GM** puede ver los jugadores, sacar a alguien, renombrar o borrar la partida (pide escribir el nombre, y ofrece antes un [[Respaldo de la partida|respaldo]]).
- Un jugador puede **irse de la partida**; sus personajes quedan y el GM los reasigna.

## El menú ☰
El botón **☰** arriba a la izquierda, igual en todas las páginas, abre el árbol del sitio: Home → tu partida abierta (con su mapa, tus personajes y, si sos GM, [[GM Tools]] y [[Generador de tiendas]]) → otras partidas → **Manual** → cerrar sesión.

> [!info] Grupo de confianza
> Cualquier cuenta ve todas las partidas y se une con un clic: el sistema asume un grupo cerrado de amigos.

+++
titulo: La ficha
alias: [Ficha, Ficha de personaje, Dock, Personajes, Exp y Job]
tags: [herramientas, personaje]
estado: borrador
+++
La **ficha** es tu personaje entero en una página: identidad, [[Atributos]], [[Stats derivados]], habilidades, pasivas, sociales, mochila, cinturón, invocaciones y estados. **Se guarda sola** en la partida, por partes.

## Qué ves
- **Cabecera:** foto (con recorte para el token), nombre, raza, clase, subclase, nivel. Las barras de **HP** (roja) y **SP** (azul) y los [[Estados alterados|estados]] activos.
- **Atributos** a todo el ancho, con sus derivados debajo y el **Campo de visión** ([[Campo de visión]]).
- **Dos columnas:** a un lado Mochila y Cinturón; al otro Habilidades, Pasivas y Sociales; al final, [[Invocaciones]].
- La **[[La Mesa|Mesa]]** flotante, con tus tiradas y las de todos.

## El dock (los botones pegados al borde izquierdo)
Se abre con el mouse encima:

| Botón | Para qué |
|---|---|
| ⚡ **Botonera** | Acciones rápidas: [[La Botonera]] |
| 👥 **Personajes** | Cambiar de personaje o crear uno; ver los de otros en solo lectura |
| 🏪 **Vendedor** | Abrir la [[Tiendas\|tienda]] publicada por el GM |
| ⭐ **Exp y Job** | Experiencia y [[Puntos de Job]] |
| 💰 **DDE y loot** | [[DDE]] y loot |
| 📖 **Bitácora** | [[La Bitácora]] |
| 🛡 **Equipo** | [[Equipo y ranuras]] |
| 🗺 **Mapa** | Ir a [[El mapa]] |
| 💾 **Respaldo** | [[Respaldo de la partida]] |

## Editar y entender tus números
- Pasá el mouse por un stat: ves de dónde sale (atributo, ítem, estado).
- Los **recursos siguen a su atributo**: subir Constitución sube tu HP máximo.
- **Estados** compactos: si son muchos, "＋N · Ver todos".
- Con el mapa en combate, **equipar cuesta Nitros** ([[Costos en Nitros]]).

## Ver y ayudar
Podés **abrir la ficha de otro jugador en solo lectura**. El **GM** además puede tocar **"✎ Editar como GM"** para ayudar a alguien (configurar habilidades, por ejemplo): lo que cambie se guarda en la ficha de ese jugador. El Mantenimiento no se aplica desde la vista del GM.

> [!info] Solo compu
> La ficha está pensada para pantalla de computadora. Ver [[Qué necesito para jugar]].

+++
titulo: La Botonera
alias: [Botonera, Acciones rápidas, Lupa, 🔍]
tags: [herramientas, combate]
estado: borrador
+++
La **Botonera** (botón ⚡ del dock, o desde tu token en el mapa) es tu **control remoto**: ventanitas con todo lo que hacés en tu turno, en botones.

## Qué tiene
- **Combate:** **Atacar** (cobra los Nitros y tira PdG) y **Daño**. Con dos armas se desdoblan.
- **Defensa:** Evasión, [[Parry]] y [[Bloqueo]], con el arma a elegir.
- **Tiradas de stats:** cualquier stat con un clic ([[Cómo se tira un stat]]).
- **[[Habilidades]]:** un **Ejecutar** por cada una, con costo, tirada y estado.
- **Consumibles** del cinturón y de la mochila.
- **Habilidades sociales** ([[Inteligencia y habilidades sociales]]), arriba en narrativo, abajo en combate.
- **🔎 Percepción** (tirada de [[Especial]], para [[Trampas]] y detección).
- **Sigilo:** el botón "Entrar en sigilo" aparece con solo tener la habilidad ([[Sigilo]]).

## La 🔍 lupa
Al lado de cada botón hay una **🔍**: **no tira nada**, te explica **de qué stat sale la tirada**, sus modificadores con origen, cómo se reparte en dados y **cuánto cuesta** en Nitros o SP. Es la mejor forma de aprender el sistema.

## Avisos
- **Sin recursos:** un botón sin Nitros suficientes queda apagado (la 🔍 sigue abriendo). Al tocarlo te avisa y te deja **"realizar de cualquier modo"**, con una línea roja en la Mesa.
- Todo lo que tirás aparece en [[La Mesa]].

+++
titulo: El mapa
alias: [Mapa, Tablero, Hexágonos, Grilla, Mapa hexagonal, VTT]
tags: [herramientas, mapa]
estado: borrador
+++
El **mapa** es un tablero de **hexágonos** compartido y en vivo. Todos ven los mismos movimientos al instante.

## Lo básico
- **Tokens:** cada personaje tiene el suyo (con su foto); los enemigos, los del GM. Un token **vinculado** a una ficha muestra su **barra de HP y SP, y sus estados**. → [[Tokens]]
- **Modo narrativo / combate:** el GM lo cambia. → [[Modo narrativo y modo combate]]
- **Orden de turnos:** lista flotante (solo en combate). → [[Estructura de un combate]]
- **La Mesa** al costado: → [[La Mesa]].
- El **fondo** del mapa puede ser una imagen que el GM sube.

## Moverte
Arrastrás tu token. Se dibuja **la ruta** casillero por casillero y todos ven una **estela** unos segundos. En combate **cada casillero cuesta Nitros**: al soltar se te pide confirmar (o cancelar). Otras cosas útiles:
- **Clic derecho mientras arrastrás** cancela el movimiento.
- **Ctrl + Z** deshace el último movimiento.
- **Girar** el token con el asa celeste ([[Campo de visión]]).
- **🦶 Mover libre:** mover sin gastar Nitros (para cuando el GM lo decide).

## Sobre el token
Al seleccionar tu token aparecen controles flotantes: la **vida** (círculo rojo: escribís +N/−N), **SP**, ⚡ **Botonera**, 🛡 **Equipo**, girar, mover libre y editar.

## Herramientas del mapa
- **Caja de herramientas:** lápiz, terreno y formas (obstáculos, líneas, flores, áreas), regla, mediciones. → [[Terreno y dibujo]]
- **Ping:** clic derecho en el mapa marca un lugar (un anillo que se expande).
- **Niebla de guerra, sigilo, conos, trampas:** ver [[Niebla de guerra]], [[Sigilo]], [[Campo de visión]], [[Trampas]].
- **Varios mapas guardados:** el GM puede tener muchos y cambiar.
- **Grilla de dados** ([[La Mesa]]) y la **bitácora flotante** ([[La Bitácora]]).

> [!tip] Atajos
> El ícono ⌨ en el mapa muestra la lista de atajos.

+++
titulo: Tokens
alias: [Token, HUD, Token vinculado, Creep token]
tags: [herramientas, mapa]
estado: borrador
+++
Un **token** es la ficha del tablero: el dibujito de un personaje, enemigo, objeto o trampa.

- **Vinculado:** un token de personaje se conecta a su [[La ficha|ficha]] (y uno de enemigo a su [[Creeps|creep]]). Muestra HP, SP y estados en vivo, y la foto de la ficha.
- **Sin vincular:** para un NPC, una puerta o un objeto: tiene nombre, color e imagen propios.
- **Dueño:** cada jugador mueve **los suyos**; el GM mueve **todos**.
- **Se crean con "+ Token"**: elegís qué es, dónde y hacia dónde mira. El GM puede crear uno a nombre de un jugador.
- **Varios en la misma casilla** se acomodan en ronda.
- El GM puede **ocultar** tokens ([[Ocultar y revelar]]).

+++
titulo: Terreno y dibujo
alias: [Terreno y Formas, Caja de herramientas, Lápiz, Dibujar, Regla]
tags: [herramientas, mapa]
estado: borrador
+++
La **caja de herramientas** del [[El mapa|mapa]] (a la izquierda) es para **dibujar y marcar**. Cualquiera puede usarla:

- **✏️ Lápiz:** dibuja a mano sobre el mapa mientras lo tenés apretado (y por casilleros numerados).
- **⬡ Terreno y Formas:** coloca **objetos** con forma (flor de radio N, línea, libre), tamaño, color y transparencia. Se usan para marcar obstáculos, áreas de hechizos y [[Trampas]]. Los **sólidos** tapan la vista ([[Campo de visión]]).
- **Regla/medición:** para contar casilleros.
- **🌫 Niebla** (solo GM): destapar o tapar a mano ([[Niebla de guerra]]).

+++
titulo: La Bitácora
alias: [Bitácora, Diario, Notas de la partida]
tags: [herramientas, empezar]
estado: borrador
+++
La **bitácora** es el **diario compartido de la partida**: quién hizo qué, pistas, nombres, lo que no querés olvidar.

- **Páginas:** cualquiera las crea y las renombra.
- **Entradas:** cada una en el **color de su autor**, con autor y fecha.
- **Cualquiera puede corregir** una entrada; **borra** solo el autor (o quien creó la página) o el GM.
- La abrís desde el dock de la ficha (📖) o como **bitácora flotante** en el mapa.
- Funciona también en solo lectura.

+++
titulo: Respaldo de la partida
alias: [Respaldo, Backup, Guardar copia, Cargar respaldo]
tags: [herramientas]
estado: confirmado
+++
Como el plan gratis del servicio no hace copias de seguridad, **todos pueden bajar un respaldo** a un archivo `.json`:

- **Jugadores:** botón **💾 Respaldo** en la ficha: baja tu personaje y lo que podés leer de la partida. Se recarga con **Cargar archivo**.
- **GM:** **Respaldo partida** en [[GM Tools]]: incluye los creeps completos. **Cargar respaldo** reemplaza los creeps de la mesa por los del archivo (con confirmación).
- Al **borrar una partida**, el sistema te ofrece bajar un respaldo antes.

> [!tip] Hacelo seguido
> Un respaldo antes de una sesión larga o de un cambio grande es barato y salva la partida.

+++
titulo: Editor de catálogo
alias: [Editor del catálogo, Catálogo editor]
tags: [herramientas, catálogo]
estado: borrador
+++
Herramienta para el **dueño del proyecto**: un listado filtrable de todo el [[Catálogo de ítems]] con alta, edición y borrado de ítems, usando el mismo asistente paso a paso ([[Crear tus propios ítems]]). Los cambios se sincronizan con las herramientas de juego (ficha, GM Tools, generador de tiendas).
