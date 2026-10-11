# -*- coding: utf-8 -*-
"""Calculadora de calidad, tier y precio de armas (rework del catálogo, 2026-09-25).

Precio (2026-10-03, dueño): `precio_libre(arma)` — sin bandas por tier; el valor del arma con una curva continua y un recargo por cada
efecto de más en el mismo slot (la combinación vale en sí misma). `precio(pc, tier)` queda para las herramientas viejas.

Fórmula v0 (TASAS INICIALES: se ajustan con ejemplos junto al dueño; ver docs/rework-armas.md, preguntas 8 a 10).
Unidad: 1 PUNTO DE CALIDAD (PC) = 1 punto de daño esperado por ataque.

  PC = daño esperado                 Peso × (Tipo + 1) / 2 + daño fijo
     + bonos                         cada +1 a un stat × su tasa (TASA_STAT)
     + efectos al golpear            Σ peso del efecto × probabilidad × K_EFECTO × modulación por familia × escala propia
     + crítico mejorado              puntos de Crítico frecuente / potente / Ignora N × PESO_CRIT × K_EFECTO
     − peso del arma                 relevancia intermedia (TASA_PESO por punto de Peso)

  Tier = por umbrales de PC (UMBRAL_TIER). Precio = interpolación dentro de la banda del tier, redondeado a números redondos.
  Si el arma tiene MÁS poder del que admite su tier asignado (p. ej. una Común con poder de Buena calidad), el precio sube ×1,5 por cada
  tier de exceso (SOBREPRECIO): el precio compensa (regla de "calidad–precio" del dueño).

Uso:
  python calculadora_armas.py calibrar      # cómo caen las 137 armas actuales (tier actual vs calculado)
  python calculadora_armas.py ejemplos      # ejemplos por tier con puntaje y precio nuevos
  python calculadora_armas.py arma NOMBRE   # detalle de una arma del catálogo actual
  python calculadora_armas.py auditoria     # escribe datos/auditoria-armas-datos.json (los datos de la herramienta de auditoría datos/auditoria-armas.html)
  python calculadora_armas.py hoja          # escribe docs/rework-armas-revision.md (para marcar conservar / reajustar / descartar)
"""
import json, math, sys, pathlib, collections

RAIZ = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from catalogo_comun import leer_catalogo   # el catálogo de fábrica: comun/catalogo.js (desde 2026-09-29)

# ---------------------------------------------------------------- tasas (a ajustar)
K_EFECTO = 1.0            # PC por punto de peso de efecto al 100 %
PESO_CRITPOT = 0.4       # el Crítico POTENTE vale ~0,4 de un punto de Frecuente (calculado con el multiplicador esperado del d20, ver docs/rework-armas.md)
PESO_CRIT = 3.0           # peso de 1 punto de Crítico frecuente / potente / Ignora 1
TASA_PESO = 0.2           # PC que resta cada punto de Peso del arma (relevancia intermedia)
TASA_STAT = {'pdg': 3.5, 'pdgcontra': 0.8, 'pdgopor': 0.8, 'dmg': 1.0, 'parry': 1.0, 'bloqueo': 1.0, 'eva': 1.0, 'rng': 0.75, 'ini': 0.5, 'nitros': 4.0, 'esp': 1.0}
TASA_STAT_DEFECTO = 1.0
RANGO_TOPE = {'Común': (3, 4), 'Buena Calidad': (4, 5), 'Raro': (5, 6), 'Excepcional': (6, 7), 'Legendario': (8, 8)}   # Rango de las armas de rango por tier: (mínimo, máximo); vale 0,75 PC por punto (la identidad de la familia)
ALCANCE_PRIMERO = 3.0     # PC del primer punto de Alcance de un arma cuerpo a cuerpo (pegar sin estar adyacente); el 'rng' de las armas de rango es su identidad y va aparte (0,5)
ALCANCE_EXTRA = 1.0       # PC de cada punto de Alcance siguiente
UMBRAL_TIER = [('Común', 0), ('Buena Calidad', 7.5), ('Raro', 11), ('Excepcional', 17), ('Legendario', 26)]
BANDA_PRECIO = {'Común': (20, 80), 'Buena Calidad': (80, 160), 'Raro': (150, 350), 'Excepcional': (400, 900), 'Legendario': (1000, 2000)}
SOBREPRECIO = 1.5
# Arcos (2026-10-09, docs/balance-combate.md): un arco necesita más dados que un arma cuerpo a cuerpo para rendir lo mismo (suma solo la mitad
# del Dmg y su crítico choca con la resistencia más abundante). Su daño se cobra a este factor: así la escalera medida con balance_combate.py
# (Común 1d4+1…2d4 / 1d6…1d6+1, Buena 3d4+1…3d4+2 / 2d6+2…3d6, Rara 4d4+2 / 3d6+2…4d6) cae en su calidad y deja lugar para bonos.
DESCUENTO_ARCO = 0.7
# Ballestas (2026-10-10, docs/rework-armas-rango.md): no suman Dmg; su daño fijo alto reemplaza a la Fuerza y crece con la calidad (la escalera
# medida con balance_combate.py con el cobro de la Recarga: Común 1d6+1 · Buena 2d6+4…+6 · Rara 2d6+7…+9). Se cobra al mismo factor que el arco
# (así cae en su calidad con lugar para bonos); la de asedio (Recarga 3) un poco menos por punto (un solo disparo por turno, más grande).
DESCUENTO_BALLESTA = 0.7
# Ballestas, recalibrado (2026-10-11, docs/rework-armas-rango.md «medidas de nuevo»): el daño se cobra por su promedio (dados + fijo + Perfora ×
# BAL_PERFORA_EQ) en una recta por Recarga, ajustada a lo que mide balance_ballestas.py (Shooter, blanco medio): Recarga 3 (las Comunes): 1d6+2 =
# 82 % → 6, 1d6+3 = 100 % → 7; Recarga 2 (desde Buena): 2d6+3 = 32 % → 8, 2d6+5 = 82 % → 10,4, 3d6+2 = 98 % → 10,8, 2d6+2 Perfora 3 = 106 % → 11.
BAL_DANO = {3: (1.0, 1.45), 2: (1.2, -2.85)}   # Recarga → (k, c): PC del daño = k × promedio + c
BAL_PERFORA_EQ = 1.15  # un punto de Perfora en una ballesta rinde ~1,2–1,5 de daño fijo contra el blanco medio
BAL_R2_MIN = 7.5       # una ballesta con Recarga 2 vale al menos lo de una Buena
PERFORA_VALOR = 0.8   # lo que vale cada punto de Perfora frente a +1 de daño fijo (docs/ideas-arcos-flechas.md)
PERFORA_CASA = {'punzante': 1.0, 'cortante': 1.25}   # la casa de la Perfora cuerpo a cuerpo: las dagas (Tipo 4); en las espadas (Tipo 6), habilitada (dueño, 2026-10-10)
RECARGA_FACTOR = {1: 1.0, 2: 1.0, 3: 0.9}
TIRO_ALTO_PC = 1.5            # el tiro alto (por encima de los tokens, PdG −2)
IDEAL_FACTOR = {1: 0.35, 2: 0.5, 3: 0.65}   # la distancia ideal: qué fracción de sus bonos fijos vale, según el ancho de la franja
# El valor de los bonos depende del Tipo del arma (dicho por el dueño): un bono plano (Dmg, daño fijo) rinde más en un arma barata en Nitros que en una cara:
# se normaliza al costo en Nitros del primer ataque (Tipo ÷ 2): factor = 4 / ceil(Tipo / 2) (Tipo 8 = 1). El crítico mejorado rinde más en Tipo bajo (calculado con la regla del crítico).
# Dos stats "de casa" por familia (P16, propuesta a confirmar); fuera de casa el bono cuesta ×1,25. Dmg, daño fijo y crítico valen para todas las familias (su valor ya depende del Tipo).
STATS_CASA = {'punzante': {'pdg', 'rng', 'pdgopor'}, 'cortante': {'parry', 'ini', 'pdgcontra'}, 'hacha': {'bloqueo', 'rng'}, 'contundente': {'bloqueo', 'parry'},
              'explosivo': {'rng', 'pdg'}, 'rango': {'rng', 'pdg'}, 'ballesta': {'rng', 'pdg'}}
