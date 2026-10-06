# -*- coding: utf-8 -*-
"""Calculadora de defensa (rework del catálogo defensivo, fase 3 — 2026-10-04, ver docs/rework-defensa.md).

La idea (aprobada por el dueño): cada pieza tiene un PRESUPUESTO en puntos según su parte del cuerpo y su calidad; la Defensa, las resistencias
y los demás bonos salen de la misma bolsa, cada uno con su costo (COSTO); lo malo (un bono negativo) devuelve puntos. La bolsa de un equipo completo
sale de la curva por nivel: Común ~14, Buena ~24, Rara ~34 (el tanque de nivel 1 con todo al máximo: Defensa 10 + T4 ×2 + T6 ×1 = 14).
El precio sale de los puntos (PRECIO_BASE + PRECIO_PUNTO × puntos), calibrado para que un equipo Común completo cueste ~460–520 con el arma.

Uso:
  python calculadora_defensa.py resumen            # cómo caen las piezas actuales contra su bolsa (por parte y calidad)
  python calculadora_defensa.py pieza NOMBRE       # el detalle de una pieza: puntos, bolsa, precio sugerido
  python calculadora_defensa.py equipos            # el máximo equipable por calidad contra la curva por nivel
  python calculadora_defensa.py lista [PARTE]      # todas las piezas (o las de una parte), con puntos, bolsa y precio
"""
import sys, pathlib, collections

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from catalogo_comun import leer_catalogo

