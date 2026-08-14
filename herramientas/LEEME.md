# Herramientas del catálogo

`datos/catalogo.json` es la fuente única del catálogo. Hay dos formas de
editarlo, y conviven:

- **`assets/catalogo.xlsx`** — un Excel, cómodo para tocar muchos ítems a la
  vez o hacer cambios masivos.
- **`datos/catalogo-editor.html`** — una herramienta HTML igual que la ficha
  o el gestor: abrí el archivo, editá con formularios, "Guardar"/"Subir
  datos" como en el resto.

Cualquiera de los dos caminos termina en el mismo lugar: los tres HTML
(`ficha-personaje/ficha.html`, `gm-toolset/gm-tools.html`,
`gm-toolset/vendor-generator.html`) y `datos/catalogo.json` quedan
sincronizados entre sí después de importar.

## Actualizar el catálogo

**Si editaste el Excel:**

```bash
cd herramientas
python importar.py
```

**Si editaste con `catalogo-editor.html`** (después de bajar el JSON con
"Guardar", o de que el editor lo suba a GitHub con "Subir datos" y lo hayas
traído a tu carpeta local):

```bash
cd herramientas
python importar_json.py
```

Cualquiera de los dos, al terminar, deja escritos: los tres HTML,
`datos/catalogo.json` (con los IDs nuevos que se hayan generado) y avisa
qué ítems tienen un Detalle que promete una mecánica sin implementar.

Si además querés que el Excel quede al día con lo que se editó desde el
HTML (o viceversa, después de una importación):

```bash
python generar_excel.py   # datos/catalogo.json -> assets/catalogo.xlsx
```

## Qué hace cada uno

- **rutas.py** — dónde está cada archivo. Todo lo demás lo usa.
- **catalogo_comun.py** — la lógica compartida entre los dos caminos:
  corrige lo obvio (tier mal escrito, tipo faltante, nombres de stat en
  minúscula), genera IDs para lo nuevo, y escribe los tres HTML. La usan
  `importar.py` e `importar_json.py`.
- **leer_excel.py** — lee las pestañas del Excel y arma los ítems.
- **importar.py** — fuente: Excel. Conserva las imágenes por ID (el Excel
  no las tiene) y al final deja `datos/catalogo.json` actualizado.
- **importar_json.py** — fuente: `datos/catalogo.json`. La imagen ya viene
  en el JSON (el editor la guarda en base64), así que no hay que
  conservar nada aparte.
- **generar_excel.py** — vuelca `datos/catalogo.json` al Excel.
- **analizar_catalogo.py** — diagnóstico aparte: extrae el catálogo del
  código a `catalogo_items.json` (sin imágenes) para comparar campos. No
  es parte del flujo normal de edición.
- **detectar_efectos.py** — marca los ítems cuyo Detalle promete una
  mecánica que no está implementada.

## Sobre los efectos escritos en Detalle

El importador no entiende lenguaje natural: si describís un efecto nuevo,
lo copia como texto y nada más pasa. Lo que sí hace es avisar cuáles
quedaron sin mecánica, para revisarlos a mano. Los efectos que actúan
sobre el rival al golpear (Rompe armadura, Sangrado como texto de arma,
etc.) son intencionalmente manuales — no es un hueco de esta auditoría.
