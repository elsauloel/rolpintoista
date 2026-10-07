# Rework del generador de tiendas (arranca 2026-10-06)

Pedido del dueño (2026-10-06): «reworkearlo para que funcione como la pieza que garantice el balance; podemos reimaginarlo desde cero». Tres
tipos (**herrero, bazar, ramos generales**) y varios tamaños; garantías («X escudos, X armaduras»), qué slots aparecen según el contexto, chances
por calidad. Antecedentes: `rework-defensa.md` («Ideas para la progresión defensiva con escasez controlada», «Fase 3», calidad ↔ nivel) y la
ruta del diseño de equipos (paso 4: escasez en el generador + simulador; después, la hoja de ruta del oro del GM).

## Paso previo hecho: solo se publica lo del rework (2026-10-06)

Dueño: «dejar solamente publicado en el catálogo del juego lo que estuvimos reworkeando; lo de la versión anterior queda como referencia».
Marca `archivo: true` en el ítem (`comun/catalogo.js`): `ItemsSubidos.mezclar` lo saca (ficha, tienda, mapa, GM Tools), el generador y el
equipo de creeps de GM Tools no lo usan; el editor del catálogo lo muestra atenuado («📦 Archivado») con un filtro y una casilla para
publicarlo o archivarlo. **220 archivados**: defensivos Raros, Excepcionales y Legendarios; los 10+3 «solo botín» viejos de Buena y Rara; las
armas viejas (Excepcionales salvo las 18 del Tipo 4, Legendarias, Hacha del clan, Hacha arrojadiza). **Publicados 928**: defensivos Común y
Buena (376, todas las partes), anillos Comunes (29), armas cuerpo a cuerpo Tipo 4/6/8/10 Común, Buena y Rara (239) + Tipo 4 Excepcional (18),
armas especiales Comunes (30), trampas consumibles (39).
**⬜ En duda, publicados por ahora:** las 28 armas **a distancia** (no pasaron por el rework metódico; si se archivan, el Shooter se queda sin
arma) y los **169 consumibles** que no son trampas (pociones, pergaminos, luces…: revisados solo los de Bonos/SP, Revive y Raciones).

## Cómo funciona hoy (resumen)

Tamaño (ambulante 8–12 · pueblito 15–20 · aldea 25–35 · ciudad 40–60 · capital 70–100 ítems) × categoría (Ramos, «Bazar arcano», Herrero,
Inicio). Cada lugar tira su calidad con pesos por tamaño (ambulante 70/19/9,9/1/0,1 … capital 20/30/32/15/3) y su rubro con un reparto fijo
(Ramos 35 % armas · 35 % defensivos · 20 % escudos · 10 % consumibles; Herrero 45/35/20; Bazar solo consumibles). Stock fijo: Poción de HP,
Poción de SP, Revive (menos el Herrero). Una tirada aparte de «ítem mágico» (anillos). Sin duplicados, **sin límite por slot ni por efecto, sin
stock** (se compra cualquier cantidad). Problemas: nada mira el **nivel** de la party; los defensivos van todos en una bolsa (puede salir una
tienda con 6 cascos y ningún torso); los anillos siempre salen Comunes; el Bazar arcano tiene un techo de 39 ítems por el piso de «legacy»;
Regenerar pierde la configuración (venta, herrero, reparación, agregar gratis).

## Propuesta v1 (⬜ a revisar por el dueño)

### 1. Dos perillas: tamaño y nivel
- **Nivel de la zona** (1–5, lo elige el GM; por defecto el de la party): decide **qué calidades salen** (lo ya decidido: Común ↔ N1–2,
  Buena ↔ N3–4, Rara ↔ N5).
- **Tamaño**: decide **cuánto y cuánta variedad**, y corre un poco la calidad (una capital tiene algo mejor que un pueblito del mismo nivel).

| Nivel | Común | Buena | Rara |
|---|---|---|---|
| 1 | 85 % | 15 % | — |
| 2 | 65 % | 33 % | 2 % |
| 3 | 40 % | 55 % | 5 % |
| 4 | 25 % | 60 % | 15 % |
| 5 | 15 % | 45 % | 40 % |

