# -*- coding: utf-8 -*-
"""Calculadora de las armas especiales (varitas y báculos) — rework mágico, 2026-10-05 (ver docs/rework-armas.md, «Armas mágicas»).

Misma unidad que la calculadora de armas físicas (herramientas/calculadora_armas.py): 1 PC = 1 punto de daño esperado por golpe.
Las armas especiales NO buscan paridad con las físicas (dueño, 2026-10-05): la calidad marca el techo y la gracia está en la variedad. Por eso
lo que se mide es el EFECTO POR TURNO, comparado con lo que hace por turno un arma física de la misma calidad (alarma, no regla):

  valor por uso  = daño (dado promedio × la clase de daño) + Especial (si lo suma) + efectos (peso × probabilidad) + terreno
                   × la forma (a uno, flor, cono, línea, cadena)
  usos por turno = con los No2 de referencia y el costo que sube de a 1 (1, 2, 3…: dueño, 2026-10-05), sin moverse (es de rango)
  efecto por turno = valor por uso × usos por turno          (el SP que cuesta cada uso se muestra aparte: es su freno)

  Arma física de referencia: su PC × los ataques que le dan los No2 que le quedan después de moverse (Tipo ÷ 2 el primero, Tipo los siguientes).
  La chance de acertar no se cuenta en ninguno de los dos lados: todos tiran para acertar.

TODAS LAS TASAS SON UN PRIMER BORRADOR, para ajustar con el dueño (están arriba, con su porqué).

Uso:
  python calculadora_especiales.py            # la referencia física por calidad y los borradores Comunes
"""
import math, sys, pathlib, statistics
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from catalogo_comun import leer_catalogo
import calculadora_armas as CA

# ---------------------------------------------------------------- referencia
NO2_REF = 7          # No2 de un personaje típico (Agilidad 7)
MOV_CUERPO = 2       # lo que gasta en moverse, por turno, quien pelea cuerpo a cuerpo (el de rango no se mueve: dueño, 2026-10-05)

# ---------------------------------------------------------------- tasas (borrador)
# La clase de daño (dueño, 2026-10-05): arcano > elemental > tóxico; el físico invocado es como un arma (la Defensa lo frena, critica).
MULT_DANO = {'fisico': 1.0, 'toxico': 1.25, 'elemental': 1.4, 'arcano': 1.5}
# Sumar el Especial (báculos): el daño directo que suma Especial y no contempla armadura es lo caro (dueño). Se cuenta el Ef.Esp de un personaje
# típico; la Fuerza del arma física no cuenta en su PC porque la Defensa la compensa: el Especial, en cambio, no tiene quién lo frene.
EF_ESP_REF = 4
# La forma: cuántos objetivos alcanza en promedio (un área, además, le cuesta No2 al que la esquiva con dodge roll).
FORMA = {'uno': 1.0, 'cadena': 1.4, 'linea': 1.3, 'cono': 1.5, 'flor1': 1.75, 'flor2': 2.5}
# Efectos: los mismos pesos de las armas físicas (PESO_EFECTO), más los de control que las armas físicas no tienen (en No2 o turnos que le hace perder).
PESO_EXTRA = {'Lento': 2.0, 'Sentado': 3.0, 'Inmovilizado': 3.5, 'Escarcha': 2.5, 'Parálisis': 4.0, 'Empuje': 1.5, '-2 PdG': 2.0,
              'Niebla': 2.0, 'Marca +1 PdG': 1.0, 'Revela': 1.5, 'Cura': 1.0, 'Escudo': 0.8, 'Sigilo': 2.0}
# Un terreno (zona) vale su efecto por cada turno que dura, pero solo si alguien lo pisa: × TERRENO por turno.
TERRENO = 0.6
TASA_SP = 2.0        # cuánto valor «compra» cada SP que cuesta un uso (el SP es el freno del control: dueño, 2026-10-05)


def peso_efecto(nombre):
    return CA.PESO_EFECTO.get(nombre, PESO_EXTRA.get(nombre, 0))


def dado_prom(dado):
    if not dado: return 0.0
    cant, caras = str(dado).lower().split('d')
    return int(cant or 1) * (int(caras) + 1) / 2


def usos_por_turno(no2=NO2_REF, base=1, sube=1):
    """Con el costo que sube: base, base + sube, base + 2·sube…"""
    n, gasto, c = 0, 0, base
    while gasto + c <= no2:
        gasto += c; n += 1; c += sube
    return n


def valor_uso(a):
    d = {}
    clase = a.get('clase', 'arcano')
    d['daño'] = dado_prom(a.get('dado')) * MULT_DANO.get(clase, 1.0)
    if a.get('sumaEspecial'):
        d['Especial'] = EF_ESP_REF * MULT_DANO.get(clase, 1.0)
    ef = 0.0
    for nombre, prob in (a.get('efectos') or {}).items():
        ef += peso_efecto(nombre) * prob
    d['efectos'] = ef
    if a.get('terreno'):
        n, turnos = a['terreno']
        d['terreno'] = peso_efecto(n) * turnos * TERRENO
    d['valor'] = sum(d.values()) * FORMA.get(a.get('forma', 'uno'), 1.0)
    return d


