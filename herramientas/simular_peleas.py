# -*- coding: utf-8 -*-
"""Peleas simuladas entre arquetipos (2026-10-10, dueño: «simulá peleas de los distintos arquetipos con distintos equipos, desde el estándar
común a uno de nivel más alto, 1 vs 1 y 2 vs 2, con distintos tipos de armas: a veces la mejor para su clase, a veces una que no tanto»).

A diferencia de balance_combate.py (daño esperado por turno), acá se pelea hasta que uno cae: vida, Defensa y resistencias de la curva por
nivel, iniciativa, No2 por turno (Agilidad), costo de atacar (Tipo ÷ 2 y después el Tipo; la ballesta con su Recarga), Evasión o Parry →
Bloqueo, crítico (niveles, resistencia, d20, supercrítico), Perfora, la Fuerza que suma cada familia (entera / la mitad el arco / nada la
ballesta) y la distancia (el cuerpo a cuerpo tiene que acercarse; el arco no dispara pegado y se aleja comiéndose el ataque de oportunidad).
Las armas salen del CATÁLOGO REAL (comun/catalogo.js): en cada pelea, una al azar de esa familia y esa calidad.

Lo que NO mide (se aclara en el informe): los efectos al golpear (veneno, sangrado, lisiado…), las habilidades y el SP, los consumibles, el
terreno y la línea de tiro, los hechizos (Mago, Support, Debuffer no entran).

Uso:  py simular_peleas.py            → escribe docs/balance-peleas.md
      py simular_peleas.py --n 300    (peleas por cruce; por defecto 400)
"""
import sys, math, random, argparse, pathlib, statistics, collections
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import balance_combate as B
from catalogo_comun import leer_catalogo

RAIZ = pathlib.Path(__file__).resolve().parent.parent
TIER_NIVEL = {1: 'Común', 3: 'Buena Calidad', 5: 'Raro'}
CAT = [i for i in leer_catalogo() if not i.get('archivo') and str(i.get('tipoItem', '')).startswith('arma') and i.get('tipoDado') and not i.get('especial') and not i.get('orbe')]
ESCUDO = {1: dict(peso=2, defensa=1, bloqueo=0), 3: dict(peso=2, defensa=1, bloqueo=1), 5: dict(peso=2, defensa=2, bloqueo=1)}

def familia(it):
    if it.get('armaDeRango'): return 'Arco' if it.get('arco') else 'Ballesta' if it.get('recarga') else 'Otra de rango'
    return {4: 'Daga', 6: 'Espada', 8: 'Hacha', 10: 'Maza', 12: 'Explosiva'}.get(int(it['tipoDado']), 'Otra')
def pool(fam, nivel, manos=None):
    t = TIER_NIVEL[nivel]
    p = [i for i in CAT if familia(i) == fam and i.get('tier') == t and (manos is None or i['tipoItem'] == manos)]
    return p or [i for i in CAT if familia(i) == fam and i.get('tier') == t]

# Armadura por rol (la curva de calculadora_defensa: liviano / medio / pesado).
def armadura(nivel, peso):
    dmin, dmax, rmax = B.CURVA[nivel]
    if peso == 'liviana': return dict(defensa=dmin, res={4: math.ceil(rmax.get(4, 0) / 2)})
    if peso == 'media': return dict(defensa=round((dmin + dmax) / 2), res={t: max(0, r - 1) for t, r in rmax.items()})
    return dict(defensa=dmax, res=dict(rmax))

# Los arquetipos: clase (reparto de atributos), armadura, y sus juegos de armas («la mejor para su clase» y otras).
ARQ = {
    'Warrior': dict(armadura='media', juegos={'hacha 2 manos': ('Hacha', 'arma_2m', False), 'espada y escudo': ('Espada', 'arma_1m', True), 'arco': ('Arco', None, False), 'ballesta': ('Ballesta', 'arma_2m', False)}),
    'Tanque': dict(armadura='pesada', juegos={'maza y escudo': ('Maza', 'arma_1m', True), 'espada y escudo': ('Espada', 'arma_1m', True), 'ballesta de mano y escudo': ('Ballesta', 'arma_1m', True)}),
    'Asalto': dict(armadura='liviana', juegos={'daga': ('Daga', 'arma_1m', False), 'espada': ('Espada', 'arma_1m', False), 'maza 2 manos': ('Maza', 'arma_2m', False), 'arco': ('Arco', None, False)}),
    'Shooter': dict(armadura='liviana', juegos={'arco': ('Arco', None, False), 'ballesta': ('Ballesta', 'arma_2m', False), 'daga': ('Daga', 'arma_1m', False), 'hacha 2 manos': ('Hacha', 'arma_2m', False)}),
}
MEJOR = {'Warrior': 'hacha 2 manos', 'Tanque': 'espada y escudo',   # la maza le pide Agilidad 5 (M5, a propósito): con 3–4 no le alcanza para atacar
         'Asalto': 'daga', 'Shooter': 'arco'}

