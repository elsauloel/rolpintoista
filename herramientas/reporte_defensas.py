# -*- coding: utf-8 -*-
"""Reporte de defensas del catálogo por slot y por calidad (2026-10-07, pedido del dueño: «al final de cada slot y de cada tier, cuánto hay de
defensa, cuánto de defensa especial y cuánto de resistencia elemental… así vamos llevando una cuenta y haciendo un control de diseño»).

Suma, entre las piezas publicadas (sin `archivo`) de cada slot y calidad: la Defensa, la Defensa especial (`armadmg`) y cada resistencia
elemental (fuego, hielo, eléctrica, tóxico, ácido; solo las positivas), y cuenta cuántas piezas dan cada cosa y cuántas son híbridas
(Defensa y Defensa especial a la vez). Los orbes van aparte de los escudos.

Uso:
  python reporte_defensas.py                 # todos los slots y calidades
  python reporte_defensas.py Común           # una calidad
  python reporte_defensas.py Común cabeza    # una calidad y un slot
"""
import re, sys, pathlib, collections
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from catalogo_comun import leer_catalogo
import calculadora_defensa as cd

ELEM = [('resfuego', '🔥'), ('reshielo', '❄'), ('resrayo', '⚡'), ('restoxico', '☠'), ('resacido', '🧪')]
# Qué resistencias elementales puede dar cada slot (dueño, 2026-10-07): acota cuánto se acumula por calidad (tope por pieza: Común +1, Buena +2).
# Cinturón y mochila: ninguna. Orbes: cualquiera. Anillos: pendiente (cuando se hagan los anillos).
PERMITIDAS = {'cabeza': {'resfuego', 'restoxico'}, 'torso': {'reshielo', 'resacido'}, 'manos': {'resfuego', 'resrayo'},
              'piernas': {'resfuego', 'reshielo'}, 'pies': {'restoxico', 'resacido'}, 'escudo': {'reshielo', 'resrayo'},
              'escudo a 2 manos': {'reshielo', 'resrayo'}, 'cinturón': set(), 'mochila': set(),
              'orbe': {'resfuego', 'reshielo', 'resrayo', 'restoxico', 'resacido'}}   # los orbes, cualquiera: el comodín para balancear (dueño, 2026-10-07)
# Ningún escudo de metal da Res. eléctrica (dueño, 2026-10-07, por color: el metal conduce). Se detecta por el nombre y la descripción.
METAL = re.compile(r'\b(hierro|acero|bronce|cobre|metal|chapa|lat[oó]n|plomo|esta[ñn]o)\b', re.I)
TOPE_RES = {'Común': 1, 'Buena Calidad': 2}
TIERS = ['Común', 'Buena Calidad', 'Raro', 'Excepcional', 'Legendario']


def slot_de(it):
    if it.get('orbe'): return 'orbe'
    return cd.PARTE.get(it.get('tipoItem'))


def mod(it, stat):
    return sum(m['val'] for m in it.get('mods', []) if m.get('stat') == stat)


def reporte(tier=None, slot=None):
    filas = collections.OrderedDict()
    for it in leer_catalogo():
        if it.get('archivo') or it.get('consumible'): continue
        s = slot_de(it)
        if not s or (tier and not it.get('tier', '').startswith(tier)) or (slot and s != slot): continue
        k = (it.get('tier'), s)
        f = filas.setdefault(k, collections.Counter())
        d, e = max(0, mod(it, 'def')), max(0, mod(it, 'armadmg'))
        f['piezas'] += 1; f['def'] += d; f['esp'] += e
        f['con_def'] += d > 0; f['con_esp'] += e > 0; f['hibridas'] += d > 0 and e > 0
        for st, _ in ELEM:
            v = max(0, mod(it, st)); f[st] += v
            if v and s in PERMITIDAS and st not in PERMITIDAS[s]: FUERA.append(f'{it["nombre"]} ({it.get("tier")}, {s}): {st[3:]} no va en este slot')
            if v and st == 'resrayo' and s.startswith('escudo') and METAL.search(it['nombre'] + ' ' + it.get('descripcionNarrativa', '')):
                FUERA.append(f'{it["nombre"]} ({it.get("tier")}): escudo de metal con Res. eléctrica (el metal conduce)')
            if v > TOPE_RES.get(it.get('tier'), 99): FUERA.append(f'{it["nombre"]} ({it.get("tier")}): {st[3:]} +{v} pasa el tope de su calidad')
    return filas
FUERA = []


def linea(k, f):
    el = ' '.join(f'{ic}{f[st]}' for st, ic in ELEM if f[st])
    return (f'{k[1]} · {k[0]}: Defensa {f["def"]} · Def. especial {f["esp"]} · Res. elemental {el or "—"} · '
            f'{f["piezas"]} piezas ({f["con_def"]} con Def, {f["con_esp"]} con Def. esp, {f["hibridas"]} híbridas)')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    tier = sys.argv[1] if len(sys.argv) > 1 else None
    slot = sys.argv[2] if len(sys.argv) > 2 else None
    filas = reporte(tier, slot)
    tot = collections.defaultdict(collections.Counter)
    for k in sorted(filas, key=lambda k: (TIERS.index(k[0]) if k[0] in TIERS else 9, k[1])):
        print(linea(k, filas[k]))
        tot[k[0]].update(filas[k])
    for t, f in tot.items():
        print(linea((t, 'TOTAL'), f))
    print('Resistencias fuera de regla:' if FUERA else 'Resistencias: todas en su slot y dentro del tope.')
    for x in FUERA: print('  ⚠', x)
