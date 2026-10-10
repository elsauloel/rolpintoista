# -*- coding: utf-8 -*-
"""Peleas simuladas entre arquetipos (2026-10-10, dueño: «simulá peleas de los distintos arquetipos con distintos equipos, desde el estándar
común a uno de nivel más alto, 1 vs 1 y 2 vs 2, con distintos tipos de armas: a veces la mejor para su clase, a veces una que no tanto»).

A diferencia de balance_combate.py (daño esperado por turno), acá se pelea hasta que uno cae: vida, Defensa y resistencias de la curva por
nivel, iniciativa, No2 por turno (Agilidad), costo de atacar (Tipo ÷ 2 y después el Tipo; la ballesta con su Recarga), Evasión o Parry →
Bloqueo, crítico (niveles, resistencia, d20, supercrítico), Perfora, la Fuerza que suma cada familia (entera / la mitad el arco / nada la
ballesta) y la distancia (el cuerpo a cuerpo tiene que acercarse; el arco no dispara pegado y se aleja comiéndose el ataque de oportunidad).
Las armas salen del CATÁLOGO REAL (comun/catalogo.js): en cada pelea, una al azar de esa familia y esa calidad.

Segunda vuelta (2026-10-10, dueño): **los efectos al golpear** se modelan como en el juego (comun/estados-presets.js: Veneno, Veneno severo,
Sangrado, Quemadura, Armadura rota, Lisiado, Pajaritos, Sentado, Stun, Rengo, Drena vida, daño elemental extra) y se mide cuánto daño agrega
cada uno; y entra **el Mago con varitas** del catálogo real (SP = Especial × 3 y su recarga, el costo que sube por uso, el daño directo que
ignora la Defensa y el especial que frena la Defensa especial). Sin efectos: `--sin-efectos`.

Lo que NO mide (se aclara en el informe): las habilidades, los consumibles, el terreno y la línea de tiro, Support y Debuffer.

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
# Las varitas (armas especiales de un solo objetivo con daño): las de Rara no hay, se usan las Buenas.
CAT_VAR = [i for i in leer_catalogo() if not i.get('archivo') and i.get('especial') and i['especial'].get('dano') and i.get('tipoItem') == 'arma_1m'
           and (i['especial'].get('duelo') or {}).get('dano') and (i['especial'].get('duelo') or {}).get('objetivo', 'enemigo') == 'enemigo'
           and not (i['especial'].get('duelo') or {}).get('area')]
EFECTOS = True                                     # --sin-efectos lo apaga
EF_STATS = collections.defaultdict(lambda: [0, 0.0])   # efecto → [veces que se aplicó, daño que hizo (directo o por turno)]
ATAQUES_CON = collections.Counter()                # efecto → ataques hechos con un arma que lo trae (para «cuánto suma por ataque»)
def tirar_formula(f):
    import re
    m = re.match(r'\s*(\d*)d(\d+)\s*([+-]\s*\d+)?', str(f or ''))
    if not m: return 0
    n = int(m.group(1) or 1); c = int(m.group(2)); k = int((m.group(3) or '0').replace(' ', ''))
    return sum(random.randint(1, c) for _ in range(n)) + k
ESCUDO = {1: dict(peso=2, defensa=1, bloqueo=0), 3: dict(peso=2, defensa=1, bloqueo=1), 5: dict(peso=2, defensa=2, bloqueo=1)}

def familia(it):
    if it.get('especial'): return 'Varita'
    if it.get('armaDeRango'): return 'Arco' if it.get('arco') else 'Ballesta' if it.get('recarga') else 'Otra de rango'
    return {4: 'Daga', 6: 'Espada', 8: 'Hacha', 10: 'Maza', 12: 'Explosiva'}.get(int(it['tipoDado']), 'Otra')
def pool(fam, nivel, manos=None):
    t = TIER_NIVEL[nivel]
    if fam == 'Varita':
        return [i for i in CAT_VAR if i.get('tier') == t] or [i for i in CAT_VAR if i.get('tier') == 'Buena Calidad']
    p = [i for i in CAT if familia(i) == fam and i.get('tier') == t and (manos is None or i['tipoItem'] == manos)]
    return p or [i for i in CAT if familia(i) == fam and i.get('tier') == t]

NIVELES = (1, 3, 5)
ARMADURA_REAL = False   # --armadura-real: piezas del catálogo en vez de la curva de Defensa máxima (2026-10-10)
CAT_DEF = [i for i in leer_catalogo() if not i.get('archivo')]
def def_de(i, stat='def'): return sum(float(m.get('val') or 0) for m in i.get('mods') or [] if m.get('stat') == stat)
def pieza(slot, tier, peso):
    """Una pieza del catálogo para esa parte y calidad, elegida según el rol: pesada = el tercio con más Defensa, media = el del medio,
    liviana = la mitad con menos."""
    xs = sorted([i for i in CAT_DEF if i.get('tipoItem') == slot and i.get('tier') == tier], key=lambda i: def_de(i))
    if not xs: return None
    n = len(xs)
    tramo = xs[2 * n // 3:] if peso == 'pesada' else xs[n // 3: 2 * n // 3]   # la media y la liviana, del tercio del medio (la liviana, con torso blando)
    return random.choice(tramo or xs)
def armadura_real(nivel, peso, escudo):
    tier = TIER_NIVEL[nivel]
    torso = 'armadura_blanda' if peso == 'liviana' else 'armadura_rigida'
    piezas = [pieza(s, tier, peso) for s in ('cabeza', torso, 'manos', 'piernas', 'pies')] + ([pieza('escudo_1m', tier, 'media')] if escudo else [])
    piezas = [p for p in piezas if p]
    res = {tp: int(sum(def_de(p, k) for p in piezas)) for k, tp in (('tipo1', 4), ('tipo2', 6), ('tipo3', 8), ('tipo4', 10), ('tipo5', 12))}
    return dict(defensa=int(sum(def_de(p) for p in piezas)), res={k: v for k, v in res.items() if v}, def_esp=int(sum(def_de(p, 'armadmg') for p in piezas)))
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
    'Mago': dict(armadura='liviana', juegos={'varita': ('Varita', None, False), 'daga': ('Daga', 'arma_1m', False)}),
    'Shooter': dict(armadura='liviana', juegos={'arco': ('Arco', None, False), 'ballesta': ('Ballesta', 'arma_2m', False), 'daga': ('Daga', 'arma_1m', False), 'hacha 2 manos': ('Hacha', 'arma_2m', False)}),
}
MEJOR = {'Warrior': 'hacha 2 manos', 'Tanque': 'espada y escudo',   # la maza le pide Agilidad 5 (M5, a propósito): con 3–4 no le alcanza para atacar
         'Asalto': 'daga', 'Shooter': 'arco', 'Mago': 'varita'}
# La Defensa especial de cada armadura (frena el daño especial, no el directo): supuesto del simulador hasta medir el catálogo de defensas.
DEF_ESPECIAL = {'liviana': 0, 'media': 0.25, 'pesada': 0.34}

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
        if ARMADURA_REAL:   # piezas reales del catálogo (el escudo, una pieza más)
            arm = armadura_real(nivel, ARQ[clase]['armadura'], bool(escudo))
            self.defensa, self.res = arm['defensa'], arm['res']
        else:
            arm = armadura(nivel, ARQ[clase]['armadura'])
            self.defensa = arm['defensa'] + (self.escudo['defensa'] if self.escudo else 0)
            self.res = arm['res']
        self.hp_max = self.hp = at['con'] * 5
        self.rango = self.arma.get('armaDeRango')
        self.arco = bool(self.arma.get('arco'))
        self.recarga = int(self.arma.get('recarga') or 0) if self.rango and not self.arco else 0
        self.alcance = max(1, at['des'] + mod(self.arma, 'rng')) if self.rango else 1 + max(0, mod(self.arma, 'rng'))
        self.pos = 0
        self.est = collections.Counter()   # estados: veneno (stacks), severo (daño del próximo turno), sangrado, quemadura (turnos), rota (stacks),
        self.sentado = False               # lisiado / pajaritos / stun / rengo (turnos que le quedan)
        self.varita = self.fam == 'Varita'
        if self.varita:
            self.rango, self.arco, self.recarga = True, False, 0
            self.alcance = max(1, at['des'])
            self.sp_max = self.sp = at['esp'] * 3
        self.def_esp = arm['def_esp'] if ARMADURA_REAL else round(self.defensa * DEF_ESPECIAL[ARQ[clase]['armadura']])
    vivo = property(lambda s: s.hp > 0)
    def defensa_ef(self): return max(0, self.defensa - self.est['rota'])
    def tipo(self): return int(self.arma.get('tipoDado') or 6)
    def costo(self, k):
        if self.varita:   # 1 No2 el primer uso y +1 por cada uno más; el SP que falte se paga con No2
            e = self.arma['especial']
            no2 = int(e.get('no2', 1) if e.get('no2') is not None else 1) + k * int(e.get('sube', 1) if e.get('sube') is not None else 1)
            return no2 + max(0, int(e.get('sp') or 0) - self.sp)
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

def mitad(v, si): return max(1, v // 2) if si else v
def ataque(a, d, k):
    """a ataca a d (k = cuántos ataques hizo a en el turno). Devuelve el daño (y aplica los efectos al golpear)."""
    if a.varita: return ataque_varita(a, d)
    it = a.arma
    if EFECTOS:
        for e in it.get('efectosGolpe') or []: ATAQUES_CON[e['nombre']] += 1
    p = mitad(tirar(a.at['des'] + mod(it, 'pdg')), EFECTOS and (a.est['lisiado'] > 0 or a.est['pajaritos'] > 0))
    # El defensor elige: Parry (si puede, le quedan No2 y su Parry es mejor que su Evasión) o Evasión.
    usa_parry = d.puede_parry(a) and d.no2 >= 1 and d.at['des'] > d.at['agl'] and not d.est['stun']
    if usa_parry:
        d.no2 -= 1
        if mitad(tirar(d.at['des']), EFECTOS and d.est['lisiado'] > 0) >= p:
            # Bloqueo: Fuerza + Peso del arma o escudo, contra la Fuerza del atacante + el Peso de su arma.
            bl = tirar(d.at['fue'] + d.peso_bloqueo() + (d.escudo['bloqueo'] if d.escudo else 0))
            fz = tirar(a.at['fue'] + int(it.get('peso') or 1))
            if bl >= fz: return 0
            amedias = True
        else: amedias = False
        e = None
    else:
        e = 1 if (EFECTOS and d.est['stun']) else max(1, mitad(tirar(d.at['agl']), EFECTOS and (d.est['pajaritos'] > 0 or d.sentado)))
        if p < e or (p == e and random.random() < .5): return 0
        amedias = False
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
            golpe = dano * (4 * v if v >= 2 else 4 if bmax >= 20 else 3 if bmax >= 17 else 2 if bmax >= 7 else 1)
            return golpe + efectos_al_golpear(a, d, golpe)
    perf = min(5, int(it.get('perfora') or 0))
    golpe = max(0, dano - max(0, d.defensa_ef() - perf))
    golpe = math.ceil(golpe / 2) if amedias else golpe
    return golpe + efectos_al_golpear(a, d, golpe)

def efectos_al_golpear(a, d, golpe):
    """Los efectos al golpear del arma de a sobre d (golpe = el daño que pasó). Devuelve el daño de más que hacen en el momento."""
    if not EFECTOS: return 0
    extra = 0
    for e in a.arma.get('efectosGolpe') or []:
        n = e.get('nombre')
        if random.random() > min(1.0, int(e.get('exitos') or 1) / max(1, int(e.get('caras') or 1))): continue
        if e.get('danoMagico') and e.get('dado'):   # el daño elemental de más: directo
            v = tirar_formula(e['dado']); extra += v; EF_STATS[n][0] += 1; EF_STATS[n][1] += v; continue
        st = int(e.get('stacks') or 0)
        if n in ('Envenenar', 'Veneno severo', 'Sangrado') and golpe <= 0: continue   # necesitan que el golpe haga daño
        EF_STATS[n][0] += 1
        if n == 'Envenenar': d.est['veneno'] += st or 2
        elif n == 'Veneno severo': d.est['severo'] = max(d.est['severo'], 1)
        elif n == 'Sangrado': d.est['sangrado'] = d.est['sangrado'] + 1 if d.est['sangrado'] else (st or 2)
        elif n == 'Rompe armadura': d.est['rota'] += st or 1
        elif n == 'Lisiado': d.est['lisiado'] = 3
        elif n == 'Pajaritos': d.est['pajaritos'] = 3
        elif n == 'Derribar': d.sentado = True
        elif n == 'Aturdir': d.est['stun'] = 2
        elif n == 'Rengo': d.est['rengo'] = 3
        elif n == 'Prende fuego': d.est['quemadura'] = 3
        elif n == 'Drena vida':
            cura = min(a.hp_max - a.hp, math.floor(golpe * float(e.get('drenaPct') or 50) / 100)); a.hp += max(0, cura); EF_STATS[n][1] += max(0, cura)
    return extra

def ataque_varita(a, d):
    """La varita: PdG.Esp contra la Evasión (sin Parry ni crítico en este modelo), daño de la varita (+ el Especial si lo suma); el directo
    ignora la Defensa, el especial lo frena la Defensa especial."""
    e = a.arma['especial']
    p = mitad(tirar(a.at['esp']), EFECTOS and (a.est['lisiado'] > 0 or a.est['pajaritos'] > 0))
    ev = 1 if (EFECTOS and d.est['stun']) else max(1, mitad(tirar(d.at['agl']), EFECTOS and (d.est['pajaritos'] > 0 or d.sentado)))
    if p < ev or (p == ev and random.random() < .5): return 0
    suma = e.get('sumaEspecial')
    dano = tirar_formula(e['dano']) + (math.floor(a.at['esp'] * (1 if suma is True else float(suma))) if suma else 0)
    directo = (e.get('duelo') or {}).get('danoDirecto')
    return max(0, dano - (0 if directo else d.def_esp))

def estados_al_empezar(a):
    """El daño por turno de los estados y lo que vence. Devuelve False si pierde el turno (Stun)."""
    if not EFECTOS: return True
    for clave, nombre in (('veneno', 'Envenenar'), ('severo', 'Veneno severo'), ('sangrado', 'Sangrado'), ('quemadura', 'Prende fuego')):
        if a.est[clave] <= 0: continue
        v = 2 if clave == 'quemadura' else a.est[clave]
        a.hp -= v; EF_STATS[nombre][1] += v
        if clave == 'veneno': a.est['veneno'] -= 1
        elif clave == 'severo': a.est['severo'] += 1
        elif clave == 'quemadura': a.est['quemadura'] -= 1
    for k in ('lisiado', 'pajaritos', 'rengo'):
        if a.est[k] > 0: a.est[k] -= 1
    if a.est['stun'] > 0:
        a.est['stun'] -= 1; EF_STATS['Aturdir'][1] += 0
        return False
    return True

def turno(a, enemigos, aliados, log):
    vivos = [e for e in enemigos if e.vivo]
    if not vivos: return
    a.no2 = a.at['agl']
    if a.varita: a.sp = min(a.sp_max, a.sp + a.at['esp'] // 2)
    if not estados_al_empezar(a) or not a.vivo: return
    if a.sentado:   # levantarse cuesta 1 No2
        a.no2 -= 1; a.sentado = False
    # Objetivo: el que está más cerca; entre iguales, el de menos vida.
    obj = min(vivos, key=lambda e: (abs(e.pos - a.pos), e.hp))
    dist = abs(obj.pos - a.pos)
    k = 0
    if not a.rango:
        # Acercarse (1 No2 por casillero) hasta tenerlo al alcance.
        paso = 2 if (EFECTOS and a.est['rengo'] > 0) else 1
        while dist > a.alcance and a.no2 >= paso:
            a.pos += 1 if obj.pos > a.pos else -1; a.no2 -= paso; dist -= 1
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
        if a.varita: a.sp = max(0, a.sp - int(a.arma['especial'].get('sp') or 0))
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
    ap.add_argument('--sin-efectos', action='store_true', help='sin los efectos al golpear (como la primera vuelta)')
    ap.add_argument('--armadura-real', action='store_true', help='armaduras armadas con piezas del catálogo (no la curva de Defensa máxima)')
    ap.add_argument('--niveles', default='1,3,5', help='niveles a simular (1 = Común, 3 = Buena, 5 = Rara)')
    ap.add_argument('--salida', default='docs/balance-peleas.md', help='dónde escribir el informe')
    o = ap.parse_args()
    global EFECTOS, ARMADURA_REAL, NIVELES
    EFECTOS = not o.sin_efectos
    ARMADURA_REAL = o.armadura_real
    NIVELES = tuple(int(x) for x in o.niveles.split(','))
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
    L.append('**Segunda vuelta:** ' + ('con **los efectos al golpear** modelados como en el juego (veneno, veneno severo, sangrado, quemadura, rompe armadura, '
             'lisiado, pajaritos, derribar → sentado, aturdir → stun, rengo, drena vida, daño elemental extra)' if EFECTOS else 'SIN los efectos al golpear (`--sin-efectos`)') +
             ' y con **el Mago con varitas** (SP = Especial × 3 y su recarga; el costo que sube por uso; el daño directo ignora la Defensa y el especial lo frena la '
             'Defensa especial, que el simulador supone 0 en armadura liviana, ¼ de la Defensa en la media y ⅓ en la pesada). A nivel 5 el mago usa varitas Buenas: '
             'no hay Raras en el catálogo.\n')
    L.append('**Qué NO mide:** habilidades, consumibles, terreno y línea de tiro, Support y Debuffer, y la inteligencia táctica de un jugador real. '
             'Los números son una guía, no un veredicto.\n')

    # 1) 1 vs 1 con la mejor arma de cada clase, por nivel.
    clases = list(ARQ)
    for nivel in NIVELES:
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
    L.append('| Clase · juego | ' + ' | '.join(f'Nivel {n}' for n in NIVELES) + ' |')
    L.append('|' + '---|' * (len(NIVELES) + 1))
    for a in clases:
        for juego in ARQ[a]['juegos']:
            cel = []
            for nivel in NIVELES:
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
        L.append(f'| {c} | {pct(cruce_niveles(c, 3, 1, o.n // 2))} | ' + (pct(cruce_niveles(c, 5, 3, o.n // 2)) if 5 in NIVELES else '—') + ' |')

    # 4) 2 vs 2: parejas típicas.
    L.append('\n## 2 vs 2 · parejas\n')
    L.append('% que gana la pareja de la fila contra la de la columna (turnos promedio). Cada uno con su mejor arma salvo que se diga.\n')
    PAREJAS = {
        'Warrior + Shooter': [('Warrior', MEJOR['Warrior']), ('Shooter', 'arco')],
        'Tanque + Shooter (ballesta)': [('Tanque', MEJOR['Tanque']), ('Shooter', 'ballesta')],
        'Warrior + Tanque': [('Warrior', MEJOR['Warrior']), ('Tanque', MEJOR['Tanque'])],
        'Asalto + Asalto': [('Asalto', 'daga'), ('Asalto', 'daga')],
        'Shooter + Shooter': [('Shooter', 'arco'), ('Shooter', 'ballesta')],
        'Warrior + Mago': [('Warrior', MEJOR['Warrior']), ('Mago', 'varita')],
        'Tanque + Mago': [('Tanque', MEJOR['Tanque']), ('Mago', 'varita')],
    }
    nombres = list(PAREJAS)
    for nivel in NIVELES:
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
        L.append('| Arma | ' + ' | '.join(f'Nivel {n}' for n in NIVELES) + ' |')
        L.append('|' + '---|' * (len(NIVELES) + 1))
        for fam in fams:
            ARQ[c]['juegos']['_prueba'] = fam
            cel = [pct(cruce([(c, '_prueba')], [('Warrior', 'hacha 2 manos')], nivel, o.n // 2)['A']) for nivel in NIVELES]
            del ARQ[c]['juegos']['_prueba']
            L.append(f'| {fam[0]} | ' + ' | '.join(cel) + ' |')
    print('familias listo', flush=True)

    # 6) Cuánto suman los efectos al golpear (lo que se juntó en todas las peleas de arriba) y cada clase con y sin efectos.
    if EFECTOS:
        L.append('\n## Cuánto suman los efectos al golpear\n')
        L.append('Juntado en todas las peleas de arriba. «Por aplicación»: el daño que hizo cada vez que entró (en el momento o por turno, hasta que venció '
                 'o terminó la pelea; Drena vida: lo que curó). «Por ataque»: ese daño repartido entre todos los ataques hechos con armas que lo traen '
                 '(cuenta la probabilidad y los que fallan): **es lo que suma, en promedio, tener ese efecto en el arma**. Los de control (lisiado, pajaritos, '
                 'sentado, stun, rengo, rompe armadura) no hacen daño propio: su valor se ve en la tabla de abajo.\n')
        L.append('| Efecto | Veces que entró | Daño por aplicación | Daño por ataque |')
        L.append('|---|---|---|---|')
        for nombre, (veces, dano) in sorted(EF_STATS.items(), key=lambda x: -x[1][1]):
            if not veces: continue
            por_ap = dano / veces if veces else 0
            por_at = dano / ATAQUES_CON[nombre] if ATAQUES_CON[nombre] else 0
            L.append(f'| {nombre} | {veces} | {por_ap:.1f} | {por_at:.2f} |')
        L.append('\n**Cada clase con su mejor arma, con y sin los efectos** (% de victorias promedio contra las otras clases; nivel ' + ' / '.join(map(str, NIVELES)) + ').\n')
        L.append('| Clase · arma | Con efectos | Sin efectos |')
        L.append('|---|---|---|')
        for a in clases:
            fila = []
            for ef in (True, False):
                EFECTOS = ef
                fila.append(' / '.join(pct(statistics.mean([cruce([(a, MEJOR[a])], [(b, MEJOR[b])], nivel, o.n // 4)['A'] for b in clases if b != a])) for nivel in NIVELES))
            EFECTOS = True
            L.append(f'| {a} · {MEJOR[a]} | ' + ' | '.join(fila) + ' |')
        print('efectos listo', flush=True)

    salida = RAIZ / o.salida
    salida.write_text('\n'.join(L) + '\n', encoding='utf-8')
    print('escrito', salida)

if __name__ == '__main__':
    main()
