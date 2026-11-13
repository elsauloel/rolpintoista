# -*- coding: utf-8 -*-
"""Balance de combate: daño esperado por turno (2026-10-09, dueño: «vamos con el método paso a paso, con testeos»; ver docs/balance-combate.md).

Cruza QUIÉN ataca (cada clase con su reparto de atributos sugerido, nivel 1/3/5), CON QUÉ (la familia de arma, con los dados típicos del catálogo
para la calidad de ese nivel) y CONTRA QUIÉN (un blanco liviano, medio y pesado con la Defensa y las resistencias de la curva por nivel). Las reglas
son las del juego (copiadas acá para poder medir; si cambian en el código, cambiarlas acá):
  - las tiradas: el valor de un stat se tira como dados (comun/tiradas.js formulaParaValor);
  - PdG (Destreza) contra Evasión (Agilidad; mínimo 1); empate 50 %;
  - crítico (comun/critico.js): niveles = diferencia ÷ (Tipo − Crítico frecuente, mínimo 2) − Resistencia a ese Tipo; se tiran tantos d20 y vale el
    mejor (7+ ×2, 17+ ×3, 20 ×4; dos o más 20 = ×4 cada uno); con crítico el daño se multiplica y la Defensa NO se resta;
  - sin crítico: daño − Defensa (mínimo 0);
  - No2 por turno = Agilidad; atacar cuesta Tipo ÷ 2 el primero del turno y el Tipo completo los siguientes; se cuentan los ataques que entran
    sin moverse (el daño por turno «en rango»).
Las PALANCAS (las variables a probar) son opciones de la línea de comandos: ver `python balance_combate.py --ayuda`.
"""
import sys, io, math, random, argparse
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DADOS = [4, 6, 8, 10, 12, 20, 100]
def _combos(n, k, desde=0):
    if k == 0: return [[]] if n == 0 else []
    out = []
    for i in range(desde, len(DADOS)):
        if DADOS[i] > n: break
        for c in _combos(n - DADOS[i], k - 1, i): out.append([DADOS[i]] + c)
    return out
_cache = {}
def formula(v):
    n = round(v)
    if n <= 0: return None
    if n in _cache: return _cache[n]
    base, mod = (n - 1, 1) if n % 2 else (n, 0)
    res = ([n], 0)
    if base > 0:
        for k in range(1, 7):
            cs = _combos(base, k)
            if cs: cs.sort(key=lambda c: max(c) - min(c)); res = (cs[0], mod); break
    _cache[n] = res
    return res
def tirar(v):
    f = formula(v)
    return sum(random.randint(1, d) for d in f[0]) + f[1] if f else 0

PESOS = {'Warrior': [.26, .30, .14, .16, .14], 'Tanque': [.36, .26, .10, .12, .16], 'Asalto': [.16, .18, .30, .24, .12],
         'Shooter': [.18, .10, .24, .32, .16], 'Mago': [.20, .08, .16, .16, .40], 'Support': [.24, .10, .16, .14, .36], 'Debuffer': [.22, .08, .18, .14, .38],
         # «Mono-Destreza» (2026-10-09, la ballesta): casi todo a Destreza; lo demás en el mínimo. Solo entra con --ballesta.
         'MonoDes': [.12, .02, .12, .62, .12]}
def repartir(total, pesos, m=3):   # Combatiente.repartirAtributos
    v = [max(m, math.floor(total * p)) for p in pesos]
    resto = total - sum(v); orden = sorted(range(5), key=lambda i: -pesos[i]); k = 0
    while resto > 0: v[orden[k % 5]] += 1; resto -= 1; k += 1
    return dict(zip(['con', 'fue', 'agl', 'des', 'esp'], v))
def atributos(clase, nivel): return repartir(33 + 3 * (nivel - 1), PESOS[clase])

