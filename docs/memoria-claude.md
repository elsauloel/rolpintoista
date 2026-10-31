# Memoria de Claude (para las sesiones en la nube)

> Copia limpia de lo que Claude aprendió trabajando con el dueño (Saulo). Las sesiones de la compu lo tienen además en su memoria local;
> **las sesiones en la nube no**: por eso vive acá, en el repo. Pasada el 2026-10-31. El repo es **público**: acá no van emails, ids de
> partidas, de personajes ni de cuentas. Cuando aprendas algo nuevo que tenga que valer en cualquier sesión, sumalo acá (una línea, con
> fecha y las palabras del dueño si las hay).

## Cómo hablarle y presentarle las cosas

- **Siempre en español rioplatense**: avisos cortos, propuestas, resumen final y commits. Pasó varias veces que se pasó al inglés después de
  mucho trabajo técnico o de un resumen automático: revisar el idioma antes de cada mensaje.
- **No es técnico**: explicar qué va a ver o hacer el jugador, no cómo funciona por dentro. Preguntar el objetivo antes de proponer arquitectura.
  A veces dicta por voz, en partes.
- **Celular**: si está en el teléfono o en la calle, **nada de tablas**: cada cosa como «Título: texto», un párrafo por cosa. En la compu, a lo
  sumo tablas de dos columnas. Las tablas detalladas pueden ir a los docs.
- **Una skill o un ítem para decidir**: primero el texto original tal cual (con su costo y de qué clase es), una explicación corta de lo que no sea
  obvio y, si sirve, skills parecidas ya auditadas; recién después la pregunta. Si la pregunta va en un cuadro de opciones, repetir la cita adentro
  (el cuadro tapa el texto de antes).
- **Áreas por diámetro**: «diámetro 3 (7 casillas)», nunca «radio N» ni «flor de N». Las luces de varitas y bengalas: diámetro 3.
- **Vocabulario**: «cooldown», no «espera». «SP» es siempre Special Power; «Esp/Especial» es el atributo (ex Inteligencia). La clase/rol se llama
  **Asalto** (no «emboscador»); la de hechizos, **Mago** (él a veces dice «caster»). «Equipo/equipado» incluye las armas. La palabra «trampa», solo
  para lo que coloca una trampa real en el mapa. «Rol Pintoísta» = el sistema y el proyecto; «Piratas en el espacio» = la campaña vieja.
- **Nombres de armas e ítems**: mitad clásico, mitad criollo/rioplatense o fantasía absurda; nada de palabras raras en Argentina (húsar,
  matarife, alfanje). El renombrado de lo viejo está en pausa.
- **«Botón instantáneo»** = los botones flotantes de `comun/flotantes.js` (Empower, Re-roll, Flash…), que se mudan a «Podés usar» del duelo.

## Cómo trabajar

- **Subir sin pedir permiso**: apenas algo queda probado (al menos sin errores), commit + push a `nueva-version` y avisar. Cada push se publica
  solo en GitHub Pages en 1–2 minutos. Si depende de reglas de Firestore, subirlo igual y recordarle que las pegue en la consola (las pega él).
- **Lo estructural, sin reportes intermedios**: en cambios internos que él no puede ver, encadenar los pasos (probar, subir, documentar) y cortar
  solo para una decisión suya o si algo se rompe. Al terminar un tramo largo, un reporte completo para que lo lea en la compu.
- **Sistema prolijo antes que rápido**: una sola pieza común en `comun/` usada por ficha, GM Tools y mapa; sin copias «por ahora» ni caminos viejos.
- **Mudar código**: copiarlo tal cual y comparar CADA función movida contra el original (un error así llegó a publicarse).
- **La regla manda**: una regla del juego vale en todos los caminos (duelo, botón, personaje, creep, invocación). Las reglas de combate son
  **iguales para personajes, invocaciones y creeps**: nunca dejar a uno «para más adelante».
- **Automatizar o aclarar**: si se puede automatizar, se automatiza; si no, se aclara (⚙ Automatizado / ✋ A mano, en «Detalles técnicos»).
  **Sin silencio**: lo automático tiene su Anuncio para quien lo dispara y para quien lo recibe (patrón de `vtt-hexgrid/js/66-zona-extra.js`).
  **Salida a mano**: en cada automatización nueva, preguntar en una línea si vale «Aplicar automático» / «Resolver a mano» (decide él).
- **Excepción a propósito**: los efectos de arma sobre el golpeado (`efectosGolpe`) se recuerdan y se tiran, no se aplican solos, salvo pedido.
  Las «inmunidades a X» de ítems nuevos son un estado recordatorio «Inmune a X (origen)», sin mecánica (6 anillos/pergaminos viejos sí la tienen).
