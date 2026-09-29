# Plan: subida unificada de elementos

> Hoja de trabajo para retomar desde cualquier conversación. Empezado el 2026-09-29.
> Estado de cada paso al final. Antes de tocar código de "subir / bajar / auditar", leer esto.

## Objetivo (dicho por el dueño)

Los cuatro amigos que juegan son también quienes desarrollan. Mientras juegan, cualquiera edita un
elemento — una habilidad, una habilidad de creep, un creep, un ítem, una pasiva, una trampa… — con
**toda** su configuración, incluida la automatización (la Ejecución paso a paso del duelo, que es lo
que más tiempo lleva), y toca **"Subir"** desde donde esté (ficha, GM Tools, mapa). Queda disponible
para todos. Quien lo baje recibe **exactamente lo mismo**. Después hay una auditoría de lo subido.

**El mecanismo es el mismo para cualquier tipo de elemento.**

## Decisiones tomadas (2026-09-29)

1. **Lo subido queda disponible al instante** para los cuatro, marcado "sin auditar". No espera aprobación.
2. **Audita solo el dueño** (rolpintoista@gmail.com, igual que la Biblioteca de hoy). Los otros tres suben.
3. **Si se corrige un original, las fichas que ya tienen una copia no cambian solas**: les aparece un
   aviso tipo "hay una versión nueva, ¿actualizar?".
4. **Base de fábrica + lo subido**: lo que hoy vive en archivos de código (`comun/skills-clase.js`,
   `comun/creeps-base.js`, `comun/skills-creep-base.js`, `comun/pasivas.js`, `comun/trampas-base.js`,
   `datos/catalogo.json`) queda como base de fábrica. Lo que suben los jugadores vive en la base de datos
   en vivo (Firebase), sin tokens de GitHub y sin la caché de 10 minutos del sitio publicado. Cada tanto
   una conversación puede pasar lo aprobado a código, si hace falta.
5. **Se parte de la Biblioteca que ya existe** (`comun/biblioteca.js`: `propuestas_<tipo>` →
   aprobación → `biblioteca_<tipo>`), no de un mecanismo nuevo en paralelo.

## Cómo estaba el andamiaje (auditoría del 2026-09-29)

| Elemento | Dónde vive | Cómo se subía | ¿Viajaba toda la configuración? |
|---|---|---|---|
| Habilidades de clase / pool custom | `comun/skills-clase.js` (código, GitHub) | 📤 de la ficha escribiendo directo en GitHub, con token (hecho y **retirado** el 2026-09-29) | Sí, pero con campos basura, duplicados y caché |
| Habilidades de creep, creeps, pasivas, trampas | Firebase, Biblioteca | "Guardar en la biblioteca" → propuesta → el dueño aprueba | Sí |
| Ítems | `datos/catalogo.json` en la rama `main` | "📦 Agregar al catálogo", con token | No llega a las herramientas hasta correr `importar_json.py` |
| Presets de estados | Copiados en `ficha.html` (`EFECTOS_PRESET`), `gm-tools.html` (`ESTADOS_PRESET_GM`) y `comun/estados-aplicar.js` (juntados en `comun/estados-presets.js` el 2026-09-29) | No se suben | — |

Problemas encontrados:
- **Tres maneras distintas de "subir"**, una por tipo de elemento.
- **Caché de hasta 10 minutos** del sitio publicado para los `comun/*.js` cargados con `<script src>`:
  una ficha abierta en ese rato baja la versión anterior (de la skill o del propio código).
- **Campos basura**: al subir una habilidad desde la ficha viajaban ~40 campos que no son de una
  habilidad (peso, ranuras, equipado, `usadaEsteTurno`…), heredados del editor genérico de la ficha
  (`openEditor`, plantilla en blanco con todos los campos de todos los tipos).
- **Duplicados con el mismo nombre** (cuatro "Lisiar" en el pool custom).
- **La herramienta de auditoría podía pisar lo que otro subía** (guardaba lo que tenía cargado).
- **Pregunta confusa** "¿pisar la original o guardar como nueva?" con Aceptar/Cancelar del navegador.

## Plantillas (qué datos viajan de cada elemento)

### Habilidad de jugador (clase o pool custom) — definida

