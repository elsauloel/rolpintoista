# -*- coding: utf-8 -*-
"""Genera datos/trampas-consumibles.json: cada trampa base de comun/trampas-base.js como consumible, en tres potencias (radio 1, 2 y 3).

Pedido del dueño (2026-09-25): trampas como ítems consumibles, con variantes menos y más poderosas de área "flor" de radio 1, 2 y 3, con las distintas
mecánicas, y que en la mochila las iguales se apilen sin límite (campo `pilaInfinita`, ver ficha.html).

Potencia p = 1 (menor, radio 1) · 2 (común, radio 2) · 3 (mayor, radio 3). Las líneas (dardos, cuchillas, cable) se dan en largo 3 / 5 / 7.
  - daño: el de la trampa base en la potencia 2; ±1 dado en las potencias 1 y 3;
  - dificultades y duraciones: ±2 según la potencia (a mano, van en el texto);
  - precio: (10 + 12 × nivel) × [0,7 · 1 · 1,5], redondeado a 5.
Uso: python herramientas/generar_trampas_consumibles.py   (después, publicar_nuevos.py e importar_json.py)
"""
import json, re, pathlib, math

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SRC = RAIZ / 'comun' / 'trampas-base.js'


def leer_base():
    s = open(SRC, encoding='utf-8').read().replace('\r\n', '\n')
    cuerpo = s[s.index("\n  tr('Trampa de oso'"):s.index('window.TRAMPAS_BASE')]
    cuerpo = '\n'.join(l for l in cuerpo.split('\n') if not l.strip().startswith('//'))
    cuerpo = re.sub(r'\btrue\b', 'True', cuerpo)
    cuerpo = re.sub(r'\bfalse\b', 'False', cuerpo)
    cuerpo = re.sub(r'\{\s*nombre:', "{'nombre':", cuerpo)
    cuerpo = re.sub(r',\s*turnos:', ",'turnos':", cuerpo)
    cuerpo = re.sub(r'^\s*tr\(', 'tr(', cuerpo, flags=re.M).replace(');', ')')
    out = []

    def tr(nombre, nivel, etiquetas, tipo, tamano, color, dano, detalle, amiga=None, ignoraDef=None, estado=None):
        out.append(dict(nombre=nombre, nivel=nivel, etiquetas=etiquetas, tipo=tipo, tamano=tamano, color=color, dano=dano, detalle=detalle, amiga=amiga, ignoraDef=ignoraDef, estado=estado))
    exec(cuerpo, {'tr': tr})
    return out


FISICAS = {'Trampa de oso', 'Foso con estacas', 'Red de caza', 'Brea pegajosa', 'Aceite resbaladizo', 'Dardos envenenados', 'Cuchillas de guadaña', 'Cable de alarma',
           'Arena movediza', 'Derrumbe', 'Nube de veneno', 'Gas somnífero', 'Bomba de esporas', 'Mina explosiva', 'Barril de pólvora'}
NARR = {
    'Trampa de oso': 'Mandíbulas de hierro con resorte, armadas a ras del suelo. Se cierran con un chasquido que se oye en toda la ladera.',
    'Foso con estacas': 'Un pozo estrecho con estacas afiladas y una tapa de ramas. Cae quien confía en el suelo.',
    'Red de caza': 'Una red de cuerda gruesa con lastres, plegada y lista para caer sobre quien pase.',
    'Brea pegajosa': 'Un barril de brea densa que se derrama sobre el camino: se pega a las botas y a las ganas de seguir.',
    'Aceite resbaladizo': 'Aceite de lámpara vertido sobre las piedras. Nadie ve dónde está hasta que ya está en el suelo.',
    'Dardos envenenados': 'Una hilera de tubos con dardos untados en algo verde. Un hilo tenso hace de gatillo.',
    'Cuchillas de guadaña': 'Guadañas montadas en un eje que giran como una puerta cuando alguien pisa la placa.',
    'Cable de alarma': 'Un cable fino con cascabeles: no lastima a nadie, pero todos se enteran de que alguien pasó.',
    'Arena movediza': 'Un polvo mágico que, al ser pisado, convierte el suelo en arena que traga y retiene.',
    'Derrumbe': 'Un puntal cortado a medias que sostiene un techo de piedras. Basta un roce para que ceda.',
    'Nube de veneno': 'Una ampolla de vidrio grueso con gas verdoso. Se rompe al pisarla y no hay dónde respirar.',
    'Gas somnífero': 'Una cápsula que libera un vapor dulzón que apaga los párpados antes de que la mente se entere.',
    'Bomba de esporas': 'Una bola de hongo seco. Cuando revienta, el aire se llena de esporas que queman los pulmones.',
    'Mina explosiva': 'Un cilindro de bronce enterrado con pólvora prensada. Una sola pisada y no hay segunda.',
    'Barril de pólvora': 'Un barril pequeño, sellado con cera y enterrado a medias. No es sutil, pero es muy convincente.',
    'Llamarada': 'Un tubo de bronce con aceite y una chispa de pedernal: al pisarlo, lanza una lengua de fuego.',
    'Runa de silencio': 'Una piedra con un glifo que absorbe el sonido. Quien la pisa deja de oír su propia voz.',
    'Runa de debilidad': 'Un glifo violeta que, al ser pisado, le roba el vigor a quien lo toca.',
    'Niebla de confusión': 'Un frasco con una niebla violácea que embrolla los sentidos de quien la respira.',
    'Trampa de escarcha': 'Un cristal de hielo eterno que estalla en escarcha al contacto con un pie caliente.',
    'Descarga eléctrica': 'Una placa de cobre y un carrete de cables. Cuando alguien la pisa, el aire cruje.',
    'Succión arcana': 'Un glifo sin brillo que absorbe la energía de quien se acerca, como un sumidero.',
    'Espejo de discordia': 'Un espejo de mano puesto boca arriba, con un hechizo que vuelve a los amigos enemigos.',
    'Portal cósmico': 'Un glifo circular que, al ser pisado, abre una fisura hacia otro lugar.',
}
ESCALA_PRECIO = {1: 0.7, 2: 1.0, 3: 1.5}
SUF = {1: ' menor', 2: '', 3: ' mayor'}
GRADO = {1: 'menor', 2: 'común', 3: 'mayor'}


