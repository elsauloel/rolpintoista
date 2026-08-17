# -*- coding: utf-8 -*-
"""
Lógica compartida del catálogo: correcciones/generación de IDs, lectura del
catálogo embebido en ficha.html y escritura a los tres HTML.

La usan tanto importar.py (fuente: assets/catalogo.xlsx) como
importar_json.py (fuente: datos/catalogo.json, la que llena el editor HTML).
Las dos fuentes conviven: cualquiera de las dos, al importarse, termina
actualizando datos/catalogo.json Y los tres HTML, así nunca quedan
desincronizados entre sí.
"""
import sys, pathlib, re, json, unicodedata
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from rutas import FICHA, GM, VENDOR, RAIZ

CATALOGO_JSON = str(pathlib.Path(RAIZ) / "datos" / "catalogo.json")

TIERS_OK = {'común':'Común', 'buena calidad':'Buena Calidad', 'raro':'Raro',
            'excepcional':'Excepcional', 'legendario':'Legendario'}
STATS_OK = {'def','tipo1','tipo2','tipo3','tipo4','tipo5','mov','bonos','eva','ini','pdg','crit',
            'parry','fue','con','int','agl','des','resm','resmg','rescc','rangocasteo','accionesmax',
            'dmg','bloqueo','hpmax','crgmax','rng','pdgmg','capcinturon'}

# Nombres en español completo que se usan en "Otros modificadores" (sobre
# todo en Accesorios) y no coinciden con el id interno del stat. Sin este
# mapeo, corregir() los descarta en silencio — pasó con casi todos los
# anillos la primera vez que se cargó la pestaña Accesorios.
ALIAS_STATS = {
    'fuerza': 'fue', 'constitucion': 'con', 'inteligencia': 'int',
    'destreza': 'des', 'agilidad': 'agl',
    'resistenciamagica': 'resmg', 'resistenciamental': 'resm', 'resistenciacc': 'rescc',
    'dano': 'dmg', 'cargamax': 'crgmax', 'evasion': 'eva', 'iniciativa': 'ini',
    'rango': 'rng', 'critico': 'crit', 'pdgmagico': 'pdgmg', 'defensa': 'def',
    'accionesmaximas': 'accionesmax', 'movimiento': 'mov',
}


def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()
    return s or 'item'


def corregir(items):
    """Aplica las mismas correcciones sea cual sea la fuente: tier con
    mayúsculas del sistema, tipoItem por defecto según hoja/categoría,
    nombres de stat en minúscula, e IDs nuevos para lo que no tenga. Devuelve
    (items, lista_de_correcciones_en_texto)."""
    correcciones = []
    ids_usados = {it['id'] for it in items if it.get('id')}

    for it in items:
        et = f"{it.get('_hoja', it.get('tipoItem',''))} · {it['nombre']}"

        tier = (it.get('tier') or '').strip()
        if tier.lower() in TIERS_OK and tier != TIERS_OK[tier.lower()]:
            correcciones.append(f"{et}: tier '{tier}' -> '{TIERS_OK[tier.lower()]}'")
            tier = TIERS_OK[tier.lower()]
        it['tier'] = tier or 'Común'

        if it.get('_hoja') == 'Consumibles' or it.get('consumible'):
            it['tipoItem'] = 'consumibles'
        elif not (it.get('tipoItem') or '').strip():
            nuevo = {'Armas': 'arma_1m', 'Escudos': 'escudo_1m'}.get(it.get('_hoja'), '')
            if nuevo:
                correcciones.append(f"{et}: sin tipo -> '{nuevo}'")
                it['tipoItem'] = nuevo
        # El tipoItem siempre va en minúsculas ("Cinturon" -> "cinturon"): así
        # no importa cómo se haya tipeado en el Excel o el editor.
        tipoNormalizado = (it.get('tipoItem') or '').strip().lower()
        if tipoNormalizado != (it.get('tipoItem') or ''):
            it['tipoItem'] = tipoNormalizado

        limpios = []
        for m in it.get('mods', []):
            s = (m.get('stat') or '').strip()
            low = re.sub(r'[^a-z0-9]', '', s.lower())
            if low in ALIAS_STATS:
                if ALIAS_STATS[low] != s:
                    correcciones.append(f"{et}: modificador '{s}' -> '{ALIAS_STATS[low]}'")
                s = ALIAS_STATS[low]
            elif s not in STATS_OK and low in STATS_OK:
                correcciones.append(f"{et}: modificador '{s}' -> '{low}'")
                s = low
            if s in STATS_OK:
                limpios.append({'stat': s, 'val': m['val']})
            else:
                correcciones.append(f"{et}: modificador '{s}' no existe, se descarta")
        it['mods'] = limpios

        if not it.get('id'):
            base = 'new-' + slug(it['nombre'])
            iid, n = base, 2
            while iid in ids_usados:
                iid = f"{base}-{n}"; n += 1
            ids_usados.add(iid)
            it['id'] = iid
            correcciones.append(f"{et}: id nuevo '{iid}'")

    return items, correcciones


