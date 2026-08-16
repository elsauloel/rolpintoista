# -*- coding: utf-8 -*-
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from rutas import FICHA, GM, VENDOR, XLSX, SP

# Importa el Excel al codigo: corrige lo obvio, genera ids para los items
# nuevos, conserva las imagenes por id, reescribe los tres catalogos y deja
# datos/catalogo.json al día (así el editor HTML siempre parte de lo último,
# venga de donde venga el último cambio: Excel o el editor).
from leer_excel import leer
from catalogo_comun import corregir, imagenes_por_id, escribir_htmls, guardar_catalogo_json

items, avisos = leer()

if avisos:
    print("=== AVISOS DE LECTURA DEL EXCEL ===")
    for a in avisos: print("  ", a)
    print("")

# Las imagenes no vienen del Excel (pesan demasiado para editarlas ahí):
# se conservan las que ya estaban en ficha.html, por id.
imagenes = imagenes_por_id()
for it in items:
    it['imagen'] = imagenes.get(it.get('id'), '')

items, correcciones = corregir(items)

# ---------- Aviso: efectos escritos que el codigo no respalda ----------
from detectar_efectos import analizar as _analizar
_rev, _ = _analizar(items)
_YA = {'Ankh de Reencarnación'}
import re as _re
def _cubierto(r):
    d, it = r['detalle'].lower(), r['it']
    if it.get('curahp') and _re.search(r'recupera \d+ ?hp|cura \d+ ?hp', d): return True
    # efectoNombre solo no alcanza: el estado tiene que traer algo que lo
    # haga (mods o hp/turno) — si no, se activa un estado que no hace nada.
    if (it.get('efectoNombre') or '').strip() and (it.get('efectoMods') or it.get('efectoHpTurno')): return True
    if it.get('curabonosPct') and 'bonos' in d: return True
    if it.get('mods'): return True
    # Estado al equipar: cuenta como cubierto aunque no tenga preset —
    # "recordatorio sin mecánica automática" es un resultado a propósito
    # para lo que de verdad no se puede automatizar todavía.
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

con_imagen = sum(1 for it in items if it.get('imagen'))
print("Imágenes conservadas:", con_imagen)

conteos = escribir_htmls(items)
print(f"ficha.html: catálogo reescrito ({conteos['ficha']} ítems)")
print(f"vendor-generator.html: catálogo reescrito ({conteos['vendor']} ítems)")
print(f"gm-tools.html: catálogo de equipo reescrito ({conteos['gm']} ítems)")

guardar_catalogo_json(items)
print("datos/catalogo.json: actualizado")

if _pend:
    print("")
    print(f"=== EFECTOS DESCRITOS SIN MECÁNICA ({len(_pend)}) ===")
    print("   El texto lo promete, pero nada en el código lo hace:")
    for r in sorted(_pend, key=lambda x: x['it']['nombre']):
        cfg = ', '.join(r['configurado']) or 'nada configurado'
        print(f"   · {r['it']['nombre']}: \"{r['detalle'][:75]}\" [{cfg}]")
