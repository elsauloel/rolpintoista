#!/usr/bin/env python3
"""Compila el manual: manual-usuario/notas/*.md  ->  datos/manual.json

Cada archivo de `notas/` es un capítulo (el orden sale del prefijo numérico
del nombre: 01-empezar.md, 02-...). Adentro van varias notas, cada una con su
cabecera entre líneas `+++`:

    +++
    capitulo: Empezar a jugar          <- (solo en la primera cabecera del archivo)
    icono: 🚀
    resumen: Lo básico para arrancar.
    +++

    +++
    titulo: Nitros (No2)
    alias: [No2, Nitro, Nitros]
    tags: [recursos, combate]
    estado: confirmado                 <- confirmado | borrador | pendiente
    +++
    Texto de la nota en Markdown, con enlaces [[Otra nota]], [[Otra nota|texto]]
    y [[Otra nota#Sección]].  > [!question] Abierto  = pregunta sin resolver.

Uso:  python compilar_manual.py      (desde la carpeta herramientas o desde la raíz)
Avisa de enlaces [[...]] que no apuntan a ninguna nota (no es un error: son
las notas "por escribir", como en Obsidian).
"""
import json, re, sys, unicodedata
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
NOTAS = RAIZ / 'manual-usuario' / 'notas'
SALIDA = RAIZ / 'datos' / 'manual.json'
ESTADOS = {'confirmado', 'borrador', 'pendiente'}


def norm(s):
    s = unicodedata.normalize('NFD', str(s).lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'\s+', ' ', s).strip()


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', norm(s)).strip('-')


def parse_valor(v):
    v = v.strip()
    if v.startswith('[') and v.endswith(']'):
        return [x.strip() for x in v[1:-1].split(',') if x.strip()]
    return v


def parse_cabecera(txt):
    d = {}
    for linea in txt.strip().splitlines():
        if ':' in linea:
            k, v = linea.split(':', 1)
            d[k.strip()] = parse_valor(v)
    return d


def main():
    capitulos, notas, ids = [], [], {}
    archivos = sorted(NOTAS.glob('*.md'))
    if not archivos:
        sys.exit('No hay archivos en ' + str(NOTAS))
    for orden, arch in enumerate(archivos):
        texto = arch.read_text(encoding='utf-8').replace('\r\n', '\n')
        partes = re.split(r'(?m)^\+\+\+\n(.*?)\n\+\+\+\n', texto, flags=re.S)
        # partes = [previo, cab1, cuerpo1, cab2, cuerpo2, ...]
        cap_id = re.sub(r'^\d+-', '', arch.stem)
        cap = {'id': cap_id, 'titulo': cap_id, 'icono': '📄', 'resumen': '', 'orden': orden}
        for i in range(1, len(partes), 2):
            cab = parse_cabecera(partes[i])
            cuerpo = partes[i + 1].strip('\n')
            if 'capitulo' in cab and 'titulo' not in cab:
                cap.update({'titulo': cab['capitulo'], 'icono': cab.get('icono', '📄'), 'resumen': cab.get('resumen', '')})
                continue
            if 'titulo' not in cab:
                print('AVISO: cabecera sin titulo en', arch.name, cab)
                continue
            nid = cab.get('id') or slug(cab['titulo'])
            if nid in ids:
                sys.exit(f'Nota repetida: {nid} ({arch.name} y {ids[nid]})')
            ids[nid] = arch.name
            estado = cab.get('estado', 'borrador')
            if estado not in ESTADOS:
                print('AVISO: estado raro', estado, 'en', nid)
            alias = cab.get('alias', [])
            tags = cab.get('tags', [])
            notas.append({
                'id': nid, 'titulo': cab['titulo'],
                'alias': alias if isinstance(alias, list) else [alias],
                'tags': tags if isinstance(tags, list) else [tags],
                'estado': estado, 'capitulo': cap_id, 'cuerpo': cuerpo,
            })
        capitulos.append(cap)

    # Enlaces rotos
    indice = {}
    for n in notas:
        for clave in [n['id'], n['titulo']] + n['alias']:
            indice[norm(clave)] = n['id']
    rotos = {}
    for n in notas:
        sin_codigo = re.sub(r'`[^`\n]*`', '', re.sub(r'```.*?```', '', n['cuerpo'], flags=re.S))
        for m in re.finditer(r'\[\[([^\]\|#]+)(?:#[^\]\|]*)?(?:\|[^\]]*)?\]\]', sin_codigo.replace('\\|', '|')):
            if norm(m.group(1)) not in indice:
                rotos.setdefault(m.group(1).strip(), []).append(n['id'])

    datos = {
        'titulo': 'Manual — Rol Pintoísta',
        'actualizado': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'capitulos': capitulos,
        'notas': notas,
    }
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'Manual compilado: {len(capitulos)} capítulos, {len(notas)} notas -> {SALIDA.relative_to(RAIZ)}')
    if rotos:
        print(f'\nNotas por escribir ({len(rotos)}): enlaces [[...]] sin nota')
        for k, v in sorted(rotos.items()):
            print(f'  · {k}  (desde: {", ".join(sorted(set(v)))})')


if __name__ == '__main__':
    main()
