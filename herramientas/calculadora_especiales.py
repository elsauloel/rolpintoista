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
# Varitas y báculos (dueño, 2026-10-07): las VARITAS no crecen con el nivel (dado fijo, daño directo —también en área—, sirven a cualquiera);
# los BÁCULOS son de magos: daño especial «común» que suma Ef.Esp (½ a un objetivo, ¼ en área) y lo frena la Defensa especial.
# La clase de daño (dueño, 2026-10-07, P169: existe la Defensa especial). Lo que frena una defensa vale como un arma física (×1): el físico
# invocado (la Defensa) y el daño especial normal — el que suma el Ef.Esp, las áreas, las zonas, los báculos (la Defensa especial, y su Res. si es
# elemental). El DAÑO DIRECTO (proyectiles chicos, `directo: True`) ignora la Defensa especial: el elemental todavía choca con su Res. (×1,3); el
# arcano no tiene resistencia (×1,4). El TRUE DAMAGE no lo frena nada (×1,5; muy controlado). Antes (2026-10-05): arcano 1,5 · elemental 1,4 · tóxico 1,25.
MULT_DANO = {'fisico': 1.0, 'toxico': 1.0, 'elemental': 1.0, 'arcano': 1.0}
MULT_DIRECTO = {'arcano': 1.4, 'elemental': 1.3, 'toxico': 1.3, 'fisico': 1.0}
MULT_TRUE = 1.5
def mult_dano(a):
    clase = a.get('clase', 'arcano')
    if a.get('true'): return MULT_TRUE
    if a.get('directo'): return MULT_DIRECTO.get(clase, 1.0)
    return MULT_DANO.get(clase, 1.0)
# Sumar el Especial (báculos y lo que lo diga): con la Defensa especial (2026-10-07) el Ef.Esp es la Fuerza de la magia — no se cobra, como la
# Fuerza del arma física, porque la Defensa especial lo compensa. Un daño que suma el Ef.Esp nunca es directo.
EF_ESP_REF = 4   # el Ef.Esp de alguien que no es mago (para mostrar cuánto pega)
# El Ef.Esp de un MAGO de nivel 1 (reparto del asistente: Especial 14). Los báculos lo suman y SÍ se cobra (2026-10-07, calibrado con la
# simulación mago contra guerrero en el mapa: con ½ el mago ganaba el 92-98 %; con ¼, el 40-55 %, que es lo buscado). ¼ de 14 = +3.
EF_ESP_MAGO = 14
# La forma: cuántos objetivos alcanza en promedio (un área, además, le cuesta No2 al que la esquiva con dodge roll).
FORMA = {'frente3x5': 1.75, 'trampa': 0.75, 'linea4': 1.3, 'uno': 1.0, 'cadena': 1.4, 'linea': 1.2, 'cono': 1.3, 'flor1': 1.5, 'flor2': 2.0}   # un área suele alcanzar 1 o 2 rivales; 3 es raro (dueño, 2026-10-07)
# Efectos: los mismos pesos de las armas físicas (PESO_EFECTO), más los de control que las armas físicas no tienen (en No2 o turnos que le hace perder).
PESO_EXTRA = {'Silencio': 3.0, 'Atraer': 1.5, 'Marca': 1.0, 'Luz': 1.0, 'Muro': 2.5, 'Daño 1': 1.0, 'Daño 1d4': 2.5, 'Brea': 3.5,
              'Lento': 2.0, 'Sentado': 3.0, 'Inmovilizado': 3.5, 'Escarcha': 2.5, 'Parálisis': 4.0, 'Empuje': 1.5, '-2 PdG': 2.0,
              'Niebla': 2.0, 'Marca +1 PdG': 1.0, 'Revela': 1.5, 'Cura': 1.0, 'Escudo': 0.8, 'Sigilo': 2.0,
              'Portal': 4.0,   # Portal (2026-10-05, dueño): «cuenta como hacerle perder un No2» = la Demora de las armas físicas (4)
              # Buena calidad (2026-10-07, borradores de Claude):
              'Ceguera': 3.0, 'Confusión': 3.5, 'Desarme': 3.0, '-2 Def': 2.0, 'Maldición': 1.5, 'Drena SP': 1.5, 'Quita estado': 3.0,
              'Daño 1d4 paso': 2.5, 'SP de vuelta': 1.0, 'Luz flotante': 2.5,
              'Blink': 8.0,    # el dueño: «debe ser costoso» → 3 SP en Buena
              'Portal doble': 5.0}   # Portal (2026-10-05, dueño): «cuenta como hacerle perder un No2» = la Demora de las armas físicas (4)
