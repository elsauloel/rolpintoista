# Pruebas de humo

> Paso 0 de [`plan-consolidacion.md`](plan-consolidacion.md) (2026-09-30). **Qué tocar y qué tiene que pasar** en cada
> herramienta, para repasar **antes y después** de cada paso de la consolidación (y de cualquier cambio grande). Lo automático
> vive en [`../comun/pruebas.html`](../comun/pruebas.html) (reglas puras, sin sesión: todo en verde = se puede seguir); esto es
> lo que hay que mirar con las herramientas de verdad.
>
> **Dónde probar** (ver la memoria del asistente, `partidas-de-prueba`): **"Claude · pruebas"** para todo lo del GM (creeps del
> grupo "Arena de pruebas", tokens en el mapa principal y en "Mazmorra de pruebas"); **"Test"** (GM: Seba) solo para lo que
> necesita una ficha de jugador (personaje "Prueba de Claude"). Nunca en las partidas reales. Al terminar, dejar todo como estaba
> (estados, cooldowns, No2, HP; borrar lo colocado en el mapa de Seba).
>
> Cómo anotar: al lado de cada punto, ✔ / ✘ y la fecha. Un ✘ se arregla (o se anota en `pendientes.md`) antes de seguir.

## 0. Automáticas
- [ ] `comun/pruebas.html` en verde (hoy: 107 pruebas).

## 1. Ficha (partida "Test", "Prueba de Claude")
- [ ] Abre sin errores en la consola; el título dice personaje y partida.
- [ ] Cambiar un atributo (Con) recalcula el HP máximo; el HP actual no se cura de más.
- [ ] **Habilidad 📣 manual**: "Anunciar" publica el texto en la Mesa; no cobra nada.
- [ ] **Habilidad 💰 semiautomática**: cobra SP y No2 y tira la tirada inicial (aparece en la Mesa).
- [ ] **Habilidad ✨ automática sobre uno mismo sin tiradas** (Blindaje): aplica el estado (escudo) sin abrir el cuadro y lo anuncia.
- [ ] **Habilidad ✨ automática contra un enemigo**: abre el cuadro de Ejecución; elegir objetivo; tiradas de los dos lados; efectos.
- [ ] Editor de habilidad: arranca en "¿Cómo se ejecuta?"; los pasos cambian según el modo.
- [ ] "+ Estado" con un preset: pregunta las cantidades y lo aplica; el Mantenimiento lo descuenta.
- [ ] Equipar / desequipar un ítem: cambian los stats; en modo combate cuesta 1 No2.
- [ ] Talentos: "± Nivel" → por Inteligencia, por tirada máxima y ✎ a mano; la tirada es 1d(nivel×2) + Inteligencia libre.
- [ ] Invocación: crearla, "▶ Usar", ejecutar una habilidad de cada modo.
- [ ] Ver un ítem del catálogo → "✎ Editar y subir" abre el asistente (no subir, cancelar).

## 2. Mapa (como jugador en "Test" y como GM en "Claude · pruebas")
- [ ] Carga el mapa con los tokens; el GM ve los creeps ocultos, el jugador no.
- [ ] Mover el propio token cobra No2 por casillero.
- [ ] La Botonera (dentro del mapa) abre, tira y publica en la Mesa; sus ventanitas se ven (ej. "¿Es tu turno?").
- [ ] Atacar a un token → cuadro del duelo: PdG, defensa, crítico (cuadraditos), daño aplicado al HP.
- [ ] Trampa de una habilidad ✨: se anuncia en la Mesa sin ubicación; el mapa pide la casilla; la ve solo el bando que la puso.
- [ ] Pisar una trampa enemiga la dispara (daño y estado).
- [ ] Zona persistente: se coloca, afecta al entrar y en el Mantenimiento.
- [ ] Niebla de guerra y "Ve lo oculto" funcionan; el GM no descubre trampas de los jugadores.
- [ ] ⟳ Mantenimiento (GM): pasa el turno de fichas y creeps; el reporte aparece en la Mesa.

