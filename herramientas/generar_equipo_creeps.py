# -*- coding: utf-8 -*-
"""Genera el bloque de EQUIPO y DEFENSA de los creeps dentro de comun/creeps-base.js.

Pedidos del dueño (2026-09-26):
  - Humanos y humanoides llevan equipo con una escala de cantidad y calidad por nivel:
      N1: 1 arma Común + 1 ítem defensivo Común (siempre) · N2: 1 arma + 2 defensivos (Común y, en la mitad, uno de Buena Calidad) ·
      N3: 1 o 2 armas + 2 o 3 defensivos (Buena) · N4: 1 o 2 armas + 3 defensivos (Buena/Raro) · N5: 1 o 2 armas + 3 a 5 (Raro/Excepcional). Jefe: +1 tier y +1 ítem.
  - ARMAS: pueden tener su arma temática (con su nombre) en cualquier nivel, pero con EXACTAMENTE los valores de un ítem del catálogo (el mismo Tipo de dado que ya tenían).
    Los lanzadores llevan un arma simple del catálogo y su foco mágico temático como segundo plano.
  - DEFENSA: la de un HUMANO es siempre la de su equipo; un HUMANOIDE puede tener defensa propia (natural) y además equipo; todo lo que NO es humano tiene defensa NATURAL.
    Los valores por nivel son parecidos entre creeps; el rol tanque juega con mucha defensa. Objetivo T por nivel [1, 2,5, 4, 6, 8] × factor del rol
    (tanque 1,7 · melee 1,1 · asalto 0,8 · rango 0,8 · apoyo 0,8 · debuffer 0,7 · mágico 0,6); el jefe suma 2.
Las piezas salen del catálogo (datos/catalogo.json); este script vuelca una tabla compacta y la lógica entre los marcadores
/*EQUIPO_CREEP:INICIO*/ y /*EQUIPO_CREEP:FIN*/ de comun/creeps-base.js. Volver a correrlo cuando cambie el catálogo.

Uso: python herramientas/generar_equipo_creeps.py
"""
import json, pathlib, collections

RAIZ = pathlib.Path(__file__).resolve().parent.parent
CAT = RAIZ / 'datos' / 'catalogo.json'
DEST = RAIZ / 'comun' / 'creeps-base.js'
TIERS = ['Común', 'Buena Calidad', 'Raro', 'Excepcional']
SLOTS = {'cabeza': 'cabeza', 'armadura_blanda': 'torso', 'armadura_rigida': 'torso', 'manos': 'manos', 'piernas': 'piernas', 'pies': 'pies', 'escudo_1m': 'escudo'}
POR_GRUPO = 8   # máximo de piezas por (grupo, tier)


def tier_norm(t):
    for x in TIERS + ['Legendario']:
        if t and t[:3] == x[:3]:
            return x
    return 'Común'


def bonus_def(it):
    return sum(m['val'] for m in it.get('mods', []) if m['stat'] == 'def')


def compacto(it):
    o = {'n': it['nombre'], 't': it['tipoItem'], 'k': tier_norm(it['tier']), 'p': it.get('peso', 0), 'det': (it.get('detalle') or '')[:160]}
    if it['tipoItem'].startswith('arma_'):
        o.update({'d': it.get('tipoDado', 0), 'f': it.get('danoFijo', 0), 'r': bool(it.get('armaDeRango')), 'm': [m for m in it.get('mods', [])],
                  'e': [{k: e[k] for k in ('nombre', 'caras', 'exitos', 'dado', 'detalle', 'stacks') if k in e} for e in it.get('efectosGolpe') or []]})
    else:
        o.update({'def': bonus_def(it), 'm': [m for m in it.get('mods', []) if m['stat'] != 'def']})
    return o


def pick(lista):
    lista = sorted(lista, key=lambda x: x['nombre'])
    if len(lista) <= POR_GRUPO:
        return lista
    paso = len(lista) / POR_GRUPO
    return [lista[int(i * paso)] for i in range(POR_GRUPO)]


