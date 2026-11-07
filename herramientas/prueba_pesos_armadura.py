# -*- coding: utf-8 -*-
"""Prueba de la propuesta A + B + D de la armadura (2026-10-10; docs/diagnostico-armadura-media.md, P190). NO toca el catálogo: arma kits de
prueba con tres pesos (liviano / medio / pesado) y los pone en el simulador de peleas (simular_peleas.py) en vez de las piezas reales.

  A: tres pesos por parte del cuerpo · B: lo pesado tiene contra (−1 Evasión por pieza pesada desde la segunda: kit completo −4) ·
  D: la bolsa vuelve a la Defensa común (la media pasa a proteger de verdad).

Uso: py prueba_pesos_armadura.py [--n 300]   → escribe docs/prueba-pesos-armadura.md
"""
import sys, argparse, pathlib, statistics
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import simular_peleas as S

# Kit completo por peso y calidad: Defensa, Res. crítico T4 / T6, y lo que cambia la Evasión.
KITS = {
    1: {'liviana': dict(defensa=3.5, res={4: 0}, eva=+1), 'media': dict(defensa=7, res={4: 1}, eva=0), 'pesada': dict(defensa=12.5, res={4: 2, 6: 1}, eva=-4)},
    3: {'liviana': dict(defensa=6, res={4: 1}, eva=+2), 'media': dict(defensa=12, res={4: 2, 6: 1}, eva=0), 'pesada': dict(defensa=18, res={4: 3, 6: 2}, eva=-4)},
}
ESCUDO_PRUEBA = {1: 1, 3: 2}   # la Defensa que suma el escudo (aparte del kit)

def instalar():
    """Cambia cómo se arma la armadura en el simulador: el kit de prueba del peso del arquetipo (S.ARQ[clase]['armadura'])."""
    orig_init = S.Luchador.__init__
    def init(self, clase, nivel, juego, equipo, nombre):
        orig_init(self, clase, nivel, juego, equipo, nombre)
        peso = S.ARQ[clase]['armadura']
        k = KITS[nivel][peso]
        self.defensa = int(round(k['defensa'])) + (ESCUDO_PRUEBA[nivel] if self.escudo else 0)
        self.res = dict(k['res'])
        self.eva_mod = k['eva']
        self.pdg_mod = k.get('pdg', 0)
        self.def_esp = 0
    S.Luchador.__init__ = init
    # La Evasión con el modificador del kit (mínimo 1): se cambia el atributo que tiran ataque() y ataque_varita().
    orig_ataque, orig_var = S.ataque, S.ataque_varita
    def con_eva(f):
        def g(a, d, *x):
            agl, des = d.at['agl'], a.at['des']
            d.at = dict(d.at, agl=max(1, agl + getattr(d, 'eva_mod', 0)))
            a.at = dict(a.at, des=max(1, des + getattr(a, 'pdg_mod', 0)))
            try: return f(a, d, *x)
            finally: d.at = dict(d.at, agl=agl); a.at = dict(a.at, des=des)
        return g
    S.ataque, S.ataque_varita = con_eva(orig_ataque), con_eva(orig_var)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--n', type=int, default=300)
    ap.add_argument('--variante', default='eva', help="la contra de lo pesado: 'eva' (−4 Evasión) o 'pdg' (−2 PdG y Defensa algo menor)")
    ap.add_argument('--pdg', type=int, default=2, help="con --variante pdg: cuánto PdG resta lo pesado")
    ap.add_argument('--salida', default='docs/prueba-pesos-armadura.md'); o = ap.parse_args()
    if o.variante == 'pdg':   # B': la contra que muerde también a los de poca Agilidad: −N PdG con todo pesado; y lo pesado protege un poco menos
        for niv, d in ((1, 10), (3, 15)): KITS[niv]['pesada'].update(defensa=d, eva=0, pdg=-o.pdg)
    S.ARMADURA_REAL = False
    instalar()
    import random; random.seed(41)
    L = [f"# Prueba de la armadura A + B + D (2026-10-10){f' — variante: −{o.pdg} PdG con lo pesado' if o.variante == 'pdg' else ''}\n",
         'Kits de prueba, no el catálogo (ver [`diagnostico-armadura-media.md`](diagnostico-armadura-media.md), P190). Kit completo:\n',
         '| Peso | Común: Defensa · Res. T4 · Evasión | Buena: Defensa · Res. T4 · Evasión |', '|---|---|---|']
    for p in ('liviana', 'media', 'pesada'):
        a, b = KITS[1][p], KITS[3][p]
        L.append(f"| {p} | {a['defensa']} · {a['res'].get(4, 0)} · {a['eva']:+d} | {b['defensa']} · {b['res'].get(4, 0)} · {b['eva']:+d} |")
    L.append('\nEl tanque lleva además escudo (+1 / +2 Defensa). El resto de las clases, con su peso de siempre: asalto, tirador y mago livianos.\n')
    # 1) El guerrero (hacha a dos manos y espada y escudo) con cada peso contra las otras clases.
    L.append('## El guerrero con cada peso (% de victorias; nivel 1 / 3)\n')
    rivales = ['Tanque', 'Asalto', 'Mago', 'Shooter']
    L.append('| Guerrero · peso | ' + ' | '.join(f'vs {r}' for r in rivales) + ' | Promedio |')
    L.append('|' + '---|' * (len(rivales) + 2))
    for juego in ('hacha 2 manos', 'espada y escudo'):
        for peso in ('liviana', 'media', 'pesada'):
            S.ARQ['Warrior']['armadura'] = peso
            celdas, prom = [], {1: [], 3: []}
            for r in rivales:
                v = [S.cruce([('Warrior', juego)], [(r, S.MEJOR[r])], niv, o.n)['A'] for niv in (1, 3)]
                prom[1].append(v[0]); prom[3].append(v[1])
                celdas.append(f'{S.pct(v[0])} / {S.pct(v[1])}')
            L.append(f'| {juego} · {peso} | ' + ' | '.join(celdas) + f" | {S.pct(statistics.mean(prom[1]))} / {S.pct(statistics.mean(prom[3]))} |")
            print(juego, peso, 'listo', flush=True)
    S.ARQ['Warrior']['armadura'] = 'media'
    # 2) Las cinco clases con su peso de siempre (guerrero medio), todas contra todas.
    L.append('\n## Todas contra todas, con el guerrero en armadura media (% de victorias de la fila; nivel 1 / 3)\n')
    clases = list(S.ARQ)
    L.append('| | ' + ' | '.join(clases) + ' |'); L.append('|' + '---|' * (len(clases) + 1))
    for a in clases:
        fila = []
        for b in clases:
            if a == b: fila.append('—'); continue
            fila.append(' / '.join(S.pct(S.cruce([(a, S.MEJOR[a])], [(b, S.MEJOR[b])], niv, o.n // 2)['A']) for niv in (1, 3)))
        L.append(f'| **{a}** | ' + ' | '.join(fila) + ' |')
        print(a, 'listo', flush=True)
    (S.RAIZ / o.salida).write_text('\n'.join(L) + '\n', encoding='utf-8')
    print('escrito')

if __name__ == '__main__':
    main()
