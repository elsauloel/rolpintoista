# -*- coding: utf-8 -*-
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from rutas import FICHA, GM, VENDOR, XLSX, SP

# Importa el Excel al codigo: corrige lo obvio, genera ids para los items
# nuevos, conserva las imagenes por id y reescribe los tres catalogos.
import sys, re, json, unicodedata
from leer_excel import leer

GM = GM

TIERS_OK = {'común':'Común', 'buena calidad':'Buena Calidad', 'raro':'Raro',
            'excepcional':'Excepcional', 'legendario':'Legendario'}
STATS_OK = {'def','tipo1','tipo2','tipo3','tipo4','tipo5','mov','bonos','eva','ini','pdg','crit',
            'parry','fue','con','int','agl','des','resm','rescc','rangocasteo','accionesmax',
            'dmg','bloqueo','hpmax','crgmax','rng','pdgmg'}

items, avisos = leer()
correcciones = []

def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()
    return s or 'item'

ids_usados = {it['id'] for it in items if it.get('id')}

for it in items:
    et = f"{it['_hoja']} fila {it['_fila']} · {it['nombre']}"

    # 1. Tier con mayúsculas del sistema
    tier = (it.get('tier') or '').strip()
    if tier.lower() in TIERS_OK and tier != TIERS_OK[tier.lower()]:
        correcciones.append(f"{et}: tier '{tier}' -> '{TIERS_OK[tier.lower()]}'")
        tier = TIERS_OK[tier.lower()]
    it['tier'] = tier or 'Común'

    # 2. Tipo de ítem
    if it['_hoja'] == 'Consumibles':
        it['tipoItem'] = 'consumibles'
    elif not (it.get('tipoItem') or '').strip():
        # Por ahora todo es de una mano, armas y escudos.
        nuevo = {'Armas':'arma_1m', 'Escudos':'escudo_1m'}.get(it['_hoja'], '')
        if nuevo:
            correcciones.append(f"{et}: sin tipo -> '{nuevo}'")
            it['tipoItem'] = nuevo

    # 3. Modificadores: nombre del stat en minúscula
    limpios = []
    for m in it['mods']:
        s = m['stat'].strip()
        if s not in STATS_OK and s.lower() in STATS_OK:
            correcciones.append(f"{et}: modificador '{s}' -> '{s.lower()}'")
            s = s.lower()
        if s in STATS_OK:
            limpios.append({'stat': s, 'val': m['val']})
        else:
            correcciones.append(f"{et}: modificador '{s}' no existe, se descarta")
    it['mods'] = limpios

    # 4. ID para los nuevos
    if not it.get('id'):
        base = 'new-' + slug(it['nombre'])
        iid, n = base, 2
        while iid in ids_usados:
            iid = f"{base}-{n}"; n += 1
        ids_usados.add(iid)
        it['id'] = iid
        correcciones.append(f"{et}: id nuevo '{iid}'")


# ---------- Aviso: efectos escritos que el codigo no respalda ----------
# El importador no entiende el texto, pero si puede marcar los items cuyo
# Detalle describe una mecanica y no tienen nada configurado que la haga.
from detectar_efectos import analizar as _analizar
_rev, _ = _analizar(items)
_YA = {'Ankh de Reencarnación'}
import re as _re
def _cubierto(r):
    d, it = r['detalle'].lower(), r['it']
    if it.get('curahp') and _re.search(r'recupera \d+ ?hp|cura \d+ ?hp', d): return True
    if (it.get('efectoNombre') or '').strip(): return True
    if it.get('curabonosPct') and 'bonos' in d: return True
    return False
_pend = [r for r in _rev if r['it']['nombre'] not in _YA and not _cubierto(r)]

print("=== CORRECCIONES APLICADAS ===")
for c in correcciones: print("  ", c)
print(f"\nÍtems a escribir: {len(items)}")

# ---------- Imágenes que ya estaban, por id ----------
t = open(FICHA, encoding="utf-8", newline="").read().replace("\r\n", "\n")
i = t.index("  catalogo:["); i = t.index("[", i)
p = 0
for j in range(i, len(t)):
    if t[j] == "[": p += 1
    elif t[j] == "]":
        p -= 1
        if p == 0: fin = j + 1; break
bloque_viejo = t[i:fin]
imagenes = dict(re.findall(r"\{id:'([^']+)',[^}]*?imagen:'(data:[^']*)'", bloque_viejo))
print("Imágenes conservadas:", len(imagenes))

# ---------- Generar el JS ----------
def esc_js(s):
    return str(s or '').replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ').strip()

def mods_js(mods):
    return '[' + ', '.join("{stat:'%s', val:%s}" % (m['stat'], m['val']) for m in mods) + ']'