STATS_UNIVERSALES = {'dmg', 'crit', 'critpot'}
FACTOR_CRIT = {4: 1.75, 6: 1.0, 8: 0.75, 10: 0.6, 12: 0.5}


def factor_plano(tipo):
    return 4 / max(2, math.ceil(int(tipo or 8) / 2))

ORDEN = [t for t, _ in UMBRAL_TIER]

# Pesos de los efectos (P7, cerrado) y familias (de casa / habilitado). Familia por Tipo: 4 punzante, 6 cortante, 8 hacha, 10 contundente, 12 explosivo; de rango aparte.
PESO_EFECTO = {'Rompe armadura': 4, 'Demora': 4, 'Aturdir': 5, 'Lisiado': 3, 'Sangrado': 2, 'Envenenar': 2, 'Veneno severo': 3,
               'Derribar': 3, 'Prende fuego': 3.5, 'Drena vida': 4, 'Explosión': 6, 'Rengo': 3,
               'Pajaritos': 4}   # Pajaritos (2026-10-03, dueño: de los contundentes): PdG y Evasión a la mitad 3 turnos   # Explosión: la razón de ser del Tipo 12; el peso es a radio 1, cada radio extra suma +50 %
CASA = {'ballesta': {'Rompe armadura'}, 'hacha': {'Rompe armadura'}, 'contundente': {'Demora', 'Aturdir', 'Pajaritos'}, 'punzante': {'Lisiado'}, 'cortante': {'Sangrado'}, 'explosivo': {'Explosión'}}
HABILITADO = {'Envenenar': {'hacha', 'cortante', 'punzante', 'rango', 'ballesta'}, 'Veneno severo': {'hacha', 'cortante', 'punzante', 'rango', 'ballesta'},
              'Sangrado': {'punzante', 'hacha'}, 'Lisiado': {'cortante'}, 'Rompe armadura': {'contundente'}, 'Aturdir': {'explosivo'},
              'Demora': {'explosivo'}, 'Derribar': {'contundente', 'hacha', 'explosivo', 'ballesta'}, 'Prende fuego': {'explosivo', 'rango', 'ballesta'},
              'Drena vida': {'cortante', 'punzante'}, 'Rengo': {'punzante', 'cortante'}, 'Pajaritos': {'explosivo'}}
FAMILIA_POR_TIPO = {4: 'punzante', 6: 'cortante', 8: 'hacha', 10: 'contundente', 12: 'explosivo'}
# efectos del catálogo actual que ya no existen en el diseño nuevo (no suman)
DESCARTADOS = {'Arruina armadura', 'Media armadura', 'Ignora armadura', 'Agarrar', 'Primera sangre', 'Golpes seguidos', 'Estruendo', 'Empuje'}
ALIAS = {'Knockdown': 'Demora'}


def familia(arma):
    if arma.get('armaDeRango'):
        return 'ballesta' if int(arma.get('recarga') or 0) > 0 else 'rango'   # la ballesta: su casa es Rompe armadura (2026-10-10)
    return FAMILIA_POR_TIPO.get(int(arma.get('tipoDado') or 0), 'cortante')


def modulacion(efecto, fam):
    if efecto in CASA.get(fam, ()):
        return 1.0
    if fam in HABILITADO.get(efecto, ()):
        return 1.25
    return 1.5


