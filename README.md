# Ficha de personaje — Piratas en el espacio

Ficha de personaje interactiva para nuestra campaña de rol casera, hecha como una
única página HTML autocontenida. No necesita instalación, servidor ni conexión a
internet: se abre en el navegador y listo.

## Cómo usarla

1. Descargá o cloná este repositorio.
2. Abrí [`ficha.html`](ficha.html) haciendo doble clic (o arrastrándolo a una
   pestaña del navegador).
3. Con el botón **Personajes** elegís un personaje de la lista (se trae la
   última versión directo desde GitHub), creás una ficha en blanco o, si
   preferís, cargás un archivo `.json` local de la carpeta
   [`personajes/`](personajes/).
4. Con el botón **Guardar ficha** exportás tu personaje actual a un archivo
   `.json` para no perder el progreso y poder seguir jugando otro día.
5. Con el botón **Sincronizar** subís tu personaje directo a la carpeta
   `personajes/` de este repo (más un backup con fecha en `personajes/backups/`),
   sin salir de la ficha. La primera vez te pide un token de GitHub: crealo en
   *Settings → Developer settings → Fine-grained tokens*, con acceso solo a este
   repo y permiso **Contents: Read and write**. Queda guardado en tu navegador.

Todo se guarda localmente en tu computadora (no hay backend ni base de datos):
el archivo `.json` que exportás **es** tu personaje.

## Estructura del repo

```
ficha.html              La herramienta: ficha de personaje interactiva
personajes/              Personajes jugables, listos para cargar en la ficha
  aurelio-tinto.json
  felipe-gilardosky.json
  retratos/               Retratos originales de cada personaje
  backups/                Copias de seguridad más viejas de aurelio-tinto
assets/
  items/                  Arte de referencia para objetos e ítems
  skills/                 Arte de referencia para habilidades
  armas/                  Planilla de armas/escudos y arte de referencia
```

## Compartir con amigos

Basta con que clonen o descarguen el repo y abran `ficha.html`. Si crean un
personaje nuevo y quieren sumarlo al repo, pueden agregar su `.json` (y
retrato, si tienen) dentro de `personajes/`.