# Curva de defensa por nivel (herramientas/calculadora_defensa.py CURVA): (Def liviano, Def tanque, resistencia máxima por Tipo).
CURVA = {1: (4, 10, {4: 2, 6: 1}), 3: (6, 14, {4: 3, 6: 2, 8: 1}), 5: (8, 18, {4: 4, 6: 3, 8: 2, 10: 1, 12: 1})}
def blancos(nivel, o):
    dmin, dmax, rmax = CURVA[nivel]
    mult = dict((int(k), float(v)) for k, v in (x.split('=') for x in o.res.split(',') if x)) if o.res else {}
    if o.res_t4 != 1.0: mult[4] = o.res_t4
    rmax = {t: math.floor(r * mult.get(t, 1) + 1e-9) for t, r in rmax.items()}
    for t, v in mult.items():   # un Tipo que no estaba en la curva y ahora se multiplica (ej. 10 a nivel 3): se agrega si da 1 o más
        if t not in rmax and v > 1: pass
    return {
        'liviano': dict(eva=atributos('Asalto', nivel)['agl'], defensa=dmin, res={4: math.ceil(rmax.get(4, 0) / 2)}),
        'medio': dict(eva=atributos('Warrior', nivel)['agl'], defensa=round((dmin + dmax) / 2), res={t: max(0, r - 1) for t, r in rmax.items()}),
        'pesado': dict(eva=atributos('Tanque', nivel)['agl'], defensa=dmax, res=dict(rmax)),
    }

# Armas típicas del catálogo por calidad (mediana de dados: Común 1, Buena 1–2, Rara 2; daño fijo ~0). Nivel 1 → Común, 3 → Buena, 5 → Rara.
DADOS_NIVEL = {1: 1, 3: 1.5, 5: 2}
FAMILIAS = ['Daga T4', 'Espada T6', 'Hacha T8', 'Maza T10', 'Arco T4']
# La ballesta (2026-10-09, «la varita física»): no suma Fuerza; dados del Tipo + daño fijo alto. Con --ballesta entra como una familia más.
BAL_FIJO = {1: 3, 3: 4, 5: 5}
def arma(fam, nivel, o):
    if fam.startswith('Ballesta'):
        return dict(tipo=o.bal_tipo, dados=o.bal_dados if o.bal_dados else DADOS_NIVEL[nivel], rango=True, fijo=(o.bal_fijo if o.bal_fijo is not None else BAL_FIJO[nivel]), ballesta=True,
                    perfora=o.bal_perfora, recarga=o.bal_recarga)
    t = int(fam.split('T')[-1])
    if fam == 'Arco T4':   # el arco: Tipo 4 o 6 (el dado es el Tipo; dueño, 2026-10-09), con sus dados y su daño fijo (palancas)
        return dict(tipo=o.arco_tipo, dados=o.arco_dados, rango=True, fijo=o.arco_fijo)
    return dict(tipo=t, dados=DADOS_NIVEL[nivel], rango=False, fijo=0)

def golpe(at, a, d, o):
    p, e = tirar(at['des']) + (o.arco_pdg if a['rango'] else 0), max(1, tirar(d['eva']))
    if p < e or (p == e and random.random() < .5): return 0
    n = a['dados']
    n = (math.floor(n) + (1 if random.random() < n - math.floor(n) else 0)) if n != int(n) else int(n)   # 1.5 = mitad 1 y mitad 2; 2.5 = mitad 2 y mitad 3
    fue = 0 if a.get('ballesta') else at['fue'] * (o.arco_fuerza if a['rango'] else 1)
    if o.sutileza and a['tipo'] == 4: fue = max(fue, at['des'] * o.sutileza)   # las armas livianas suman Destreza (palanca)
    dano = sum(random.randint(1, a['tipo']) for _ in range(n)) + math.ceil(fue) + a['fijo']
    frec = o.crit_frec + (o.crit_frec_t4 if a['tipo'] == 4 else 0) + (o.arco_frec if a['rango'] else 0)
    res = max(0, d['res'].get(a['tipo'], 0) - (o.arco_ignora_res if a['rango'] else 0))
    niveles = (p - e) // max(2, a['tipo'] - frec) - res
    if niveles > 0:
        r = [random.randint(1, 20) for _ in range(niveles)]
        v = r.count(20); b = max(r)
        return dano * (4 * v if v >= 2 else 4 if b >= 20 else 3 if b >= 17 else 2 if b >= 7 else 1)
    defensa = d['defensa'] * o.def_mult * (1 - (o.perfora if a['tipo'] == 4 else 0)) * (1 - (o.arco_perfora if a['rango'] else 0))
    # Perfora N (2026-10-10): N puntos del golpe pasan siempre la Defensa; el resto va contra ella (nunca menos de N ni más que el golpe).
    return max(0, dano - math.ceil(defensa), min(a.get('perfora', 0), dano))

def ataques_por_turno(no2, tipo, o=None):
    n, gasto = 0, 0
    while True:
        div1, div2 = (o.costo_div, o.costo_div2) if o else (2, 1)
        c = math.ceil(tipo / div1) if n == 0 else math.ceil(tipo / div2)
        if gasto + c > no2: return n
        gasto += c; n += 1