Tamaño: ambulante y pueblito, tope Buena; aldea, como la tabla; ciudad y capital, un escalón de nivel más (una capital de nivel 2 se sortea
como nivel 3). Excepcional y Legendario: nunca en la tienda (botín y misiones), hasta que se rehagan.

### 2. Recetas por tipo: cupos por parte del cuerpo, no un sorteo libre
Cada tipo es una **receta** de cupos (en partes de 100, se escala al tamaño). Garantiza lo básico y deja lo raro para las tiendas grandes.

| Parte | Herrero | Ramos generales | Bazar |
|---|---|---|---|
| Armas cuerpo a cuerpo | 30 (las 4 familias: T4, T6, T8, T10, parejas) | 15 | — |
| Armas a distancia | 8 | 6 | — |
| Torso (blando y rígido) | 16 (siempre ≥ 1 rígido) | 8 (siempre ≥ 1 blando) | 6 (túnicas de caster) |
| Escudos | 12 | 5 | — |
| Cabeza | 8 | 6 | 5 (piezas de caster) |
| Manos | 8 | 6 | 4 (de caster) |
| Piernas | 6 | 6 | — |
| Pies | 6 | 6 | — |
| Cinturón | 3 | 8 | 4 |
| Mochila | 3 | 8 | — |
| Trampas | — | 10 | — |
| Consumibles | — | 16 (los básicos) | 40 (todos) |
| Armas especiales (varitas, báculos) | — | — | 20 |
| Orbes | — | — | 8 |
| Anillos | — | — | 13 |

**Garantías mínimas** (aunque el tamaño no alcance): el Herrero, siempre ≥ 1 escudo, ≥ 1 torso y ≥ 1 arma de cada familia desde pueblito; el
Ramos, siempre ≥ 1 torso, ≥ 1 cinturón y ≥ 1 mochila; el Bazar, siempre ≥ 2 varitas y la Poción de HP. Stock fijo: Poción de HP y de SP en
Bazar y Ramos; Revive solo desde aldea (es Buena calidad).

### 3. Escasez controlada de los efectos sensibles
Cada ítem lleva etiquetas calculadas de sus bonos (sin cargar nada a mano): **Res. crítico T8/T10**, **Evasión**, **Iniciativa**, **Sigilo**,
**Percepción / Ve lo oculto**, **rebajas de No2** (Pasos gratis, Parada fácil, Saque rápido…), **chances %** (Retirada, Reflejos,
Recuperarse, Inamovible), **PdG.Esp / Ef.Esp / SP Regen**, **Crítico frecuente / potente**. Por tamaño, un tope de ítems con cada etiqueta:

| Tamaño | Tope por etiqueta |
|---|---|
| Ambulante | 0–1 (sale 1 con 50 %) |
| Pueblito | 1 |
| Aldea | 2 |
| Ciudad | 3 |
| Capital | 4 |

Así una tienda chica nunca ofrece a la vez la bota de Iniciativa, el anillo de Iniciativa y la pierna de Iniciativa, y lo fuerte aparece de a
poco. Los topes se ajustan con el simulador.

### 4. Stock limitado (opcional, el cambio más grande)
Hoy cada ítem se compra infinitas veces. Propuesta: **Buena y Rara, 1 unidad** (si alguien la compra, desaparece de la tienda para todos);
Común sin límite; consumibles con unidades (3–5 según tamaño). Pide una transacción al comprar (la tienda publicada guarda cuántas quedan).
Es la herramienta más fuerte contra «todo el grupo con la misma pieza buena».

### 5. Simulador
Un botón «🧪 Simular 200 tiendas» en el generador: con el tipo, tamaño y nivel elegidos, muestra el promedio por parte, por calidad y por
etiqueta, y el peor caso (la tienda con menos torsos, etc.). Es la herramienta para calibrar los números de arriba (y la base de la hoja de
ruta del oro).

### 6. Arreglos de paso
Regenerar conserva toda la configuración; el Bazar sin techo de «legacy» (el stock fijo reemplaza al piso de 40 %); los anillos entran en la
receta del Bazar como cualquier pieza (con su calidad); «Inicio de partida» se reemplaza por «nivel 1» + el tipo que se quiera.