def mod(it, st): return sum(float(m.get('val') or 0) for m in it.get('mods') or [] if m.get('stat') == st)

class Luchador:
    def __init__(self, clase, nivel, juego, equipo, nombre):
        self.clase, self.nivel, self.juego, self.equipo, self.nombre = clase, nivel, juego, equipo, nombre
        at = B.atributos(clase, nivel)
        self.at = at
        fam, manos, escudo = ARQ[clase]['juegos'][juego]
        self.arma = random.choice(pool(fam, nivel, manos))
        self.fam = fam
        self.escudo = ESCUDO[nivel] if escudo else None
        arm = armadura(nivel, ARQ[clase]['armadura'])
        self.defensa = arm['defensa'] + (self.escudo['defensa'] if self.escudo else 0)
        self.res = arm['res']
        self.hp_max = self.hp = at['con'] * 5
        self.rango = self.arma.get('armaDeRango')
        self.arco = bool(self.arma.get('arco'))
        self.recarga = int(self.arma.get('recarga') or 0) if self.rango and not self.arco else 0
        self.alcance = max(1, at['des'] + mod(self.arma, 'rng')) if self.rango else 1 + max(0, mod(self.arma, 'rng'))
        self.pos = 0
    vivo = property(lambda s: s.hp > 0)
    def tipo(self): return int(self.arma['tipoDado'])
    def costo(self, k):
        if self.recarga: return self.recarga * (k + 1)
        t = self.tipo(); c = math.ceil(t / 2) if k == 0 else t
        return max(0, c - (int(self.arma.get('ahorroNitros') or 0) if k == 0 else 0))
    def fue_suma(self):
        if not self.rango: return self.at['fue']
        return math.ceil(self.at['fue'] / 2) if self.arco else 0
    def puede_parry(self, atacante):
        if atacante.rango: return bool(self.escudo)   # un disparo: solo con escudo
        return (not self.rango) or bool(self.escudo)
    def peso_bloqueo(self): return (self.escudo['peso'] if self.escudo else int(self.arma.get('peso') or 1))

def tirar(v): return B.tirar(max(1, v))

def ataque(a, d, k):
    """a ataca a d (k = cuántos ataques hizo a en el turno, para la Perfora no importa). Devuelve el daño."""
    it = a.arma
    p = tirar(a.at['des'] + mod(it, 'pdg'))
    # El defensor elige: Parry (si puede, le quedan No2 y su Parry es mejor que su Evasión) o Evasión.
    usa_parry = d.puede_parry(a) and d.no2 >= 1 and d.at['des'] > d.at['agl']
    if usa_parry:
        d.no2 -= 1
        if tirar(d.at['des'] + (0)) >= p:
            # Bloqueo: Fuerza + Peso del arma o escudo, contra la Fuerza del atacante + el Peso de su arma.
            bl = tirar(d.at['fue'] + d.peso_bloqueo() + (d.escudo['bloqueo'] if d.escudo else 0))
            fz = tirar(a.at['fue'] + int(it.get('peso') or 1))
            if bl >= fz: return 0
            mitad = True
        else: mitad = False
        e = None
    else:
        e = max(1, tirar(d.at['agl']))
        if p < e or (p == e and random.random() < .5): return 0
        mitad = False
    n = int(it.get('peso') or 1) + int(it.get('danoAmplificado') or 0)
    tipo = a.tipo()
    dano = sum(random.randint(1, tipo) for _ in range(n)) + a.fue_suma() + float(it.get('danoFijo') or 0)
    # El crítico (contra la Evasión; con Parry, contra el Parry que perdió no hay crítico en este modelo: se simplifica a sin crítico)
    if e is not None:
        frec = mod(it, 'crit')
        res = max(0, d.res.get(tipo, 0) - int(it.get('ignoraResistCrit') or 0))
        niveles = (p - e) // max(2, tipo - int(frec)) - res
        if niveles > 0:
            r = [random.randint(1, 20) for _ in range(niveles)]
            v = r.count(20); bmax = max(r)
            return dano * (4 * v if v >= 2 else 4 if bmax >= 20 else 3 if bmax >= 17 else 2 if bmax >= 7 else 1)
    perf = min(5, int(it.get('perfora') or 0))
    golpe = max(0, dano - max(0, d.defensa - perf))
    return math.ceil(golpe / 2) if mitad else golpe