def _bloque_balanceado(texto, inicio_corchete):
    """Dado el índice del '[' que abre un array, devuelve el índice
    (exclusivo) del ']' que lo cierra, contando anidamiento."""
    p = 0
    for j in range(inicio_corchete, len(texto)):
        if texto[j] == '[':
            p += 1
        elif texto[j] == ']':
            p -= 1
            if p == 0:
                return j + 1
    raise ValueError("array sin cerrar")


def leer_desde_ficha():
    """Parsea el bloque catalogo:[...] de ficha.html a una lista de dicts,
    con la imagen incluida (a diferencia de analizar_catalogo.py, que la
    saca por pesar demasiado para un diagnóstico)."""
    t = open(FICHA, encoding="utf-8", newline="").read().replace("\r\n", "\n")
    i = t.index("  catalogo:["); i = t.index("[", i)
    fin = _bloque_balanceado(t, i)
    bloque = t[i:fin]
    js = re.sub(r"([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*):", r'\1"\2":', bloque)
    js = js.replace("\\'", "\u0001")
    js = re.sub(r"'([^']*)'", lambda m: json.dumps(m.group(1).replace("\u0001", "'")), js)
    js = re.sub(r",(\s*[\]}])", r"\1", js)
    return json.loads(js)


def imagenes_por_id():
    """id -> data-URI de imagen, leyendo lo que ya está en ficha.html. La usa
    el flujo Excel (que no trae imágenes) para no perderlas al reimportar."""
    return {it['id']: it.get('imagen', '') for it in leer_desde_ficha() if it.get('imagen')}


def esc_js(s):
    return str(s or '').replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ').strip()


def mods_js(mods):
    return '[' + ', '.join("{stat:'%s', val:%s}" % (m['stat'], m['val']) for m in (mods or [])) + ']'


def item_js(it, con_imagen=True):
    es_cons = it['tipoItem'] == 'consumibles'
    es_arma = it['tipoItem'].startswith('arma_')
    partes = [
        "id:'%s'" % it['id'],
        "nombre:'%s'" % esc_js(it['nombre']),
        "tier:'%s'" % it['tier'],
        "imagen:'%s'" % (it.get('imagen', '') if con_imagen else ''),
        "tipoItem:'%s'" % it['tipoItem'],
        "peso:%s" % it.get('peso', 0),
        "ranuras:%s" % it.get('ranuras', 0),
    ]
    if es_arma or it.get('tipoDado'):
        partes.append("tipoDado:%s" % it.get('tipoDado', 0))
        partes.append("danoFijo:%s" % it.get('danoFijo', 0))
        if it.get('danoAmplificado'):
            partes.append("danoAmplificado:%s" % it['danoAmplificado'])
        if it.get('armaDeRango'):
            partes.append("armaDeRango:true")
    partes.append("precioCompra:%s" % it.get('precioCompra', 0))
    if es_cons:
        partes.append("unidades:%s" % (it.get('unidades') or 1))
    if it.get('cargaMax'):
        partes.append("cargaMax:%s" % it['cargaMax'])
    partes.append("consumible:%s" % ('true' if es_cons else 'false'))
    if it.get('legacy'):
        partes.append("legacy:true")
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
        if it.get('efectoMods'):
            partes.append("efectoMods:%s" % mods_js(it['efectoMods']))
    if (it.get('equipoEstadoNombre') or '').strip():
        partes.append("equipoEstadoNombre:'%s'" % esc_js(it['equipoEstadoNombre']))
        if it.get('equipoEstadoHpTurno'):
            partes.append("equipoEstadoHpTurno:%s" % it['equipoEstadoHpTurno'])
        if (it.get('equipoEstadoDetalle') or '').strip():
            partes.append("equipoEstadoDetalle:'%s'" % esc_js(it['equipoEstadoDetalle']))
        if (it.get('equipoEstadoPreset') or '').strip():
            partes.append("equipoEstadoPreset:'%s'" % esc_js(it['equipoEstadoPreset']))
    partes.append("mods:%s" % mods_js(it['mods']))
    partes.append("detalle:'%s'" % esc_js(it.get('detalle')))
    if (it.get('descripcionNarrativa') or '').strip():
        partes.append("descripcionNarrativa:'%s'" % esc_js(it['descripcionNarrativa']))
    return '{' + ', '.join(partes) + '}'


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
    if es_arma and it.get('danoAmplificado'):
        partes.append("danoAmplificado:%s" % it['danoAmplificado'])
    if es_arma and it.get('armaDeRango'):
        partes.append("armaDeRango:true")
    if it['tipoItem'] == 'consumibles':
        partes.append("consumible:true")
        if it.get('curahp'): partes.append("curahp:%s" % it['curahp'])
        if it.get('legacy'): partes.append("legacy:true")
    if otros:
        partes.append("mods:%s" % mods_js(otros))
    partes.append("detalle:'%s'" % esc_js(it.get('detalle')))
    return '{' + ', '.join(partes) + '}'