# ------------------------------------------------------------ costos (dueño, 2026-10-04; se ajustan con el uso)
COSTO = {
    'def': 1, 'tipo1': 1, 'tipo2': 2, 'tipo3': 3, 'tipo4': 4, 'tipo5': 5,          # Defensa y resistencias a crítico (T4…T12)
    'eva': 2, 'ini': 1.5, 'rescc': 1,   # Iniciativa = 0,75 de la Evasión (dueño, 2026-10-04: la Evasión protege de más, también de críticos)
     'resmg': 1, 'resm': 0.5,                         # Res.Mt 0,5: los efectos que la piden son escasos
    'vision': 0.5, 'percepcion': 0.5, 'veoculto': 1,
    'luz': 0.25,   # Luz portada (dueño, 2026-10-05): muy circunstancial (solo pesa en lo oscuro) → la mitad que la Visión
    'hpmax': 0.2, 'nitros': 4, 'mov': 4,                                              # +5 vida = 1 · No2 lo más valioso (−1 Mov = −1 No2)
    'armadmg': 3,   # Armadura mágica: escasa, cara y rara — resta TODO daño mágico, arcano y elemental (dueño, 2026-10-04)
    # Cinturón y mochila (dueño, 2026-10-04/05): la ranura de cinturón baja a 0,5; la exclusiva (solo pociones, pergaminos, trampas o el Ankh) es
    # el 75 % de una común; la de mochila, 0,25 (una mochila tiene muchas).
    'capcinturon': 0.5, 'capmochila': 0.25, 'crgmax': 0.25,
    'ranurapocion': 0.375, 'ranurapergamino': 0.375, 'ranuratrampa': 0.375, 'ranuraankh': 0.375,
    'boticario': 0.2,          # Mano de boticario: +1 a lo que cura una poción (dueño, 2026-10-06: +5 = 1 punto, como Vida +5; Común +3, Buena +5)
    'vainas': 1, 'correas': 1,  # cada arma (o escudo) a mano, que se equipa sin No2
    'bolsilloext': 1, 'morral': 0.5,
    'pasamanos': 0.75, 'alforja': 0.75,   # en combate (dueño, 2026-10-05): pasar del cinturón sin No2 / un aliado saca de tu mochila por 1
    'portapergaminos': 0.4,   # por pergamino que entra en el Portapergaminos (dueño, 2026-10-05): apenas más que una ranura exclusiva
    'saquerapido': 0,
    'parry': 1, 'bloqueo': 1,
    # Ofensivo en una pieza defensiva: con la escala de la calculadora de armas (se marca aparte).
    # PdG en una pieza defensiva (dueño, 2026-10-04, por ahora solo en guantes): espejo de la Evasión; contraataque y oportunidad, situacionales.
    'pdgcontra': 1, 'pdgopor': 0.75,
    'pdg': 2, 'dmg': 1, 'crit': 3, 'critpot': 1.2, 'rng': 0.75, 'rangocasteo': 0.5, 'pdgmg': 2, 'dmgesp': 1,
    # Atributos: suben varios stats a la vez (Agilidad = Evasión + Iniciativa + No2).
    'fue': 2.5, 'con': 3, 'agl': 8, 'des': 3, 'esp': 3,
    'bonos': 1, 'accionesmax': 4,
    # Resistencia elemental (a construir): situacional, pesa poco.
    'resfuego': 0.5, 'reshielo': 0.5, 'resrayo': 0.5, 'restoxico': 0.5, 'resacido': 0.5,
    'pasosgratis': 3,   # el primer casillero del turno gratis (dueño, 2026-10-04): el 75 % de +1 No2 (4) — no es un No2, pero sigue siendo relevante
    'sigilo': 1,   # Sigilo +N (2026-10-04): mejora la tirada del que se esconde contra la Percepción de quien lo busca
    # Mecánicas de las piernas (dueño, 2026-10-04): Evasión +1 (2) ≈ contra oportunidad +2 ≈ contra contraataque +3 — la oportunidad pasa más seguido.
    'evaopor': 1, 'evacontra': 2 / 3,
    # Retirada limpia (en %, ver costo_retirada): 33 % = 1, 50 % = 1,5, siempre = 4 (desde Rara).
    'retirada': 0.03,
    # Mecánicas de los pies (dueño, 2026-10-04): Pasos de baile = 75 % de +1 Evasión; Pisada atenta 1; las de chance, en COSTO_CHANCE.
    'pasosbaile': 1.5, 'pisadaatenta': 1,
    # Guantes de Buena calidad (dueño, 2026-10-05): PdG con una familia de armas o a distancia (la mitad del PdG de todo); rebaja de No2 en la
    # oportunidad o el contraataque (el 50 % de una rebaja de No2 a secas: 2 por No2); soltarse y trampas escondidas, muy circunstanciales.
    'pdgt4': 1, 'pdgt6': 1, 'pdgt8': 1, 'pdgt10': 1, 'pdgdist': 1, 'oporahorro': 2, 'contraahorro': 2,
    'soltarse': 0.25, 'trampaoculta': 0.125, 'ahorroespsp': 0.75, 'venenista': 2,
    # Torso blando de Buena calidad (dueño, 2026-10-06): +SP máximo 0,75 por punto (vale para casters); Defensa contra el primer golpe del turno
    # 0,75 por punto (casi siempre cuenta, pero una vez); contra armas a distancia 0,5 por punto (la mitad: solo un tipo de ataque); pagar el SP de
    # un arma especial con vida, 2.
    'sp': 0.75, 'defprimer': 0.75, 'defdist': 0.5, 'pagarhp': 2,
    'spregen': 2,   # SP Regen +1 (dueño, 2026-10-05): como la Evasión — rinde todos los turnos; vive solo en la cabeza (escasez controlada)
    'inamovible': 0, 'recuperarse': 0, 'reflejos': 0,
    # Torso rígido de Buena calidad (dueño, 2026-10-06): los aliados al lado tuyo con +N Defensa (Coraza del guardián) 2 por punto; recibir el golpe
    # de un aliado al lado (Armadura del escolta, a mano) 1,5.
    'guardian': 2, 'escolta': 1.5,
    # Pies de Buena calidad (dueño, 2026-10-06): levantarse de Sentado sin pagar el No2 1; el primer casillero de terreno lento de cada turno a
    # costo normal 0,5; lo que pisás (zonas y trampas) hace N menos de daño 1 por N; meditar (+1 SP al empezar el turno si no se movió en el
    # anterior) 1.
    'levantarse': 1, 'pasoseguro': 0.5, 'suelagruesa': 1, 'meditar': 1,
}
def costo_retirada(pct):
    return 4 if pct >= 100 else pct * 0.03