- **Texto de una skill o ítem**: el efecto práctico en números primero, la tirada después, las notas al final. El texto visible dice solo qué pasa:
  los términos llevan su globo del glosario (`comun/glosario.js`) y lo técnico va a «Detalles técnicos».
- **Redondeo**: los debuffs para abajo, los buffs para arriba, salvo aviso.
- **Preguntas de diseño** sin decidir → `docs/preguntas-abiertas.md` (número, contexto, fecha; ✅ al decidir). **Ideas que dicta al pasar** →
  `docs/pendientes.md`, «💡 Ideas del dueño para retomar». Lo que necesita que él esté en la compu → la sección «🖥» de `docs/pendientes.md`; cuando
  dice «estoy en la compu», leerla y proponer. Lo que deja «para más adelante», anotado en el repo (nunca solo en el chat) y preguntarle si lo suma
  también a «Herramientas de diseño» (`preguntas-diseno/`, pestaña «A desarrollar»; solo se suma ahí cuando él lo pide).
- **Avanzar antes que trabarse** en balance y diseño: medir lo justo, decidir con criterio, anotar lo abierto y seguir. El GM afina lo puntual.
  La prueba a fondo («romper el juego») va al final.
- **Simuladores de balance**: con el inventario real del catálogo, no con curvas de diseño.
- **Decisiones relajadas**: es un juego entre amigos; lo que se relaja en anti-trampa o privacidad se anota en la tabla «Antes de abrirlo al
  público» de `docs/plan-sistema-nuevo.md`.
- **Solo compu**: no adaptar ni probar nada para pantallas de celular salvo pedido (la excepción es `preguntas-diseno/`).
- **«La otra conversación»** que dejó trabajo hecho suele ser el mismo dueño desde otra cuenta o la otra máquina: continuar su trabajo, revisando
  `git log` y los docs antes de tocar algo grande. Antes de un cambio grande en `ficha.html` o `gm-tools.html`: `git status` y `git log --oneline -5`.

## Diseño del juego

- **Esencia sandbox**: plataforma, no corsé. Avisar en vez de bloquear, salida manual siempre, no imponer balance; la creación es colectiva (del grupo).
- **Nitros (No2) muy preciados**: un costo bajo en No2 es una ventaja grande; lo barato en No2 es de calidad baja o tiene límites.
- **Habilidades que se sientan**: si gasta la acción, además del estado suma algo de daño o algo concreto; ante la duda, un poco para arriba.
- **Creeps agresivos**: los jugadores tienen muchas herramientas (consumibles, support, re-roll, wildcards); ante la duda, la opción más agresiva.
  La alarma es lo contrario: una acción que no le hace nada a nadie.
- **Versión creep, más potente**: al adaptar una skill de clase a creep, proponerla un escalón arriba (tienen menos skills y menos combos).
- **Vida de un creep = Con × 5 + bonos**, sola. Al editar un creep por script, recalcular con `CreepCalculo.actualizarHpMaxPorCon` (y el No2 con
  `actualizarNo2PorAgl`).
- **Creeps base** (`comun/creeps-base.js`) y las skills de creep anteriores a la tanda de 20 por rol: no son referencia; no condicionar el diseño.
- **Skills de creep, rol por rol** (`docs/diseno-roles-creep.md`): al entrar a un rol, primero la lista completa de conceptos (y las skills de clase de
  ese rol), después elegir; siempre avanza el rol con menos conceptos. **Diseñar todo, programar después**: cuando él lo pide, se definen sin programar
  y se programan juntas cuando dice «ahora programalos».
- **Auditorías**: se define → se programa → pruebas automáticas → se sube → se anota «para probar» en `docs/pruebas-en-el-mapa.md`. Las pruebas en
  el mapa, todas juntas cuando él dice «corré/probá todo»; no ofrecerlas en el momento.
- **Elementos por rol** (estilo, no regla): Mago arcano/fuego/hielo/rayo/ácido; Debuffer siniestro y tóxico; Support luz.
- **Encuentros** («lo mismo que con las minas»): `docs/metodo-diseno-encuentros.md` (grupo → cada creep → progresión → botín).
- **Rework de armas**: Tipo por Tipo y calidad por calidad (`docs/rework-armas.md`), nunca completar calidades de un saque; anotar el porqué y lo
  descartado (sale de ahí un manual del criterio de diseño). **Trampas**: solo se auditan las que se compran (`docs/rework-trampas.md`).
  **Testear un tipo de arma en una calidad**: `docs/metodo-testeo-armas.md`. **Balance de defensas**: tabla «Antes → después» por slot, las
  resistencias elementales aparte.
