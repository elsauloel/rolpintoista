# -*- coding: utf-8 -*-
"""Peleas de varias rondas con las ballestas (y desde 2026-10-11 los arcos: --familia arco) del catálogo (2026-10-11, dueño: «con esas 25, hacete una ronda de testeo: fijate si hay alguna que
pueda llegar a romper algo… contra personajes pesados, livianos»). A diferencia de balance_ballestas.py (un disparo promedio), acá se juega la pelea
entera contra el mismo blanco, ronda por ronda, con lo que se acumula y lo que se gasta:
  - la Recarga N, 2N, 3N… con los No2 de la Agilidad, y Doble cuerda, Tiro rápido, Llega cargada, primer disparo −N No2 y Tensar (si sobran No2);
  - Perfora N; Crítico frecuente / potente; Emboscada (el primer disparo de la pelea); Remate (si el blanco está Sentado);
  - Rompe armadura (%, doble, seguro con crítico): cada stack baja 1 la Defensa del blanco para el resto de la pelea;
  - Sangrado (2 de daño por turno durante 2 turnos; otro golpe le suma 1 stack y le vuelven los 2 turnos) y Veneno ×N (N de daño, después N−1…), directo a la vida;
  - Matabestias (contra una bestia). No entran (no cambian el daño contra un blanco quieto): Lisiado, Rengo, Afinidad (sin virote especial),
    Alcance con caída (dentro del alcance), Atraviesa escudos (el blanco no para con escudo), Evasión −1 (es de quien la lleva).
Se compara con la mejor arma cuerpo a cuerpo de la misma calidad de cada clase, en las mismas rondas. Reglas: las de balance_combate.py.

  py herramientas/combate_ballestas.py [--rondas 4] [--n 3000] [--nivel 1]
"""
import sys, os, json, random, math, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import balance_combate as B
import balance_ballestas as BB