JS = r"""/*EQUIPO_CREEP:INICIO*/
  /* ================= EQUIPO Y DEFENSA DE LOS CREEPS (rework de creeps, 2026-09-26) — generado por herramientas/generar_equipo_creeps.py =================
     EQUIPO (humanos y humanoides), escala por nivel: N1 arma y defensa Comunes · N2 un arma y 2 defensivos (Común + la mitad con uno de Buena) · N3 1–2 armas y 2–3 defensivos (Buena) ·
     N4 1–2 armas y 3 (Buena/Raro) · N5 1–2 armas y 3–5 (Raro/Excepcional) · jefe: +1 tier y +1 ítem. Las armas conservan el NOMBRE temático del creep pero tienen EXACTAMENTE los valores de un
     ítem del catálogo (mismo Tipo de dado que ya tenían); los lanzadores llevan un arma simple y su foco mágico aparte.
     DEFENSA: un HUMANO tiene la de su equipo; un HUMANOIDE tiene defensa natural (la mitad del objetivo) y además su equipo; lo que NO es humano tiene defensa natural. Objetivo por nivel
     [1, 2,5, 4, 6, 8] × factor del rol (tanque 1,7 · melee 1,1 · asalto 0,8 · rango 0,8 · apoyo 0,8 · debuffer 0,7 · mágico 0,6); el jefe suma 2. */
  const EQUIPO_CREEP = __TABLA__;
  const TIERS_EQ = ['Común', 'Buena Calidad', 'Raro', 'Excepcional'];
  const ROLES_EQ = ['melee', 'tanque', 'asalto', 'rango', 'mágico', 'apoyo', 'debuffer'];
  const DEF_NIVEL = [1, 2.5, 4, 6, 8];
  const DEF_ROL = {tanque: 1.7, melee: 1.1, asalto: 0.8, rango: 0.8, apoyo: 0.8, debuffer: 0.7, 'mágico': 0.6};
  const hashEq = (s, sal) => [...(s + '|' + sal)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const pctEq = (nombre, sal) => hashEq(nombre, sal) % 100;
  const subeTier = (t, n) => TIERS_EQ[Math.min(TIERS_EQ.length - 1, Math.max(0, TIERS_EQ.indexOf(t) + n))];
  const rolDe = c => c.etiquetas.find(e => ROLES_EQ.includes(e)) || 'melee';
  const objetivoDef = c => Math.max(0, DEF_NIVEL[Math.min(5, Math.max(1, c.nivel)) - 1] * (DEF_ROL[rolDe(c)] || 1) + (c.datos.jefe ? 2 : 0));
  function escalaEquipo(c){
    const n = c.nivel, nom = c.nombre, jefe = !!c.datos.jefe, r = sal => pctEq(nom, sal);
    let armas, defs;
    if(n === 1){ armas = ['Común']; defs = ['Común']; }
    else if(n === 2){ armas = ['Común']; defs = ['Común', r('d2') < 50 ? 'Buena Calidad' : 'Común']; }
    else if(n === 3){ armas = ['Buena Calidad', ...(r('a3') < 50 ? ['Común'] : [])]; defs = ['Buena Calidad', 'Común', ...(r('d3') < 34 ? ['Buena Calidad'] : [])]; }
    else if(n === 4){ armas = [r('a4') < 50 ? 'Raro' : 'Buena Calidad', r('b4') < 50 ? 'Buena Calidad' : 'Común']; defs = ['Buena Calidad', 'Buena Calidad', r('d4') < 50 ? 'Raro' : 'Buena Calidad']; }
    else { armas = [r('a5') < 34 ? 'Excepcional' : 'Raro', 'Buena Calidad']; defs = ['Raro', 'Raro', r('d5') < 34 ? 'Excepcional' : 'Raro', ...(r('e5') < 50 ? ['Buena Calidad'] : [])]; }
    if(jefe){ armas = armas.map(t => subeTier(t, 1)); defs = [...defs.map(t => subeTier(t, 1)), subeTier(defs[defs.length - 1], 1)]; }
    return {armas, defs};
  }
  // Pieza del tier pedido (o de uno más bajo si no hay). Con `objetivo` (defensa): la más cercana; sin él, una fija por creep.
  function piezaEq(lista, tier, sal, nombre, objetivo){
    for(let i = TIERS_EQ.indexOf(tier); i >= 0; i--){
      let l = lista && lista[TIERS_EQ[i]];
      if(!(l && l.length)) continue;
      if(objetivo !== undefined){
        const mejor = Math.min(...l.map(x => Math.abs((x.def || 0) - objetivo)));
        l = l.filter(x => Math.abs((x.def || 0) - objetivo) === mejor);
      }
      return l[hashEq(nombre, sal) % l.length];
    }
    return null;
  }
  const critIx = {tipo1: 0, tipo2: 1, tipo3: 2, tipo4: 3, tipo5: 4};
  function aplicarEquipo(){
    lista.forEach(c => {
      const d = c.datos, tipo = d.tipoCriatura, rol = rolDe(c), obj = objetivoDef(c);
      // ---- no humanos: defensa natural y nada más ----
      if(tipo !== 'humano' && tipo !== 'humanoide'){ d.defensa = Math.round(obj); return; }
      const lanzador = rol === 'mágico' || rol === 'apoyo' || rol === 'debuffer';
      const {armas, defs} = escalaEquipo(c);
      const notas = [];
      // ---- arma principal: valores EXACTOS de un ítem del catálogo (mismo Tipo y mismo alcance), con el nombre temático (los lanzadores: arma simple + foco aparte) ----
      const focoOriginal = d.armaNombre, eraRango = !!d.armaDeRango;
      const grupoArma = EQUIPO_CREEP.arma[(eraRango ? 'r' : 'm') + d.armaTipo];
      const principal = piezaEq(grupoArma, armas[0], 'arma', c.nombre);
      d.equipo = [];
      if(principal){
        d.armaNombre = lanzador ? principal.n : focoOriginal;
        d.armaPeso = principal.p; d.armaFijo = principal.f; d.armaDeRango = principal.r; d.armaMods = structuredClone(principal.m || []);
        d.armaEfectos = structuredClone(principal.e || []); d.armaManos = principal.t;
        d.armaDetalle = lanzador ? (principal.det || '') : `Equivale a «${principal.n}» (${principal.k}), con exactamente sus valores. ${principal.det || ''}`.trim();
        notas.push(lanzador ? `${principal.n} (${principal.k})` : `${focoOriginal} [= ${principal.n}] (${principal.k})`);
        if(lanzador) d.equipo.push({id: 'foco-' + slug(c.nombre), nombre: focoOriginal, tipoItem: 'arma_1m', def: 0, mods: [], detalle: 'Foco mágico temático: de acá salen los hechizos de sus habilidades (segundo plano; sin daño propio).'});
      }else notas.push(d.armaNombre);
      // ---- segunda arma (nivel 3+): catálogo, con una mano libre ----
      const dosManos = /2m/.test(d.armaManos || '');
      if(!lanzador && !dosManos && armas.length > 1 && c.nivel >= 3 && !d.armaDeRango){
        const seg = piezaEq(EQUIPO_CREEP.arma['m' + (d.armaTipo <= 6 ? 4 : d.armaTipo === 8 ? 6 : 8)] || grupoArma, armas[1], 'arma2', c.nombre);
        if(seg){ d.equipo.push({id: 'eq2-' + slug(c.nombre), nombre: seg.n, tipoItem: seg.t, def: 0, mods: structuredClone(seg.m || []), detalle: '2.ª arma. ' + (seg.det || '')}); notas.push(`${seg.n} (${seg.k})`); }
      }
      // ---- defensivos: torso primero (rígido salvo lanzadores, asalto y rango), luego cabeza, piernas, manos, pies y —con una mano libre— escudo. Lo que traía antes se reemplaza por la escala. ----
      const orden = ['torso', 'cabeza', 'piernas', 'manos', 'pies'];
      if(!dosManos && !d.armaDeRango && !lanzador && (rol === 'tanque' || pctEq(c.nombre, 'esc') < 25)) orden.splice(1, 0, 'escudo');
      const objEquipo = tipo === 'humano' ? obj : Math.max(0, obj - Math.floor(obj / 2));   // el humano viste toda su defensa; el humanoide, la mitad (la otra es natural)
      let sumDef = 0; const crit = [0, 0, 0, 0, 0]; let torsoNombre = '';
      const cantidad = defs.length;
      let usadas = 0;
      for(let i = 0; i < orden.length && usadas < cantidad; i++){
        const slot = orden[i], lst = EQUIPO_CREEP.def[slot];
        const porPieza = Math.max(0, (objEquipo - sumDef) / (cantidad - usadas));
        let p = piezaEq(lst, defs[usadas], 'def' + slot, c.nombre, porPieza);
        if(!p) continue;
        if(slot === 'torso' && p.t === 'armadura_rigida' && (lanzador || rol === 'asalto' || rol === 'rango')){
          const blandas = {}; TIERS_EQ.forEach(t => { blandas[t] = ((lst || {})[t] || []).filter(x => x.t === 'armadura_blanda'); });
          p = piezaEq(blandas, p.k, 'blanda', c.nombre, porPieza) || p;
        }
        usadas++;
        d.equipo.push({id: 'eq-' + slot + '-' + slug(c.nombre), nombre: p.n, tipoItem: p.t, def: p.def || 0, mods: structuredClone(p.m || []), detalle: p.det || ''});
        sumDef += p.def || 0; if(slot === 'torso') torsoNombre = p.n;
        (p.m || []).forEach(m => { const ix = critIx[m.stat]; if(ix !== undefined) crit[ix] += m.val; });
        notas.push(`${p.n} (${p.k})`);
      }
      d.crit = crit.map(v => Math.min(3, v));
      const natural = tipo === 'humano' ? 0 : Math.floor(obj / 2);
      d.defensa = natural + sumDef;
      d.armaduraTipo = torsoNombre;
      c.detalle = c.detalle.replace(/ Equipo: [^.]*\./, '') + ' Equipo: ' + notas.join(', ') + '.' + (natural ? ` Defensa natural ${natural} + equipo ${sumDef}.` : '');
      c.etiquetas = [...new Set([...c.etiquetas, 'con equipo'])];
    });
  }
  aplicarEquipo();
/*EQUIPO_CREEP:FIN*/"""