# Un terreno (zona) vale su efecto por cada turno que dura, pero solo si alguien lo pisa: × TERRENO por turno.
TERRENO = 0.6
# El tamaño de la zona sí cuenta, pero poco: una flor tapa más que una casilla (más chances de que alguien la pise o la use).
TERRENO_FORMA = {'uno': 1.0, 'linea': 1.2, 'linea4': 1.3, 'flor1': 1.3, 'cono': 1.2, 'flor2': 1.6}
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
ESCALA_SP = [(5.0, 1), (6.0, 2), (7.5, 3), (9.5, 4), (11.5, 5), (99, 6)]   # Común llega a 4. Hasta 5 → 1 SP (2026-10-07: la varita base, 1d6 directo, cuesta 1 SP según la simulación)
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


# Cómo se evita (dueño, 2026-10-07): un proyectil (y el relámpago) con Evasión, y si ganás no te pasa nada; un rayo (haz) o un área con Evasión
# y además hay que SALIR con el dodge roll, pagando el movimiento: vale ×1,15. Lo que no se esquiva (Res.Esp) y lo que se coloca, ×1.
ESQUIVE = {'evasion': 1.0, 'dodge': 1.15, 'resesp': 1.0, 'no': 1.0}
FORMAS_DODGE = {'flor1', 'flor2', 'cono', 'linea', 'linea4', 'frente3x5'}
def esquive_de(a):
    if a.get('esquive'): return a['esquive']
    return 'dodge' if a.get('forma') in FORMAS_DODGE and (a.get('dado') or a.get('efectos')) else 'evasion'


