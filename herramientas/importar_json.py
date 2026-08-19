# -*- coding: utf-8 -*-
import sys, pathlib, json
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from rutas import FICHA, GM, VENDOR, XLSX, SP

# Importa datos/catalogo.json (la fuente que llena catalogo-editor.html) al
# código: corrige lo obvio, genera ids para los items nuevos, reescribe los
# tres catálogos y regraba datos/catalogo.json con los ids que se hayan
# generado — así el editor, en su próxima carga, ya los tiene.
from catalogo_comun import corregir, escribir_htmls, guardar_catalogo_json, CATALOGO_JSON

items = json.load(open(CATALOGO_JSON, encoding='utf-8'))
items, correcciones = corregir(items)

from detectar_efectos import analizar as _analizar
_rev, _ = _analizar(items)
_YA = {'Ankh de Reencarnación'}
import re as _re
def _cubierto(r):
    d, it = r['detalle'].lower(), r['it']
    if it.get('curahp') and _re.search(r'recupera \d+ ?hp|cura \d+ ?hp', d): return True
    # efectoNombre solo no alcanza: el estado tiene que traer algo que lo
    # haga (mods, hp/turno, o un preset del que heredar la mecánica real)
    # — si no, se activa un estado que no hace nada.
    if (it.get('efectoNombre') or '').strip() and (it.get('efectoMods') or it.get('efectoHpTurno') or (it.get('efectoPreset') or '').strip()): return True
    if it.get('curabonosPct') and 'bonos' in d: return True
    if it.get('mods'): return True
    if it.get('danoAmplificado'): return True
    if (it.get('equipoEstadoNombre') or '').strip(): return True
    return False
_pend = [r for r in _rev if r['it']['nombre'] not in _YA and not _cubierto(r)]

print("=== CORRECCIONES APLICADAS ===")
for c in correcciones: print("  ", c)
print(f"\nÍtems totales: {len(items)}")

ocultos = [it for it in items if it.get('ocultoEnCatalogo')]
if ocultos:
    print(f"Ocultos del catálogo (no van a ficha/vendor/gm-tools, siguen en catalogo.json): {len(ocultos)}")
    for it in sorted(ocultos, key=lambda x: x['nombre']):
        print("  ", it['nombre'])

conteos = escribir_htmls(items)
print(f"ficha.html: catálogo reescrito ({conteos['ficha']} ítems)")
print(f"vendor-generator.html: catálogo reescrito ({conteos['vendor']} ítems)")
print(f"gm-tools.html: catálogo de equipo reescrito ({conteos['gm']} ítems)")

guardar_catalogo_json(items)
print("datos/catalogo.json: regrabado (con los ids nuevos, si hubo)")

if _pend:
    print("")
    print(f"=== EFECTOS DESCRITOS SIN MECÁNICA ({len(_pend)}) ===")
    print("   El texto lo promete, pero nada en el código lo hace:")
    for r in sorted(_pend, key=lambda x: x['it']['nombre']):
        cfg = ', '.join(r['configurado']) or 'nada configurado'
        print(f"   · {r['it']['nombre']}: \"{r['detalle'][:75]}\" [{cfg}]")