### Preguntas
1. ¿El «bazar» es el Bazar arcano de hoy (consumibles, varitas, orbes, anillos, piezas de caster)?
2. ¿Las armas a distancia y los consumibles no revisados quedan publicados por ahora, o se archivan y se revisan antes?
3. ¿Nivel de la zona como segunda perilla? ¿La tabla de calidades por nivel sirve para arrancar?
4. ¿Recetas por parte del cuerpo con esos cupos y garantías?
5. ¿Escasez por etiqueta con esos topes?
6. ¿Stock limitado (Buena y Rara, 1 unidad)?

## Respuestas del dueño a la v1 (2026-10-06)
«En líneas generales estoy de acuerdo.» 1 ✅ el bazar es el Bazar arcano · 2 ✅ armas a distancia y consumibles sin revisar quedan publicados por
ahora · 3 ✅ nivel de la zona + la tabla · 4 ✅ recetas, **pero sin garantizar todos los slots defensivos: garantizar una VARIEDAD de partes**
(«por ejemplo 3 distintas en un pueblito, pero nunca sabés cuáles») · 5 ✅ escasez por etiqueta · 6 ✅ stock limitado · simulador ✅.
Observaciones:
- **Reposición**: si se compra una pieza limitada, la tienda la reemplaza por otra de la misma calidad («que todos tengan chance de llegar a alguna»).
- **«Toca toca, la suerte es loca»**: le gustaba que siempre pudiera salir algo Raro o Excepcional en cualquier slot, con un % bajo. Mantenerlo.
- **¿En qué contexto aparecen Excepcional y Legendario?** (pregunta abierta).

### Cómo se incorpora (v2, etapa 1 en construcción)
- **Variedad garantizada**: partes defensivas distintas (de torso, escudo, cabeza, manos, piernas, pies, cinturón, mochila) por tamaño: ambulante 2 ·
  pueblito 3 · aldea 5 · ciudad 7 · capital 8; en el Herrero, familias de armas distintas (T4/T6/T8/T10): 2 · 3 · 4 · 4 · 4. Al azar cuáles.
- **Golpe de suerte**: cada lugar, después de tirar su calidad, tiene 4 % de subir un escalón y 0,5 % de subir dos, sin importar el techo del
  tamaño (si en esa parte no hay nada publicado de esa calidad, cae a la más cercana). Es la única vía de Excepcional y Legendario en tienda.
- **Reposición (etapa 2, propuesta)**: el comprado se reemplaza por otro de la misma calidad **y la misma parte** (la tienda conserva su forma),
  con una **reserva** de reposiciones por tamaño (ambulante 1 · pueblito 2 · aldea 4 · ciudad 6 · capital 10): comprar y revender a mitad de precio
  no se convierte en un sorteo infinito.

### ✅ Etapa 1 hecha (2026-10-06)
`comun/generador-tiendas.js` (`GeneradorTiendas`: `generar`, `otro`, `simular`, más las tablas `TAMANOS`, `TIPOS`, `CALIDAD_POR_NIVEL`, `SUERTE`,
`ETIQUETAS`) y el generador usándolo: perilla **Nivel de la zona**, tipos Herrero / Ramos generales / Bazar arcano (salió «Inicio de partida»: una
tienda guardada con ese tipo se toma como Ramos), **🧪 Simular 200** (promedio, mínimo y máximo por parte, por calidad —y en qué % de las tiendas
aparece cada una— y por efecto escaso), «🎲 Otro» por la misma parte con la calidad del nivel y la escasez, y **Regenerar conserva toda la
configuración**. El Herrero sale con «repara» prendido. Se sacaron el sorteo viejo por rubro, el piso de «legacy» del Bazar y la tirada aparte de
anillos. Probado en vivo («Claude · pruebas», capturas al dueño) y con una prueba automática.
**Etapa 2 (pendiente):** stock limitado (Buena y Rara, 1 unidad) con reposición de la misma calidad y parte y una reserva por tamaño; pide una regla de
Firestore nueva para que la compra de un jugador descuente el stock.