def orden_categoria(it):
    orden_hoja = {'Consumibles': 0, 'Armas': 1, 'Escudos': 2, 'Defensivos': 3, 'Accesorios': 4, 'Otros': 5}
    if it.get('_hoja'):
        return orden_hoja.get(it['_hoja'], 9)
    t = it.get('tipoItem', '')
    if t == 'consumibles': return 0
    if t.startswith('arma_'): return 1
    if t.startswith('escudo'): return 2
    return 4


def escribir_htmls(items):
    """Reescribe el catálogo embebido en ficha.html (con imagen),
    vendor-generator.html (sin imagen) y gm-tools.html (formato de equipo).
    Los ítems marcados 'ocultoEnCatalogo' (columna del Excel, para lo que
    todavía no se auditó/balanceó) no se escriben acá — siguen enteros en
    datos/catalogo.json, vía guardar_catalogo_json(), para poder editarlos
    desde catalogo-editor.html."""
    items = [it for it in items if not it.get('ocultoEnCatalogo')]
    items = sorted(items, key=lambda x: (orden_categoria(x), x['nombre']))

    t = open(FICHA, encoding="utf-8", newline="").read().replace("\r\n", "\n")
    i = t.index("  catalogo:["); i = t.index("[", i)
    fin = _bloque_balanceado(t, i)
    nuevo_bloque = '[\n' + ',\n'.join('    ' + item_js(it) for it in items) + '\n  ]'
    t2 = t[:i] + nuevo_bloque + t[fin:]
    open(FICHA, "w", encoding="utf-8", newline="").write(t2.replace("\n", "\r\n"))

    tv = open(VENDOR, encoding="utf-8", newline="").read().replace("\r\n", "\n")
    m = re.search(r"const CATALOGO = \[\n.*?\n\];", tv, re.S)
    assert m, "no encontré CATALOGO en el vendor"
    nuevo_v = 'const CATALOGO = [\n' + ',\n'.join('  ' + item_js(it, con_imagen=False) for it in items) + ',\n];'
    tv = tv[:m.start()] + nuevo_v + tv[m.end():]
    open(VENDOR, "w", encoding="utf-8", newline="").write(tv.replace("\n", "\r\n"))

    equipo = [it for it in items if it['tipoItem']]
    tg = open(GM, encoding="utf-8", newline="").read().replace("\r\n", "\n")
    mg = re.search(r"const CATALOGO_EQUIPO = \[\n.*?\n\];", tg, re.S)
    assert mg, "no encontré CATALOGO_EQUIPO"
    nuevo_g = 'const CATALOGO_EQUIPO = [\n' + ',\n'.join('  ' + item_gm(it) for it in equipo) + ',\n];'
    tg = tg[:mg.start()] + nuevo_g + tg[mg.end():]
    open(GM, "w", encoding="utf-8", newline="").write(tg.replace("\n", "\r\n"))

    return {'ficha': len(items), 'vendor': len(items), 'gm': len(equipo)}


def guardar_catalogo_json(items):
    """Escribe datos/catalogo.json a partir de la lista de items ya
    corregida (incluye imagen: es la copia completa, fuente para el editor
    HTML)."""
    limpios = []
    for it in items:
        it2 = {k: v for k, v in it.items() if not k.startswith('_')}
        limpios.append(it2)
    limpios.sort(key=lambda x: (orden_categoria(x), x['nombre']))
    with open(CATALOGO_JSON, 'w', encoding='utf-8') as f:
        json.dump(limpios, f, ensure_ascii=False, indent=2)
        f.write('\n')