def redondo5(x):
    return max(5, int(round(x / 5.0)) * 5)


def hexes(r):
    return 3 * r * (r + 1) + 1


def tier_por_precio(p):
    return 'Común' if p <= 40 else 'Buena Calidad' if p <= 100 else 'Raro'


def dados(dano, p):
    m = re.match(r'(\d+)d(\d+)$', dano or '')
    if not m:
        return dano
    return '%dd%s' % (max(1, int(m.group(1)) + p - 2), m.group(2))


def slug(t):
    import unicodedata
    t = unicodedata.normalize('NFD', t)
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn').lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def main():
    items = []
    for b in leer_base():
        for p in (1, 2, 3):
            nombre = b['nombre'] + SUF[p]
            linea = b['tipo'] == 'linea'
            tamano = (3, 5, 7)[p - 1] if linea else p
            dano = dados(b['dano'], p)
            texto = b['detalle']
            if b['dano'] and dano != b['dano']:
                texto = texto.replace(b['dano'], dano)
            if not linea:
                texto = re.sub(r'flor de %d' % b['tamano'], 'flor de %d' % tamano, texto)   # el texto de las explosivas nombra su área
            precio = redondo5((10 + 12 * b['nivel']) * ESCALA_PRECIO[p])
            forma = ('línea de largo %d' % tamano) if linea else ('flor de radio %d (%d casilleros)' % (tamano, hexes(tamano)))
            detalle = ('Trampa %s: al usarla se coloca en el mapa una trampa en %s. %s' % (GRADO[p], forma, texto))
            if p != 2:
                detalle += ' Dificultades y duraciones %s.' % ('−2 respecto de la trampa común' if p == 1 else '+2 respecto de la trampa común')
            detalle += ' ⚙ Automático: al consumirla se coloca sola en el mapa, en la casilla libre al frente de tu token, con estas cifras; después la arrastrás adonde la quieras (solo la ven vos y el GM y la disparan los rivales; los aliados nunca). ✋ A mano: estados, tiradas para evitarla y lo demás que dice el texto. Se apila sin límite en la mochila.'
            datos = {'nombre': nombre[:40], 'detalle': (texto[:190]), 'amiga': bool(b['amiga'] or b['nombre'] in FISICAS), 'tipo': b['tipo'], 'tamano': tamano, 'color': b['color'], 'alfa': 45, 'dano': dano}
            if b['ignoraDef']:
                datos['ignoraDef'] = True
            if b['estado']:
                datos['estado'] = b['estado']['nombre']
                datos['estadoTurnos'] = b['estado']['turnos']
            items.append({
                'id': 'nuevo-trampa-%s-r%d' % (slug(b['nombre']), p), 'nombre': nombre, 'tier': tier_por_precio(precio), 'tipoItem': 'consumibles', 'peso': 0, 'ranuras': 1,
                'precioCompra': precio, 'detalle': detalle, 'descripcionNarrativa': NARR[b['nombre']], 'unidades': 1, 'consumible': True,
                'pilaInfinita': True, 'trampaDatos': datos,
            })
    # teleport: variante única (necesita destino)
    json.dump(items, open(RAIZ / 'datos' / 'trampas-consumibles.json', 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print(len(items), 'trampas consumibles;', sum(1 for i in items if i['tier'] == 'Común'), 'Común,', sum(1 for i in items if i['tier'] == 'Buena Calidad'), 'Buena,', sum(1 for i in items if i['tier'] == 'Raro'), 'Raro')


if __name__ == '__main__':
    main()