def probabilidad(e):
    caras, exitos = int(e.get('caras') or 1), int(e.get('exitos') or 1)
    return min(1.0, max(0.05, exitos / max(1, caras)))


def puntaje(arma):
    """Devuelve (PC total, desglose)."""
    tipo, peso, fijo = int(arma.get('tipoDado') or 0), int(arma.get('peso') or 1), float(arma.get('danoFijo') or 0)
    amp = int(arma.get('danoAmplificado') or 0)   # los dados amplificados también pegan (no pesan)
    perf = min(5.0, float(arma.get('perfora') or 0))   # Perfora N (2026-10-10): 0,8 de un punto de daño fijo por punto
    rango = bool(arma.get('armaDeRango'))
    d = {'daño': (peso + amp) * (tipo + 1) / 2 + (fijo + (PERFORA_VALOR * perf if rango else 0)) * factor_plano(tipo)}
    if perf and not rango:   # cuerpo a cuerpo: la casa de la Perfora es el Tipo 4 (dueño, 2026-10-10); en el Tipo 6, habilitada; en el resto, fuera de casa
        d['perfora'] = PERFORA_VALOR * perf * factor_plano(tipo) * PERFORA_CASA.get(familia(arma), 1.5)
    if arma.get('armaDeRango') and arma.get('arco'): d['daño'] *= DESCUENTO_ARCO
    elif arma.get('armaDeRango') and int(arma.get('recarga') or 0) > 0 and int(arma['recarga']) not in BAL_DANO: d['daño'] *= DESCUENTO_BALLESTA * RECARGA_FACTOR.get(int(arma['recarga']), 1.0)
    rcb = int(arma.get('recarga') or 0) if rango and not arma.get('arco') else 0
    if rcb in BAL_DANO:   # la ballesta (2026-10-11): el daño vale lo que rinde contra la Defensa de su calidad (medido con balance_ballestas.py)
        prom = (peso + amp) * (tipo + 1) / 2 + fijo + BAL_PERFORA_EQ * perf
        k, c = BAL_DANO[rcb]
        d['daño'] = k * prom + c
    fam = familia(arma)
    bonos = crit = 0.0
    for m in arma.get('mods') or []:
        st, v = m.get('stat'), float(m.get('val') or 0)
        if st in ('crit', 'critpot'):
            if st == 'crit':   # Frecuente: el rango no baja de 2 (Tipo 4 aprovecha 2 puntos) y su valor baja con el Tipo
                crit += min(v, max(0, tipo - 2)) * PESO_CRIT * K_EFECTO * FACTOR_CRIT.get(tipo, 1.0)
            else:              # Potente: vale menos por punto y no depende del Tipo; el doble daño llega a 1 con 6 puntos
                crit += min(v, 6) * PESO_CRIT * PESO_CRITPOT * K_EFECTO
        elif st == 'dmg':
            bonos += v * TASA_STAT['dmg'] * factor_plano(tipo)
        elif st == 'rng' and not arma.get('armaDeRango'):   # Alcance cuerpo a cuerpo: el 1.º punto deja pegar sin estar adyacente (vale mucho); los siguientes, menos
            fuera = 1.0 if 'rng' in STATS_CASA.get(fam, ()) else 1.25
            bonos += (ALCANCE_PRIMERO + max(0.0, v - 1) * ALCANCE_EXTRA) * fuera if v > 0 else v * ALCANCE_EXTRA
        else:
            fuera = 1.0 if st in STATS_UNIVERSALES or st in STATS_CASA.get(fam, ()) else 1.25
            bonos += v * TASA_STAT.get(st, TASA_STAT_DEFECTO) * fuera
    d['bonos'] = bonos
    d['crítico'] = crit
    ef = 0.0
    for e in arma.get('efectosGolpe') or []:
        if e.get('danoMagico') and e.get('dado'):   # daño mágico extra: el promedio del dado, ×1,5 porque ignora la Defensa (sin multiplicar con el crítico)
            try:
                cant, caras = str(e['dado']).lower().split('d'); ef += (int(cant or 1) * (int(caras) + 1) / 2) * 1.5
            except Exception: pass
            continue
        nombre = ALIAS.get(e.get('nombre'), e.get('nombre'))
        if nombre in DESCARTADOS or nombre not in PESO_EFECTO and not str(nombre).startswith('Ignora'):
            continue
        if str(nombre).startswith('Ignora'):   # "Ignora N de Res. crítico" ≈ N puntos de Frecuente (convención 1:1), solo si es Tipo 4/6
            try: n = int(str(nombre).split()[1])
            except Exception: n = 1
            ef += n * PESO_CRIT * K_EFECTO * probabilidad(e) * FACTOR_CRIT.get(tipo, 1.0)
            continue
        base = PESO_EFECTO[nombre]
        if nombre == 'Envenenar' and 'severo' in str(e.get('detalle', '')).lower():
            base = PESO_EFECTO['Veneno severo']
        escala = 1.0
        st = float(e.get('stacks') or 0)
        if nombre == 'Explosión' and st > 1: escala = 1 + 0.5 * (st - 1)      # radio de la Explosión (stacks): radio 2 = ×1,5; radio 3 = ×2
        if nombre == 'Rompe armadura' and st > 1: escala = 1 + 0.5 * (st - 1)      # cada stack extra de Armadura rota por golpe suma +50 %
        if nombre == 'Envenenar' and st and 'severo' not in str(e.get('detalle', '')).lower(): escala = st / 2   # el peso 2 del Veneno es a 2 stacks
        if nombre == 'Drena vida' and e.get('drenaPct'): escala = float(e['drenaPct']) / 50   # el peso 4 de Drena vida es a 50 % del daño que pasa
        if nombre == 'Sangrado' and st: escala = st / 2   # el peso 2 del Sangrado es a 2 stacks
        prob = probabilidad(e) * (P_CRITICO if e.get('soloCritico') else 1.0)   # Critical Matters: solo con un golpe crítico
        if e.get('seguroCritico') and not e.get('soloCritico'): prob = min(1.0, prob + (1 - prob) * P_CRITICO)   # con crítico entra seguro
        ef += base * escala * prob * K_EFECTO * modulacion(nombre, fam)
    if arma.get('ignoraResistCrit'):   # el campo nuevo del arma (2026-10-03): igual que el efecto viejo «Ignora N», siempre
        ef += float(arma['ignoraResistCrit']) * PESO_CRIT * K_EFECTO * FACTOR_CRIT.get(tipo, 1.0)
    d['efectos'] = ef
    es = arma.get('espalda') or {}
    if es:   # por la espalda: vale como sus bonos, pero es situacional (solo en sigilo y por atrás)
        d['por la espalda'] = ESPALDA_FACTOR * (float(es.get('pdg') or 0) * TASA_STAT['pdg'] + float(es.get('fijo') or 0) * factor_plano(tipo)
                                                 + min(float(es.get('critpot') or 0), 6) * PESO_CRIT * PESO_CRITPOT)
    # Arcos (2026-10-09): el tiro alto vale TIRO_ALTO_PC; la distancia ideal, lo que valdrían sus bonos fijos × IDEAL_FACTOR según el ancho de la franja
    # (situacional: hay que ubicarse, y eso cuesta No2). Una franja fija vale como su ancho.
    if arma.get('armaDeRango'):
        id_ = arma.get('ideal') or {}
        if id_.get('donde'):
            ancho = (int(id_.get('hasta') or 0) - int(id_.get('desde') or 0) + 1) if id_['donde'] == 'franja' else int(id_.get('ancho') or 2)
            fac = IDEAL_FACTOR.get(max(1, min(3, ancho)), 0.5)
            v = (float(id_.get('pdg') or 0) * TASA_STAT['pdg'] + min(float(id_.get('crit') or 0), max(0, tipo - 2)) * PESO_CRIT * FACTOR_CRIT.get(tipo, 1.0)
                 + min(float(id_.get('critpot') or 0), 6) * PESO_CRIT * PESO_CRITPOT + float(id_.get('fijo') or 0) * factor_plano(tipo)
                 + float(id_.get('ignora') or 0) * PESO_CRIT * FACTOR_CRIT.get(tipo, 1.0))
            d['distancia ideal'] = v * fac
        # El tiro alto: todos los arcos lo traen de base (ya está en el daño de la escalera); un arco SIN tiro alto se abarata. Otra arma de rango
        # que lo traiga, lo paga.
        if arma.get('arco') and arma.get('sinTiroAlto'):
            d['sin tiro alto'] = -TIRO_ALTO_PC
        elif not arma.get('arco') and arma.get('tiroAlto'):
            d['tiro alto'] = TIRO_ALTO_PC
    firma = (2.0 if arma.get('sinParry') else 0) + (2.0 if arma.get('oporGratis') else 0) + 3.0 * float(arma.get('ahorroNitros') or 0) + 3.0 * float(arma.get('critD20') or 0)
    # Rasgos de ballesta (2026-10-10): llega cargada ~ un disparo gratis cada dos turnos (3); apuntada: PdG que pide no moverse (la mitad de un PdG,
    # 1,75 por punto); atraviesa escudos: situacional (solo contra quien para con escudo, 1,5).
    firma += (3.0 if arma.get('cargada') else 0) + 1.75 * float(arma.get('apuntada') or 0) + (1.5 if arma.get('atraviesaEscudos') else 0)
    if arma.get('armaDeRango'):   # mecánicas de arco (2026-10-11)
        ed = arma.get('espaldaDistancia') or {}
        arc = (TENSAR_FACTOR * float(arma.get('tensar') or 0) * TASA_STAT['pdg'] + LARGO_PC.get(int(arma.get('largoAlcance') or 0), 0)
               + EMBOSCADA_FACTOR * min(float(arma.get('emboscada') or 0), max(0, tipo - 2)) * PESO_CRIT * FACTOR_CRIT.get(tipo, 1.0)
               + MATABESTIAS_FACTOR * float(arma.get('matabestias') or 0) * factor_plano(tipo)
               + MARCADO_FACTOR * float(arma.get('contraMarcado') or 0) * TASA_STAT['pdg']
               + ESPALDA_DIST_FACTOR * (float(ed.get('pdg') or 0) * TASA_STAT['pdg'] + float(ed.get('fijo') or 0) * factor_plano(tipo))
               + (AFINIDAD_PC if arma.get('afinidad') else 0)
               + CAIDA_PC.get(int(arma.get('caida') or 0), 0) + APUNTADA_FIRME_PC * float(arma.get('apuntadaFirme') or 0)
               + APOYO_FACTOR * float(arma.get('tiradorApoyo') or 0) * TASA_STAT['pdg']
               + REMATE_FACTOR * min(float(arma.get('remate') or 0), max(0, tipo - 2)) * PESO_CRIT * FACTOR_CRIT.get(tipo, 1.0)
               + (PRIMER_DISPARO_FACTOR * (tipo + 1) / 2 * factor_plano(tipo) if arma.get('primerDisparo') else 0)
               + (PUNTA_DIAMANTE_PC if arma.get('puntaDiamante') else 0) + (REMACHADORA_PC if arma.get('remachadora') else 0)
               + (RECUPERABLE_PC if arma.get('recuperable') else 0) + CARGADOR_PC * float(arma.get('cargador') or 0)
               + CARCAJ_EXTRA_PC * float(arma.get('carcajExtra') or 0))
        rc = int(arma.get('recarga') or 0)
        if rc and not arma.get('arco'):
            if arma.get('tiroRapido'): arc += TIRO_RAPIDO_FACTOR * (rc - 1) + 0.5
            elif arma.get('dobleCuerda'): arc += DOBLE_CUERDA_FACTOR * rc
        if arc: d['mecánicas de rango'] = arc
    if firma: d['firma'] = firma   # mecánicas de firma (2026-10-03): sin Parry 2 · oportunidad sin No2 2 · −1 No2 en el primero 3 · +1 d20 en el crítico 3
    dx = round(float(arma.get('durExtra') or 0)) + ((float(arma['durPorPeso']) - 3) * peso if float(arma.get('durPorPeso') or 0) > 3 else 0)
    if dx:   # Resistente ×N / Frágil ×N (2026-10-04: durabilidad total de más o de menos; antes, por punto de Peso)
        d['durabilidad'] = TASA_DUR * dx
    d['peso del arma'] = -TASA_PESO * peso
    if arma.get('tipoItem') == 'arma_2m':   # dos manos (dueño, 2026-10-03): sin segunda arma ni escudo, un poco menos de valor
        d['dos manos'] = -DESCUENTO_DOS_MANOS
    if rcb == 2 and sum(d.values()) < BAL_R2_MIN:   # Recarga 2 empieza en Buena (2026-10-11): a nivel 1 dispara dos veces y una 1d6 pelada ya rinde 103 %
        d['recarga 2 (desde Buena)'] = BAL_R2_MIN - sum(d.values())
    return sum(d.values()), d


