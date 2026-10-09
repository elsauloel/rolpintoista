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
         'Shooter': [.18, .10, .24, .32, .16], 'Mago': [.20, .08, .16, .16, .40], 'Support': [.24, .10, .16, .14, .36], 'Debuffer': [.22, .08, .18, .14, .38]}
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
    rmax = {t: (math.floor(r * o.res_t4) if t == 4 else r) for t, r in rmax.items()}
    return {
        'liviano': dict(eva=atributos('Asalto', nivel)['agl'], defensa=dmin, res={4: math.ceil(rmax.get(4, 0) / 2)}),
        'medio': dict(eva=atributos('Warrior', nivel)['agl'], defensa=round((dmin + dmax) / 2), res={t: max(0, r - 1) for t, r in rmax.items()}),
        'pesado': dict(eva=atributos('Tanque', nivel)['agl'], defensa=dmax, res=dict(rmax)),
    }

# Armas típicas del catálogo por calidad (mediana de dados: Común 1, Buena 1–2, Rara 2; daño fijo ~0). Nivel 1 → Común, 3 → Buena, 5 → Rara.
DADOS_NIVEL = {1: 1, 3: 1.5, 5: 2}
FAMILIAS = ['Daga T4', 'Espada T6', 'Hacha T8', 'Maza T10', 'Arco T4']
def arma(fam, nivel, o):
    t = int(fam.split('T')[-1])
    return dict(tipo=t, dados=DADOS_NIVEL[nivel] if fam != 'Arco T4' else o.arco_dados, rango=fam.startswith('Arco'))

def golpe(at, a, d, o):
    p, e = tirar(at['des']), max(1, tirar(d['eva']))
    if p < e or (p == e and random.random() < .5): return 0
    n = a['dados']
    n = (1 if random.random() < .5 else 2) if n == 1.5 else int(n)
    fue = at['fue'] * (o.arco_fuerza if a['rango'] else 1)
    if o.sutileza and a['tipo'] == 4: fue = max(fue, at['des'] * o.sutileza)   # las armas livianas suman Destreza (palanca)
    dano = sum(random.randint(1, a['tipo']) for _ in range(n)) + math.ceil(fue)
    niveles = (p - e) // max(2, a['tipo'] - o.crit_frec) - d['res'].get(a['tipo'], 0)
    if niveles > 0:
        r = [random.randint(1, 20) for _ in range(niveles)]
        v = r.count(20); b = max(r)
        return dano * (4 * v if v >= 2 else 4 if b >= 20 else 3 if b >= 17 else 2 if b >= 7 else 1)
    defensa = d['defensa'] * (1 - (o.perfora if a['tipo'] == 4 else 0))
    return max(0, dano - math.ceil(defensa))

def ataques_por_turno(no2, tipo):
    n, gasto = 0, 0
    while True:
        c = math.ceil(tipo / 2) if n == 0 else tipo
        if gasto + c > no2: return n
        gasto += c; n += 1

def tabla(nivel, blanco, o, N):
    d = blancos(nivel, o)[blanco]
    filas = {}
    for clase in PESOS:
        at = atributos(clase, nivel)
        fila = {}
        for fam in FAMILIAS:
            a = arma(fam, nivel, o)
            por = sum(golpe(at, a, d, o) for _ in range(N)) / N
            k = ataques_por_turno(at['agl'], a['tipo'])
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
    ap.add_argument('--blancos', default='liviano,medio,pesado')
    o = ap.parse_args()
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

if __name__ == '__main__':
    main()