# Las de chance (en %): (33 %, 50 %, siempre). Retirada limpia va aparte (por punto).
COSTO_CHANCE = {'inamovible': (0.5, 0.75, 1.5), 'recuperarse': (0.5, 1, 2), 'reflejos': (1, 1.5, 2.5), 'saquerapido': (0.75, 1, 2)}
# Contrapesos baratos (dueño, 2026-10-06): «ruidosa» (Sigilo negativo) devuelve 0,5 por punto — al que lleva placas casi no le importa el sigilo — y
# una resistencia elemental negativa («conductora»: recibe más daño de ese elemento) devuelve 0,25 por punto: tiene poco valor.
NEGATIVO_BARATO = {'sigilo': 0.5, 'resfuego': 0.25, 'reshielo': 0.25, 'resrayo': 0.25, 'restoxico': 0.25, 'resacido': 0.25}
def costo_especial(stat, v):
    if v < 0 and stat in NEGATIVO_BARATO: return v * NEGATIVO_BARATO[stat]
    return None
def costo_chance(stat, pct):
    a, b, c = COSTO_CHANCE[stat]
    return c if pct >= 100 else b if pct >= 50 else a
COSTO_DEFECTO = 1
OFENSIVOS = {'pdg', 'dmg', 'crit', 'critpot', 'rng', 'pdgmg', 'dmgesp', 'rangocasteo', 'accionesmax'}
COSTO_ESTADO_EQUIPO = 2          # un estado que se pone al equipar (Espinas, Regeneración…): a revisar caso por caso
# Estados al equipar cuyo efecto ya se cobra en un bono de la pieza (2026-10-06): Inamovible va con «inamovible 100» (la chance, siempre).
COSTO_ESTADO_EQUIPO_NOMBRE = {'Inamovible': 0}
# Durabilidad (dueño, 2026-10-04): Resistente ×N suma N a la durabilidad TOTAL y Frágil ×N la resta (no por Peso); 0,25 por punto, como la
# calculadora de armas. Una pieza vieja con durPorPeso se cuenta por la diferencia con lo normal (3 por punto de Peso, mínimo 3).
COSTO_DUR = 0.25


def durabilidad_extra(it):
    peso = max(0, round(float(it.get('peso', 0) or 0)))
    dx = round(float(it.get('durExtra', 0) or 0))
    dpp = float(it.get('durPorPeso', 0) or 0)
    if dpp and dpp != 3: dx += max(3, round(dpp * peso + 1e-9)) - max(3, 3 * peso)
    return dx
# Peso de un escudo (dueño, 2026-10-04): suma a la tirada de Bloqueo y a la durabilidad → cada punto por encima del primero cuesta 0,25.
# En las demás partes el peso no se cobra: la durabilidad que da se compensa con la carga que ocupa.
COSTO_PESO_ESCUDO = 0.25
# Peso de una armadura (torso, cabeza, manos, piernas, pies, cinturón; dueño, 2026-10-04): es una contra — ocupa carga y acerca al sobrepeso, y la
# durabilidad que trae no lo compensa —, así que cada punto DEVUELVE 0,5 desde peso 0. Lo liviano es caro; lo pesado trae más bonos (sin pasar el
# tope de Defensa de su parte).
DEVUELVE_PESO_ARMADURA = 0.5

# ------------------------------------------------------------ bolsas por parte y calidad (dueño, 2026-10-04)
TIERS = ['Común', 'Buena Calidad', 'Raro', 'Excepcional', 'Legendario']
PARTE = {'cabeza': 'cabeza', 'armadura_blanda': 'torso', 'armadura_rigida': 'torso', 'manos': 'manos', 'piernas': 'piernas', 'pies': 'pies',
         'escudo_1m': 'escudo', 'escudo_2m': 'escudo a 2 manos', 'cinturon': 'cinturón', 'anillos': 'anillo', 'mochila': 'mochila'}
BOLSA = {   # Común, Buena, Rara, Excepcional, Legendaria (las dos últimas, extrapoladas)
    'torso': [4, 7, 10, 13, 16], 'escudo': [3, 5, 7, 9, 11], 'escudo a 2 manos': [4, 6.5, 9, 12, 15], 'cabeza': [2, 3.5, 5, 6.5, 8],
    'piernas': [1.5, 3, 4, 5.5, 7], 'pies': [1.5, 2.5, 3.5, 4.5, 5.5], 'manos': [1.5, 2.5, 3.5, 4.5, 5.5],
    'cinturón': [1, 1.5, 2, 2.5, 3], 'anillo': [1, 1.5, 2, 2.5, 3],
    'mochila': [1.5, 2.5, 3.5, 4.5, 5.5],   # como los pies (dueño, 2026-10-04)
}
TOLERANCIA = 1.1                 # hasta un 10 % por encima de la bolsa se acepta
PRECIO_BASE, PRECIO_PUNTO = 10, 25

