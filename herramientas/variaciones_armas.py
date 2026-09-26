# -*- coding: utf-8 -*-
"""Variaciones para que no haya armas idénticas con distinto nombre (pedido del dueño, 2026-09-25).

Si dos armas del catálogo tienen exactamente los mismos números y efectos, una se queda como está y a la otra se le suma una variación leve
(un bono +1 o un efecto de 25 %). Clave: nombre del arma. Valor: lista de ('bono', stat, val) o ('efecto', nombre, porcentaje, detalle[, stacks]).
`variar(arma)` devuelve (arma_con_variacion, texto_del_cambio) o (arma, None) si no hay variación para ella.
"""
import copy

PROB = {100: (1, 1), 50: (2, 1), 33: (6, 2), 25: (4, 1)}
S = 'Sangrado'
SANG = lambda p: ('efecto', S, p, '%d %% de dejar Sangrado.' % p)
LIS = lambda p: ('efecto', 'Lisiado', p, '%d %% de dejar Lisiado 3 turnos.' % p)
ROMPE = lambda p: ('efecto', 'Rompe armadura', p, '%d %% de dejar 1 stack de Armadura rota.' % p)
DEM = lambda p: ('efecto', 'Demora', p, '%d %% de bajar al golpeado 1 lugar en la tabla de iniciativa (definitivo).' % p)
VEN = ('efecto', 'Envenenar', 25, '25 % de dejar Veneno (2 stacks).', 2)
B = lambda stat, v: ('bono', stat, v)

VARIACIONES = {
    # punzantes (Tipo 4)
    'Cuchillo del grumete polizón': [SANG(25)],
    'Cuchillo de cocina reconvertido': [B('pdg', 1)],
    'Punzón del ladronzuelo': [LIS(25)],
    'Estilete de práctica': [B('pdg', 1)],
    'Daga del sacrificio': [SANG(33)],
    'Daga de la viuda verde': [VEN],
    'Estileto ritual del acólito': [SANG(25)],
    'Lanza de guardia de puerta': [B('rng', 1)],
    'Honda del cazador de jabalíes': [B('ini', 1)],
    # cortantes (Tipo 6)
    'Espada de taberna': [SANG(25)],
    'Machete de chacarero': [B('ini', 1)],
    'Espada de entrenamiento': [LIS(25)],
    'Espada de alquiler oxidada': [SANG(25)],
    'Sable de abordaje': [B('ini', 1)],
    'Sable mellado del camino real': [SANG(25)],
    'Espada de recluta de la guardia': [SANG(25)],
    'Hoz ceremonial': [LIS(25)],
    'Cimitarra del contramaestre': [B('ini', 1)],
    'Espada del Jefe de los Mil Caminos': [B('parry', 1)],
    'Espada del veterano de mil batallas': [B('crit', 1)],
    'Sable de mando del capitán': [B('parry', 1)],
    'Sable del sargento': [SANG(25)],
    'Espada bastarda del Espectro': [LIS(25)],
    'Katana del cazarrecompensas': [SANG(33)],
    # hachas (Tipo 8)
    'Hacha del clan': [B('bloqueo', 1)],
    'Hachuela de leñador': [B('ini', 1)],
    'Hacha de la furia roja': [SANG(25)],
    'Hacha del Jefe de Guerra': [B('bloqueo', 1)],
    # contundentes (Tipo 10)
    'Bastón del trueno': [B('ini', 1)],
    'Mazo de carnicero': [DEM(25)],
    'Báculo del Sumo Profeta': [B('rng', 1)],
    'Báculo del inquisidor': [DEM(25)],
    'Garrote de pastor': [DEM(25)],
    'Maza': [DEM(25)],
    'garrote de hueso': [B('bloqueo', 1)],
    'Porra de guardia': [DEM(25)],
    'Maza de guardia': [B('parry', 1)],
    # de rango (en pausa: se varían igual para que no haya duplicados; se revisan con el rework de rango)
    'Ballesta de almenara': [B('pdg', 1)],
    'Ballesta de mano': [VEN],
    'Ballesta del arbusto': [B('rng', 1)],
    'Arco del rastreador': [VEN],
}


def variar(arma):
    """Devuelve (copia con la variación, texto) o (arma, None)."""
    v = VARIACIONES.get(arma.get('nombre'))
    if not v:
        return arma, None
    a = copy.deepcopy(arma)
    partes = []
    for x in v:
        if x[0] == 'bono':
            _, stat, val = x
            for m in a.setdefault('mods', []):
                if m['stat'] == stat:
                    m['val'] += val
                    break
            else:
                a['mods'].append({'stat': stat, 'val': val})
            partes.append('%s +%d' % (stat, val))
        else:
            _, nombre, pct, detalle = x[:4]
            caras, exitos = PROB[pct]
            e = {'nombre': nombre, 'caras': caras, 'exitos': exitos, 'detalle': detalle}
            if len(x) > 4:
                e['stacks'] = x[4]
            a.setdefault('efectosGolpe', []).append(e)
            partes.append('%s %d %%' % (nombre, pct))
    return a, 'Variación para que no sea idéntica a otra arma del catálogo: ' + ' · '.join(partes) + '.'