def umbrales(potente):
    P = max(0, round(potente))
    return max(1, 7 - P), max(1, 17 - P // 2), max(1, 20 - P // 3)
def mult(rolls, potente):
    v = rolls.count(20)
    if v >= 2: return 4 * v
    d, t, c = umbrales(potente); b = max(rolls)
    return 4 if b >= c else 3 if b >= t else 2 if b >= d else 1

def disparo(at, arma, d, defensa, frec, potente, pdg_extra):
    """→ (pegó, daño, crítico)"""
    p, e = B.tirar(at['des']) + pdg_extra, max(1, B.tirar(d['eva']))
    if p < e or (p == e and random.random() < .5): return False, 0, False
    dano = sum(random.randint(1, arma['tipoDado']) for _ in range(arma['peso'] + int(arma.get('danoAmplificado') or 0))) + arma.get('danoFijo', 0)
    if arma.get('arco'): dano += math.ceil(at['fue'] / 2)   # el arco suma la mitad del Dmg (la ballesta, nada)
    res = d['res'].get(arma['tipoDado'], 0)
    niveles = (p - e) // max(2, arma['tipoDado'] - frec) - res
    if niveles > 0:
        return True, dano * mult([random.randint(1, 20) for _ in range(niveles)], potente), True
    perf = min(int(arma.get('perfora') or 0), dano)
    return True, max(0, dano - max(0, defensa), perf), False

def costo(arma, h):
    if not arma.get('recarga'):   # un arco (o cualquier arma sin Recarga): Tipo ÷ 2 el primero del turno, el Tipo completo los siguientes
        t = int(arma['tipoDado']); c = math.ceil(t / 2) if h == 0 else t
        return max(0, c - 1) if arma.get('tiroRapido') and h > 0 else c
    rc = int(arma['recarga'])
    if arma.get('tiroRapido'): return rc + h
    if arma.get('dobleCuerda') and h == 1: return rc
    return rc * (h + 1)

def pelea(arma, clase, nivel, blanco, rondas, sentado=False, bestia=False, caso=False):
    """`caso` (2026-10-11, arcos): el blanco cumple todas las condiciones del arma — Sentado (Remate), bestia (Matabestias), se movió 3 o más
    (Contra el que corre), humano (Contra humanos), sobrenatural (Contra lo sobrenatural), y el arquero está a su distancia ideal."""
    if caso: sentado = bestia = True
    o = BB.opciones()
    d = dict(B.blancos(nivel, o)[blanco])
    at = B.atributos(clase, nivel)
    defensa, total = d['defensa'], 0.0
    ideal = (arma.get('ideal') or {}) if caso else {}
    pdg_fijo = (int(arma.get('contraCorre') or 0) if caso else 0) + int(ideal.get('pdg') or 0) - (2 if arma.get('arcoDuro') and at['fue'] < int(arma['arcoDuro']) else 0)
    dano_fijo = (int(arma.get('matagente') or 0) + int(arma.get('matasobrenatural') or 0) + int(ideal.get('fijo') or 0)) if caso else 0
    lectura = 0   # Lectura del viento: golpes seguidos al mismo blanco (hasta 3)
    sangra, veneno = [0, 0], 0  # Sangrado [stacks = daño por turno, turnos que quedan] y stacks de Veneno
    frec0 = sum(m['val'] for m in arma.get('mods') or [] if m['stat'] == 'crit') + int(ideal.get('crit') or 0)
    pot = sum(m['val'] for m in arma.get('mods') or [] if m['stat'] == 'critpot') + int(ideal.get('critpot') or 0)
    pdg_arma = sum(m['val'] for m in arma.get('mods') or [] if m['stat'] == 'pdg')   # el PdG +N del arma
    primero, disparo_anterior = True, False
    for r in range(rondas):
        # Al empezar el turno del blanco: lo que le hacen los estados
        if sangra[1] > 0: total += sangra[0]; sangra[1] -= 1
        if sangra[1] == 0: sangra[0] = 0
        if veneno: total += veneno; veneno -= 1
        no2, h, disparo_este, pego_ant, racha = at['agl'], 0, False, False, 0
        while True:
            c = costo(arma, h)
            if h == 0 and arma.get('cargada') and not disparo_anterior and r > 0 or (h == 0 and arma.get('cargada') and r == 0): c = 0
            if h == 0: c = max(0, c - int(arma.get('ahorroNitros') or 0))
            if h == 0 and arma.get('enCuerda') and not disparo_anterior: c = max(0, c - 1)   # Flecha en la cuerda
            if h > 0 and arma.get('encadenar') and pego_ant: c = max(0, c - 1)              # Encadenar
            if c > no2: break
            no2 -= c
            pdg = pdg_arma + pdg_fijo + (min(int(arma.get('lecturaMax') or 3), lectura) if arma.get('lectura') else 0)
            if arma.get('respiracion'): pdg += 2 if h == 0 else -2
            if primero: pdg += int(arma.get('emboscadaPdg') or 0)
            if arma.get('tensar') and no2 >= 1 and (costo(arma, h + 1) > no2 - 1 or True):   # tensa si le alcanza (aunque le saque un disparo, no: se fija abajo)
                if no2 - 1 >= 0 and (costo(arma, h + 1) > no2 or costo(arma, h + 1) <= no2 - 1): no2 -= 1; pdg += int(arma['tensar'])
            frec = frec0 + (int(arma.get('emboscada') or 0) if primero else 0) + (int(arma.get('remate') or 0) if sentado else 0) + racha
            pot_t = pot + (int(arma.get('emboscadaPot') or 0) if primero else 0)
            pego, dmg, crit = disparo(at, arma, d, defensa, frec, pot_t, pdg)
            if pego and bestia: dmg += int(arma.get('matabestias') or 0)
            if pego: dmg += dano_fijo
            pego_ant, racha = pego, (1 if arma.get('racha') and crit else 0)
            lectura = lectura + 1 if pego else 0
            total += dmg
            if pego:
                for e in arma.get('efectosGolpe') or []:
                    if e.get('soloCritico') and not crit: continue   # solo con crítico (el del forastero: Veneno seguro con crítico)
                    if random.random() >= 1 / int(e.get('caras') or 1) and not (e.get('seguroCritico') and crit): continue
                    n = e.get('nombre')
                    if n == 'Rompe armadura': defensa -= int(e.get('stacks') or 1)
                    elif n == 'Sangrado': sangra = [sangra[0] + 1 if sangra[1] > 0 else 2, 2]   # otro golpe: +1 stack y vuelven los turnos (Combatiente.acumularSangrado)
                    elif n in ('Envenenar', 'Veneno'): veneno += int(e.get('stacks') or 2)
            primero, disparo_este, h = False, True, h + 1
        disparo_anterior = disparo_este
    return total, defensa

def melee(clase, nivel, blanco, rondas):
    o = BB.opciones(); d = B.blancos(nivel, o)[blanco]; at = B.atributos(clase, nivel)
    mejor = 0
    for fam in ('Daga T4', 'Espada T6', 'Hacha T8', 'Maza T10'):
        a = B.arma(fam, nivel, o)
        k = B.ataques_por_turno(at['agl'], a['tipo'], o)
        mejor = max(mejor, sum(B.golpe(at, a, d, o) for _ in range(800)) / 800 * k * rondas)
    return mejor

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--rondas', type=int, default=4); ap.add_argument('--n', type=int, default=2500); ap.add_argument('--nivel', type=int, default=1)
    ap.add_argument('--clases', default='Shooter,Asalto,MonoDes,Mago,Warrior'); ap.add_argument('--calidad', default='Común')
    ap.add_argument('--familia', default='ballesta', help='ballesta | arco')
    a = ap.parse_args()
    random.seed(17)
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    bal = []
    for ln in open(os.path.join(raiz, 'comun', 'catalogo.js'), encoding='utf-8'):
        t = ln.strip().rstrip(',')
        if not t.startswith('{"id"'): continue
        it = json.loads(t)
        es = it.get('arco') if a.familia == 'arco' else (it.get('armaDeRango') and it.get('recarga'))
        if it.get('archivo') or it.get('soloBotin') or not es or it['tier'] != a.calidad.replace('Buena', 'Buena Calidad') and it['tier'] != a.calidad: continue
        bal.append(it)
    clases = a.clases.split(',')
    if a.familia == 'arco':   # los arcos: un solo «en su caso» (el medio, con todas las condiciones del arco)
        esc = [('liviano', False, False, False), ('medio', False, False, False), ('pesado', False, False, False), ('medio', False, False, True)]
        nom_esc = ['liviano', 'medio', 'pesado', 'en su caso']
    else:
        esc = [('liviano', False, False, False), ('medio', False, False, False), ('pesado', False, False, False), ('pesado', True, False, False), ('medio', False, True, False)]
        nom_esc = ['liviano', 'medio', 'pesado', 'pesado Sentado', 'bestia (medio)']
    base = {(c, n): melee(c, a.nivel, b, a.rondas) for c in clases for (b, s, be, ca), n in zip(esc, nom_esc)}
    print(f'Nivel {a.nivel} · {a.rondas} rondas · daño total con la ballesta ÷ con su mejor cuerpo a cuerpo (100 % = lo mismo)')
    print('Cuerpo a cuerpo de referencia (daño total): ' + ' · '.join(f"{c} " + '/'.join(f"{base[(c, n)]:.0f}" for n in nom_esc[:3]) for c in clases))
    for it in bal:
        fila = []
        for c in clases:
            vals = []
            for (b, s, be, ca), n in zip(esc, nom_esc):
                tot = sum(pelea(it, c, a.nivel, b, a.rondas, s, be, ca)[0] for _ in range(a.n)) / a.n
                vals.append(tot / max(0.5, base[(c, n)]))
            fila.append((c, vals))
        dfin = sum(pelea(it, 'Shooter', a.nivel, 'pesado', a.rondas)[1] for _ in range(400)) / 400
        print(f"{it['nombre'].replace('Ballesta ', '').replace('Arco ', ''):22} | " + ' | '.join(f"{c[:4]} " + '/'.join(f'{v*100:.0f}' for v in vals) for c, vals in fila) + f" | Def. pesado al final {dfin:.1f}")

if __name__ == '__main__':
    main()
