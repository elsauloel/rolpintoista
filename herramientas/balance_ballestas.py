# -*- coding: utf-8 -*-
"""La escalera de las ballestas (2026-10-11, dueño: «hacete varias pruebas de combate de ballesta contra otras armas para volver a afinar la
calculadora»). Usa las reglas de balance_combate.py (con la Recarga N, 2N, 3N… y la Perfora) y mide, para cada ballesta (dados, daño fijo,
Perfora, Recarga), lo que rinde la del Shooter respecto de su mejor arma cuerpo a cuerpo de la misma calidad (100 % = pega lo mismo), contra el
blanco liviano, el medio y el pesado. Nivel 1 → Común, 3 → Buena, 5 → Rara. Banda buscada (la misma de los arcos): 74–106 % contra el medio.

  py herramientas/balance_ballestas.py                 → la escalera completa (tarda unos minutos)
  py herramientas/balance_ballestas.py --n 4000 --niveles 1
"""
import sys, io, argparse, types, random
sys.path.insert(0, __file__.rsplit('\\', 1)[0] if '\\' in __file__ else __file__.rsplit('/', 1)[0])
import balance_combate as B   # (ya deja la salida en UTF-8)

def opciones(**k):
    o = dict(n=6000, arco_fuerza=0.5, arco_dados=1.5, res_t4=1.0, perfora=0.0, crit_frec=0, sutileza=0.0, res='', crit_frec_t4=0, def_mult=1.0,
             costo_div=2, costo_div2=1, arco_ignora_res=0, arco_tipo=4, arco_fijo=0, arco_pdg=0, arco_frec=0, arco_perfora=0.0, ballesta=True,
             bal_tipo=6, bal_dados=1, bal_fijo=0, bal_costo='arma', bal_recarga=2, bal_perfora=0)
    o.update(k)
    return types.SimpleNamespace(**o)

MELEE = ['Daga T4', 'Espada T6', 'Hacha T8', 'Maza T10']
def medir(nivel, blanco, o, N, clase='Shooter'):
    d = B.blancos(nivel, o)[blanco]
    at = B.atributos(clase, nivel)
    def por_turno(fam):
        a = B.arma(fam, nivel, o)
        por = sum(B.golpe(at, a, d, o) for _ in range(N)) / N
        k = B.disparos_recarga(at['agl'], a['recarga']) if a.get('ballesta') and a.get('recarga') else B.ataques_por_turno(at['agl'], a['tipo'], o)
        return por * k
    mejor = max(por_turno(f) for f in MELEE) or 1
    return por_turno('Ballesta T6') / mejor

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--n', type=int, default=6000)
    ap.add_argument('--niveles', default='1,3,5')
    ap.add_argument('--semilla', type=int, default=7)
    a = ap.parse_args()
    random.seed(a.semilla)
    for nivel in [int(x) for x in a.niveles.split(',')]:
        print(f'\n## Nivel {nivel} ({ {1: "Común", 3: "Buena", 5: "Rara"}.get(nivel, "") }) · Shooter: ballesta ÷ su mejor cuerpo a cuerpo')
        print('| Ballesta | Recarga | liviano | medio | pesado |')
        print('|---|---|---|---|---|')
        dados_lista = {1: [1, 2], 3: [1, 2, 3], 5: [2, 3, 4]}.get(nivel, [1, 2, 3])
        for rec in (2, 3):
            for dados in dados_lista:
                for perf in (0, 2):
                    for fijo in range(0, 11):
                        o = opciones(bal_dados=dados, bal_fijo=fijo, bal_perfora=perf, bal_recarga=rec)
                        r = {b: medir(nivel, b, o, a.n) for b in ('liviano', 'medio', 'pesado')}
                        if r['medio'] < 0.55: continue
                        marca = ' ✅' if 0.74 <= r['medio'] <= 1.06 else ''
                        print(f"| {dados}d6+{fijo}{f' · Perfora {perf}' if perf else ''} | {rec} | {r['liviano']*100:.0f} % | {r['medio']*100:.0f} %{marca} | {r['pesado']*100:.0f} % |")
                        if r['medio'] > 1.35: break

if __name__ == '__main__':
    main()