`id, nombre, detalle, automatizada, etiquetas` · `costo, nitrosCosto, hpCosto, turnoAjenoSp` ·
`tiradaStat, tiradaBono, tiradaExtra, curaHp` · `efectoNombre, efectoTurnos, efectoHpTurno, efectoEscudo,
efectoStacks, efectoPermanente, efectoMods, efectoDetalle` (solo si hay `efectoNombre`) ·
`zonaMapa, zonaRadio, portalMapa, trampaColocar` · `duelo` (la Ejecución completa, incluido Critical Matters).

No viaja: lo propio del personaje (`job, jobCosto, origen, imagen, habClaseId, habClase`), el estado del
turno ni campos de otros tipos de elemento. Implementado hoy en `limpiarHab` de `datos/auditoria-skills.html`
(y en el script con que se limpió el archivo); en el paso 1 pasa a un archivo compartido.

### Criterio general (vale para todas)

Una plantilla dice **qué datos viajan** al subir un elemento: todo lo que define **qué es y qué hace**
(textos, números, automatización), y nada de lo que es **del momento o de quien lo tiene** (vida actual,
cooldown corriendo, si está equipado, en qué grupo o ficha está, ids internos). Al bajarlo se le ponen ids
nuevos y los valores "de arranque" (vida llena, cooldown en 0 o en su máximo si es lenta…). **Sin imágenes**
por ahora (mismo criterio que el catálogo durante el desarrollo, y la Biblioteca ya es "solo texto").
Relevado el 2026-09-29 mirando lo que guarda hoy cada herramienta (paso 0e).

### Habilidad de creep (`habs_creep`)

`nombre, detalle` · `costo, nitrosCosto` (número o `"ATAQUE"`), `cd, cdArranca` (habilidad lenta) ·
`tiradaStat, tiradaExtra, curaHp` · `efectoNombre, efectoPolaridad, efectoTurnos, efectoStacks, efectoHpTurno,
efectoEscudo, efectoMods, efectoDetalle` (solo si hay `efectoNombre`) · `estadoObjetivo` (el estado que deja a
quien golpea) · `trampaColocar` · `duelo` (la Ejecución completa) · `turnoAjenoSp` (si se cargó).

No viaja: `id`, `cdActual` (al bajarla: 0, o `cd` si es lenta). Hoy `proponerHabilidadABiblioteca` ya saca el
`id` y acomoda `cdActual`, pero manda el resto tal cual está en el creep.

**Casi igual a la habilidad de jugador**: comparten todo menos `cd/cdArranca/estadoObjetivo/efectoPolaridad`
(de creep) y `automatizada/etiquetas/hpCosto/zonaMapa/zonaRadio/portalMapa` (de jugador). Ver P122.

### Creep (`creeps`)

Todo lo de `nuevoCreep()` que describe al creep: `nombre, nivel, color` · atributos `con, fue, agl, des, esp`,
`hpMax, spd` · el arma (`armaTipo, armaPeso, armaFijo, armaAmplificado, armaDeRango, armaNombre, armaDetalle,
armaMods, armaEfectos, armaManos`) · `defensa, armadmg, armaduraTipo, equipo, crit` · `habilidades` (cada una
con la plantilla de habilidad de creep de arriba) · los estados **permanentes** (`estados` filtrados) · `notas` ·
recompensas (`tipoCriatura, tipoCriaturaOtro, jefe, oroBase, armaNatural, trofeoEspecial`) · `escalaTipos`.

No viaja: `id, imagen, hp` (al bajarlo: `hpMax`), `nitros, ataquesTurno`, estados pasajeros, `grupo` (el grupo
de la mesa del que lo sube), `_borrador`, `recompensado`, y dentro de cada habilidad `id/cdActual`.
**Hoy se cuelan** `grupo` y los `id/cdActual` de las habilidades (`guardarCreepEnBiblioteca` solo saca `id`,
`_borrador`, vida, No2 y estados pasajeros) — se corrige en el paso 3.

### Pasiva (`pasivas`)

`nombre, detalle, jobCosto, mods, regenHp, etiquetas`. No viaja: `id, poolId` (se genera al aprobar),
`compras, job, origen, imagen`. Es lo que ya manda `proponerPasiva` (menos `etiquetas`, que hoy se ponen al
guardar en la Biblioteca).

### Trampa (`trampas`)

La del mapa ("Trampas guardadas"): `nombre, detalle, amiga` (fuego amigo) · forma `tipo, tamano, color, alfa` ·
`dano, ignoraDef` · `estado, estadoTurnos` · **y la zona que deja al dispararse** (`dejaZona`, `zonaTurnos`,
`zonaEnMantenimiento`, `zonaCadaPaso`, `zonaResistStat`, `zonaResistValor`), que hoy **no se guarda** (pendiente
anotado en `comun/CLAUDE.md`, "Trampas persistentes") — se suma en el paso 4.

