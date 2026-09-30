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
- [ ] `comun/pruebas.html` en verde (hoy: 97 pruebas).

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
| 2026-09-30 | Flash de creep en turno ajeno (P136): en el duelo "No, es turno ajeno" → cooldown 4 (el doble de 2); con el botón Ejecutar "Sí, es su turno" → cooldown 2, sin No2; sin cooldown no pregunta; Cancelar no cobra — copia de GM Tools sin sesión | ✔ 97/97 | |
| 2026-09-30 | Creeps: ataque con arreglos (Embestida: cobra lo de un ataque, PdG +2, daño +3) y ⚡ Flash (Furia ciega en PdG, cooldown sin No2; Esquive felino vale con Evasión y no con Parry, cuesta 2 HP) — copia de GM Tools sin sesión | ✔ 96/96 | Ataque con arreglos del personaje comparado con el viejo: 4000 casos, igual. Falta el duelo real en el mapa (pendientes). |
| 2026-09-30 | Paso 3 en mesa ("Claude · pruebas", sitio publicado): Piel dura (✨ sobre sí) del Escarabajo de cobre | ✔ | −1 No2, cooldown 3, Escudo especial 5, sin cuadro. Restaurado (recargado y verificado). |
| 2026-09-30 | Paso 3, tanda 2 (zonas, trampas y el estado del sistema anterior): creep y personaje dentro de un marco que hace de mapa (mensajes de zona y trampa), Veneno 2+2, Excedente de vida 4+4, jefe contra Stun, estado repetido que se renueva, Invulnerable contra Lisiado (copias sin sesión) | ✔ 94/94 | Zona del personaje con X = 3: «1d6+3». |
| 2026-09-30 | Paso 3, tanda 1 (usar una habilidad): creep (✨ sobre sí con costo en vida, cooldown, "Sin vida", ataque con arma y sin Ejecución → avisan, tirada personalizada en el duelo, editor), invocación (escudo que se renueva, Invulnerable frena un Stun, Veneno ×2, zona → avisa, cura, editor) y personaje (copias sin sesión) | ✔ 92/92 | Comparado contra las funciones viejas sobre las habilidades de clase + 3000 al azar: igual (creep: solo lo buscado). |
| 2026-09-30 | Bloqueo solo tras un Parry: personaje (arma + escudo), invocación y creep (copias sin sesión) | ✔ 66/66 | Antes del Parry: apagado con «Espada 1d4 · Escudo 1d6»; tras el Parry: se tira con ese; un segundo Bloqueo no. |
| 2026-09-30 | Parry y Bloqueo solo con arma o escudo: personaje (sin nada / con escudo), invocación (natural / con arma), creeps (sin arma, espada, garras, garras + escudo) | ✔ 66/66 | Sin opción → aviso y no cobra ni tira. |
