# -*- coding: utf-8 -*-
"""Reajuste de la defensa (fase 2 del rework, P114): reparte la Resistencia a crítico por slots y por tier.

Reglas (docs/rework-defensa.md, aprobadas por el dueño el 2026-09-25):
  Tipo 4  -> cabeza, torso, manos, piernas, pies, escudo
  Tipo 6  -> torso (solo rígido), manos, piernas
  Tipo 8  -> torso rígido, escudo
  Tipo 10 -> cabeza
  Tipo 12 -> solo cinturón y anillos (Legendarios, +1)
Tope por pieza según tier (ver TOPE). Las armaduras blandas solo dan Tipo 4.

Uso:
  python herramientas/reajuste_defensa.py auditoria   # escribe datos/auditoria-defensa-datos.json (actuales reajustados + nuevos)
  python herramientas/reajuste_defensa.py resumen     # máximo equipable por Tipo, antes y después
No toca datos/catalogo.json: los cambios se aplican después de que el dueño audite.
"""
import json, pathlib, sys, collections

RAIZ = pathlib.Path(__file__).resolve().parent.parent
T_CRIT = {'tipo1': 4, 'tipo2': 6, 'tipo3': 8, 'tipo4': 10, 'tipo5': 12}
STAT_DE_TIPO = {v: k for k, v in T_CRIT.items()}
TIERS = ['Común', 'Buena Calidad', 'Raro', 'Excepcional', 'Legendario']
TOPE = {  # tier -> {Tipo: tope por pieza}
    'Común': {4: 1, 6: 1, 8: 0, 10: 0, 12: 0},
    'Buena Calidad': {4: 1, 6: 1, 8: 0, 10: 0, 12: 0},
    'Raro': {4: 2, 6: 1, 8: 1, 10: 1, 12: 0},
    'Excepcional': {4: 2, 6: 2, 8: 1, 10: 1, 12: 0},
    'Legendario': {4: 3, 6: 2, 8: 2, 10: 2, 12: 1},
}
SLOT_DE = {'cabeza': 'cabeza', 'armadura_blanda': 'torso', 'armadura_rigida': 'torso', 'manos': 'manos', 'piernas': 'piernas', 'pies': 'pies',
           'escudo_1m': 'escudo', 'escudo_2m': 'escudo', 'cinturon': 'cinturón', 'anillos': 'anillo'}


def tier_norm(t):
    for x in TIERS:
        if t and t[:3] == x[:3]:
            return x
    return 'Común'


def permitido(tipo, item):
    """¿Puede este ítem dar Resistencia a crítico de ese Tipo? Devuelve (bool, motivo)."""
    ti, slot, tier = item['tipoItem'], SLOT_DE.get(item['tipoItem']), tier_norm(item.get('tier'))
    if tipo == 4:
        return slot in ('cabeza', 'torso', 'manos', 'piernas', 'pies', 'escudo'), 'el Tipo 4 no va en %s' % slot
    if tipo == 6:
        return (slot in ('manos', 'piernas') or ti == 'armadura_rigida'), 'el Tipo 6 solo va en torso rígido, manos y piernas'
    if tipo == 8:
        return (ti == 'armadura_rigida' or slot == 'escudo'), 'el Tipo 8 solo va en torso rígido y escudo'
    if tipo == 10:
        return slot == 'cabeza', 'el Tipo 10 solo va en la cabeza'
    if tipo == 12:
        return slot in ('cinturón', 'anillo'), 'el Tipo 12 solo va en cinturón y anillos'
    return True, ''