def fisica_por_turno(arma, no2=NO2_REF - MOV_CUERPO):
    tipo = int(arma.get('tipoDado') or 8)
    primero, sig = math.ceil(tipo / 2), tipo
    n, gasto, c = 0, 0, primero
    while gasto + c <= no2:
        gasto += c; n += 1; c = sig
    return CA.puntaje(arma)[0] * max(1, n), max(1, n)


def referencia():
    out = {}
    for t in ['Común', 'Buena Calidad', 'Raro']:
        L = [i for i in leer_catalogo() if i.get('tipoItem') in ('arma_1m', 'arma_2m') and i.get('tier') == t
             and not i['nombre'].startswith('⚠') and not i.get('armaDeRango')]
        turnos = [fisica_por_turno(a)[0] for a in L]
        pcs = [CA.puntaje(a)[0] for a in L]
        out[t] = (statistics.mean(pcs), statistics.mean(turnos), min(turnos), max(turnos), len(L))
    return out


# ---------------------------------------------------------------- borradores Comunes (2026-10-05, a revisar con el dueño)
# Todas: tiran PdG.Esp para acertar; costo en No2 que sube 1, 2, 3; las de control y terreno pagan además SP.
BORRADORES = [
    {'nombre': 'Varita arcana', 'clase': 'arcano', 'dado': '1d4'},
    {'nombre': 'Varita de escarcha (lanza de hielo, física T4)', 'clase': 'fisico', 'dado': '1d4', 'efectos': {'Lento': 1 / 3}},
    {'nombre': 'Varita de estática', 'clase': 'elemental', 'dado': '1d3', 'forma': 'cadena'},
    {'nombre': 'Varita de chispas', 'clase': 'elemental', 'dado': '1d2', 'forma': 'flor1'},
    {'nombre': 'Frasco de miasma', 'clase': 'toxico', 'efectos': {'Envenenar': 1.0}, 'sp': 1},
    {'nombre': 'Silbato de ráfaga', 'clase': 'arcano', 'efectos': {'Empuje': 1.0}, 'forma': 'cono', 'sp': 1},
    {'nombre': 'Varita de lodo', 'clase': 'arcano', 'terreno': ('Lento', 2), 'forma': 'linea', 'sp': 2},
    {'nombre': 'Vara de destello', 'clase': 'arcano', 'efectos': {'-2 PdG': 1.0}, 'forma': 'flor1', 'sp': 2},
    {'nombre': 'Varita de bruma', 'clase': 'arcano', 'terreno': ('Niebla', 2), 'forma': 'flor1', 'sp': 1},
    {'nombre': 'Varita de cuerdas', 'clase': 'arcano', 'efectos': {'Inmovilizado': 1.0}, 'sp': 2},
    {'nombre': 'Varita de aceite', 'clase': 'arcano', 'terreno': ('Sentado', 2), 'forma': 'flor1', 'sp': 2},
    {'nombre': 'Amuleto de la chispa vital (cura 1d4)', 'clase': 'arcano', 'efectos': {'Cura': 2.5}, 'sp': 1},
    {'nombre': 'Varita del amparo (escudo 3)', 'clase': 'arcano', 'efectos': {'Escudo': 3}, 'sp': 1},
    {'nombre': 'Campanita de vigía', 'clase': 'arcano', 'efectos': {'Revela': 1.0}, 'forma': 'flor2', 'sp': 1},
    {'nombre': 'Bastón zahorí (marca +1 PdG)', 'clase': 'arcano', 'efectos': {'Marca +1 PdG': 1.0}},
    {'nombre': 'Báculo arcano (suma Especial)', 'clase': 'arcano', 'dado': '1d4', 'sumaEspecial': True, 'sp': 2},
]


def main():
    ref = referencia()
    print('Referencia física (armas rehechas, cuerpo a cuerpo; efecto por turno con %d No2 menos %d de moverse):' % (NO2_REF, MOV_CUERPO))
    for t, (pc, turno, lo, hi, n) in ref.items():
        print(f'  {t}: PC por golpe {pc:.1f} · por turno {turno:.1f} (de {lo:.1f} a {hi:.1f}) · {n} armas')
    usos = usos_por_turno()
    print(f'\nVaritas: costo 1, 2, 3… → {usos} usos por turno con {NO2_REF} No2 (sin moverse)\n')
    techo = ref['Común'][1]
    for a in BORRADORES:
        d = valor_uso(a)
        turno = d['valor'] * usos
        sp = a.get('sp', 0)
        marca = '  ⚠ pasa la Común' if turno - sp * usos * TASA_SP > ref['Común'][3] else ''
        print(f"  {a['nombre']}: {d['valor']:.1f} por uso · {turno:.1f} por turno" + (f" · {sp} SP por uso ({sp * usos} por turno)" if sp else '') + marca)


if __name__ == '__main__':
    main()