def disparos_recarga(no2, r):   # la Recarga N (2026-10-10): N, 2N, 3N… No2 por disparo en el turno
    k, gasto = 0, 0
    while gasto + r * (k + 1) <= no2: gasto += r * (k + 1); k += 1
    return k
def recargas(no2):   # la ballesta como varita: 1 No2 el primer disparo del turno, +1 por cada uno más (1, 2, 3…)
    k, gasto = 0, 0
    while gasto + k + 1 <= no2: gasto += k + 1; k += 1
    return k
def tabla(nivel, blanco, o, N):
    d = blancos(nivel, o)[blanco]
    filas = {}
    for clase in (o.clases.split(',') if o.clases else [c for c in PESOS if c != 'MonoDes' or o.ballesta]):
        at = atributos(clase, nivel)
        fila = {}
        for fam in FAMILIAS + ([f'Ballesta T{o.bal_tipo}'] if o.ballesta else []):
            a = arma(fam, nivel, o)
            por = sum(golpe(at, a, d, o) for _ in range(N)) / N
            k = (disparos_recarga(at['agl'], a['recarga']) if a.get('ballesta') and a.get('recarga') else
                 recargas(at['agl']) if a.get('ballesta') and o.bal_costo == 'varita' else ataques_por_turno(at['agl'], a['tipo'], o))
            fila[fam] = None if k == 0 else por * k   # None: no le alcanzan los No2 para un ataque con esa arma
        filas[clase] = fila
    return d, filas

def main():
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument('--ayuda', action='help', help='esta ayuda')
    ap.add_argument('--n', type=int, default=6000, help='tiradas por casilla (más = más preciso y lento)')
    ap.add_argument('--arco-fuerza', type=float, default=0.5, help='cuánta Fuerza suma el arco: 0 (como el código hoy), 0.5 (lo decidido), 1')
    ap.add_argument('--arco-dados', type=float, default=1.5, help='dados del arco (1, 2, o 1.5 = mitad y mitad)')
    ap.add_argument('--res-t4', type=float, default=1.0, help='palanca: multiplica la resistencia a Tipo 4 de la curva (0.5 = la mitad)')
    ap.add_argument('--perfora', type=float, default=0.0, help='palanca: las armas Tipo 4 ignoran esta fracción de la Defensa (0.5 = la mitad)')
    ap.add_argument('--crit-frec', type=int, default=0, help='palanca: Crítico frecuente que traen todas las armas')
    ap.add_argument('--sutileza', type=float, default=0.0, help='palanca: las armas Tipo 4 suman Destreza × esto si es más que su Fuerza')
    ap.add_argument('--niveles', default='1,3,5')
    ap.add_argument('--res', default='', help='palanca: multiplicador de la resistencia por Tipo, ej. "4=0.5,10=1.5"')
    ap.add_argument('--crit-frec-t4', type=int, default=0, help='palanca: Crítico frecuente que traen las armas Tipo 4 (dagas, arcos)')
    ap.add_argument('--def-mult', type=float, default=1.0, help='palanca: cuánto de la Defensa se resta sin crítico (0.5 = la mitad)')
    ap.add_argument('--costo-div', type=float, default=2, help='palanca: el primer ataque cuesta Tipo ÷ esto (hoy 2)')
    ap.add_argument('--costo-div2', type=float, default=1, help='palanca: los siguientes cuestan Tipo ÷ esto (hoy 1)')
    ap.add_argument('--arco-ignora-res', type=int, default=0, help='palanca del arco: la flecha ignora esto de Resistencia a crítico Tipo 4')
    ap.add_argument('--arco-tipo', type=int, default=4, help='palanca del arco: su Tipo (4 o 6; tira dados de ese Tipo)')
    ap.add_argument('--arco-fijo', type=int, default=0, help='palanca del arco: daño fijo del arco')
    ap.add_argument('--arco-pdg', type=int, default=0, help='palanca del arco: PdG +N del arco (mod que ya existe)')
    ap.add_argument('--arco-frec', type=int, default=0, help='palanca del arco: Crítico frecuente que traen los arcos')
    ap.add_argument('--arco-perfora', type=float, default=0.0, help='palanca del arco: la flecha ignora esta fracción de la Defensa')
    ap.add_argument('--ballesta', action='store_true', help='suma la ballesta (familia) y el personaje «MonoDes» (casi todo a Destreza)')
    ap.add_argument('--bal-tipo', type=int, default=6, help='Tipo de la ballesta (sus dados y su crítico)')
    ap.add_argument('--bal-dados', type=float, default=0, help='dados de la ballesta (0 = los de la calidad del nivel)')
    ap.add_argument('--bal-fijo', type=int, default=None, help='daño fijo de la ballesta (por defecto 3 / 4 / 5 por nivel)')
    ap.add_argument('--bal-recarga', type=int, default=2, help='Recarga de la ballesta: el disparo cuesta N, 2N, 3N… (0 = como dice --bal-costo)')
    ap.add_argument('--bal-perfora', type=int, default=0, help='Perfora N de la ballesta: N puntos del golpe pasan siempre la Defensa')
    ap.add_argument('--bal-costo', default='arma', help="cómo cobra el disparo: 'arma' (Tipo ÷ 2 y después el Tipo) o 'varita' (1, 2, 3…)")
    ap.add_argument('--clases', default='', help='solo estas clases, separadas por coma')
    ap.add_argument('--metas', action='store_true', help='en vez de las tablas, el resumen de las metas del paso 2')
    ap.add_argument('--blancos', default='liviano,medio,pesado')
    o = ap.parse_args()
    if o.metas: return metas(o)
    for nivel in map(int, o.niveles.split(',')):
        for blanco in o.blancos.split(','):
            d, filas = tabla(nivel, blanco, o, o.n)
            vals = lambda f: [v for v in f.values() if v is not None] or [0]
            mejor_w = max(vals(filas['Warrior'])) or 1
            print(f"\n## Nivel {nivel} · contra un blanco {blanco} (Defensa {d['defensa']}, Evasión {d['eva']}, Res {d['res']})")
            print('| Clase | ' + ' | '.join(FAMILIAS) + ' | Mejor / Warrior |')
            print('|' + '---|' * (len(FAMILIAS) + 2))
            for clase, fila in filas.items():
                mejor = max(vals(fila))
                print(f"| {clase} | " + ' | '.join('—' if v is None else f"{v:.1f}" for v in fila.values()) + f" | {100 * mejor / mejor_w:.0f} % |")