def turno(a, enemigos, aliados, log):
    vivos = [e for e in enemigos if e.vivo]
    if not vivos: return
    a.no2 = a.at['agl']
    # Objetivo: el que está más cerca; entre iguales, el de menos vida.
    obj = min(vivos, key=lambda e: (abs(e.pos - a.pos), e.hp))
    dist = abs(obj.pos - a.pos)
    k = 0
    if not a.rango:
        # Acercarse (1 No2 por casillero) hasta tenerlo al alcance.
        while dist > a.alcance and a.no2 >= 1:
            a.pos += 1 if obj.pos > a.pos else -1; a.no2 -= 1; dist -= 1
        if dist > a.alcance: return
    else:
        if a.arco and dist < 2:   # el arco no dispara pegado: se aleja 1 y se come el ataque de oportunidad de quien estaba al lado
            if a.no2 >= 1:
                for e in vivos:
                    if abs(e.pos - a.pos) <= 1 and not e.rango:
                        dmg = ataque(e, a, 0); a.hp -= dmg
                a.pos += -1 if obj.pos > a.pos else 1; a.no2 -= 1; dist += 1
                if not a.vivo: return
            else: return
    reserva = 1 if (a.at['des'] > a.at['agl'] and (not a.rango or a.escudo)) else 0   # guarda 1 No2 para un Parry si le conviene (no a costa del primer ataque)
    while a.no2 >= a.costo(k) and (k == 0 or a.no2 - a.costo(k) >= reserva) and obj.vivo:
        a.no2 -= a.costo(k)
        obj.hp -= ataque(a, obj, k)
        k += 1
        if not obj.vivo:
            vivos = [e for e in enemigos if e.vivo]
            if not vivos: return
            obj = min(vivos, key=lambda e: (abs(e.pos - a.pos), e.hp))
            if abs(obj.pos - a.pos) > a.alcance: break
    # El tirador se aleja con lo que le sobra («kitear»), si nadie lo tiene pegado (alejarse de al lado le costaría un ataque de oportunidad).
    if a.rango:
        cuerpo = [e for e in enemigos if e.vivo and not e.rango]
        if cuerpo and all(abs(e.pos - a.pos) > 1 for e in cuerpo):
            lejos = 1 if a.pos >= min(e.pos for e in cuerpo) else -1
            while a.no2 - reserva >= 1:
                a.pos += lejos; a.no2 -= 1
    a.no2 = max(a.no2, 0)

def pelea(eqA, eqB, dist=6, max_turnos=40):
    for x in eqA: x.pos = 0
    for x in eqB: x.pos = dist
    for x in eqA + eqB: x.no2 = x.at['agl']
    orden = sorted(eqA + eqB, key=lambda x: -(tirar(x.at['agl']) + random.random()))
    for t in range(1, max_turnos + 1):
        for x in orden:
            if not x.vivo: continue
            ene, ali = (eqB, eqA) if x in eqA else (eqA, eqB)
            turno(x, ene, ali, None)
            if not any(e.vivo for e in eqB): return 'A', t
            if not any(e.vivo for e in eqA): return 'B', t
    return '=', max_turnos

