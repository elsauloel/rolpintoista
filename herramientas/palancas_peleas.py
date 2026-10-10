# -*- coding: utf-8 -*-
"""Palancas de balance probadas con las peleas simuladas (2026-10-10; ver docs/balance-peleas.md). No cambia ninguna regla: prueba, en el
simulador, qué pasaría con cada palanca. Uso: py palancas_peleas.py [--n 200]"""
import sys, math, random, argparse, statistics, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import simular_peleas as S

ARM_ORIG, ATAQUE_ORIG = S.armadura, S.ataque
EXTRA_PERF = {1: 1, 3: 2, 5: 3}

def con_palancas(perf_familias=False, def_mult=1.0, dano_min=0.0):
    def armadura(nivel, peso):
        a = ARM_ORIG(nivel, peso)
        if peso != 'liviana' and def_mult != 1.0: a = dict(a, defensa=round(a['defensa'] * def_mult))
        return a
    def ataque(a, d, k):
        it = a.arma
        if perf_familias and a.fam in ('Daga', 'Ballesta'):
            a.arma = dict(it, perfora=int(it.get('perfora') or 0) + EXTRA_PERF[a.nivel])
        try:
            if dano_min:
                # el golpe que entra pasa al menos esa fracción de su daño (sin Defensa): se simula comparando con la Defensa en 0
                guardo = d.defensa
                g = ATAQUE_ORIG(a, d, k)
                if g == 0:
                    d.defensa = 0
                    g2 = ATAQUE_ORIG(a, d, k)   # (una tirada nueva: aproximación)
                    d.defensa = guardo
                    return math.ceil(g2 * dano_min) if g2 else 0
                return g
            return ATAQUE_ORIG(a, d, k)
        finally:
            a.arma = it
    S.armadura, S.ataque = armadura, ataque

CRUCES = [(('Shooter', 'arco'), ('Warrior', 'hacha 2 manos')), (('Shooter', 'ballesta'), ('Warrior', 'hacha 2 manos')), (('Asalto', 'daga'), ('Warrior', 'hacha 2 manos')),
          (('Shooter', 'arco'), ('Tanque', 'espada y escudo')), (('Shooter', 'ballesta'), ('Tanque', 'espada y escudo')), (('Asalto', 'daga'), ('Tanque', 'espada y escudo')),
          (('Warrior', 'hacha 2 manos'), ('Tanque', 'espada y escudo'))]
PALANCAS = [('Como hoy', {}), ('Perfora +1/+2/+3 (por calidad) en dagas y ballestas', {'perf_familias': True}),
            ('Armadura media y pesada al 75 %', {'def_mult': 0.75}), ('Un golpe que entra pasa al menos ¼ de su daño', {'dano_min': 0.25}),
            ('Perfora por calidad + armadura al 75 %', {'perf_familias': True, 'def_mult': 0.75})]

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--n', type=int, default=200); o = ap.parse_args()
    L = ['\n## Palancas probadas (2026-10-10)\n', 'Ninguna está aplicada: es lo que pasaría con cada una. % de victorias de la fila; nivel 1 / 3 / 5.\n']
    L.append('| Palanca | ' + ' | '.join(f'{a[0]} ({a[1]}) vs {b[0]}' for a, b in CRUCES) + ' |')
    L.append('|' + '---|' * (len(CRUCES) + 1))
    for nombre, kw in PALANCAS:
        random.seed(5)
        con_palancas(**kw)
        cel = []
        for a, b in CRUCES:
            cel.append(' / '.join(S.pct(S.cruce([a], [b], nivel, o.n)['A']) for nivel in (1, 3, 5)))
        L.append(f'| {nombre} | ' + ' | '.join(cel) + ' |')
        print(nombre, 'listo', flush=True)
    S.armadura, S.ataque = ARM_ORIG, ATAQUE_ORIG
    p = S.RAIZ / 'docs' / 'balance-peleas.md'
    p.write_text(p.read_text(encoding='utf-8') + '\n'.join(L) + '\n', encoding='utf-8')
    print('agregado a', p)

if __name__ == '__main__':
    main()