**Hay dos formas de trampa**: la del mapa (arriba) y la que coloca una habilidad (`trampaColocar = {nombre,
detalle, dano, radio, cant, amiga, estado}`). Ver P123.

### Ítem (`items`)

La forma de `datos/catalogo.json` (ver `datos/esquema.md`): `nombre, tier, tipoItem, peso, ranuras,
precioCompra, detalle, mods, legacy` · armas: `tipoDado, danoFijo, danoAmplificado, armaDeRango, efectosGolpe` ·
consumibles: `consumible, unidades, cargaMax, curahp, curaspPct, efectoNombre, efectoTurnos, efectoHpTurno,
efectoPermanente, efectoDetalle, efectoMods` · equipo: `equipoEstadoNombre, equipoEstadoHpTurno,
equipoEstadoDetalle, equipoEstadoPreset` · `escalaTipos`.

No viaja: `imagen`, `id` (se genera al subir: ver P124), y lo de quien lo lleva (`equipado`, cantidad en la
mochila, `cargaActual`, durabilidad gastada).

### Estado alterado propio (`estados`)

Los "Mis presets" (`S.efectosPersonalizados` en la ficha, `S.estadosPersonalizados` en gm-tools) hoy viven solo
en la ficha o en la mesa de quien los creó. Plantilla = la forma de un preset de `comun/estados-presets.js`:
`nombre, polaridad, detalle, turnos, permanente, stacks, hpTurno, stacksTurno, mods, escudoMagico, forzarNitros`
y las marcas de mecánica (`esCC, esVeneno, esSangrado, mitadPdgEva, lisiado, paralisis, esEscarcha, inmovilizado,
rengo, cansado, exhausto, hypeado, sentado, invulnerable, inmunidadCC, sangrePura, coagulacionExtrema,
afortunado, blindado, espinas, armaduraRota, excedenteVida`). No viaja: `id, activo`, el escudo que le queda.
Al subirse se guarda en la forma de creep y cada herramienta lo adapta (como los presets base).

### El "sobre" de cualquier elemento subido (se construye en el paso 1)

Lo que rodea a la plantilla, igual para todos los tipos. Parte de lo que la Biblioteca ya guarda hoy (`nombre,
etiquetas, descripcion, nivel, json, autorUid, autorNombre, creado`) y le suma:

- `auditado` (falso al subir; lo pasa a verdadero el dueño) — reemplaza el ir de "propuesta" a "oficial".
- `version` (1 al subir; +1 cada vez que se corrige ese mismo elemento).
- `basadoEn` (`{id, version}` del elemento del que salió, sea de fábrica o subido): al subir algo editado se
  pregunta **"¿es una corrección de «X» o algo nuevo?"** (pedido del dueño, 2026-09-29) — en botones claros,
  no con el Aceptar/Cancelar del navegador.
- En la copia que queda en una ficha o en un creep: `origen: {tipo, id, version}`, para poder avisar
  "hay una versión nueva, ¿actualizar?" (decisión 3).

**Ojo para el paso 1**: hoy una propuesta **solo la ven su autor y el dueño** (reglas de `propuestas_*`), y eso
choca con la decisión 1 (disponible al instante para los cuatro). Hay que cambiar las reglas de Firestore (y
pegarlas en la consola).

## Paso 1: cómo quedó (2026-09-29)

- **`comun/plantillas.js`** (`Plantillas.limpiar(tipo, datos)`): las plantillas de arriba, en código. La usa la
  Biblioteca al subir y `datos/auditoria-skills.html` al guardar skills (antes tenía su propia copia).
- **`comun/biblioteca.js`**, el "Subir" (`Biblioteca.guardar`, botón ⬆ Subir): va directo a `biblioteca_<tipo>`,
  disponible al instante; si no sube el dueño, con `auditado: false`. Con `opts.basadoEn = {id}` pregunta con dos
  botones **"✎ Una corrección de «X»"** (misma entrada, versión + 1, vuelve a sin auditar; si X es de fábrica, una
  entrada nueva con `reemplaza` que lo tapa) o **"＋ Algo nuevo"**. Si las reglas nuevas no están publicadas, cae
  al camino viejo (propuesta) y lo avisa.
