# Ficha de personaje — Piratas en el espacio

Ficha de personaje interactiva para nuestra campaña de rol casera, hecha como una
única página HTML autocontenida. No necesita instalación, servidor ni conexión a
internet: se abre en el navegador y listo.

## Cómo usarla

1. Descargá o cloná este repositorio.
2. Abrí [`ficha-personaje/ficha.html`](ficha-personaje/ficha.html) haciendo
   doble clic (o arrastrándolo a una pestaña del navegador).
3. Con el botón **Personajes** elegís un personaje de la lista (se trae la
   última versión directo desde GitHub), creás una ficha en blanco o, si
   preferís, cargás un archivo `.json` local de la carpeta
   [`datos/personajes/`](datos/personajes/).
4. Con el botón **Guardar ficha** exportás tu personaje actual a un archivo
   `.json` para no perder el progreso y poder seguir jugando otro día.
5. Con el botón **Bajar datos** traés de un toque la última versión sincronizada
   del personaje que tenés abierto, sin pasar por la lista.
6. Con el botón **Subir datos** subís tu personaje directo a la carpeta
   `datos/personajes/` de este repo (más un backup con fecha en
   `datos/personajes/backups/`), sin salir de la ficha. La primera vez te pide
   un token de GitHub: crealo en *Settings → Developer settings → Fine-grained
   tokens*, con acceso solo a este repo y permiso **Contents: Read and write**.
   Queda guardado en tu navegador.

7. Para mantener la herramienta misma al día, abrí [`gestor.html`](gestor.html):
   la primera vez elegís la carpeta raíz del repo (una sola vez) y de ahí en
   más **Traer última versión** actualiza `ficha-personaje/ficha.html` y el
   resto con un clic. Si editaste la herramienta localmente, **Subir al repo**
   publica tu versión para todos. Y si el que quedó viejo es el gestor mismo,
   la ficha tiene un botón **Actualizar gestor** (en el menú ⚙ de arriba a la
   derecha, junto con **Cambiar token**) que lo trae al día usando la misma
   carpeta recordada.

Todo se guarda localmente en tu computadora (no hay backend ni base de datos):
el archivo `.json` que exportás **es** tu personaje.

## Herramientas del máster: creeps en combate

Para que el máster comparta el estado de sus creeps (HP y estados alterados)
con el resto del grupo sin pasar el archivo por WhatsApp, hay dos páginas más:

- [`gm-toolset/gm-tools.html`](gm-toolset/gm-tools.html) — panel del máster
  para manejar sus creeps en combate (HP, atributos, arma, habilidades,
  estados). El botón **Guardar** baja dos archivos: `gm-creeps.json` (todos
  los datos, respaldo privado del máster, **nunca** se sube al repo) y
  `creeps-publico.json` (una versión recortada: id, nombre, imagen, HP y
  estados con nombre y turnos). El botón **Subir datos** sube directamente
  `datos/creeps-publico.json` al repo, con el mismo token de GitHub que usa
  **Subir datos** de la ficha.
- [`gm-toolset/vendor-generator.html`](gm-toolset/vendor-generator.html) —
  Generador de Tiendas: arma un catálogo de venta y lo publica en
  `datos/tienda-publica.json`, para que la ficha lo lea desde el botón
  **Vendedor**.

El botón **Tablero** —está tanto en la ficha como en gm-tools— baja
`datos/creeps-publico.json` junto con lo que publicó cada jugador en
`datos/tablero/` y arma el panorama del combate: una tarjeta por personaje y
por creep, con su HP y sus estados. No se actualiza solo: cada uno publica lo
suyo cuando termina su turno y el resto refresca cuando quiere.

Si el máster actualiza `gm-tools.html` o `vendor-generator.html`, esos cambios
se publican desde `gestor.html` (botón **Subir al repo**), igual que
`ficha.html` — no desde el botón Subir datos de ninguna de las dos
herramientas, que es solo para los datos de la partida.

## Estructura del repo

Ver [`CLAUDE.md`](CLAUDE.md) para el resumen completo de cada carpeta. En
breve:

```
gestor.html             Gestor de la app: actualizarla o publicar tu versión
README.md               Este archivo

ficha-personaje/        La herramienta: ficha de personaje interactiva
  ficha.html

gm-toolset/              Herramientas del máster
  gm-tools.html          Creeps en combate (HP, estados, etc.)
  vendor-generator.html  Generador de Tiendas

datos/                   JSONs de la partida (personajes, creeps, tablero)
  personajes/             Personajes jugables, listos para cargar en la ficha
    aurelio-tinto.json
    retratos/               Retratos originales de cada personaje
    backups/                Copias de seguridad fechadas
  tablero/                Estado de combate publicado por cada jugador
  creeps-publico.json     Estado público de los creeps (lo sube gm-tools.html)
  tienda-publica.json     Tienda publicada (la sube vendor-generator.html)

manual-usuario/          Manual de reglas de la campaña (en construcción)
vtt-hexgrid/              Mapa hexagonal virtual (en pausa, sin código todavía)
docs/                     Notas de workflow y generales
herramientas/             Scripts Python: sincronizan assets/catalogo.xlsx
                          con el catálogo embebido en las 3 apps
assets/
  items/                  Arte de referencia para objetos e ítems
  skills/                 Arte de referencia para habilidades
  armas/                  Planilla de armas/escudos y arte de referencia
```

## Compartir con amigos

Basta con que clonen o descarguen el repo y abran `ficha-personaje/ficha.html`.
Si crean un personaje nuevo y quieren sumarlo al repo, pueden agregar su
`.json` (y retrato, si tienen) dentro de `datos/personajes/`.
