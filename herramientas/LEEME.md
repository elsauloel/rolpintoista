# Herramientas del catálogo

El catálogo se edita en `assets/catalogo.xlsx` y desde ahí se vuelca a las
tres apps. Estos scripts hacen ese trabajo.

## Actualizar el catálogo

```bash
cd herramientas
python analizar_catalogo.py   # lee el catálogo que hay hoy en el código
python importar.py            # aplica el Excel a las tres apps
python generar_excel.py       # deja el Excel al día con los IDs nuevos
```

El último paso no es opcional: los ítems que agregás sin ID reciben uno al
importar, y si el Excel no se actualiza, la próxima vez entran de nuevo
como si fueran otros ítems distintos.

## Qué hace cada uno

- **rutas.py** — dónde está cada archivo. Todo lo demás lo usa.
- **leer_excel.py** — lee las pestañas y arma los ítems.
- **importar.py** — corrige lo obvio (tier mal escrito, tipo faltante),
  genera IDs, conserva las imágenes por ID y reescribe los tres catálogos.
  Al terminar lista los efectos escritos que ningún código respalda.
- **generar_excel.py** — vuelca el código al Excel.
- **analizar_catalogo.py** — extrae el catálogo del código a JSON.
- **detectar_efectos.py** — marca los ítems cuyo Detalle promete una
  mecánica que no está implementada.

## Sobre los efectos escritos en Detalle

El importador no entiende lenguaje natural: si describís un efecto nuevo,
lo copia como texto y nada más pasa. Lo que sí hace es avisar cuáles
quedaron sin mecánica, para revisarlos a mano.