# ---------------------------------------------------------------- precio libre (dueño, 2026-10-03)
# El precio ya NO sale de una banda por tier: sale del valor del arma (daño, crítico, durabilidad, efectos) con una curva continua, y sube
# además por COMBINACIÓN: cada cosa de más en el mismo slot tiene un valor en sí misma (sinergias), un recargo de RECARGO_COMBO por extra.
P_CRITICO = 0.25          # chance aproximada de que un golpe sea crítico (Critical Matters / «seguro si es crítico»)
ESPALDA_FACTOR = 0.3      # lo que rinde un bono por la espalda frente a uno permanente
TASA_DUR = 0.25           # PC por cada punto de durabilidad de más
DESCUENTO_DOS_MANOS = 0.75   # PC que resta usarla a dos manos (dueño, 2026-10-03: "baja un poquito el precio, no demasiado"): ~10 % del precio
PRECIO_A, PRECIO_B = 27, 0.158   # precio = A · e^(B · PC): ~40 con 2,3 PC, ~90 con 7,5, ~150 con 11, ~400 con 17, ~1650 con 26
RECARGO_COMBO = 0.10      # +10 % por cada extra después del primero
# Mecánicas de arco (2026-10-11, docs/ideas-arcos-flechas.md, segunda ronda); valen en cualquier arma de rango.
TENSAR_FACTOR = 0.3       # Tensar N: +N PdG pagando 1 No2 más: rinde ~0,3 de un PdG fijo (cuesta No2 cada vez)
LARGO_PC = {1: 1.5, 2: 1.0}   # Largo alcance −1 / −2 PdG por casillero de más (hasta 4 más): poder disparar más lejos
EMBOSCADA_FACTOR = 0.3    # Emboscada: el Crítico frecuente vale en un disparo por combate (~1 de cada 3–4)
MATABESTIAS_FACTOR = 0.35 # Matabestias: daño fijo solo contra bestias (una parte de los rivales)
MARCADO_FACTOR = 0.2      # Contra el Marcado: PdG solo contra un Marcado (hace falta marcarlo antes)
ESPALDA_DIST_FACTOR = 0.35   # Espalda a distancia: como por la espalda, pero sin sigilo (un poco más fácil de lograr)
AFINIDAD_PC = 0.75        # Afinidad elemental: +1 a cada dado elemental de las flechas especiales
# Mecánicas de ballesta (2026-10-11, docs/ideas-ballestas.md); valen en cualquier arma de rango salvo Doble cuerda y Tiro rápido (Recarga).
CAIDA_PC = {1: 1.5, 2: 1.0, 3: 0.7}   # Alcance con caída: disparar más lejos perdiendo daño por casillero de más
APUNTADA_FIRME_PC = 1.0   # por punto: +PdG si no se movió ni este turno ni el anterior (la apuntada común vale 1,75)
APOYO_FACTOR = 0.4        # Tirador de apoyo: PdG contra un rival pegado a un aliado (pasa seguido)
REMATE_FACTOR = 0.15      # Remate: Crítico frecuente contra Sentado o Inmovilizado
PRIMER_DISPARO_FACTOR = 0.3   # Primer disparo del combate: un dado más, una vez por combate
PUNTA_DIAMANTE_PC = 1.0   # Perfora +2 contra Defensa 12 o más
REMACHADORA_PC = 2.0      # Perfora +1 por golpe seguido, hasta +3
RECUPERABLE_PC = 0.5      # el virote especial que erra no se rompe
CARGADOR_PC = 0.5         # por virote especial del combate sin su No2
CARCAJ_EXTRA_PC = 0.15    # por lugar de más en el carcaj
DOBLE_CUERDA_FACTOR = 1.2   # × Recarga: el segundo disparo del turno cuesta N en vez de 2N
TIRO_RAPIDO_FACTOR = 1.5    # × (Recarga − 1), + 0,5: cada disparo más cuesta +1, no +N


