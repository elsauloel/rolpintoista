# -*- coding: utf-8 -*-
"""Busca ítems idénticos con distinto nombre (armas, defensa y consumibles), ya con las variaciones aplicadas.
Regla del dueño (2026-09-25): no tiene que haber dos ítems con exactamente los mismos números y efectos.

Uso: python herramientas/buscar_duplicados.py
"""
import json, collections, sys, pathlib

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import calculadora_armas as C
import reajuste_defensa as D


def _mods(a):
    return json.dumps(sorted((m['stat'], m['val']) for m in a.get('mods', [])))


def firma_arma(a):
    return (a['tier'], a['tipoItem'], a.get('tipoDado'), a.get('peso'), a.get('danoFijo') or 0, bool(a.get('armaDeRango')), _mods(a),
            json.dumps(sorted((e['nombre'], e.get('caras'), e.get('exitos'), e.get('stacks')) for e in a.get('efectosGolpe', []) or [])))


def firma_defensa(a):
    return (a['tier'], a['tipoItem'], a.get('peso'), a.get('ranuras'), _mods(a), json.dumps(a.get('efectoMods') or [], sort_keys=True), a.get('efectoPreset'),
            a.get('efectoNombre'), a.get('equipoEstadoNombre'), a.get('equipoEstadoDetalle'), a.get('efectoDetalle'))


def firma_consumible(a):
    return (a['tier'], a.get('curahp'), a.get('curabonosPct'), a.get('efectoNombre'), a.get('efectoPreset'), a.get('efectoTurnos'), a.get('efectoHpTurno'),
            a.get('efectoPermanente'), a.get('efectoDetalle'), json.dumps(a.get('efectoMods') or [], sort_keys=True), _mods(a))


def grupos(pares):
    g = collections.defaultdict(list)
    for firma, nombre in pares:
        g[firma].append(nombre)
    return [v for v in g.values() if len(v) > 1]


def main():
    cat = json.load(open(C.CATALOGO, encoding='utf-8'))
    cat = cat['items'] if isinstance(cat, dict) and 'items' in cat else cat
    informe = {
        'armas': grupos([(firma_arma(C.reajustar(a)[0]), a['nombre']) for a in C.cargar()] + [(firma_arma(a), a['nombre'] + ' [nuevo]') for a in C.cargar_nuevas()]),
        'defensa': grupos([(firma_defensa(D.reajustar(a)[0]), a['nombre']) for a in D.cargar()] + [(firma_defensa(a), a['nombre'] + ' [nuevo]') for a in D.cargar_nuevos()]),
        'consumibles': grupos([(firma_consumible(a), a['nombre']) for a in cat if a.get('tipoItem') == 'consumibles' and not str(a.get('id', '')).startswith('nuevo-')]),
    }
    for k, v in informe.items():
        print(k, '->', len(v), 'grupos duplicados')
        for g in v:
            print('   ', g)


if __name__ == '__main__':
    main()
