# -*- coding: utf-8 -*-
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from rutas import FICHA, GM, VENDOR, XLSX, SP

# Extrae el catalogo de ficha.html y analiza que campos usa cada categoria,
# para decidir las columnas del Excel.
import re, json, collections


t = open(FICHA, encoding="utf-8", newline="").read().replace("\r\n", "\n")
i = t.index("  catalogo:[")
i = t.index("[", i)
prof = 0
for j in range(i, len(t)):
    if t[j] == "[":
        prof += 1
    elif t[j] == "]":
        prof -= 1
        if prof == 0:
            fin = j + 1
            break
bloque = t[i:fin]

# Convertir el JS a JSON: sacar imagenes primero (son gigantes)
sin_img = re.sub(r"imagen:'data:[^']*'", "imagen:'@@IMG@@'", bloque)
tiene_img = {}
for m in re.finditer(r"\{id:'([^']+)'[^}]*?imagen:'(@@IMG@@|)'", sin_img):
    tiene_img[m.group(1)] = m.group(2) == "@@IMG@@"

# claves sin comillas -> con comillas
js = re.sub(r"([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*):", r'\1"\2":', sin_img)
# comillas simples -> dobles, cuidando los apostrofes escapados
js = js.replace("\\'", "\u0001")
js = re.sub(r"'([^']*)'", lambda m: json.dumps(m.group(1).replace("\u0001", "'")), js)
js = re.sub(r",(\s*[\]}])", r"\1", js)

items = json.loads(js)
print("Items:", len(items))

campos = collections.Counter()
stats = collections.Counter()
tipos = collections.Counter()
for it in items:
    for k in it:
        campos[k] += 1
    for m in it.get("mods", []):
        stats[m["stat"]] += 1
    tipos[it.get("tipoItem", "")] += 1

print("\n--- CAMPOS ---")
for k, v in campos.most_common():
    print(f"  {k}: {v}")
print("\n--- STATS EN MODS ---")
for k, v in stats.most_common():
    print(f"  {k}: {v}")
print("\n--- TIPOS DE ITEM ---")
for k, v in tipos.most_common():
    print(f"  {k}: {v}")
print("\nCon imagen:", sum(1 for v in tiene_img.values() if v), "/", len(tiene_img))

for it in items:
    it["_tiene_imagen"] = tiene_img.get(it["id"], False)
    it.pop("imagen", None)
json.dump(items, open(SP + "/catalogo_items.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("\nGuardado en catalogo_items.json")