def cruce(defA, defB, nivel, n, dist=6):
    gan = collections.Counter(); turnos = []
    vida = []
    for _ in range(n):
        A = [Luchador(c, nivel, j, 'A', f'A{i}') for i, (c, j) in enumerate(defA)]
        Bq = [Luchador(c, nivel, j, 'B', f'B{i}') for i, (c, j) in enumerate(defB)]
        g, t = pelea(A, Bq, dist)
        gan[g] += 1; turnos.append(t)
        ganadores = A if g == 'A' else Bq if g == 'B' else []
        if ganadores: vida.append(sum(max(0, x.hp) for x in ganadores) / sum(x.hp_max for x in ganadores))
    return {'A': gan['A'] / n, 'B': gan['B'] / n, 'empate': gan['='] / n, 'turnos': statistics.mean(turnos), 'vida': statistics.mean(vida) if vida else 0}

def pct(x): return f'{round(100 * x)} %'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--n', type=int, default=400)
    o = ap.parse_args()
    random.seed(10)
    L = []
    L.append('# Balance — peleas simuladas entre arquetipos (2026-10-10)\n')
    L.append('> Pedido del dueño (2026-10-10): «simulá peleas de los distintos arquetipos con distintos equipos, desde el estándar común a uno de nivel más alto, '
             '1 vs 1 y 2 vs 2, con distintos tipos de armas, a veces la mejor para su clase, a veces una que no tanto». Herramienta: '
             '[`herramientas/simular_peleas.py`](../herramientas/simular_peleas.py) (`py simular_peleas.py --n 400`). Cada cruce: '
             f'{o.n} peleas hasta que un equipo cae, con armas al azar del catálogo real de esa familia y esa calidad (nivel 1 = Común, 3 = Buena, 5 = Rara).\n')
    L.append('**Qué mide:** vida (Constitución × 5), Defensa y resistencias a crítico de la curva por nivel (Shooter y Asalto con armadura liviana, Warrior media, '
             'Tanque pesada), escudo (+Defensa, Parry contra disparos, Bloqueo), iniciativa, No2 por turno (Agilidad), costo de atacar (la ballesta con su '
             'Recarga), Evasión o Parry → Bloqueo (el defensor elige Parry si su Destreza es mayor que su Agilidad y guarda 1 No2 para eso), crítico completo, '
             'Perfora, la Fuerza que suma cada familia y la distancia (arrancan a 6 casilleros; el cuerpo a cuerpo se acerca a 1 No2 por casillero; el arco '
             'no dispara pegado y se aleja comiéndose el ataque de oportunidad).\n')
    L.append('**Qué NO mide:** efectos al golpear (veneno, sangrado, lisiado, rompe armadura…), habilidades y SP, consumibles, terreno y línea de tiro, '
             'hechizos (Mago, Support y Debuffer no entran), y la inteligencia táctica de un jugador real. Los números son una guía, no un veredicto.\n')

    # 1) 1 vs 1 con la mejor arma de cada clase, por nivel.
    clases = list(ARQ)
    for nivel in (1, 3, 5):
        L.append(f'\n## 1 vs 1 · nivel {nivel} ({TIER_NIVEL[nivel]}) · cada clase con su mejor arma\n')
        L.append('Cada celda: % de peleas que gana la clase de la fila contra la de la columna (turnos promedio).\n')
        L.append('| | ' + ' | '.join(f'{c} ({MEJOR[c]})' for c in clases) + ' |')
        L.append('|' + '---|' * (len(clases) + 1))
        for a in clases:
            fila = []
            for b in clases:
                if a == b: fila.append('—'); continue
                r = cruce([(a, MEJOR[a])], [(b, MEJOR[b])], nivel, o.n)
                fila.append(f"{pct(r['A'])} ({r['turnos']:.1f})")
            L.append(f'| **{a}** | ' + ' | '.join(fila) + ' |')
        print('1v1 nivel', nivel, 'listo', flush=True)

    # 2) Cada clase con cada uno de sus juegos de armas contra los demás (con su mejor arma), por nivel: el % de victorias promedio.
    L.append('\n## 1 vs 1 · ¿qué juego de armas le conviene a cada clase?\n')
    L.append('% de victorias promedio de la clase con ese juego contra las otras tres clases (cada una con su mejor arma).\n')
    L.append('| Clase · juego | Nivel 1 | Nivel 3 | Nivel 5 |')
    L.append('|---|---|---|---|')
    for a in clases:
        for juego in ARQ[a]['juegos']:
            cel = []
            for nivel in (1, 3, 5):
                vs = [cruce([(a, juego)], [(b, MEJOR[b])], nivel, o.n // 2)['A'] for b in clases if b != a]
                cel.append(pct(statistics.mean(vs)))
            L.append(f"| {a} · {juego}{' ★' if juego == MEJOR[a] else ''} | " + ' | '.join(cel) + ' |')
        print('juegos', a, 'listo', flush=True)

    # 3) Saltos de nivel: el de nivel más alto contra el de más bajo.
    L.append('\n## Diferencia de nivel · la misma clase y arma, un nivel de equipo arriba\n')
    L.append('% que gana el de nivel más alto (atributos y equipo de su nivel).\n')
    L.append('| Clase | Nivel 3 contra nivel 1 | Nivel 5 contra nivel 3 |')
    L.append('|---|---|---|')
    def cruce_niveles(c, na, nb, n):
        g = 0
        for _ in range(n):
            A = [Luchador(c, na, MEJOR[c], 'A', 'A')]; Bq = [Luchador(c, nb, MEJOR[c], 'B', 'B')]
            if pelea(A, Bq)[0] == 'A': g += 1
        return g / n
    for c in clases:
        L.append(f'| {c} | {pct(cruce_niveles(c, 3, 1, o.n // 2))} | {pct(cruce_niveles(c, 5, 3, o.n // 2))} |')

    # 4) 2 vs 2: parejas típicas.
    L.append('\n## 2 vs 2 · parejas\n')
    L.append('% que gana la pareja de la fila contra la de la columna (turnos promedio). Cada uno con su mejor arma salvo que se diga.\n')
    PAREJAS = {
        'Warrior + Shooter': [('Warrior', MEJOR['Warrior']), ('Shooter', 'arco')],
        'Tanque + Shooter (ballesta)': [('Tanque', MEJOR['Tanque']), ('Shooter', 'ballesta')],
        'Warrior + Tanque': [('Warrior', MEJOR['Warrior']), ('Tanque', MEJOR['Tanque'])],
        'Asalto + Asalto': [('Asalto', 'daga'), ('Asalto', 'daga')],
        'Shooter + Shooter': [('Shooter', 'arco'), ('Shooter', 'ballesta')],
    }
    nombres = list(PAREJAS)
    for nivel in (1, 3, 5):
        L.append(f'\n### Nivel {nivel}\n')
        L.append('| | ' + ' | '.join(nombres) + ' |')
        L.append('|' + '---|' * (len(nombres) + 1))
        for a in nombres:
            fila = []
            for b in nombres:
                if a == b: fila.append('—'); continue
                r = cruce(PAREJAS[a], PAREJAS[b], nivel, o.n // 2)
                fila.append(f"{pct(r['A'])} ({r['turnos']:.1f})")
            L.append(f'| **{a}** | ' + ' | '.join(fila) + ' |')
        print('2v2 nivel', nivel, 'listo', flush=True)

    # 5) Cómo rinde cada familia de armas: cada clase con cada familia contra un Warrior con hacha (la vara de medir).
    L.append('\n## Familias de armas contra la misma vara (un Warrior con hacha a 2 manos)\n')
    L.append('% que gana la clase de la fila con esa arma contra el Warrior con hacha del mismo nivel. Sirve para comparar armas entre sí, no clases.\n')
    fams = [('Daga', 'arma_1m', False), ('Espada', 'arma_1m', False), ('Hacha', 'arma_2m', False), ('Maza', 'arma_2m', False), ('Arco', None, False), ('Ballesta', 'arma_2m', False)]
    for c in ('Shooter', 'Asalto', 'Warrior'):
        L.append(f'\n**{c}**\n')
        L.append('| Arma | Nivel 1 | Nivel 3 | Nivel 5 |')
        L.append('|---|---|---|---|')
        for fam in fams:
            ARQ[c]['juegos']['_prueba'] = fam
            cel = [pct(cruce([(c, '_prueba')], [('Warrior', 'hacha 2 manos')], nivel, o.n // 2)['A']) for nivel in (1, 3, 5)]
            del ARQ[c]['juegos']['_prueba']
            L.append(f'| {fam[0]} | ' + ' | '.join(cel) + ' |')
    print('familias listo', flush=True)

    salida = RAIZ / 'docs' / 'balance-peleas.md'
    salida.write_text('\n'.join(L) + '\n', encoding='utf-8')
    print('escrito', salida)

if __name__ == '__main__':
    main()