- El "Bajar" (`Biblioteca.abrir`): relee cada vez que se abre (lo que subió otro aparece sin recargar), marca
  **🔶 sin auditar** y **vN**, pestaña **🔶 Sin auditar (N)** para todos; el dueño tiene **✅ Auditado**. Borrar: el
  dueño, o el autor mientras siga sin auditar. `alElegir(datos, meta)` recibe `meta = {tipo, id, version}`.
- Para el aviso de versión nueva: la copia guarda `bibOrigen = meta` (lo cablea cada herramienta en su paso) y
  compara con `Biblioteca.entrada(tipo, id)` → `{id, nombre, version, auditado, datos}` (encuentra también la
  corrección de uno de fábrica).
- Reglas (`firebase/firestore.rules`, `match /{bib}/{id}`): crear lo propio sin auditar; corregir cualquiera
  (autor y fecha fijos, versión + 1, sin auditar, editor = quien corrige); el dueño todo. Anotado en "Antes de
  abrirlo al público" de `plan-sistema-nuevo.md`.
- **Todavía no cableado** en cada herramienta (pasos 2 a 5): pasarle `basadoEn` al subir, guardar `bibOrigen` al
  bajar y mostrar el aviso. Mientras tanto, los botones de siempre ("📚 Biblioteca" de un creep o una habilidad de
  creep, proponer pasiva, proponer trampa) ya suben por el camino nuevo, como "algo nuevo".
- Verificado con una base de datos simulada (subir, bajar, corregir lo subido y lo de fábrica, auditar, borrar,
  reglas viejas → propuesta); **no probado contra Firebase real**.

## Paso 2: cómo quedó (2026-09-29)

Decisión previa (P122): **un solo tipo "habilidad"** (colección `biblioteca_skills`), con la marca `para: 'jugador' |
'creep'` bien visible mientras paguen con recursos distintos (SP / cooldown, ver P125). En este paso solo hay de jugador;
la etiqueta visible 🧙/🐾 y el aviso al mezclarlas se suman en el paso 3, cuando entran las de creep.

- **Ficha, ⬆ en cada habilidad** (`subirHabilidad`): sube la plantilla (`Plantillas.habilidad`, sin el id del personaje)
  con `para: 'jugador'` y `clase`. Si salió de otra (`bibOrigen`, o `habClaseId` de fábrica) pregunta corrección / nuevo:
  una **corrección** queda en la clase del original y lo reemplaza para todos; **algo nuevo** va al pool custom. Después
  de subir, la copia de quien subió apunta a la entrada nueva (no se avisa a sí mismo).
- **"+ Habilidad"** (`habsDelPool`): fábrica + lo subido, releído al abrir. La corrección de una de fábrica ocupa su
  lugar (misma id, "Ya la tenés" sigue andando); lo nuevo aparece en su clase o en 🧩 Pool custom (ids `bib-<doc>`).
  Lo subido muestra "🔶 sin auditar · vN · subida por X". Agregar guarda `bibOrigen = {tipo, id, version}`.
- **🔔 versión nueva** (`versionNuevaDeHab`, `abrirVersionNuevaHab`): al lado del nombre de la habilidad, si la de la
  biblioteca de la que salió tiene una versión mayor. Las agregadas antes de esto salen de la de fábrica, versión 1.
  Cartel con **Actualizar** (pisa la configuración, conserva Job/imagen/id), **Dejar la mía** (no avisa más de ESA
  versión; una corrección posterior vuelve a avisar) y **Ahora no**.
- Límite conocido: un cambio hecho **en el archivo de fábrica** (`comun/skills-clase.js`, desde la auditoría de skills)
  no sube versión, así que no dispara el aviso — solo lo subido a la biblioteca lo hace.
- Verificado en una copia de la ficha con la base de datos simulada (agregar, corregir, actualizar, dejar la mía,
  segunda corrección que vuelve a avisar, subir una creada de cero); no probado contra Firebase real.

## Paso 3: cómo quedó (2026-09-29)

- **Habilidades de creep en el tipo único** (P122): se suben a `biblioteca_skills` con `para: 'creep'`
  (`Plantillas.limpiar('skills')` las limpia como de creep: conservan cooldown, "lenta", estado sobre el objetivo…).
  Lo que ya estaba en `biblioteca_habs_creep` se sigue viendo: la Biblioteca acepta `opts.legado = {tipo, convertir}`,
  lee también esa colección (y sus propuestas), deja auditarla y borrarla, y una corrección de algo viejo es una entrada
  nueva con `reemplaza` que lo tapa. Nada se migró a mano.
