# -*- coding: utf-8 -*-
"""Palancas de balance probadas con las peleas simuladas (2026-10-10; ver docs/balance-peleas.md). No cambia ninguna regla: prueba, en el
simulador, qué pasaría con cada palanca. Uso: py palancas_peleas.py [--n 200]"""
import sys, math, random, argparse, statistics, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import simular_peleas as S

ARM_ORIG, ATAQUE_ORIG = S.armadura, S.ataque
EXTRA_PERF = {1: 1, 3: 2, 5: 3}

PERF_SIN_TOPE = {1: 2, 3: 4, 5: 6}
def con_palancas(perf_familias=False, def_mult=1.0, dano_min=0.0, perf_sin_tope=False, min_por_dado=False):
    def armadura(nivel, peso):
        a = ARM_ORIG(nivel, peso)
        if peso != 'liviana' and def_mult != 1.0: a = dict(a, defensa=round(a['defensa'] * def_mult))
        return a
    def ataque(a, d, k):
        it = a.arma
        if perf_familias and a.fam in ('Daga', 'Ballesta'):
            a.arma = dict(it, perfora=int(it.get('perfora') or 0) + EXTRA_PERF[a.nivel])
        guardo_def = d.defensa
        if perf_sin_tope and a.fam in ('Daga', 'Ballesta'): d.defensa = max(0, d.defensa - PERF_SIN_TOPE[a.nivel])   # Perfora por calidad, sin tope
        try:
            if min_por_dado:
                g = ATAQUE_ORIG(a, d, k)
                if g == 0:
                    guardo = d.defensa; d.defensa = 0
                    g2 = ATAQUE_ORIG(a, d, k); d.defensa = guardo
                    return min(g2, int(a.arma.get('peso') or 1) + int(a.arma.get('danoAmplificado') or 0)) if g2 else 0   # al menos 1 por dado
                return g
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
            d.defensa = guardo_def
    S.armadura, S.ataque = armadura, ataque

CRUCES = [(('Shooter', 'arco'), ('Warrior', 'hacha 2 manos')), (('Shooter', 'ballesta'), ('Warrior', 'hacha 2 manos')), (('Asalto', 'daga'), ('Warrior', 'hacha 2 manos')),
          (('Shooter', 'arco'), ('Tanque', 'espada y escudo')), (('Shooter', 'ballesta'), ('Tanque', 'espada y escudo')), (('Asalto', 'daga'), ('Tanque', 'espada y escudo')),
          (('Warrior', 'hacha 2 manos'), ('Tanque', 'espada y escudo'))]
PALANCAS = [('Como hoy', {}), ('Perfora +1/+2/+3 (por calidad) en dagas y ballestas', {'perf_familias': True}),
            ('Armadura media y pesada al 75 %', {'def_mult': 0.75}), ('Un golpe que entra pasa al menos ¼ de su daño', {'dano_min': 0.25}),
            ('Perfora por calidad + armadura al 75 %', {'perf_familias': True, 'def_mult': 0.75}),
            ('Perfora por calidad SIN tope (+2/+4/+6) en dagas y ballestas', {'perf_sin_tope': True}),
            ('Daño mínimo: 1 por dado si el golpe entra', {'min_por_dado': True}),
            ('Perfora sin tope + 1 por dado (la propuesta)', {'perf_sin_tope': True, 'min_por_dado': True})]

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