# ------------------------------------------------------------ la curva por nivel (aprobada 2026-10-04)
CURVA = {1: (4, 10, {'tipo1': 2, 'tipo2': 1}), 2: (5, 12, {'tipo1': 2, 'tipo2': 1}), 3: (6, 14, {'tipo1': 3, 'tipo2': 2, 'tipo3': 1}),
         4: (7, 16, {'tipo1': 3, 'tipo2': 2, 'tipo3': 1, 'tipo4': 1}), 5: (8, 18, {'tipo1': 4, 'tipo2': 3, 'tipo3': 2, 'tipo4': 1, 'tipo5': 1})}
NIVELES_DE_TIER = {'Común': [1, 2], 'Buena Calidad': [3, 4], 'Raro': [5]}
NOMBRE = {'def': 'Defensa', 'tipo1': 'T4', 'tipo2': 'T6', 'tipo3': 'T8', 'tipo4': 'T10', 'tipo5': 'T12', 'eva': 'Evasión', 'ini': 'Iniciativa',
          'mov': 'Mov', 'resm': 'Res.Mt', 'resmg': 'Res.Esp', 'rescc': 'Res.CC', 'capcinturon': 'Ranuras', 'hpmax': 'Vida'}


def tier_idx(t):
    t = (t or 'Común').strip()
    return TIERS.index(t) if t in TIERS else 0


def puntos(it):
    """→ (total, detalle [(texto, puntos)], avisos)."""
    det, avisos = [], []
    for m in it.get('mods', []):
        v = float(m.get('val', 0) or 0)
        c = COSTO.get(m['stat'], COSTO_DEFECTO)
        det.append((f"{v:+g} {NOMBRE.get(m['stat'], m['stat'])}", costo_retirada(v) if m['stat'] == 'retirada' else costo_chance(m['stat'], v) if m['stat'] in COSTO_CHANCE else costo_especial(m['stat'], v) if costo_especial(m['stat'], v) is not None else v * c))
        if m['stat'] in OFENSIVOS and v > 0: avisos.append(f"bono ofensivo ({NOMBRE.get(m['stat'], m['stat'])})")
        if m['stat'] not in COSTO: avisos.append(f"sin costo definido: {m['stat']}")
    if it.get('equipoEstadoNombre'):
        det.append((f"estado al equipar: {it['equipoEstadoNombre']}", COSTO_ESTADO_EQUIPO_NOMBRE.get(it['equipoEstadoNombre'], COSTO_ESTADO_EQUIPO)))
        avisos.append('estado al equipar: revisar a mano')
    dx = durabilidad_extra(it)
    if dx: det.append((f"{'Resistente' if dx > 0 else 'Frágil'} ×{abs(dx)}", dx * COSTO_DUR))
    peso = float(it.get('peso', 0) or 0)
    if PARTE.get(it.get('tipoItem'), '').startswith('escudo'):
        if peso > 1: det.append((f"pesa {it.get('peso')} (escudo)", (peso - 1) * COSTO_PESO_ESCUDO))
    elif peso > 0: det.append((f"pesa {it.get('peso')}", -peso * DEVUELVE_PESO_ARMADURA))
    return sum(p for _, p in det), det, avisos


def bolsa(it):
    parte = PARTE.get(it.get('tipoItem'))
    return (parte, BOLSA[parte][tier_idx(it.get('tier'))]) if parte else (None, None)


def precio_sugerido(pts):
    return max(15, int(round((PRECIO_BASE + PRECIO_PUNTO * max(0, pts)) / 5.0)) * 5)


def tier_que_corresponde(parte, pts):
    for i, b in enumerate(BOLSA[parte]):
        if pts <= b * TOLERANCIA: return TIERS[i]
    return TIERS[-1] + '+'


def piezas():
    return [it for it in leer_catalogo() if it.get('tipoItem') in PARTE]


def fila(it):
    pts, det, avisos = puntos(it)
    parte, b = bolsa(it)
    return {'it': it, 'parte': parte, 'pts': pts, 'bolsa': b, 'uso': pts / b if b else 0, 'det': det, 'avisos': avisos,
            'precio': precio_sugerido(pts), 'corresponde': tier_que_corresponde(parte, pts)}


