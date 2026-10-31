# -*- coding: utf-8 -*-
"""Catálogo de ítems de fábrica: comun/catalogo.js (CATALOGO_BASE), un ítem por renglón.

Desde el 2026-09-29 (paso 5 de docs/plan-subida-unificada.md) es la ÚNICA copia del catálogo: la cargan la ficha, GM Tools,
el generador de tiendas y el editor de catálogo (datos/catalogo-editor.html, que también lo escribe). Se retiraron el Excel
(assets/catalogo.xlsx), datos/catalogo.json y los scripts que copiaban el catálogo adentro de los HTML (importar.py,
importar_json.py, leer_excel.py, generar_excel.py): quedan en el historial del repositorio.

Lo que suben jugadores y GM desde el juego vive en Firebase (biblioteca_items), no acá.

  leer_catalogo()          -> lista de ítems
  guardar_catalogo(items)  -> reescribe el archivo (conserva la cabecera; mismo formato que el editor)
  normalizar_item(it)      -> un ítem "de trabajo" (p. ej. de datos/armas-nuevas.json) en la forma del catálogo
"""
import json, pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
CATALOGO_JS = RAIZ / 'comun' / 'catalogo.js'
MARCA = 'const CATALOGO_BASE'


def leer_catalogo():
    texto = CATALOGO_JS.read_text(encoding='utf-8')
    i = texto.index('[', texto.index(MARCA))
    j = texto.rindex('];')
    cuerpo = texto[i:j + 1].rstrip()
    cuerpo = cuerpo[:-1].rstrip().rstrip(',') + ']'
    return json.loads(cuerpo)


def guardar_catalogo(items):
    texto = CATALOGO_JS.read_text(encoding='utf-8')
    cab = texto[:texto.index(MARCA)]
    lineas = ''.join('  ' + json.dumps({k: v for k, v in it.items() if not k.startswith('_')}, ensure_ascii=False, separators=(',', ':')) + ',\n' for it in items)
    CATALOGO_JS.write_text(cab + MARCA + ' = [\n' + lineas + '];\n', encoding='utf-8', newline='\n')


def normalizar_efectos(efs):
    """Efectos al golpear de un arma (ver comun/efectos-golpe.js): [{nombre, caras, exitos, dado, detalle}]."""
    out = []
    for ef in (efs or []):
        if not isinstance(ef, dict):
            continue
        nombre = str(ef.get('nombre') or '').strip()
        if not nombre:
            continue
        try: caras = max(1, int(ef.get('caras') or 1))
        except (TypeError, ValueError): caras = 1
        try: exitos = min(caras, max(1, int(ef.get('exitos') or 1)))
        except (TypeError, ValueError): exitos = 1
        out.append({'nombre': nombre, 'caras': caras, 'exitos': exitos,
                    'dado': str(ef.get('dado') or '').strip(), 'detalle': str(ef.get('detalle') or '').strip()})
    return out


def _t(s):
    return str(s or '').replace('\n', ' ').strip()


def normalizar_item(it):
    """La forma que usan las herramientas (la misma que tenía el catálogo copiado adentro de la ficha)."""
    es_cons = it['tipoItem'] == 'consumibles'
    es_arma = it['tipoItem'].startswith('arma_')
    o = {'id': it['id'], 'nombre': _t(it['nombre']), 'tier': it['tier'], 'imagen': '', 'tipoItem': it['tipoItem'],
         'peso': it.get('peso', 0), 'ranuras': it.get('ranuras', 0)}
    if es_arma or it.get('tipoDado'):
        o['tipoDado'] = it.get('tipoDado', 0)
        o['danoFijo'] = it.get('danoFijo', 0)
        if it.get('danoAmplificado'): o['danoAmplificado'] = it['danoAmplificado']
        if it.get('armaDeRango'): o['armaDeRango'] = True
        efs = normalizar_efectos(it.get('efectosGolpe'))
        if es_arma and efs: o['efectosGolpe'] = efs
    o['precioCompra'] = it.get('precioCompra', 0)
    if es_cons: o['unidades'] = it.get('unidades') or 1
    if it.get('cargaMax'): o['cargaMax'] = it['cargaMax']
    if it.get('pilaInfinita'): o['pilaInfinita'] = True
    if it.get('trampaDatos'): o['trampaDatos'] = it['trampaDatos']
    o['consumible'] = bool(es_cons)
    if it.get('legacy'): o['legacy'] = True
    o['curahp'] = it.get('curahp', 0)
    if it.get('curabonosPct'): o['curabonosPct'] = it['curabonosPct']
    if _t(it.get('efectoNombre')):
        o['efectoNombre'] = _t(it['efectoNombre'])
        for k in ('efectoTurnos', 'efectoHpTurno'):
            if it.get(k): o[k] = it[k]
        if it.get('efectoPermanente'): o['efectoPermanente'] = True
        if _t(it.get('efectoDetalle')): o['efectoDetalle'] = _t(it['efectoDetalle'])
        if it.get('efectoMods'): o['efectoMods'] = [{'stat': m['stat'], 'val': m['val']} for m in it['efectoMods']]
        if _t(it.get('efectoPreset')): o['efectoPreset'] = _t(it['efectoPreset'])
    if _t(it.get('equipoEstadoNombre')):
        o['equipoEstadoNombre'] = _t(it['equipoEstadoNombre'])
        if it.get('equipoEstadoHpTurno'): o['equipoEstadoHpTurno'] = it['equipoEstadoHpTurno']
        if _t(it.get('equipoEstadoDetalle')): o['equipoEstadoDetalle'] = _t(it['equipoEstadoDetalle'])
        if _t(it.get('equipoEstadoPreset')): o['equipoEstadoPreset'] = _t(it['equipoEstadoPreset'])
    o['mods'] = [{'stat': m['stat'], 'val': m['val']} for m in (it.get('mods') or [])]
    o['detalle'] = _t(it.get('detalle'))
    if _t(it.get('descripcionNarrativa')): o['descripcionNarrativa'] = _t(it['descripcionNarrativa'])
    if it.get('rerollMoneda'): o['rerollMoneda'] = True
    return o