## Respuestas del dueño a la etapa 1 (2026-10-07)
- **La calidad depende solo del nivel** («variables independientes: un pueblito o un ambulante puede tener productos de buena calidad, pero pocos»).
  Hecho: se sacaron el techo del tamaño y el escalón de más de la ciudad y la capital.
- **La lista de efectos sensibles se revisa en detalle más adelante** (cuáles y por qué): ⬜ pendiente, para preparar.
- **Reposición para todo el catálogo y todas las tiendas** (no solo Buena y Rara): «comprar un ítem y que se reemplace por otro del mismo tipo y
  calidad, un casco por otro, un arma de Tipo 6 por otra de Tipo 6; puede generar alguna disputa entre jugadores, pero le suma sabor».
- **Reparación por tipo de tienda** (el herrero repara lo de herrero; el bazar, lo del bazar): **es el próximo paso, a definir bien** (menú, lógica,
  el talento de reparar). No se tocó.
- **«Pasar de día»** (nueva, la maneja el GM desde el mapa): otro pulso de renovación — ítems que se renuevan cada día (una poción que se rellena,
  un casco con un efecto una vez al día). ⬜ a diseñar (también puede reponer la reserva de las tiendas).

### ✅ Etapa 2: piezas únicas y reposición (2026-10-07)
Cada pieza de una tienda publicada es **única** (menos el stock fijo). Al publicar, el GM escribe `campanas/<id>/tienda/stock` = {version, items,
reposiciones, reserva, vendidos} (y la tienda lleva `stockVersion`). Al comprar, `FichaTienda.comprar` hace una transacción: si alguien se la llevó
antes, no se compra y sale del carrito; si no, la saca y pone otra de **la misma parte, familia (Tipo del arma; blando o rígido en el torso) y calidad**
(`GeneradorTiendas.otro({reponer})`), mientras quede **reserva** (ambulante 3 · pueblito 6 · aldea 10 · ciudad 16 · capital 28; una personalizada, 10).
Sin reserva, no vuelve. La Mesa lo cuenta («X compró Y · llegó a la tienda: Z»); la tienda se actualiza sola para todos (`FichaTienda.escucharStock`);
el cartel del GM muestra vendidas y repuestas. **Reglas nuevas de Firestore** (`tienda/stock`): hasta pegarlas, el GM publica sin piezas únicas (avisa).

## Escasez: respuestas del dueño (2026-10-07)
- **Piso de resistencia a crítico** (forzar que la tienda traiga una pieza con Tipo 8 o 10/12): «no me cierra, lo voy a pensar». ⬜
- **Más piezas de Buena calidad con Tipo 8**: sí («aunque haya abundancia y variedad, la tienda va a filtrar que no aparezcan demasiadas»). Hoy hay 4 con
  Tipo 8 y 3 con Tipo 10/12 entre 923 publicados: por eso una tienda casi nunca los trae (un Herrero de pueblito, 8 % → 20 % según el nivel). Propuesta
  de 9 piezas en `rework-defensa.md`, ⬜ a revisar.
- **Crítico propio de las armas**: ✅ hecho — no cuenta para la escasez **solo en las armas de Tipo 4** (28 armas); el de las armas de otros Tipos y el
  de todo lo que no es arma, sí (21 ítems). La Iniciativa de las armas sigue contando.
- **✅ Las 9 piezas de Tipo 8 cargadas** (13 en total). Chance de que una tienda traiga al menos una (nivel 1 / 3 / 5), simulada: Herrero ambulante
  11/16/15 % · pueblito 21/45/60 % · aldea 31/61/78 % · ciudad 51/79/88 % · capital 71/97/100 %; Ramos ambulante 5/10/18 % · pueblito 9/37/47 % ·
  aldea 22/55/62 % · ciudad 36/67/80 % · capital 55/88/94 %. En nivel 1 sale menos porque son de Buena calidad (y solo una Común).

## Defensa y Defensa especial en las tiendas (dueño, 2026-10-07, para cuando el catálogo defensivo esté auditado)
El **herrero** muestra lo que da Defensa; el **Bazar**, lo que da Defensa especial. Lo que da las dos puede salir en cualquiera de las dos
tiendas: si está más cargado a una, sale en esa; si está balanceado, en cualquiera. Ver `docs/rework-armas.md` («Defensa especial»).
