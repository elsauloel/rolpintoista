# -*- coding: utf-8 -*-
"""Calculadora de las armas especiales (varitas y báculos) — rework mágico, 2026-10-05 (ver docs/rework-armas.md, «Armas mágicas»).

Misma unidad que la calculadora de armas físicas (herramientas/calculadora_armas.py): 1 PC = 1 punto de daño esperado por golpe.
Las armas especiales NO buscan paridad con las físicas (dueño, 2026-10-05): la calidad marca el techo y la gracia está en la variedad. Por eso
lo que se mide es el EFECTO POR TURNO, comparado con lo que hace por turno un arma física de la misma calidad (alarma, no regla):

  valor por uso  = daño (dado promedio × la clase de daño) + Especial (si lo suma) + efectos (peso × probabilidad) + terreno
                   × la forma (a uno, flor, cono, línea, cadena)
  usos por turno = con los No2 de referencia y el costo que sube de a 1 desde 2 (2, 3, 4…: dueño, 2026-10-05), sin moverse (es de rango)
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
FORMA = {'frente3x5': 2.0, 'trampa': 0.75, 'linea4': 1.5, 'uno': 1.0, 'cadena': 1.4, 'linea': 1.3, 'cono': 1.5, 'flor1': 1.75, 'flor2': 2.5}
# Efectos: los mismos pesos de las armas físicas (PESO_EFECTO), más los de control que las armas físicas no tienen (en No2 o turnos que le hace perder).
PESO_EXTRA = {'Silencio': 3.0, 'Atraer': 1.5, 'Marca': 1.0, 'Luz': 1.0, 'Muro': 2.5, 'Daño 1': 1.0, 'Daño 1d4': 2.5, 'Brea': 3.5,
              'Lento': 2.0, 'Sentado': 3.0, 'Inmovilizado': 3.5, 'Escarcha': 2.5, 'Parálisis': 4.0, 'Empuje': 1.5, '-2 PdG': 2.0,
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


COSTO_BASE, COSTO_SUBE = 1, 1   # varitas (dueño, 2026-10-05, cuarta vuelta): el No2 sube 1, 2, 3 por uso en el turno, y cada uso cuesta el SP de su
# efecto: se parte de 1d4 por 1 SP y lo más fuerte cuesta más SP (no más No2). El SP es la reserva del combate: las caras dan una ráfaga y se apagan.
# (Descartadas: 2-3-4 sin SP; 1 No2 + 1 SP con el No2 que sube — tiros chicos; una vez por turno — sin ritmo.)
# Escala del SP según la fuerza del tiro (valor por uso): hasta 4,5 → 1 SP · hasta 6 → 2 · hasta 7,5 → 3 · más → 4 (Común llega a 3).
ESCALA_SP = [(4.5, 1), (6.0, 2), (7.5, 3), (9.5, 4), (11.5, 5), (99, 6)]   # Común llega a 4 (propuesta, 2026-10-05)
def precio_de(valor):
    return CA.redondo(CA.PRECIO_A * math.exp(CA.PRECIO_B * valor))   # la curva de las armas físicas (Común: 40 a 120 DDE)


def sp_de(valor):
    return next(sp for tope, sp in ESCALA_SP if valor <= tope + 1e-9)
# Personajes de referencia para la simulación del combate (4 turnos, 7 No2): el mago y el que no es mago.
MAGO, NO_MAGO = (18, 3), (9, 1)   # (SP máximo, SP que recupera por turno): Especial 6 y Especial 3
TURNOS = 4
def combate(valor, sp_uso, quien, no2=NO2_REF, turnos=TURNOS):
    sp_max, regen = quien
    sp, total = sp_max, 0
    for t in range(turnos):
        if t: sp = min(sp_max, sp + regen)
        n, gasto = 0, 0
        while gasto + (COSTO_BASE + n * COSTO_SUBE) <= no2 and sp >= sp_uso:
            gasto += COSTO_BASE + n * COSTO_SUBE; sp -= sp_uso; n += 1
        total += n * valor
    return total / turnos
# El equivalente sin SP: cada SP se paga con 1 No2 más (2, 3, 4 No2). La calculadora mide la forma con SP (lo descuenta con TASA_SP).
SP_MIN = 1      # toda varita cuesta al menos 1 SP por uso (o su equivalente en No2)


def usos_por_turno(no2=NO2_REF, base=COSTO_BASE, sube=COSTO_SUBE):
    """Con el costo que sube: base, base + sube, base + 2·sube…"""
    n, gasto, c = 0, 0, base
    while gasto + c <= no2:
        gasto += c; n += 1; c += sube
    return n


def valor_uso(a):
    d = {}
    clase = a.get('clase', 'arcano')
    d['daño'] = dado_prom(a.get('dado')) * MULT_DANO.get(clase, 1.0) * a.get('golpes', 1)
    if a.get('sumaEspecial'):   # True = el Especial entero; un número = esa fracción (0.5 = la mitad)
        f = 1.0 if a['sumaEspecial'] is True else float(a['sumaEspecial'])
        d['Especial'] = EF_ESP_REF * f * MULT_DANO.get(clase, 1.0)
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


# ---------------------------------------------------------------- pool Común (2026-10-05, después del filtro del dueño)
# Varitas: sin Especial; tiran PdG.Esp; cuestan 2, 3, 4 No2; las de control y terreno, además SP. El control va como secundario de un daño
# leve o en área (dueño). Báculos: suman Especial (en Común, la mitad) y cuestan SP. Orbes: van en la otra mano, no atacan (valor aparte).
POOL = [
    # — daño —
    {'nombre': 'Varita arcana: 1d4 directo (el piso)', 'clase': 'arcano', 'dado': '1d4'},
    {'nombre': 'Varita arcana mayor: 1d8 directo', 'clase': 'arcano', 'dado': '1d8'},
    {'nombre': 'Varita de misiles: 2 misiles de 1d4, a uno o a dos rivales', 'clase': 'arcano', 'dado': '1d4', 'golpes': 2, 'sp': 2},
    {'nombre': 'Varita de chispa eléctrica: 1d6 de rayo, salta 2 veces (la mitad cada salto), 10 % Parálisis al primero', 'clase': 'elemental', 'dado': '1d6', 'forma': 'cadena', 'efectos': {'Parálisis': 0.10}},
    {'nombre': 'Varita láser: 1d6 arcano a todos en una línea recta de 4 (atraviesa)', 'clase': 'arcano', 'dado': '1d6', 'forma': 'linea4'},
    {'nombre': 'Varita de la fogata: 1d4 de fuego en flor; deja la flor incendiada 2 turnos', 'clase': 'elemental', 'dado': '1d4', 'forma': 'flor1', 'terreno': ('Daño 1', 2)},
    {'nombre': 'Varita del soplo de fuego: cono de 2, 1d4 de fuego, 25 % quemar', 'clase': 'elemental', 'dado': '1d4', 'forma': 'cono', 'efectos': {'Prende fuego': 0.25}, 'sp': 1},
    {'nombre': 'Varita de la bola de fuego: estalla en flor, 1d4 de fuego y deja fuego 1 turno', 'clase': 'elemental', 'dado': '1d4', 'forma': 'flor1', 'terreno': ('Daño 1', 1), 'sp': 2},
    {'nombre': 'Varita de la estaca: lanza de hielo física T4, 2d4 + Ef.Esp − Defensa (critica), 33 % Escarcha', 'clase': 'fisico', 'dado': '2d4', 'efectos': {'Escarcha': 1 / 3}},
    {'nombre': 'Varita del canto rodado: piedrazo físico T10 (contundente), 1d10 + Ef.Esp − Defensa (critica), 25 % Demora', 'clase': 'fisico', 'dado': '1d10', 'efectos': {'Demora': 0.25}},
    {'nombre': 'Varita de granizo: flor física T4, 1d4 + Ef.Esp − Defensa a cada uno, 25 % Escarcha', 'clase': 'fisico', 'dado': '1d4', 'forma': 'flor1', 'efectos': {'Escarcha': 0.25}},
    {'nombre': 'Varita de lluvia ácida: flor, 1d2 de ácido, 50 % Armadura rota', 'clase': 'elemental', 'dado': '1d2', 'forma': 'flor1', 'efectos': {'Rompe armadura': 0.5}, 'sp': 2},
    {'nombre': 'Varita de miasma: nube tóxica de 1 turno en flor; Ef.Esp contra Res.Esp, el que no resiste recibe la diferencia + 1d4', 'clase': 'toxico', 'dado': '1d4', 'forma': 'flor1', 'efectos': {'Daño 1': 2.0}},
    {'nombre': 'Varita de la pelea cercana: 1d10 arcano, −1 por cada casillero de distancia después del primero (al lado, entero)', 'clase': 'arcano', 'dado': '1d10', 'efectos': {'Daño 1': -2.0}},
    {'nombre': 'Varita del chorro de ácido: proyectil (se esquiva con Evasión); si pega, Armadura rota segura y 1d2 de ácido', 'clase': 'elemental', 'dado': '1d2', 'efectos': {'Rompe armadura': 1.0}},
    # — daño leve con control —
    {'nombre': 'Varita del destello: flor, 1d4, 25 % Pajaritos', 'clase': 'arcano', 'dado': '1d4', 'forma': 'flor1', 'efectos': {'Pajaritos': 0.25}},
    {'nombre': 'Varita del susurro: 1d6 arcano (no se esquiva: PdG.Esp contra Res.Esp), 25 % Silencio', 'clase': 'arcano', 'dado': '1d6', 'efectos': {'Silencio': 0.25}},
    {'nombre': 'Varita del gancho: lazo arcano, 1d4 y lo atrae 2 (se resiste con Fuerza contra tu Ef.Esp)', 'clase': 'arcano', 'dado': '1d4', 'efectos': {'Atraer': 1.67 * 0.6}},
    {'nombre': 'Varita del rastreador: 1d4 y lo marca 3 turnos (no puede entrar en sigilo ni ocultarse; se lo ve a través de la niebla)', 'clase': 'arcano', 'dado': '1d4', 'efectos': {'Marca': 3.0}},
    # — terreno y colocar —
    {'nombre': 'Varita del aceite: flor de aceite, 2 turnos (Sentado al entrar)', 'clase': 'arcano', 'terreno': ('Sentado', 2), 'forma': 'flor1', 'sp': 1},
    {'nombre': 'Varita de telaraña: línea de 3, 2 turnos, como la Brea', 'clase': 'arcano', 'terreno': ('Brea', 2), 'forma': 'linea', 'sp': 1},
    {'nombre': 'Varita de la ventisca: flor, 1d4 de hielo y el suelo resbala 1 turno', 'clase': 'elemental', 'dado': '1d4', 'forma': 'flor1', 'terreno': ('Sentado', 1)},
    {'nombre': 'Varita de espinas: línea de 3, 3 turnos, 1d4 al pasar', 'clase': 'arcano', 'terreno': ('Daño 1d4', 3), 'forma': 'linea', 'sp': 1},
    {'nombre': 'Varita de la runa: trampa oculta, 2d4 arcano al pisarla (Evasión contra tu Ef.Esp: la mitad); se detecta con Percepción contra tu Ef.Esp', 'clase': 'arcano', 'dado': '2d4', 'forma': 'trampa'},
    {'nombre': 'Varita de niebla: flor de niebla, 3 turnos (no se ve a través ni se apunta adentro desde afuera; adentro se ve a 1)', 'clase': 'arcano', 'terreno': ('Niebla', 3), 'forma': 'flor1', 'sp': 1},
    {'nombre': 'Varita de los pilares: 2 pilares de 1 casilla donde quieras (dentro del alcance), 3 turnos', 'clase': 'arcano', 'terreno': ('Muro', 3), 'forma': 'uno'},
    # — apoyo —
    {'nombre': 'Varita de la luz: radio 3 hasta el final del turno; revela sigilo y trampas', 'clase': 'arcano', 'efectos': {'Luz': 1.5, 'Revela': 1.0}},
    {'nombre': 'Varita de cura: 1d8 + 1 a un aliado', 'clase': 'arcano', 'efectos': {'Cura': 5.5}, 'sp': 1},
    # — báculos (suman Especial; también una vez por turno) —
    {'nombre': 'Báculo de aprendiz (1 mano): 1d4 + la mitad del Especial', 'clase': 'arcano', 'dado': '1d4', 'sumaEspecial': 0.5, 'sp': 2},
]
PARA_BUENA = [   # candidatas a calidad Buena o más
    {'nombre': 'Varita de la ráfaga helada: frente de 3 de ancho y 5 de largo, 1d4 de hielo, empuja 2, 25 % Escarcha', 'clase': 'elemental', 'dado': '1d4', 'forma': 'frente3x5', 'efectos': {'Empuje': 1.67, 'Escarcha': 0.25}},
    {'nombre': 'Báculo de brasas (2 manos): 1d6 de fuego + la mitad del Especial, 25 % quemar', 'clase': 'elemental', 'dado': '1d6', 'sumaEspecial': 0.5, 'efectos': {'Prende fuego': 0.25}, 'sp': 2},
    {'nombre': 'Báculo de sangre (2 manos): 1d6 + el Especial entero, se paga con 2 de vida', 'clase': 'arcano', 'dado': '1d6', 'sumaEspecial': True, 'sp': 0},
]
ORBES = [   # van en la otra mano y no atacan: su valor se compara con un escudo Común (a definir)
    ('Orbe de resguardo', 'Una vez por turno, al usar una varita o un báculo, Escudo especial 2 hasta tu próximo turno.'),
    ('Orbe de luz', 'Luz alrededor tuyo (radio 1) y +1 al campo de visión mientras lo llevás.'),
    ('Orbe salvaje', 'Al usar una varita, tirás 1d6: con 1 te hace 1 de daño a vos; con 6 el efecto sale doble.'),
]


def main():
    ref = referencia()
    print('Referencia física (armas rehechas, cuerpo a cuerpo; efecto por turno con %d No2 menos %d de moverse):' % (NO2_REF, MOV_CUERPO))
    for t, (pc, turno, lo, hi, n) in ref.items():
        print(f'  {t}: PC por golpe {pc:.1f} · por turno {turno:.1f} (de {lo:.1f} a {hi:.1f}) · {n} armas')
    usos = usos_por_turno()
    print(f'\nVaritas y báculos: 1, 2, 3 No2 por uso y el SP de su efecto. Combate de {TURNOS} turnos con {NO2_REF} No2; mago {MAGO[0]} SP (+{MAGO[1]}), no mago {NO_MAGO[0]} SP (+{NO_MAGO[1]})')
    print(f'  (arma física Común: ~{ref["Común"][1]:.1f} por turno, de {ref["Común"][2]:.1f} a {ref["Común"][3]:.1f}; Buena ~{ref["Buena Calidad"][1]:.1f})\n')
    print('  tiro · SP · DDE · mago/turno · no mago/turno · arma')
    for a in POOL:
        v = valor_uso(a)['valor']
        sp = 0 if a['nombre'].startswith('Báculo de sangre') else sp_de(v)
        marca = '  ⚠ más de 4 SP: no es Común' if sp > 4 else ''
        print(f"  {v:4.1f} · {sp} · {precio_de(v):3d} · {combate(v, sp, MAGO):5.1f} · {combate(v, sp, NO_MAGO):5.1f} · {a['nombre']}{marca}")
    print('\nCandidatas a Buena (se pasan del techo Común):')
    for a in PARA_BUENA:
        v = valor_uso(a)['valor']
        sp = 0 if a['nombre'].startswith('Báculo de sangre') else sp_de(v)
        print(f"  {v:4.1f} · {sp} SP · {precio_de(v)} DDE · {a['nombre']}")
    print('\nOrbes (otra mano, no atacan; valor a definir):')
    for n, t in ORBES: print(f'  {n}: {t}')


if __name__ == '__main__':
    main()