def extras(arma):
    """Cuántas cosas trae el arma además del daño: cada bono, cada efecto al golpear, ignora, por la espalda, durabilidad de más."""
    n = len([m for m in arma.get('mods') or [] if float(m.get('val') or 0) and m.get('stat') != 'def'])
    n += len([e for e in arma.get('efectosGolpe') or [] if e.get('nombre')])
    n += 1 if arma.get('ignoraResistCrit') else 0
    n += 1 if arma.get('espalda') else 0
    n += 1 if float(arma.get('durPorPeso') or 0) > 3 or round(float(arma.get('durExtra') or 0)) else 0
    n += sum(1 for k in ('sinParry', 'oporGratis', 'ahorroNitros', 'critD20') if arma.get(k))
    n += 1 if float(arma.get('perfora') or 0) > 0 else 0
    n += sum(1 for k in ('cargada', 'apuntada', 'atraviesaEscudos') if arma.get(k))
    n += 1 if arma.get('armaDeRango') and not arma.get('arco') and arma.get('tiroAlto') else 0
    n += 1 if arma.get('armaDeRango') and (arma.get('ideal') or {}).get('donde') else 0
    n += sum(1 for k in ('tensar', 'largoAlcance', 'emboscada', 'matabestias', 'contraMarcado', 'espaldaDistancia', 'afinidad', 'caida', 'apuntadaFirme', 'tiradorApoyo',
                         'remate', 'primerDisparo', 'puntaDiamante', 'remachadora', 'recuperable', 'cargador', 'carcajExtra', 'dobleCuerda', 'tiroRapido') if arma.get('armaDeRango') and arma.get(k))
    return n