- **Catálogo**: sin imágenes de ítems durante el desarrollo (la función de cargar imagen queda). El «Detalle» manda: si promete algo que sus
  números no tienen, se corrige el ítem; descripciones narrativas vacías, se completan; «resistencia a crítico Tipo N» sin número = +1. El Excel
  se retiró: el catálogo es `comun/catalogo.js`. **Subir/bajar/auditar** cualquier elemento: un solo mecanismo (`docs/plan-subida-unificada.md`).
- **Clases**: `docs/clases-borrador.md` (el PDF viejo) no es referencia: se adapta a las decisiones nuevas. Las skills de clase se cargan en
  `comun/skills-clase.js` solo cuando él las cierra.
- **Reglas de casteo**: proceso por pasos en `docs/proceso-casteo.md`; decisiones antes que código.
- **El origen de las especies**: la única partida real. Los drops los decide él al terminar cada combate (no plantearlos como duda). Su ficha
  «Estrella culona» es de prueba (se puede tocar). Lo demás de esa partida no se modifica sin su permiso explícito; leer sí.

## Probar

- **El chequeo previo**: `comun/pruebas.html` en verde (`window.PRUEBAS = {total, fallas}`).
- **Probar desde el mapa** con la Botonera, con capturas, con tokens visibles (salvo que la prueba sea de lo oculto), en las partidas de prueba
  («Claude · pruebas», «Renacuajos no binaries», «Test con claude elsaulo», «Test29-9»: crear, modificar y borrar libre, sin restaurar después).
  Al terminar: duelos con «Terminar duelo» (la ✕ solo esconde), carteles aceptados, menús cerrados, el mapa limpio. Si una tirada tiene que salir
  alta o baja: «✍ Elegir manualmente» con un número fijo.
- **Sin el mapa disponible, no se prueba «por detrás»** (con funciones o datos simulados): se anota en `docs/pruebas-en-el-mapa.md` y se prueba
  apenas se pueda.

## Sesiones en la nube (desde el 2026-10-31)

- **Subir directo a `nueva-version`** (`git push origin HEAD:nueva-version`), no a una rama `claude/…`: lo que no llega a `nueva-version` no se
  publica. Antes de empezar, partir de la última `nueva-version`. Para ver que se publicó: `curl` al archivo en `https://elsauloel.github.io/rolpintoista/`.
- **Tres cuentas de prueba en la nube (desde el 2026-10-31)**: el entorno tiene `ROL_GM_EMAIL`/`ROL_GM_CLAVE`, `ROL_J1_…` y `ROL_J2_…` (nunca
  mostrarlas en el chat ni escribirlas en el repo). Con ellas: leer las partidas por la API REST de Firebase (login `accounts:signInWithPassword`
  con la `apiKey` de `comun/sesion.js`, después Firestore con el token) y **probar en el mapa** con el Chromium sin pantalla (Playwright ya instalado:
  entrar por `index.html` con `#in-email`/`#in-clave`, abrir el mapa con `?partida=`, apretar los botones de verdad y sacar capturas). Para probar
  antes de subir, servir la carpeta en `localhost` (`python3 -m http.server`): Firebase acepta `localhost`. La cuenta GM es GM en «Claude ·
  pruebas» y jugador en El origen (ahí no puede editar fichas ajenas). Las pruebas que igual no se puedan hacer, a `docs/pruebas-en-el-mapa.md`.
- **Pantalla de las pruebas y capturas** (2026-10-31, dueño: «el programa está pensado para la computadora: las capturas y las pruebas tienen que
  ser en una resolución horizontal de pantalla promedio»): el navegador sin pantalla va a **1920 × 1080** (Playwright: `viewport`), nunca tamaño celular.
- **Pruebas automáticas**: necesitan un navegador; si la máquina no tiene uno, decirlo y anotarlo, no darlas por buenas.
- **Seguramente está en el celular**: nada de tablas, mensajes cortos.
- **En la compu**: Claude usa «Claude in Chrome» con dos perfiles (uno es GM en «Claude · pruebas» y jugador en El origen; el otro es GM en El
  origen y jugador en «Claude · pruebas»); mirar siempre con qué cuenta y rol está antes de escribir. Si una pestaña queda frizada, cerrarla y abrir
  otra. Al volver a la compu, **traer primero lo que se hizo en la nube** (`git pull`).