- **GM Tools, "+ Habilidad" de un creep** (`abrirCatalogoHabilidades`): muestra fábrica + lo subido de creep **y de
  jugador**, cada fila con **🐾 Creep · cooldown** o **🧙 Jugador · SP**. Elegir una de jugador avisa (en el mismo
  cartel) que paga con SP; la copia conserva `para: 'jugador'` y su "Ver" lo recuerda (`paraHabHtml`). Toda habilidad
  agregada guarda `bibOrigen`. **⬆ Subir** también en la ventana "Ver" de una habilidad de un creep de la mesa
  (`#verhab-subir`), además del 📚 de la vista de la biblioteca; ambos preguntan corrección / nuevo.
- **Creeps**: `guardarCreepEnBiblioteca` pregunta corrección / nuevo si el creep salió de la biblioteca; los agregados
  guardan `bibOrigen` (también los de fábrica: `base-<poolId>`, versión 1). Si el original se corrige, la tarjeta del
  creep muestra **🔔** (`versionNuevaDeCreep`, `abrirVersionNuevaCreep`): Actualizar cambia atributos, arma, equipo y
  habilidades pero conserva lo del combate (vida con tope del máximo nuevo, estados, grupo, imagen, color); Dejar el
  mío; Ahora no. Lo subido se lee al entrar (GM) y al abrir "+ Creep" (`cargarCreepsSubidos`).
- **Ficha, "+ Habilidad → 🐾 De creep"**: las habilidades de creep subidas, con el aviso a la vista (pagan con cooldown;
  en la ficha hay que ponerles costo en SP), 2 de Job; la copia lleva `para: 'creep'` y la fila muestra 🐾 de creep.
- Pendiente chico: el 🔔 por habilidad **dentro** de un creep (hoy el aviso es por creep entero; las habilidades de un
  creep ya guardan `bibOrigen`, así que se puede sumar). Anotado en `docs/pendientes.md`.
- Verificado con la base de datos simulada en copias de GM Tools y de la ficha; no probado contra Firebase real.

## Pasos

| # | Paso | Estado |
|---|---|---|
| 0 | **Ordenar lo que hay** | ✅ 2026-09-29 |
| 0a | Retirar el 📤 que escribía directo en GitHub (camino paralelo) | ✅ 2026-09-29 |
| 0b | Limpiar `comun/skills-clase.js`: una habilidad por renglón, sin campos basura; Lisiar consolidada en Asalto (la versión con Critical Matters bien armado); pool custom vacío | ✅ 2026-09-29 |
| 0c | `datos/auditoria-skills.html` guarda con la plantilla y el mismo formato (ida y vuelta idéntica), y avisa si el archivo cambió desde que se abrió; sale "🔍 A auditar" (dependía del 📤) | ✅ 2026-09-29 |
| 0d | Juntar las tres copias de los presets de estados en un solo archivo de `comun/`: `comun/estados-presets.js` (ficha, gm-tools, mapa y auditoría de skills leen de ahí; se reconciliaron Sangrado, Afortunado, textos viejos y Barrera) | ✅ 2026-09-29 |
| 0e | Plantillas del resto de los elementos (este documento) + el "sobre" común; preguntas P122–P124 | ✅ 2026-09-29 |
| 1 | **Mecanismo único**: extender la Biblioteca — un "Subir" y un "Bajar" genéricos por tipo, con la plantilla de cada tipo; lo subido disponible al instante, marcado "sin auditar"; aviso de versión nueva en las copias | ✅ 2026-09-29 (el mecanismo; el aviso en cada herramienta va en su paso) — ver "Paso 1: cómo quedó" · **falta pegar las reglas de Firestore** |
| 2 | Habilidades de jugador sobre ese mecanismo (botón Subir en la ficha, "+ Habilidad" lee base + lo subido) | ✅ 2026-09-29 — ver "Paso 2: cómo quedó" |
| 3 | Habilidades de creep y creeps (ya usan la Biblioteca: alinearlos a la plantilla y al "al instante") | ✅ 2026-09-29 — ver "Paso 3: cómo quedó" |
| 4 | Pasivas y trampas | Pendiente |
| 5 | Ítems (el más enredado: rama `main`, Excel, `importar_json.py`, catálogo copiado adentro de los HTML) | Pendiente |
| 6 | **Una sola pantalla de auditoría** para todo lo subido: ver, comparar con el original, editar, aprobar o descartar | Pendiente |
