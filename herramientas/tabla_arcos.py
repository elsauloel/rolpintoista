# -*- coding: utf-8 -*-
"""La planilla de los arcos (2026-10-11, como tabla_ballestas.py; dueño: «esto mismo que hice con las ballestas quiero hacerlo con los arcos»).
Mide, con las reglas de balance_combate.py (el arco suma la mitad de la Fuerza; cuesta Tipo ÷ 2 el primer disparo del turno y el Tipo los
siguientes; Perfora N), lo que rinde cada base de arco en manos del Shooter respecto de su mejor arma cuerpo a cuerpo de la misma calidad, contra el
blanco medio y el pesado, en el nivel 1 (Común) y en el 3 (Buena). La guarda en herramientas/tabla_arcos.json, que lee la calculadora de armas
(calculadora_armas.py: el precio del daño de un arco sale de acá).

  py herramientas/tabla_arcos.py            → rehace la planilla (un par de minutos)
  py herramientas/tabla_arcos.py --ver      → la muestra en tablas (Común y Buena)
"""
import sys, json, random, os, itertools, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import balance_combate as B
import balance_ballestas as BB

N = 3000
SALIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tabla_arcos.json')
TIPOS, DADOS, FIJOS, PERFORAS = (4,), (1, 2, 3, 4), range(0, 9), (0, 1, 2)
def clave(tipo, dados, fijo, perfora): return f'{tipo}|{dados}|{fijo}|{perfora}'

_melee = {}
def melee(nivel, blanco, o, clase='Shooter'):
    if (nivel, blanco, clase) not in _melee:
        d, at = B.blancos(nivel, o)[blanco], B.atributos(clase, nivel)
        _melee[(nivel, blanco, clase)] = max(sum(B.golpe(at, B.arma(f, nivel, o), d, o) for _ in range(N)) / N * B.ataques_por_turno(at['agl'], B.arma(f, nivel, o)['tipo'], o)
                                             for f in BB.MELEE) or 1
    return _melee[(nivel, blanco, clase)]

def medir(nivel, blanco, tipo, dados, fijo, perfora, clase='Shooter'):
    o = BB.opciones(ballesta=False)
    d, at = B.blancos(nivel, o)[blanco], B.atributos(clase, nivel)
    a = dict(tipo=tipo, dados=dados, rango=True, fijo=fijo, perfora=perfora)
    por = sum(B.golpe(at, a, d, o) for _ in range(N)) / N * B.ataques_por_turno(at['agl'], tipo, o)
    return por / melee(nivel, blanco, o, clase)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--ver', action='store_true'); a = ap.parse_args()
    if a.ver: return ver()
    random.seed(13)
    tabla = {}
    for tipo, dados in itertools.product(TIPOS, DADOS):
        for fijo, perfora in itertools.product(FIJOS, PERFORAS):
            tabla[clave(tipo, dados, fijo, perfora)] = {f'n{n}': {b: round(medir(n, b, tipo, dados, fijo, perfora), 3) for b in ('medio', 'pesado')} for n in (1, 3)}
        print(f'Tipo {tipo} · {dados} dado(s): listo', flush=True)
    json.dump({'nota': 'Shooter: arco ÷ su mejor cuerpo a cuerpo, nivel 1 (Común) y 3 (Buena); ver tabla_arcos.py', 'bases': tabla},
              open(SALIDA, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    ver()

def ver():
    t = json.load(open(SALIDA, encoding='utf-8'))['bases']
    for n, nom in ((1, 'Común (nivel 1)'), (3, 'Buena (nivel 3)')):
        print(f'\n## {nom} · Shooter: arco ÷ su mejor cuerpo a cuerpo · medio / pesado (✅ = 74–106 % contra el medio)')
        print('| Base | Perfora 0 | Perfora 1 | Perfora 2 |'); print('|---|---|---|---|')
        for tipo, dados, fijo in itertools.product(TIPOS, DADOS, FIJOS):
            cel = []
            for p in PERFORAS:
                e = t[clave(tipo, dados, fijo, p)][f'n{n}']
                cel.append(f"{e['medio']*100:.0f} / {e['pesado']*100:.0f}{' ✅' if 0.74 <= e['medio'] <= 1.06 else ''}")
            if min(t[clave(tipo, dados, fijo, p)][f'n{n}']['medio'] for p in PERFORAS) > 1.4: continue
            print(f'| {dados}d{tipo}+{fijo} | ' + ' | '.join(cel) + ' |')

if __name__ == '__main__':
    main()