## 3. GM Tools (partida "Claude · pruebas")
- [ ] Carga los 6 creeps del grupo "Arena de pruebas".
- [ ] **Grito burlón** (📣): Anunciar, sin cobrar ni cooldown.
- [ ] **Piel dura** (✨ sobre sí): cobra No2, cooldown, escudo de 5, sin cuadro.
- [ ] **Rayo de pantano** (✨ contra un enemigo): abre el cuadro del duelo (necesita un objetivo en el mapa).
- [ ] **Pisotón** (✨ onda): desde el mapa, afecta a los adyacentes.
- [ ] **Trampa de raíces** (✨ trampa): desde las Acciones del mapa, pide la casilla; los jugadores no la ven.
- [ ] Una habilidad 💰 de fábrica: cobra y tira la primera tirada.
- [ ] Editor de habilidad de creep: arranca en "¿Cómo se ejecuta?"; los pasos cambian según el modo.
- [ ] Mantenimiento: baja cooldowns, recarga No2, aplica estados.
- [ ] 🏁 Finalizar combate → reporte de XP/oro/despojos (no publicar).

## 4. Generador de tiendas (partida "Claude · pruebas")
- [ ] Generar una tienda: no aparecen ítems 🎒 solo botín.
- [ ] Ver un ítem → "✎ Editar y subir" abre el asistente (cancelar).
- [ ] Publicar y verla desde una ficha (partida "Test" no: usar solo el generador).

## 5. Biblioteca, subida y auditoría
- [ ] "+ Habilidad" de la ficha lista las clases y el pool custom.
- [ ] `datos/auditoria.html`: 👁 Ver y ⚖ Comparar se leen claros (sin llaves ni JSON crudo).
- [ ] Menú ☰ abre todas las herramientas de la partida.