def reajustar(item):
    """Devuelve (item_nuevo, cambios, avisos) con las resistencias acomodadas a los slots y topes."""
    it = json.loads(json.dumps(item))
    tier = tier_norm(it.get('tier'))
    cambios, avisos, mods = [], [], []
    for m in it.get('mods') or []:
        if m['stat'] not in T_CRIT:
            mods.append(m)
            continue
        tipo = T_CRIT[m['stat']]
        ok, motivo = permitido(tipo, it)
        if not ok:
            cambios.append('Quitar Res. crítico Tipo %d (+%d): %s.' % (tipo, m['val'], motivo))
            continue
        tope = TOPE[tier][tipo]
        if tope <= 0:
            cambios.append('Quitar Res. crítico Tipo %d (+%d): no la dan piezas de tier %s.' % (tipo, m['val'], tier))
            continue
        if m['val'] > tope:
            cambios.append('Res. crítico Tipo %d: de +%d a +%d (tope de %s).' % (tipo, m['val'], tope, tier))
            m = dict(m, val=tope)
        mods.append(m)
    if cambios:
        avisos.append('Al quitar resistencia la pieza pierde valor: si querés compensarla, pedilo en la nota (+1 de Defensa u otro bono).')
    it['mods'] = mods
    return it, cambios, avisos


def cargar():
    c = json.load(open(RAIZ / 'datos' / 'catalogo.json', encoding='utf-8'))
    c = c['items'] if isinstance(c, dict) and 'items' in c else c
    return [i for i in c if i['tipoItem'] in SLOT_DE]


def cargar_nuevos():
    p = RAIZ / 'datos' / 'defensa-nuevos.json'
    return json.load(open(p, encoding='utf-8')) if p.exists() else []


def val(item, stat):
    return sum(m['val'] for m in (item.get('mods') or []) if m['stat'] == stat)


def resumen_mods(item):
    return [{'stat': m['stat'], 'val': m['val']} for m in (item.get('mods') or [])]


def datos_auditoria():
    out = []
    for origen, lista in (('catálogo actual', cargar()), ('nuevo · defensa', cargar_nuevos())):
        for it in lista:
            nuevo, cambios, avisos = reajustar(it)
            if origen != 'catálogo actual':
                assert not cambios, (it['nombre'], cambios)   # un ítem nuevo tiene que cumplir las reglas tal cual
            out.append({
                'id': it.get('id') or it['nombre'], 'nombre': it['nombre'], 'origen': origen,
                'slot': SLOT_DE[it['tipoItem']], 'tipoItem': it['tipoItem'], 'tier': tier_norm(it.get('tier')), 'peso': it.get('peso'),
                'def': val(it, 'def'), 'antes': resumen_mods(it), 'despues': resumen_mods(nuevo), 'cambios': cambios, 'avisos': avisos,
                'precioHoy': it.get('precioCompra'), 'detalle': (it.get('descripcionNarrativa') or it.get('detalle') or '')[:400],
            })
    ruta = RAIZ / 'datos' / 'auditoria-defensa-datos.json'
    ruta.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
    print('escrito', ruta.relative_to(RAIZ), len(out), 'piezas;', sum(1 for o in out if o['cambios']), 'con cambios')


def maximo_equipable(items, tier_max=None):
    """Máximo de resistencia por Tipo juntando la mejor pieza por slot (2 anillos)."""
    res = {}
    for tipo in (4, 6, 8, 10, 12):
        mejor = collections.defaultdict(list)
        for it in items:
            if tier_max is not None and TIERS.index(tier_norm(it.get('tier'))) > tier_max:
                continue
            v = val(it, STAT_DE_TIPO[tipo])
            if v:
                mejor[SLOT_DE[it['tipoItem']]].append(v)
        tot = 0
        for slot, vs in mejor.items():
            vs = sorted(vs, reverse=True)
            tot += sum(vs[:2]) if slot == 'anillo' else vs[0]
        res[tipo] = tot
    return res


def resumen():
    hoy = cargar()
    nuevo = [reajustar(i)[0] for i in hoy] + [reajustar(i)[0] for i in cargar_nuevos()]
    print('Máximo equipable por Tipo (mejor pieza por slot):')
    for etiqueta, tm in (('cualquier tier', None), ('hasta Raro', 2)):
        print(' ', etiqueta, '| hoy:', maximo_equipable(hoy, tm), '| reglas nuevas:', maximo_equipable(nuevo, tm))


if __name__ == '__main__':
    {'auditoria': datos_auditoria, 'resumen': resumen}.get(sys.argv[1] if len(sys.argv) > 1 else '', lambda: print(__doc__))()
