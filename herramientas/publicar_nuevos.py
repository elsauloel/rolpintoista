# -*- coding: utf-8 -*-
"""Publica en el catálogo (datos/catalogo.json) los ítems del rework que están en archivos aparte:
  datos/armas-nuevas.json, datos/defensa-nuevos.json, datos/consumibles-nuevos.json
Es idempotente: primero saca del catálogo todo id que empiece con "nuevo-" y vuelve a ponerlo con los datos de hoy.
No toca ningún otro ítem. Después hay que correr `python herramientas/importar_json.py` para regenerar los tres HTML.

Uso: python herramientas/publicar_nuevos.py
"""
import json, re, sys, pathlib

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import calculadora_armas as C

RAIZ = C.RAIZ
CATALOGO = RAIZ / 'datos' / 'catalogo.json'
STAT = {'rng': 'Alcance', 'pdg': 'PdG', 'parry': 'Parry', 'bloqueo': 'Bloqueo', 'crit': 'Crít. frecuente', 'critpot': 'Crít. potente', 'ini': 'Iniciativa', 'dmg': 'Dmg'}
EXTRAS = ('tanda', 'categoria', 'categoriaVisibilidad', 'revelaOculto', 'percepcionAumentada')   # campos de trabajo que no van al catálogo


def narrativa(detalle):
    """De un texto que mezcla historia y números, deja solo la parte narrativa."""
    salida = []
    for frase in re.split(r'(?<=[.!?])\s+', detalle.strip()):
        if ':' in frase and re.search(r'\d', frase.split(':', 1)[1]):
            frase = frase.split(':', 1)[0].strip().rstrip('.') + '.'
        elif re.search(r'\d|PdG|Parry|Bloqueo|Alcance|Iniciativa|Crít', frase):
            continue
        if frase and frase != '.':
            salida.append(frase)
    return ' '.join(salida)


def arma(a):
    it = {k: v for k, v in a.items() if k not in EXTRAS}
    pc, _ = C.puntaje(a)
    it['precioCompra'] = C.precio(pc, a['tier'])[0]
    partes = []
    if a.get('danoFijo'):
        partes.append('+%d de daño fijo' % a['danoFijo'])
    for m in a.get('mods') or []:
        partes.append('%s %+d' % (STAT.get(m['stat'], m['stat']), m['val']))
    for e in a.get('efectosGolpe') or []:
        partes.append((e.get('detalle') or e['nombre']).rstrip('.'))
    it['descripcionNarrativa'] = narrativa(a.get('detalle', ''))
    it['detalle'] = (' · '.join(partes) if partes else 'Sin bonos ni efectos.')
    it['efectosGolpe'] = [dict(e, dado=e.get('dado', '')) for e in a.get('efectosGolpe') or []]
    it.update({'ranuras': 0, 'danoAmplificado': 0, 'armaDeRango': bool(a.get('armaDeRango')), 'efectoMods': [], 'equipoEstadoNombre': '', 'equipoEstadoHpTurno': 0, 'equipoEstadoDetalle': '', 'consumible': False})
    return it


def otro(a):
    it = {k: v for k, v in a.items() if k not in EXTRAS}
    it.setdefault('efectoMods', [])
    return it


def cargar_json(nombre):
    p = RAIZ / 'datos' / nombre
    return json.load(open(p, encoding='utf-8')) if p.exists() else []


def main():
    cat = json.load(open(CATALOGO, encoding='utf-8'))
    antes = len(cat)
    cat = [i for i in cat if not str(i.get('id', '')).startswith('nuevo-')]
    quitados = antes - len(cat)
    nuevos = [arma(a) for a in cargar_json('armas-nuevas.json')] + [otro(a) for a in cargar_json('defensa-nuevos.json')] + [otro(a) for a in cargar_json('consumibles-nuevos.json')] + [otro(a) for a in cargar_json('trampas-consumibles.json')]
    nombres = {i['nombre'].strip().lower() for i in cat}
    choques = [n['nombre'] for n in nuevos if n['nombre'].strip().lower() in nombres]
    assert not choques, 'nombres que ya existen en el catálogo: %s' % choques
    cat += nuevos
    json.dump(cat, open(CATALOGO, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=2)
    print('catálogo: %d ítems (quitados %d "nuevo-" viejos, agregados %d)' % (len(cat), quitados, len(nuevos)))


if __name__ == '__main__':
    main()