def resumen():
    filas = [fila(it) for it in piezas()]
    print(f'{len(filas)} piezas defensivas')
    tabla = collections.defaultdict(lambda: [0, 0, 0, 0])
    for f in filas:
        k = (f['parte'], f['it'].get('tier'))
        t = tabla[k]; t[0] += 1
        if f['uso'] > TOLERANCIA: t[1] += 1
        elif f['uso'] < 0.5: t[2] += 1
        else: t[3] += 1
    print('parte · calidad: piezas | se pasan de la bolsa | usan menos de la mitad | bien')
    for (p, t), v in sorted(tabla.items(), key=lambda x: (x[0][0], tier_idx(x[0][1]))):
        print(f'  {p} · {t}: {v[0]} | {v[1]} | {v[2]} | {v[3]}')
    exceso = sorted([f for f in filas if f['uso'] > TOLERANCIA], key=lambda f: -f['uso'])
    print(f"\nSe pasan de su bolsa: {len(exceso)}. Las 15 que más:")
    for f in exceso[:15]:
        print(f"  {f['it']['nombre']} ({f['parte']}, {f['it']['tier']}): {f['pts']:.1f} de {f['bolsa']} → correspondería {f['corresponde']}")


def detalle(nombre):
    for it in piezas():
        if it['nombre'].lower() == nombre.lower():
            f = fila(it)
            print(f"{it['nombre']} — {f['parte']}, {it['tier']}, precio actual {it.get('precioCompra')}")
            for t, p in f['det']: print(f'  {t}: {p:+.2f}')
            print(f"  = {f['pts']:.2f} puntos de {f['bolsa']} ({f['uso'] * 100:.0f} %) · correspondería {f['corresponde']} · precio sugerido {f['precio']}")
            for a in f['avisos']: print('  ⚠', a)
            return
    print('No está:', nombre)


def lista(parte=None):
    for f in sorted((fila(it) for it in piezas()), key=lambda f: (f['parte'], tier_idx(f['it'].get('tier')), -f['pts'])):
        if parte and f['parte'] != parte: continue
        print(f"{f['parte']} · {f['it']['tier']} · {f['it']['nombre']}: {f['pts']:.1f}/{f['bolsa']} · precio {f['it'].get('precioCompra')} → {f['precio']}"
              + (' · ⚠ ' + '; '.join(f['avisos']) if f['avisos'] else ''))


def equipos():
    """El máximo equipable por calidad (la mejor pieza de cada parte, hasta esa calidad) contra la curva."""
    its = piezas()
    for tope in ['Común', 'Buena Calidad', 'Raro']:
        k = tier_idx(tope)
        pool = [i for i in its if tier_idx(i.get('tier')) <= k]
        mejor = {}
        for stat in ['def', 'tipo1', 'tipo2', 'tipo3', 'tipo4', 'tipo5']:
            tot = 0
            for parte in ['cabeza', 'torso', 'manos', 'piernas', 'pies', 'escudo', 'cinturón', 'anillo']:
                vals = [sum(m['val'] for m in i.get('mods', []) if m['stat'] == stat) for i in pool if PARTE.get(i['tipoItem']) in (parte, parte + ' a 2 manos')]
                n = 2 if parte == 'anillo' else 1
                tot += sum(sorted(vals, reverse=True)[:n])
            mejor[stat] = tot
        niv = NIVELES_DE_TIER[tope][-1]
        piso, techo, res = CURVA[niv]
        print(f"Hasta {tope} (nivel {niv}): Defensa máxima {mejor['def']:g} (curva: {piso}–{techo})"
              + ''.join(f" · {NOMBRE[s]} {mejor[s]:g} (≤{res.get(s, 0)})" for s in ['tipo1', 'tipo2', 'tipo3', 'tipo4', 'tipo5']))


if __name__ == '__main__':
    a = sys.argv[1:] or ['resumen']
    if a[0] == 'resumen': resumen()
    elif a[0] == 'pieza': detalle(' '.join(a[1:]))
    elif a[0] == 'equipos': equipos()
    elif a[0] == 'lista': lista(' '.join(a[1:]) or None)
    else: print(__doc__)