COMBATE = ['Warrior', 'Tanque', 'Asalto', 'Shooter']
def metas(o):
    """M1: las 4 clases de combate contra el blanco medio, entre 60 % y 140 % del Warrior. M2: contra el pesado, al menos 30 %.
    M4: el arco del Shooter, al menos 60 % de su mejor cuerpo a cuerpo (contra el medio). M5: combinaciones sin No2 para atacar.
    M3: cuántas familias son la mejor de alguna clase de combate contra algún blanco (de 5)."""
    o.clases = ','.join(COMBATE)
    print('| Nivel | M1 (medio 60–140 % del Warrior: Tanque · Asalto · Shooter) | M2 (pesado ≥30 %) | M4 arco/cuerpo a cuerpo (Shooter, medio) | M5 sin No2 | M3 familias que ganan |')
    print('|---|---|---|---|---|---|')
    for nivel in map(int, o.niveles.split(',')):
        res = {b: tabla(nivel, b, o, o.n)[1] for b in ('liviano', 'medio', 'pesado')}
        mejor = lambda f, sin=None: max([v for k, v in f.items() if v is not None and k != sin] or [0])
        w = {b: mejor(res[b]['Warrior']) or 1 for b in res}
        m1 = [c for c in COMBATE if 0.6 <= mejor(res['medio'][c]) / w['medio'] <= 1.4]
        m2 = [c for c in COMBATE if mejor(res['pesado'][c]) / w['pesado'] >= 0.3]
        sh = res['medio']['Shooter']
        m4 = (sh['Arco T4'] or 0) / (mejor(sh, 'Arco T4') or 1)
        m5 = sum(1 for b in res for c in COMBATE for v in res[b][c].values() if v is None) // 3
        ganan = set()
        for b in res:
            for c in COMBATE:
                f = {k: v for k, v in res[b][c].items() if v is not None}
                if f: ganan.add(max(f, key=f.get))
        ratios = ' · '.join(c[:3] + ' ' + format(mejor(res['medio'][c]) / w['medio'], '.0%') for c in COMBATE[1:])
        print(f"| {nivel} | {len(m1)}/4 ({ratios}) | {len(m2)}/4 | {m4:.0%} | {m5} | {len(ganan)}/5 ({', '.join(sorted(ganan))}) |")

if __name__ == '__main__':
    main()