def precio_libre(arma):
    """(precio, PC, recargo): el precio por el valor del arma y por la combinación de efectos."""
    pc, _ = puntaje(arma)
    recargo = 1 + RECARGO_COMBO * max(0, extras(arma) - 1)
    return redondo(PRECIO_A * math.exp(PRECIO_B * pc) * recargo), pc, recargo


def tier_de(pc):
    t = ORDEN[0]
    for nombre, umbral in UMBRAL_TIER:
        if pc >= umbral:
            t = nombre
    return t


def redondo(x):
    if x < 100: paso = 5
    elif x < 300: paso = 10
    elif x < 1000: paso = 50
    else: paso = 100
    return int(round(x / paso) * paso)


def precio(pc, tier_asignado=None):
    t = tier_de(pc)
    i = ORDEN.index(t)
    lo = UMBRAL_TIER[i][1]
    hi = UMBRAL_TIER[i + 1][1] if i + 1 < len(UMBRAL_TIER) else lo + 10
    pos = 0.0 if hi == lo else min(1.0, max(0.0, (pc - lo) / (hi - lo)))
    a, b = BANDA_PRECIO[t]
    p = a + (b - a) * pos
    exceso = 0
    if tier_asignado in ORDEN:
        exceso = max(0, i - ORDEN.index(tier_asignado))
        p *= SOBREPRECIO ** exceso
    return redondo(p), t, exceso


def cargar():
    d = leer_catalogo()
    return [i for i in d if i.get('tipoItem') in ('arma_1m', 'arma_2m') and not str(i.get('id', '')).startswith('nuevo-')]   # los 'nuevo-' vienen de armas-nuevas.json (ya publicados o no)


def calibrar():
    armas = cargar()
    tabla = collections.defaultdict(lambda: collections.Counter())
    pcs = collections.defaultdict(list)
    for a in armas:
        pc, _ = puntaje(a)
        tabla[a['tier']][tier_de(pc)] += 1
        pcs[a['tier']].append(pc)
    print('Tier actual → tier calculado (cuántas armas)   [PC mín / mediana / máx]')
    for t in ORDEN:
        v = sorted(pcs[t]) or [0]
        print(f"  {t:14} {dict(tabla[t])}   [{v[0]:.1f} / {v[len(v)//2]:.1f} / {v[-1]:.1f}]")