def main():
    cat = json.load(open(CAT, encoding='utf-8'))
    grupos = collections.defaultdict(list)
    for it in cat:
        ti = it['tipoItem']
        tier = tier_norm(it.get('tier'))
        if tier not in TIERS or it.get('consumible') or it.get('ocultoEnCatalogo'):
            continue
        if ti in ('arma_1m', 'arma_2m'):
            if it.get('tipoDado') not in (4, 6, 8, 10):   # el Tipo 12 es solo del efecto Explosión (muy raro): los creeps no lo llevan de equipo base
                continue
            grupos[('arma', 'rango' if it.get('armaDeRango') else 'melee', it['tipoDado'], tier)].append(it)
        elif ti in SLOTS:
            grupos[('def', SLOTS[ti], tier)].append(it)
    tabla = {'arma': {}, 'def': {}}
    for k, v in grupos.items():
        if k[0] == 'arma':
            tabla['arma'].setdefault('%s%d' % (k[1][0], k[2]), {})[k[3]] = [compacto(x) for x in pick(v)]
        else:
            tabla['def'].setdefault(k[1], {})[k[2]] = [compacto(x) for x in pick(v)]
    js = JS.replace('__TABLA__', json.dumps(tabla, ensure_ascii=False, separators=(',', ':')))
    s = open(DEST, 'rb').read().decode('utf-8')
    crlf = '\r\n' in s
    s = s.replace('\r\n', '\n')
    if '/*EQUIPO_CREEP:INICIO*/' in s:
        a, b = s.index('/*EQUIPO_CREEP:INICIO*/'), s.index('/*EQUIPO_CREEP:FIN*/') + len('/*EQUIPO_CREEP:FIN*/')
        s = s[:a] + js + s[b:]
    else:
        marca = '  window.CREEPS_BASE = lista;'
        assert marca in s
        s = s.replace(marca, '  ' + js + '\n\n' + marca, 1)
    open(DEST, 'wb').write((s.replace('\n', '\r\n') if crlf else s).encode('utf-8'))
    n = sum(len(v) for g in tabla['def'].values() for v in g.values()) + sum(len(v) for g in tabla['arma'].values() for v in g.values())
    print('tabla de equipo:', n, 'piezas;', len(js) // 1024, 'KB')


if __name__ == '__main__':
    main()