## Registro
| Fecha | Qué se probó | Resultado | Notas |
|---|---|---|---|
| 2026-09-30 | Automáticas (`comun/pruebas.html`) | ✔ 38/38 | Primera versión del paso 0. |
| 2026-09-30 | Automáticas + funciones del motor dentro de ficha y GM Tools (copias sin sesión) | ✔ 56/56 | Paso 1, tanda 1 (`comun/combatiente.js`). |
| 2026-09-30 | En mesa: GM Tools ("Claude · pruebas": Pajaritos+Lisiado+Parálisis en un goblin, tirada de PdG, Sangrado ×2, jefe contra Stun) y ficha ("Test": estados recibidos, acumulación, Invulnerable, botones de colores, escudo) | ✔ | Apareció la diferencia de estados recibidos (Veneno ×3 → ×4 en personajes): corregida. Todo quedó como estaba. |
| 2026-09-30 | Tanda 2 (tirar un stat): automáticas + ficha, invocación y GM Tools (copias sin sesión) | ✔ 65/65 | Invocaciones con Afortunado (P100) ya tiran dos veces. |
| 2026-09-30 | Paso 2, tanda 1 (pase de turno de los estados): personaje, invocación y creep (copias sin sesión) | ✔ 78/78 | La invocación ya respeta Invulnerable y el tope de vida. |
| 2026-09-30 | Paso 2, tanda 2 (poner un estado): personaje (+ Estado y recibido), invocación y creep (copias sin sesión) | ✔ 83/83 | Repetidos se renuevan; la invocación con Invulnerable rebota el Stun. |
| 2026-09-30 | 🎮 Tomar el control en mesa ("Claude · pruebas", Clementino): estado recibido, pase de turno, Botonera en el mapa, mover con No2, defensa en un duelo, devolver | ✔ | Todo restaurado al terminar. |
| 2026-09-30 | Paso 2 en mesa ("Claude · pruebas", sitio publicado): Goblin con Veneno ×2, Regeneración +3 y Escudo gastado, 3 Mantenimientos seguidos | ✔ | Vida 20 → 21 → 23 → 26; Veneno se terminó al llegar a 0 stacks; Regeneración venció; escudo recargado. Todo restaurado. |
| 2026-09-30 | Tanda 3: costo de atacar y No2 máximo en ficha, invocación y GM Tools (copias sin sesión) | ✔ 72/72 | "Forzar Nitros a 20" con Agilidad 9 ya no sube el máximo (P130). |
| 2026-10-01 | Paso 5, nivel B, área 2 (`comun/ficha-combate.js`): combate nuevo contra el viejo en 1 200 fichas al azar (igual); atacar con la espada en una copia sin sesión (−4 No2 el primero; el segundo, sin No2 suficientes, avisa y no cobra); en mesa, la Botonera de Clementino dentro del mapa (PdG 1d6, Esquivar 1d12, Parry y Bloqueo apagados sin arma ni escudo) | ✔ 107/107 | Sin errores. |
| 2026-09-30 | Paso 5, nivel B, área 1 (`comun/ficha-calculo.js`): cálculo nuevo contra el viejo en 1 500 fichas al azar (igual) y en mesa: la ficha de Clementino calcula lo mismo que tenía publicado (vida máx. 25, Defensa 0, No2 12, Rango 6, Rango de casteo 15, SP 45) | ✔ 103/103 | Sin errores. |
| 2026-09-30 | Paso 5, nivel A (ficha y GM Tools partidas en archivos): copias sin sesión comparadas con las originales (pantalla idéntica, estilos iguales, modos botonera/mantenimiento/acciones/finalizar sin errores, invocación y creep con los mismos números) y en mesa ("Claude · pruebas"): ficha de Clementino, su Botonera dentro del mapa, GM Tools suelto (6 creeps, guardado) y las Acciones del Goblin dentro del mapa | ✔ | Un ajuste en la ficha: el primer `renderAll()` pasó al final (usaba funciones de archivos posteriores). Sin errores. |
| 2026-09-30 | Paso 4, etapa 1, puntos 3 y 4 en mesa ("Claude · pruebas", como GM): precarga (GM Tools cargado por detrás sin abrir nada, capa cerrada); Acciones del Goblin en 0,3 s, sin «Abriendo…»; duelo con el creep sin cargar (GM Tools carga sin abrir sus Acciones encima del duelo, el PdG se tira igual); mensajes sin avisos de «sin registrar» | ✔ | Goblin restaurado (10 No2, 0 ataques); duelo cancelado antes de la defensa. Falta probar como jugador (precarga de la ficha propia). |
| 2026-09-30 | Paso 4, etapa 1 en mesa ("Claude · pruebas", sitio publicado, como GM): Acciones del Goblin (se ve solo su ventana; la capa se abre y al cerrar se va), un cartel suelto de GM Tools con la capa cerrada (se abre sola y se va al cancelar), Botonera de Clementino en solo lectura (se ve solo la Botonera; con otra ventana abierta la capa se queda, al cerrar todo se va) | ✔ tras 1 arreglo | Con la capa cerrada el marco no se dibuja y todo medía cero: `embebido.js` ya no mide tamaños. Sin errores; no se tocó ningún dato. |
| 2026-09-30 | Paso 4, etapa 1 (`comun/embebido.js`): ficha y GM Tools dentro de un marco de prueba — la página y la Mesa escondidas, un cartel cualquiera de GM Tools visible y avisado (abierto/cerrado), la Botonera avisa al abrir y cerrar, Polilla visible sin contar, cartel de solo lectura escondido | ✔ | Falta en mesa. |
| 2026-09-30 | Invocación: ataque con arreglos ("Mordida feroz": −3 No2 como un ataque, PdG +1, daño 1d6+4) y ⚡ Flash ("Aullido": turno ajeno → cooldown 4 y −2 HP; con Ejecutar en su turno → cooldown 2 y −1 HP, sin No2) — copia de la ficha sin sesión | ✔ 98/98 | |
| 2026-09-30 | En mesa ("Claude · pruebas", sitio publicado): Goblin recolector con dos habilidades de prueba contra Clementino en el mapa — ataque con arreglos ("+2 PdG · +2 de daño fijo", PdG 1d10 +2 ⚡, daño 2d4+8, Rengo como efecto al golpear) y ⚡ Flash (botón con los dos costos; turno ajeno → cooldown 4, su turno → cooldown 2; en cooldown aparece apagado; sin No2) | ✔ tras 2 arreglos | Se encontró que los carteles de la ficha o de GM Tools durante un duelo quedaban tapados por el cuadro del duelo (capa del mapa) y que GM Tools escondía el cartel «¿es su turno?»: corregidos y verificados. Goblin restaurado; Clementino (quedó en 0 por un crítico ×3) vuelto a 25. |
| 2026-09-30 | Regla del Flash (P136, el doble en turno ajeno) en personaje y creep: personaje "Reflejo" (2 SP + 1 HP; ajeno 4 SP + 2 HP → no le alcanzan los SP y no se usa; con Ejecutar en su turno cobra 2 SP + 1 HP, sin No2); creep "Furia ciega" (ajeno: cooldown 4 y −2 HP; con Ejecutar en su turno: cooldown 2 y −1 HP; sin No2) — copias sin sesión | ✔ 98/98 | |
| 2026-09-30 | Flash de creep en turno ajeno (P136): en el duelo "No, es turno ajeno" → cooldown 4 (el doble de 2); con el botón Ejecutar "Sí, es su turno" → cooldown 2, sin No2; sin cooldown no pregunta; Cancelar no cobra — copia de GM Tools sin sesión | ✔ 97/97 | |
| 2026-09-30 | Creeps: ataque con arreglos (Embestida: cobra lo de un ataque, PdG +2, daño +3) y ⚡ Flash (Furia ciega en PdG, cooldown sin No2; Esquive felino vale con Evasión y no con Parry, cuesta 2 HP) — copia de GM Tools sin sesión | ✔ 96/96 | Ataque con arreglos del personaje comparado con el viejo: 4000 casos, igual. Falta el duelo real en el mapa (pendientes). |
| 2026-09-30 | Paso 3 en mesa ("Claude · pruebas", sitio publicado): Piel dura (✨ sobre sí) del Escarabajo de cobre | ✔ | −1 No2, cooldown 3, Escudo especial 5, sin cuadro. Restaurado (recargado y verificado). |
| 2026-09-30 | Paso 3, tanda 2 (zonas, trampas y el estado del sistema anterior): creep y personaje dentro de un marco que hace de mapa (mensajes de zona y trampa), Veneno 2+2, Excedente de vida 4+4, jefe contra Stun, estado repetido que se renueva, Invulnerable contra Lisiado (copias sin sesión) | ✔ 94/94 | Zona del personaje con X = 3: «1d6+3». |
| 2026-09-30 | Paso 3, tanda 1 (usar una habilidad): creep (✨ sobre sí con costo en vida, cooldown, "Sin vida", ataque con arma y sin Ejecución → avisan, tirada personalizada en el duelo, editor), invocación (escudo que se renueva, Invulnerable frena un Stun, Veneno ×2, zona → avisa, cura, editor) y personaje (copias sin sesión) | ✔ 92/92 | Comparado contra las funciones viejas sobre las habilidades de clase + 3000 al azar: igual (creep: solo lo buscado). |
| 2026-09-30 | Bloqueo solo tras un Parry: personaje (arma + escudo), invocación y creep (copias sin sesión) | ✔ 66/66 | Antes del Parry: apagado con «Espada 1d4 · Escudo 1d6»; tras el Parry: se tira con ese; un segundo Bloqueo no. |
| 2026-09-30 | Parry y Bloqueo solo con arma o escudo: personaje (sin nada / con escudo), invocación (natural / con arma), creeps (sin arma, espada, garras, garras + escudo) | ✔ 66/66 | Sin opción → aviso y no cobra ni tira. |