def item_js(it, con_imagen=True):
    es_cons = it['tipoItem'] == 'consumibles'
    es_arma = it['tipoItem'].startswith('arma_')
    partes = [
        "id:'%s'" % it['id'],
        "nombre:'%s'" % esc_js(it['nombre']),
        "tier:'%s'" % it['tier'],
        "imagen:'%s'" % (imagenes.get(it['id'], '') if con_imagen else ''),
        "tipoItem:'%s'" % it['tipoItem'],
        "peso:%s" % it.get('peso', 0),
        "ranuras:%s" % it.get('ranuras', 0),
    ]
    if es_arma or it.get('tipoDado'):
        partes.append("tipoDado:%s" % it.get('tipoDado', 0))
        partes.append("danoFijo:%s" % it.get('danoFijo', 0))
    partes.append("precioCompra:%s" % it.get('precioCompra', 0))
    if es_cons:
        partes.append("unidades:%s" % (it.get('unidades') or 1))
    if it.get('cargaMax'):
        partes.append("cargaMax:%s" % it['cargaMax'])
    partes.append("consumible:%s" % ('true' if es_cons else 'false'))
    partes.append("curahp:%s" % it.get('curahp', 0))
    if it.get('curabonosPct'):
        partes.append("curabonosPct:%s" % it['curabonosPct'])
    if (it.get('efectoNombre') or '').strip():
        partes.append("efectoNombre:'%s'" % esc_js(it['efectoNombre']))
        if it.get('efectoTurnos'): partes.append("efectoTurnos:%s" % it['efectoTurnos'])
        if it.get('efectoHpTurno'): partes.append("efectoHpTurno:%s" % it['efectoHpTurno'])
        if it.get('efectoPermanente'): partes.append("efectoPermanente:true")
        if (it.get('efectoDetalle') or '').strip():
            partes.append("efectoDetalle:'%s'" % esc_js(it['efectoDetalle']))
    if (it.get('equipoEstadoNombre') or '').strip():
        partes.append("equipoEstadoNombre:'%s'" % esc_js(it['equipoEstadoNombre']))
        if it.get('equipoEstadoHpTurno'):
            partes.append("equipoEstadoHpTurno:%s" % it['equipoEstadoHpTurno'])
        if (it.get('equipoEstadoDetalle') or '').strip():
            partes.append("equipoEstadoDetalle:'%s'" % esc_js(it['equipoEstadoDetalle']))
    partes.append("mods:%s" % mods_js(it['mods']))
    partes.append("detalle:'%s'" % esc_js(it.get('detalle')))
    return '{' + ', '.join(partes) + '}'

orden_hoja = {'Consumibles':0, 'Armas':1, 'Escudos':2, 'Defensivos':3, 'Otros':4}
items.sort(key=lambda x: (orden_hoja.get(x['_hoja'], 9), x['nombre']))

# --- ficha.html ---
nuevo_bloque = '[\n' + ',\n'.join('    ' + item_js(it) for it in items) + '\n  ]'
t2 = t[:i] + nuevo_bloque + t[fin:]
open(FICHA, "w", encoding="utf-8", newline="").write(t2.replace("\n", "\r\n"))
print("ficha.html: catálogo reescrito")

# --- vendor-generator.html (sin imágenes) ---
tv = open(VENDOR, encoding="utf-8", newline="").read().replace("\r\n", "\n")
m = re.search(r"const CATALOGO = \[\n.*?\n\];", tv, re.S)
assert m, "no encontré CATALOGO en el vendor"
nuevo_v = 'const CATALOGO = [\n' + ',\n'.join('  ' + item_js(it, con_imagen=False) for it in items) + ',\n];'
tv = tv[:m.start()] + nuevo_v + tv[m.end():]
open(VENDOR, "w", encoding="utf-8", newline="").write(tv.replace("\n", "\r\n"))
print("vendor-generator.html: catálogo reescrito")

# --- gm-tools.html (solo equipo, formato propio con def aparte) ---
def item_gm(it):
    es_arma = it['tipoItem'].startswith('arma_')
    dfs = sum(m['val'] for m in it['mods'] if m['stat'] == 'def')
    otros = [m for m in it['mods'] if m['stat'] != 'def']
    partes = [
        "nombre:'%s'" % esc_js(it['nombre']),
        "tipoItem:'%s'" % it['tipoItem'],
        "tier:'%s'" % it['tier'],
        "tipoDado:%s" % (it.get('tipoDado', 0) if es_arma else 0),
        "danoFijo:%s" % (it.get('danoFijo', 0) if es_arma else 0),
        "peso:%s" % it.get('peso', 0),
        "precioCompra:%s" % it.get('precioCompra', 0),
        "def:%s" % dfs,
    ]
    if otros:
        partes.append("mods:%s" % mods_js(otros))
    partes.append("detalle:'%s'" % esc_js(it.get('detalle')))
    return '{' + ', '.join(partes) + '}'

equipo = [it for it in items if it['tipoItem'] != 'consumibles' and it['tipoItem']]
tg = open(GM, encoding="utf-8", newline="").read().replace("\r\n", "\n")
mg = re.search(r"const CATALOGO_EQUIPO = \[\n.*?\n\];", tg, re.S)
assert mg, "no encontré CATALOGO_EQUIPO"
nuevo_g = 'const CATALOGO_EQUIPO = [\n' + ',\n'.join('  ' + item_gm(it) for it in equipo) + ',\n];'
tg = tg[:mg.start()] + nuevo_g + tg[mg.end():]
open(GM, "w", encoding="utf-8", newline="").write(tg.replace("\n", "\r\n"))
print(f"gm-tools.html: catálogo de equipo reescrito ({len(equipo)} ítems)")

if _pend:
    print("")
    print(f"=== EFECTOS DESCRITOS SIN MECÁNICA ({len(_pend)}) ===")
    print("   El texto lo promete, pero nada en el código lo hace:")
    for r in sorted(_pend, key=lambda x: x['it']['nombre']):
        cfg = ', '.join(r['configurado']) or 'nada configurado'
        print(f"   · {r['it']['nombre']}: \"{r['detalle'][:75]}\" [{cfg}]")