def valor_uso(a):
    d = {}
    clase = a.get('clase', 'arcano')
    # `fijo`: un número fijo que suma el arma (2026-10-07, dueño: hasta resolver P169, ninguna arma especial suma el Ef.Esp; el daño es fijo, en
    # dados o en valores netos). En lo físico invocado (`fuerza`), el fijo hace de la Fuerza del arma física: no se cobra, porque lo frena la Defensa.
    assert not (a.get('sumaEspecial') and (a.get('directo') or a.get('true'))), 'un daño que suma el Ef.Esp nunca es directo: ' + a.get('nombre', '')
    esp = math.floor(EF_ESP_MAGO * float(a['sumaEspecial'])) if a.get('sumaEspecial') else 0   # el ¼ del Ef.Esp de un mago (+3), cobrado
    d['daño'] = (dado_prom(a.get('dado')) + a.get('fijo', 0) + esp) * mult_dano(a) * a.get('golpes', 1)
    ef = 0.0
    for nombre, prob in (a.get('efectos') or {}).items():
        ef += peso_efecto(nombre) * prob
    d['efectos'] = ef
    if a.get('terreno'):
        n, turnos = a['terreno']
        d['terreno'] = peso_efecto(n) * turnos * TERRENO
    terreno = d.pop('terreno', 0.0)   # el terreno vale por la zona, no por cuántos hay adentro: no se multiplica por la forma (2026-10-05)
    d['valor'] = sum(d.values()) * FORMA.get(a.get('forma', 'uno'), 1.0) * ESQUIVE[esquive_de(a)] + terreno * TERRENO_FORMA.get(a.get('forma', 'uno'), 1.0)   # el terreno queda: no se esquiva
    d['terreno'] = terreno
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
    {'nombre': 'Varita arcana: 1d6 directo (la base, 2026-10-07: 1d4 quedaba muy flojo en la simulación)', 'clase': 'arcano', 'dado': '1d6', 'directo': True},
    {'nombre': 'Varita arcana mayor: 1d8 directo', 'clase': 'arcano', 'dado': '1d8', 'directo': True},
    {'nombre': 'Varita de misiles: 2 misiles de 1d4, a uno o a dos rivales', 'clase': 'arcano', 'dado': '1d4', 'golpes': 2, 'sp': 2, 'directo': True},
    {'nombre': 'Varita de chispa eléctrica: 1d6 de rayo, salta 2 veces (la mitad cada salto), 10 % Parálisis al primero', 'clase': 'elemental', 'dado': '1d6', 'forma': 'cadena', 'efectos': {'Parálisis': 0.10}, 'directo': True},
    {'nombre': 'Varita láser: 1d6 arcano a todos en una línea recta de 4 (atraviesa)', 'clase': 'arcano', 'dado': '1d6', 'forma': 'linea4', 'directo': True},
    {'nombre': 'Varita de la fogata: 1d4 de fuego en flor; deja la flor incendiada 2 turnos', 'clase': 'elemental', 'dado': '1d4', 'forma': 'flor1', 'terreno': ('Daño 1', 2), 'esquive': 'no', 'directo': True},
    {'nombre': 'Varita del soplo de fuego: cono de 2, 1d4 de fuego, 25 % quemar', 'clase': 'elemental', 'dado': '1d4', 'forma': 'cono', 'efectos': {'Prende fuego': 0.25}, 'sp': 1, 'directo': True},
    {'nombre': 'Varita de la bola de fuego: estalla en flor, 1d4 de fuego y deja fuego 1 turno', 'clase': 'elemental', 'dado': '1d4', 'forma': 'flor1', 'terreno': ('Daño 1', 1), 'sp': 2, 'directo': True},
    {'nombre': 'Varita de la púa de hielo: lanza de hielo física T4, 2d4 + 3 − Defensa (critica), 33 % Escarcha', 'clase': 'fisico', 'dado': '2d4', 'fuerza': 3, 'efectos': {'Escarcha': 1 / 3}},
    {'nombre': 'Varita del canto rodado: piedrazo físico T10 (contundente), 1d10 + 3 − Defensa (critica), 25 % Demora', 'clase': 'fisico', 'dado': '1d10', 'fuerza': 3, 'efectos': {'Demora': 0.25}},
    {'nombre': 'Varita de granizo: flor física T4, 1d4 + 3 − Defensa a cada uno, 25 % Escarcha', 'clase': 'fisico', 'dado': '1d4', 'fuerza': 3, 'forma': 'flor1', 'efectos': {'Escarcha': 0.25}},
    {'nombre': 'Varita de lluvia ácida: flor, 1d4 de ácido, 50 % Armadura rota', 'clase': 'elemental', 'dado': '1d4', 'forma': 'flor1', 'efectos': {'Rompe armadura': 0.5}, 'sp': 2, 'directo': True},
    {'nombre': 'Varita de miasma: nube tóxica de 1 turno en flor; Ef.Esp contra Res.Esp, el que no resiste recibe 1d4 + 1', 'clase': 'toxico', 'dado': '1d4', 'fijo': 1, 'forma': 'flor1', 'esquive': 'no', 'directo': True},
    {'nombre': 'Varita de la pelea cercana: 1d10 arcano, −1 por cada casillero de distancia después del primero (al lado, entero)', 'clase': 'arcano', 'dado': '1d10', 'efectos': {'Daño 1': -2.0}, 'directo': True},
    {'nombre': 'Varita del chorro de ácido: proyectil (se esquiva con Evasión); si pega, Armadura rota segura y 1d4 de ácido', 'clase': 'elemental', 'dado': '1d4', 'efectos': {'Rompe armadura': 1.0}, 'directo': True},
    # — daño leve con control —
    {'nombre': 'Varita del destello: flor, 1d4, 20 % Pajaritos', 'clase': 'arcano', 'dado': '1d4', 'forma': 'flor1', 'efectos': {'Pajaritos': 0.20}, 'directo': True},   # 25 % → 20 % con el dodge (2026-10-07), para seguir en 4 SP
    {'nombre': 'Varita del susurro: 1d6 arcano (no se esquiva: PdG.Esp contra Res.Esp), 25 % Silencio', 'clase': 'arcano', 'dado': '1d6', 'efectos': {'Silencio': 0.25}, 'directo': True},
    {'nombre': 'Varita del gancho: lazo arcano, 1d4 y lo atrae 2 (se resiste con Fuerza contra tu Ef.Esp)', 'clase': 'arcano', 'dado': '1d4', 'efectos': {'Atraer': 1.67 * 0.6}, 'directo': True},
    {'nombre': 'Varita del rastreador: 1d4 y lo marca 3 turnos (no puede entrar en sigilo ni ocultarse; se lo ve a través de la niebla)', 'clase': 'arcano', 'dado': '1d4', 'efectos': {'Marca': 3.0}, 'directo': True},
    # — terreno y colocar —
    {'nombre': 'Varita del aceite: flor de aceite, 2 turnos (Sentado al entrar)', 'clase': 'arcano', 'terreno': ('Sentado', 2), 'forma': 'flor1', 'sp': 1},
    {'nombre': 'Varita de telaraña: línea de 3, 2 turnos, como la Brea', 'clase': 'arcano', 'terreno': ('Brea', 2), 'forma': 'linea', 'sp': 1},
    {'nombre': 'Varita de la ventisca: flor, 1d4 de hielo y el suelo resbala 1 turno', 'clase': 'elemental', 'dado': '1d4', 'forma': 'flor1', 'terreno': ('Sentado', 1), 'directo': True},
    {'nombre': 'Varita de espinas: línea de 3, 3 turnos, 1d4 al pasar', 'clase': 'arcano', 'terreno': ('Daño 1d4', 3), 'forma': 'linea', 'sp': 1},
    {'nombre': 'Varita de la runa: trampa oculta, 2d4 arcano al pisarla (Evasión contra tu Ef.Esp: la mitad); se detecta con Percepción contra tu Ef.Esp', 'clase': 'arcano', 'dado': '2d4', 'forma': 'trampa', 'directo': True},
    {'nombre': 'Varita de niebla: flor de niebla, 3 turnos (no se ve a través ni se apunta adentro desde afuera; adentro se ve a 1)', 'clase': 'arcano', 'terreno': ('Niebla', 3), 'forma': 'flor1', 'sp': 1},
    {'nombre': 'Varita de los pilares: 2 pilares de 1 casilla donde quieras (dentro del alcance), 3 turnos', 'clase': 'arcano', 'terreno': ('Muro', 3), 'forma': 'uno'},
    # — apoyo —
    {'nombre': 'Varita de la luz: radio 3 hasta el final del turno; revela sigilo y trampas, y al que revela lo deja marcado 3 turnos', 'clase': 'arcano', 'efectos': {'Luz': 1.5, 'Revela': 1.0, 'Marca': 3.0 * 0.3}},
    {'nombre': 'Varita del portal: trampa de portal oculta, lleva a quien la pisa a la casilla que marcaste (a 4 o menos; Res.Esp contra 7)', 'clase': 'arcano', 'efectos': {'Portal': 1.0}, 'forma': 'trampa'},
    {'nombre': 'Varita de cura: 1d10 a un aliado', 'clase': 'arcano', 'efectos': {'Cura': 5.5}, 'sp': 1},
    # — báculos (suman Especial; también una vez por turno) —
    {'nombre': 'Báculo de aprendiz (1 mano, peso 1): 1d4 + ¼ Ef.Esp (daño especial: lo frena la Defensa especial)', 'clase': 'arcano', 'dado': '1d4', 'sumaEspecial': 0.25},   # dueño 2026-10-07: «me parece caro»
]
# Buena calidad (2026-10-07, dueño: opción (c) de P168: lo nuevo, y la escala de SP corrida un escalón; tope: 4 SP = un tiro de hasta 11,5).
# Daño fijo (en dados o neto): ninguna suma el Ef.Esp hasta resolver P169. `sp`: SP fijo puesto a mano (con su porqué).
TOPE_BUENA = 11.5
BUENA = [
    # — daño —
    {'nombre': 'Varita arcana superior: 2d6 arcano directo', 'clase': 'arcano', 'dado': '2d6', 'directo': True},
    {'nombre': 'Varita de los misiles mayores: 3 misiles de 1d4, repartidos como quieras', 'clase': 'arcano', 'dado': '1d4', 'golpes': 3, 'directo': True},
    {'nombre': 'Varita del relámpago: 1d8 de rayo, salta según el número (8 → 4 → 2 → 1), 15 % Parálisis al primero', 'clase': 'elemental', 'dado': '1d8', 'forma': 'cadena', 'efectos': {'Parálisis': .15}, 'directo': True},
    {'nombre': 'Varita de la flor de chispas: flor, 1d4 de rayo y 10 % Parálisis a cada uno', 'clase': 'elemental', 'dado': '1d4', 'forma': 'flor1', 'efectos': {'Parálisis': .10}, 'directo': True},
    {'nombre': 'Varita láser larga: rayo en línea de 6, 1d8 al primero y 1 menos a cada uno de los siguientes', 'clase': 'arcano', 'dado': '1d7', 'forma': 'linea4', 'directo': True},
    {'nombre': 'Varita de la bola de fuego mayor: flor grande (radio 2), 1d4 de fuego; el fuego queda 1 turno', 'clase': 'elemental', 'dado': '1d4', 'forma': 'flor2', 'terreno': ('Daño 1', 1), 'directo': True},
    {'nombre': 'Varita de la ráfaga helada: frente de 3×3, 1d2 de hielo, empuja 2', 'clase': 'elemental', 'dado': '1d2', 'forma': 'flor1', 'efectos': {'Empuje': 1.67}, 'directo': True},
    {'nombre': 'Varita de la lluvia de cascotes: flor física T10, 1d6 + 3 − Defensa a cada uno (critica), 25 % Sentado', 'clase': 'fisico', 'dado': '1d6', 'fuerza': 3, 'forma': 'flor1', 'efectos': {'Sentado': .25}},
    {'nombre': 'Varita de la ponzoña: PdG.Esp contra Res.Esp; 1d4 tóxico y Veneno', 'clase': 'toxico', 'dado': '1d4', 'efectos': {'Envenenar': 1.0}, 'esquive': 'resesp', 'directo': True},
    {'nombre': 'Varita del chorro de lava: camino libre de 4 (cada casilla pegada a la anterior; la primera a 1/3 de tu Rango de casteo), 1d4 de fuego a todos; arde 2 turnos', 'clase': 'elemental', 'dado': '1d4', 'forma': 'linea4', 'terreno': ('Daño 1d4', 2), 'directo': True},
    {'nombre': 'Varita inestable: 2d6 arcano; si sale algún 1 (31 %), te hacés 1d4', 'clase': 'arcano', 'dado': '2d6', 'sp': 3, 'directo': True},   # el riesgo la abarata un SP (dueño)
    # — terreno y espacio —
    {'nombre': 'Varita del campo de estática: flor 2 turnos, 1d4 de rayo por cada paso adentro', 'clase': 'elemental', 'terreno': ('Daño 1d4 paso', 2), 'forma': 'flor1'},
    {'nombre': 'Varita del muro de fuego: línea de 3, 3 turnos, 1d4 de fuego al entrar o seguir (piso y aire)', 'clase': 'elemental', 'terreno': ('Daño 1d4', 3), 'forma': 'linea'},
    {'nombre': 'Varita del muro: muro de 3 casillas en línea, 3 turnos', 'clase': 'arcano', 'terreno': ('Muro', 3), 'forma': 'linea'},
    {'nombre': 'Varita del vendaval: cono que empuja 2 a todos; apaga el fuego y despeja la niebla que toca', 'clase': 'arcano', 'forma': 'cono', 'efectos': {'Empuje': 1.67}},
    {'nombre': 'Varita del blink: te teletransportás hasta 3 casillas (o llevás a un aliado que ves); una vez por turno', 'clase': 'arcano', 'efectos': {'Blink': 1}},
    {'nombre': 'Varita del portal doble: dos portales a la vista por 2 turnos, solo para tu bando', 'clase': 'arcano', 'efectos': {'Portal doble': 1}},
    {'nombre': 'Varita de la luz flotante: luz de radio 2 en una casilla, 3 turnos, revela lo oculto', 'clase': 'arcano', 'terreno': ('Luz flotante', 3), 'forma': 'flor1'},
    # — daño leve con control o debilitar —
    {'nombre': 'Varita del eclipse: 1d6, 25 % Ceguera (estado nuevo)', 'clase': 'arcano', 'dado': '1d6', 'efectos': {'Ceguera': .25}, 'directo': True},
    {'nombre': 'Varita del embrollo: 1d4, 25 % Confusión', 'clase': 'arcano', 'dado': '1d4', 'efectos': {'Confusión': .25}, 'directo': True},
    {'nombre': 'Varita del manotazo: 1d6, 33 % Desarme (estado nuevo)', 'clase': 'arcano', 'dado': '1d6', 'efectos': {'Desarme': 1 / 3}, 'directo': True},
    {'nombre': 'Varita de raíces: brotan en su casilla, 1d4, 33 % Inmovilizado', 'clase': 'arcano', 'dado': '1d4', 'efectos': {'Inmovilizado': 1 / 3}, 'esquive': 'dodge', 'directo': True},
    {'nombre': 'Varita de la grieta: 1d6 y −2 Defensa 2 turnos', 'clase': 'arcano', 'dado': '1d6', 'efectos': {'-2 Def': 2}, 'directo': True},
    {'nombre': 'Varita del maleficio: 1d4 y −1 a su Res. crítico 2 turnos (se le critica más fácil)', 'clase': 'arcano', 'dado': '1d4', 'efectos': {'Maldición': 2}, 'esquive': 'resesp', 'directo': True},
    {'nombre': 'Varita sanguijuela: 1d6 y le sacás 1 SP (lo recuperás vos)', 'clase': 'arcano', 'dado': '1d6', 'efectos': {'Drena SP': 1}, 'directo': True},
    {'nombre': 'Varita de la cosecha: 1d6 y lo marca 2 turnos; si muere marcado, recuperás 2 SP', 'clase': 'arcano', 'dado': '1d6', 'efectos': {'Marca': 2, 'SP de vuelta': .5}, 'directo': True},
    # — apoyo —
    {'nombre': 'Varita de cura mayor: 2d8 a un aliado', 'clase': 'arcano', 'efectos': {'Cura': 9}},
    {'nombre': 'Varita del escudo: Escudo especial 3 a un aliado', 'clase': 'arcano', 'efectos': {'Escudo': 3}},
    {'nombre': 'Varita de la purga: le saca un estado malo a un aliado', 'clase': 'arcano', 'efectos': {'Quita estado': 1}},
    # — báculos (dos manos; daño fijo) —
    {'nombre': 'Báculo de brasas: 1d6 + 3 de fuego, 25 % Quemadura', 'clase': 'elemental', 'dado': '1d6', 'fijo': 3, 'efectos': {'Prende fuego': .25}},
    {'nombre': 'Báculo de escarcha: 1d6 + 3 de hielo, 25 % Escarcha', 'clase': 'elemental', 'dado': '1d6', 'fijo': 3, 'efectos': {'Escarcha': .25}},
    {'nombre': 'Báculo del sabio: 1d6 + 3 arcano', 'clase': 'arcano', 'dado': '1d6', 'fijo': 3},
    {'nombre': 'Báculo de sangre: 1d6 + 3 arcano; cada uso, el 10 % de tu vida máxima (para arriba) en vez de SP', 'clase': 'arcano', 'dado': '1d6', 'fijo': 3, 'sp': 0},
    {'nombre': 'Báculo guardián: 1d4 + 2 arcano; en las manos, +1 Parry y +1 Bloqueo', 'clase': 'arcano', 'dado': '1d4', 'fijo': 2, 'extraPts': 2},
    # — otras vueltas —
    {'nombre': 'Varita de cargas (fuego): la Bola de fuego Común, 3 cargas por combate sin SP', 'clase': 'elemental', 'dado': '1d4', 'forma': 'flor1', 'terreno': ('Daño 1', 1), 'sp': 0, 'cargas': 3, 'directo': True},
    {'nombre': 'Varita gemela: Aceite o Bola de fuego (cada uso, el SP del que elegís)', 'gemela': ('Aceite', 'Bola de fuego')},
]
PRECIO_MIN_BUENA = 80   # dueño, 2026-10-07: ninguna Buena más barata que esto
def sp_buena(v):
    return max(1, sp_de(v) - 1)


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
    print('\nBuena calidad (escala de SP corrida un escalón; tope %.1f):' % TOPE_BUENA)
    print('  tiro · SP · DDE · mago/turno · no mago/turno · arma')
    pool = {a['nombre'].split(':')[0]: a for a in POOL}
    for a in BUENA:
        if a.get('gemela'):
            vs = [valor_uso(next(x for k, x in pool.items() if n.lower() in k.lower()))['valor'] for n in a['gemela']]
            v = max(vs); sp = '/'.join(str(sp_buena(x)) for x in vs); precio = max(PRECIO_MIN_BUENA, CA.redondo(precio_de(v) * 1.25))
            print(f"  {v:4.1f} · {sp} · {precio:3d} ·   —   ·   —   · {a['nombre']}"); continue
        v = valor_uso(a)['valor']
        sp = a['sp'] if 'sp' in a else sp_buena(v)
        precio = max(PRECIO_MIN_BUENA, precio_de(v) + CA.redondo(25 * a.get('extraPts', 0)))
        if a.get('cargas'): precio = CA.redondo(precio * 1.5)
        marca = '  ⚠ pasa el tope de Buena' if v > TOPE_BUENA + 1e-9 else ''
        print(f"  {v:4.1f} · {sp} · {precio:3d} · {combate(v, sp, MAGO):5.1f} · {combate(v, sp, NO_MAGO):5.1f} · {a['nombre']}{marca}")
    print('\nOrbes (otra mano, no atacan; valor a definir):')
    for n, t in ORBES: print(f'  {n}: {t}')


if __name__ == '__main__':
    main()