def ejemplos(n=6):
    armas = cargar()
    por = collections.defaultdict(list)
    for a in armas:
        por[a['tier']].append(a)
    for t in ORDEN:
        print(f"\n== {t} (precio actual → nuevo) ==")
        lista = sorted(por[t], key=lambda a: puntaje(a)[0])
        paso = max(1, len(lista) // n)
        for a in lista[::paso][:n]:
            pc, d = puntaje(a)
            p, tc, ex = precio(pc, a['tier'])
            ef = ', '.join(f"{e.get('nombre')} {int(100*probabilidad(e))}%" for e in (a.get('efectosGolpe') or [])) or '—'
            print(f"  {a['nombre'][:34]:34} T{a.get('tipoDado')} P{a.get('peso')} PC {pc:5.1f} → {tc:13} ${p:>5} (antes ${a.get('precioCompra')}){' EXCESO×'+str(ex) if ex else ''}  [{ef}]")


def hoja():
    """Escribe docs/rework-armas-revision.md: las armas actuales por familia y tier, para marcar conservar / reajustar / descartar."""
    armas = cargar()
    por = collections.defaultdict(list)
    for a in armas:
        por[familia(a)].append(a)
    nombres = {'punzante': 'Punzantes (Tipo 4)', 'cortante': 'Cortantes (Tipo 6)', 'hacha': 'Hachas y pesadas (Tipo 8)', 'contundente': 'Contundentes (Tipo 10)',
               'explosivo': 'Explosivos (Tipo 12)', 'rango': 'De rango'}
    out = ['# Rework de armas — hoja de revisión del catálogo actual', '',
           'Generada por `herramientas/calculadora_armas.py hoja` (2026-09-25). Es la pregunta **P11** de [`rework-armas.md`](rework-armas.md): para cada arma actual, la decisión del dueño:',
           '**C** = conservar la idea y reajustar sus valores · **R** = reimaginar (mantener el nombre o el concepto pero cambiar lo que hace) · **D** = descartar. Se completa en la columna *Decisión*.',
           'Los valores "Nuevo" salen de la fórmula v0 (`calculadora_armas.py`) y son solo una referencia: el catálogo viejo no seguía las reglas nuevas.', '']
    for fam in ['punzante', 'cortante', 'hacha', 'contundente', 'explosivo', 'rango']:
        lista = sorted(por.get(fam, []), key=lambda a: (ORDEN.index(a['tier']), a['nombre']))
        out += [f"## {nombres[fam]} — {len(lista)} armas", '', '| Arma | Tier | Manos | Dado×Peso | Bonos | Efectos | Precio hoy | Nuevo (PC · tier · precio) | Decisión |', '|---|---|---|---|---|---|---|---|---|']
        for a in lista:
            pc, _ = puntaje(a)
            p, tc, ex = precio(pc, a['tier'])
            bonos = ', '.join(f"{m['stat']} {int(m['val']):+d}" for m in (a.get('mods') or [])) or '—'
            ef = ', '.join(f"{e.get('nombre')} {int(100 * probabilidad(e))}%" for e in (a.get('efectosGolpe') or [])) or '—'
            manos = '2' if a['tipoItem'] == 'arma_2m' else '1'
            out.append(f"| {a['nombre']} | {a['tier']} | {manos} | d{a.get('tipoDado')}×{a.get('peso')}{'+' + str(int(a.get('danoFijo') or 0)) if (a.get('danoFijo') or 0) else ''} | {bonos} | {ef} | ${a.get('precioCompra')} | {pc:.1f} · {tc} · ${p} | |")
        out.append('')
    (RAIZ / 'docs' / 'rework-armas-revision.md').write_text(chr(10).join(out), encoding='utf-8')
    print('escrito docs/rework-armas-revision.md', len(armas), 'armas')


# ---------------------------------------------------------------- reajuste de las armas ACTUALES a las reglas nuevas (propuesta automática, el dueño audita)
MAPA_EFECTOS = {'Arruina armadura': 'Rompe armadura', 'Media armadura': 'Rompe armadura', 'Primera sangre': 'Sangrado', 'Empuje': 'Demora', 'Knockdown': 'Demora'}
DESCARTAR_EFECTOS = {'Ignora armadura', 'Golpes seguidos', 'Estruendo', 'Agarrar'}
MAX_BONOS = {'Común': 1, 'Buena Calidad': 2, 'Raro': 3, 'Excepcional': 4, 'Legendario': 6}
PROB_POR_TIER = {'Aturdir': {'Raro': (1, 6), 'Excepcional': (1, 4), 'Legendario': (1, 2)}, 'Lisiado': {'Común': (1, 4), 'Buena Calidad': (1, 4), 'Raro': (1, 3), 'Excepcional': (1, 2), 'Legendario': (3, 4)}}
PROB_BAJA = {'Común': (1, 4), 'Buena Calidad': (1, 3)}   # Sangrado / Envenenar / Rompe armadura por debajo de Raro: con porcentaje
TIER_MIN = {'Aturdir': 'Raro', 'Drena vida': 'Raro', 'Veneno severo': 'Excepcional'}


def reajustar(arma):
    """Copia del arma con las reglas nuevas aplicadas + lista de cambios/avisos (texto)."""
    import copy
    from variaciones_armas import variar
    a, texto_var = variar(copy.deepcopy(arma))   # armas idénticas a otra: se les suma una variación leve
    cambios, avisos = [], []
    tipo, tier = int(a.get('tipoDado') or 0), a['tier']
    fam = familia(a)
    if tipo == 12 and not any((e.get('nombre') or '') == 'Explosión' for e in a.get('efectosGolpe') or []):
        avisos.append('Tipo 12 = efecto Explosión (regla del dueño 2026-09-26): un arma T12 sin Explosión no corresponde; rediseñar o pasarla a otro Tipo. Muy rara y circunstancial.')
    # 1) efectos
    nuevos = []
    for e in a.get('efectosGolpe') or []:
        n = e.get('nombre') or ''
        if n.startswith('Ignora') and ('crít' in n.lower() or n.startswith('Ignora 1') or n.startswith('Ignora 2')):
            if tipo in (4, 6) and ORDEN.index(tier) >= ORDEN.index('Raro'):
                nuevos.append(e)
            else:
                cambios.append(f"Quitar «{n}»: solo va en armas de Tipo 4 y 6 desde Raro"); 
            continue
        if n in DESCARTAR_EFECTOS:
            cambios.append(f"Quitar «{n}» (ya no existe en el diseño nuevo)"); continue
        if n in MAPA_EFECTOS:
            cambios.append(f"«{n}» pasa a «{MAPA_EFECTOS[n]}»"); e = dict(e, nombre=MAPA_EFECTOS[n]); n = e['nombre']
        if n in ('Aturdir', 'Lisiado') and probabilidad(e) >= 0.99:
            ce = PROB_POR_TIER.get(n, {}).get(tier)
            if ce: e = dict(e, caras=ce[1], exitos=ce[0]); cambios.append(f"«{n}» ya no es 100 %: {round(100 * ce[0] / ce[1])} % ({tier})")
        if n in ('Sangrado', 'Envenenar', 'Rompe armadura') and probabilidad(e) >= 0.99 and tier in PROB_BAJA and not (n == 'Rompe armadura' and fam == 'hacha' and False):
            ce = PROB_BAJA[tier]; e = dict(e, caras=ce[1], exitos=ce[0]); cambios.append(f"«{n}» con porcentaje ({round(100 * ce[0] / ce[1])} %) en tier {tier}")
        minimo = TIER_MIN.get(n)
        if minimo and ORDEN.index(tier) < ORDEN.index(minimo):
            avisos.append(f"«{n}» solo desde {minimo} (el arma es {tier}): decidir si sube de tier o pierde el efecto")
        if n in PESO_EFECTO and fam not in CASA and False: pass
        if n in PESO_EFECTO and n not in CASA.get(fam, ()) and fam not in HABILITADO.get(n, ()):
            avisos.append(f"«{n}» está fuera del universo de la familia ({fam}): caso excepcional, solo si es puntual")
        nuevos.append(e)
    # si después de reemplazar quedan dos efectos iguales, se deja uno (el de mayor probabilidad) y se avisa
    únicos = {}
    for e in nuevos:
        k = e.get('nombre')
        if k in únicos:
            cambios.append(f"«{k}» estaba repetido: queda uno solo")
            if probabilidad(e) > probabilidad(únicos[k]): únicos[k] = e
        else:
            únicos[k] = e
    nuevos = list(únicos.values())
    a['efectosGolpe'] = nuevos
    # 2) bonos: Frecuente hasta el rango mínimo, máx. +3 por stat (el Alcance de las de rango no cuenta), total por tier
    mods = []
    for m in a.get('mods') or []:
        m = dict(m); st, v = m['stat'], m['val']
        if st == 'crit' and v > max(0, tipo - 2):
            nv = max(0, tipo - 2)
            if nv: m['val'] = nv; cambios.append(f"Crítico frecuente +{v} → +{nv} (el rango del crítico no baja de 2: un Tipo {tipo} aprovecha {nv} puntos)")
            else: cambios.append(f"Quitar Crítico frecuente +{v} (no rinde en Tipo {tipo})"); continue
        elif st not in ('crit', 'critpot') and v > 3 and not (st == 'rng' and a.get('armaDeRango')):
            m['val'] = 3; cambios.append(f"{st} +{v} → +3 (máximo +3 por stat)")
        mods.append(m)
    if a.get('armaDeRango'):
        lo, hi = RANGO_TOPE[tier]
        for m in mods:
            if m['stat'] == 'rng' and m['val'] > hi:
                cambios.append(f"Rango +{m['val']} → +{hi} (tope de un arma de rango {tier})"); m['val'] = hi
            elif m['stat'] == 'rng' and m['val'] < lo:
                avisos.append(f"Rango +{m['val']}: un arma de rango {tier} tiene entre +{lo} y +{hi}")
    total = sum(m['val'] for m in mods if m['stat'] not in ('crit', 'critpot') and not (m['stat'] == 'rng' and a.get('armaDeRango')))
    if total > MAX_BONOS[tier]:
        avisos.append(f"Tiene {total} puntos de bonos y un {tier} admite hasta {MAX_BONOS[tier]}: recortar o subir de tier")
    a['mods'] = mods
    tope_ef = {'Común': 1, 'Buena Calidad': 1, 'Raro': 1, 'Excepcional': 2, 'Legendario': 3}[tier]
    if len(a['efectosGolpe']) > tope_ef:
        avisos.append(f"Lleva {len(a['efectosGolpe'])} efectos y un {tier} admite {tope_ef}")
    if texto_var: cambios.insert(0, texto_var)
    return a, cambios, avisos


def cargar_nuevas():
    ruta = RAIZ / 'datos' / 'armas-nuevas.json'
    return json.load(open(ruta, encoding='utf-8')) if ruta.exists() else []


def ids_procesados():
    ruta = RAIZ / 'datos' / 'auditoria-armas-procesadas.json'
    if not ruta.exists():
        return set()
    return {x['id'] for x in json.load(open(ruta, encoding='utf-8'))}


def arma_original_tier(a):
    return a['tier']


def datos_auditoria():
    """Escribe datos/auditoria-armas-datos.json: las armas con sus valores nuevos, para la herramienta datos/auditoria-armas.html."""
    out = []
    procesadas = ids_procesados()
    for a in [dict(x, _origen='catálogo actual') for x in cargar()] + [dict(x, _origen='nuevo · tanda %s' % x.get('tanda', '?')) for x in cargar_nuevas()]:
        if (a.get('id') or a['nombre']) in procesadas:
            continue
        cambios, avisos = [], []
        if a['_origen'] == 'catálogo actual':
            a, cambios, avisos = reajustar(a)   # las armas actuales se muestran ya con las reglas nuevas aplicadas
        pc, desglose = puntaje(a)
        p, tc, ex = precio(pc, arma_original_tier(a))
        out.append({
            'id': a.get('id') or a['nombre'], 'nombre': a['nombre'], 'origen': a['_origen'], 'familia': familia(a), 'tier': a['tier'],
            'manos': 2 if a['tipoItem'] == 'arma_2m' else 1, 'tipo': a.get('tipoDado'), 'peso': a.get('peso'), 'danoFijo': a.get('danoFijo') or 0,
            'rango': bool(a.get('armaDeRango')),
            'bonos': [{'stat': m['stat'], 'val': m['val']} for m in (a.get('mods') or [])],
            'efectos': [{'nombre': e.get('nombre'), 'prob': round(100 * probabilidad(e)), 'detalle': e.get('detalle', '')} for e in (a.get('efectosGolpe') or [])],
            'cambios': cambios, 'avisos': avisos, 'bonos_hoy': None,
            'precioHoy': a.get('precioCompra'), 'detalle': (a.get('detalle') or a.get('descripcionNarrativa') or '')[:220],
            'nuevo': {'pc': round(pc, 1), 'tier': tc, 'precio': p, 'exceso': ex, 'desglose': {k: round(v, 1) for k, v in desglose.items()}},
        })
    ruta = RAIZ / 'datos' / 'auditoria-armas-datos.json'
    ruta.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
    print('escrito', ruta.relative_to(RAIZ), len(out), 'armas')


def detalle(nombre):
    for a in cargar():
        if nombre.lower() in a['nombre'].lower():
            pc, d = puntaje(a)
            p, tc, ex = precio(pc, a['tier'])
            print(a['nombre'], a['tier'], '→', tc, '$', p, 'exceso', ex)
            for k, v in d.items():
                print(f"   {k:14} {v:6.2f}")
            print(f"   {'TOTAL':14} {pc:6.2f}")
            return
    print('no encontrada')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'calibrar'
    if cmd == 'calibrar': calibrar()
    elif cmd == 'ejemplos': ejemplos()
    elif cmd == 'arma': detalle(' '.join(sys.argv[2:]))
    elif cmd == 'hoja': hoja()
    elif cmd == 'auditoria': datos_auditoria()
    else: print(__doc__)
