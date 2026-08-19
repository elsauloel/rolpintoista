# -*- coding: utf-8 -*-
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from rutas import FICHA, GM, VENDOR, XLSX, SP

# Marca los items cuyo Detalle promete algo que el programa no hace.
# No entiende el texto: busca senales de que ahi se describe una mecanica
# (condiciones, disparadores, verbos de accion) y compara con lo que el
# item tiene realmente configurado. Sirve para no pasar ninguno por alto.
import re

# Palabras que delatan una mecanica condicional o con disparador.
DISPARADORES = [
    r'\bal (?:bloquear|atacar|golpear|recibir|curar|consumir|equipar|matar|fallar|acertar|usar|revivir)\b',
    r'\bcuando\b', r'\bcada vez que\b', r'\bsi (?:el|la|tu|te|un|una|est|tien|logr|super)',
    r'\bmientras\b', r'\bdurante\b', r'\bprimer(?:a|o)? (?:turno|golpe|ataque|vez)\b',
    r'\buna vez por\b', r'\bpor turno\b', r'\bcontra (?:un|el|los)\b', r'\bcon .{0,20}activo\b',
    r'\bignora\b', r'\brevive\b', r'\breduce\b', r'\baumenta\b', r'\bduplica\b',
    r'\brepite\b', r'\bre-?roll\b', r'\bremueve\b', r'\bcura\b', r'\brecupera\b',
    r'\bpermite\b', r'\botorga\b', r'\baplica\b', r'\brompe armadura\b', r'\bamplificado\b',
    r'\bdaño \+?\d+%', r'\+\d+%', r'\bexplota\b', r'\bárea\b', r'\bcasillas\b',
]
# Lo que ya esta cubierto por columnas y no necesita codigo aparte.
YA_CUBIERTO = [
    r'^\s*tipo de daño[^.]*\.?\s*$',
    r'^\s*res(?:istencia)?\.?\s*crít', r'^\s*reduce críticos',
    r'^\s*\+?\d+\s*(?:a|al)\s+(?:los\s+)?\w+\.?\s*$',
]

def analizar(items):
    revisar, ok = [], []
    for it in items:
        det = (it.get('detalle') or '').strip()
        if not det:
            ok.append((it, 'sin detalle'))
            continue
        bajo = det.lower()
        if any(re.search(p, bajo) for p in YA_CUBIERTO):
            ok.append((it, 'descripción de lo que ya hacen las columnas'))
            continue
        golpes = [p for p in DISPARADORES if re.search(p, bajo)]
        if not golpes:
            ok.append((it, 'texto de color, sin mecánica'))
            continue
        # Tiene pinta de mecanica: ¿esta configurada en algun lado?
        tiene = []
        if it.get('mods'): tiene.append('modificadores')
        if it.get('curahp'): tiene.append('cura HP')
        if it.get('curabonosPct'): tiene.append('cura Bonos')
        if (it.get('efectoNombre') or '').strip(): tiene.append('aplica estado')
        if (it.get('tiradaExtra') or '').strip(): tiene.append('tirada extra')
        if it.get('danoAmplificado'): tiene.append('daño amplificado')
        if it.get('equipoEstadoNombre') and (it.get('equipoEstadoNombre') or '').strip(): tiene.append('estado al equipar')
        revisar.append({'it': it, 'detalle': det, 'senales': golpes, 'configurado': tiene})
    return revisar, ok

if __name__ == '__main__':
    import sys, json
    items = json.load(open(SP + "/catalogo_items.json", encoding="utf-8"))
    revisar, ok = analizar(items)
    print(f"Ítems: {len(items)} · con mecánica descrita en el Detalle: {len(revisar)}\n")
    # Agrupar por que tan cubierto esta
    solo_mods = [r for r in revisar if r['configurado'] in ([], ['modificadores'])]
    print(f"--- LOS QUE NADA EN EL CÓDIGO REFLEJA ({len(solo_mods)}) ---")
    for r in sorted(solo_mods, key=lambda x: x['it']['nombre']):
        cfg = ', '.join(r['configurado']) or 'nada'
        print(f"  {r['it']['nombre']}  [{r['it']['tier']}]")
        print(f"      \"{r['detalle'][:110]}\"")
        print(f"      configurado: {cfg}")
