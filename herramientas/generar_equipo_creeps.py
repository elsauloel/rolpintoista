# -*- coding: utf-8 -*-
"""Genera el bloque de EQUIPO de los creeps (humanos y humanoides) dentro de comun/creeps-base.js.

Pedido del dueño (2026-09-26): los creeps humanos y humanoides llevan equipo con una escala de cantidad y calidad por nivel:
  N1: 1 arma Común + 1 ítem defensivo Común (siempre)
  N2: 1 arma + 2 ítems defensivos: Común y, en la mitad de los creeps, uno de Buena Calidad
  N3: 1 o 2 armas (la principal Buena) + 2 o 3 defensivos (Buena; alguno Común)
  N4: 2 armas (principal Raro o Buena) + 3 defensivos (Buena; la mitad con uno Raro)
  N5: 2 armas (principal Raro; a veces Excepcional) + 3 o 4 defensivos (Raro; a veces Excepcional). Jefe: +1 tier y +1 ítem.
Las piezas salen del catálogo (datos/catalogo.json); este script vuelca una tabla compacta y la lógica de reparto entre los marcadores
/*EQUIPO_CREEP:INICIO*/ y /*EQUIPO_CREEP:FIN*/ de comun/creeps-base.js. Volver a correrlo cuando cambie el catálogo.

Uso: python herramientas/generar_equipo_creeps.py
"""
import json, pathlib, collections, re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
CAT = RAIZ / 'datos' / 'catalogo.json'
DEST = RAIZ / 'comun' / 'creeps-base.js'
TIERS = ['Común', 'Buena Calidad', 'Raro', 'Excepcional']
SLOTS = {'cabeza': 'cabeza', 'armadura_blanda': 'torso', 'armadura_rigida': 'torso', 'manos': 'manos', 'piernas': 'piernas', 'pies': 'pies', 'escudo_1m': 'escudo'}
POR_GRUPO = 6   # máximo de piezas por (grupo, tier)


def tier_norm(t):
    for x in TIERS + ['Legendario']:
        if t and t[:3] == x[:3]:
            return x
    return 'Común'


def bonus_def(it):
    return sum(m['val'] for m in it.get('mods', []) if m['stat'] == 'def')


def compacto(it):
    o = {'n': it['nombre'], 't': it['tipoItem'], 'k': tier_norm(it['tier']), 'p': it.get('peso', 0), 'det': (it.get('detalle') or '')[:160]}
    if it['tipoItem'].startswith('arma'):
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


def main():
    cat = json.load(open(CAT, encoding='utf-8'))
    grupos = collections.defaultdict(list)
    for it in cat:
        ti = it['tipoItem']
        tier = tier_norm(it.get('tier'))
        if tier not in TIERS or it.get('consumible') or it.get('ocultoEnCatalogo'):
            continue
        if ti in ('arma_1m', 'arma_2m'):
            if it.get('tipoDado') not in (4, 6, 8, 10, 12):
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
    js = r"""/*EQUIPO_CREEP:INICIO*/
  /* ================= EQUIPO DE HUMANOS Y HUMANOIDES (rework de creeps, 2026-09-26) — generado por herramientas/generar_equipo_creeps.py =================
     Escala de cantidad y calidad por nivel (dueño): N1 arma y defensa Comunes · N2 un arma y 2 defensivos (Común + la mitad con uno de Buena) ·
     N3 1–2 armas y 2–3 defensivos (Buena) · N4 2 armas y 3 defensivos (Buena/Raro) · N5 2 armas y 3–4 defensivos (Raro/Excepcional) · jefe: +1 tier y +1 ítem.
     Las armas de la tabla se eligen con el MISMO Tipo de dado que ya tiene el creep (no cambia el costo de sus ataques). */
  const EQUIPO_CREEP = __TABLA__;
  const TIERS_EQ = ['Común', 'Buena Calidad', 'Raro', 'Excepcional'];
  const hashEq = (s, sal) => [...(s + '|' + sal)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const pctEq = (nombre, sal) => hashEq(nombre, sal) % 100;
  const subeTier = (t, n) => TIERS_EQ[Math.min(TIERS_EQ.length - 1, Math.max(0, TIERS_EQ.indexOf(t) + n))];
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
  // Una pieza de la tabla: la del tier pedido o, si no hay, la de un tier más bajo. `sal` decide cuál (siempre la misma para el mismo creep).
  function piezaEq(lista, tier, sal, nombre){
    for(let i = TIERS_EQ.indexOf(tier); i >= 0; i--){
      const l = lista && lista[TIERS_EQ[i]];
      if(l && l.length) return l[hashEq(nombre, sal) % l.length];
    }
    return null;
  }
  function aplicarEquipo(){
    lista.forEach(c => {
      const d = c.datos, tipo = d.tipoCriatura;
      if(tipo !== 'humano' && tipo !== 'humanoide') return;
      const rol = c.etiquetas.find(e => ['melee', 'tanque', 'asalto', 'rango', 'mágico', 'apoyo', 'debuffer'].includes(e)) || 'melee';
      const lanzador = rol === 'mágico' || rol === 'apoyo' || rol === 'debuffer';
      const {armas, defs} = escalaEquipo(c);
      const notas = [];
      // Arma principal: los lanzadores conservan su foco; el resto toma una del catálogo con el mismo Tipo (y de rango si ya era de rango). Niveles 1 y 2 conservan el arma temática que ya traían.
      const conserva = lanzador || c.nivel <= 2 || d.equipo.some(e => /^arma_/.test(e.tipoItem || ''));
      let principal = null;
      if(!conserva){
        principal = piezaEq(EQUIPO_CREEP.arma[(d.armaDeRango ? 'r' : 'm') + d.armaTipo], armas[0], 'arma', c.nombre) || null;
        if(principal){
          d.armaNombre = principal.n; d.armaPeso = principal.p; d.armaFijo = principal.f; d.armaDeRango = principal.r; d.armaMods = structuredClone(principal.m || []);
          d.armaEfectos = structuredClone(principal.e || []); d.armaManos = principal.t; d.armaDetalle = principal.det || '';
        }
      }
      notas.push(`${d.armaNombre}${principal ? ' (' + principal.k + ')' : ''}`);
      // Segunda arma (si el nivel la pide, la principal es de una mano y no es lanzador ni de rango): va como pieza del equipo
      const dosManos = /2m/.test(d.armaManos || '');
      let usaEscudo = false;
      if(!lanzador && !dosManos && armas.length > 1 && c.nivel >= 3 && !d.armaDeRango){
        const seg = piezaEq(EQUIPO_CREEP.arma['m' + (d.armaTipo <= 6 ? 4 : d.armaTipo === 8 ? 6 : 8)] || EQUIPO_CREEP.arma['m' + d.armaTipo], armas[1], 'arma2', c.nombre);
        if(seg){ (d.equipo = d.equipo || []).push({id: 'eq2-' + slug(c.nombre), nombre: seg.n, tipoItem: seg.t, def: 0, mods: structuredClone(seg.m || []), detalle: '2.ª arma. ' + (seg.det || '')}); notas.push(`${seg.n} (${seg.k})`); }
      }
      // Defensivos: torso primero (rígido para tanque/melee, blando para el resto), luego cabeza, piernas, manos, pies y —si hay una mano libre— escudo.
      const previoDef = (d.equipo || []).filter(e => !/^arma_/.test(e.tipoItem || ''));
      const yaTorso = previoDef.some(e => /^armadura/.test(e.tipoItem || ''));
      const orden = ['torso', 'cabeza', 'piernas', 'manos', 'pies'];
      if(!dosManos && !d.armaDeRango && !lanzador && (rol === 'tanque' || pctEq(c.nombre, 'esc') < 25)) orden.splice(1, 0, 'escudo');
      const usados = new Set(previoDef.map(e => e.tipoItem));
      let sumDef = 0; const crit = [0, 0, 0, 0, 0]; let torsoNombre = d.armaduraTipo || '';
      previoDef.forEach(e => { sumDef += Number(e.def) || 0; });
      let iDef = Math.min(defs.length, previoDef.length);   // lo que ya traía cuenta para el total de la escala
      for(const slot of orden){
        if(iDef >= defs.length) break;
        if(slot === 'torso' && yaTorso) continue;
        if(usados.has(slot)) continue;
        const lst = EQUIPO_CREEP.def[slot];
        const p = piezaEq(lst, defs[iDef], 'def' + slot, c.nombre);
        if(!p) continue;
        if(slot === 'torso' && p.t === 'armadura_rigida' && (lanzador || rol === 'asalto' || rol === 'rango')){
          const blanda = piezaEq({[p.k]: (lst[p.k] || []).filter(x => x.t === 'armadura_blanda')}, p.k, 'blanda', c.nombre); if(blanda) Object.assign(p, blanda);
        }
        iDef++;
        (d.equipo = d.equipo || []).push({id: 'eq-' + slot + '-' + slug(c.nombre), nombre: p.n, tipoItem: p.t, def: p.def || 0, mods: structuredClone(p.m || []), detalle: p.det || ''});
        sumDef += p.def || 0; if(slot === 'torso') torsoNombre = p.n; if(slot === 'escudo') usaEscudo = true;
        (p.m || []).forEach(m => { const ix = {tipo1: 0, tipo2: 1, tipo3: 2, tipo4: 3, tipo5: 4}[m.stat]; if(ix !== undefined) crit[ix] += m.val; });
        notas.push(`${p.n} (${p.k})`);
      }
      // Lo que traía de antes (hu) también cuenta para las resistencias a crítico
      (d.crit || []).forEach((v, i) => { crit[i] += v; });
      d.crit = crit.map(v => Math.min(3, v));
      d.defensa = Math.max(Number(d.defensa) || 0, sumDef);   // el equipo REEMPLAZA a la defensa base si es mayor (no se suman: si no, los creeps quedan casi inmunes)
      d.armaduraTipo = torsoNombre;
      c.detalle = c.detalle.replace(/ Equipo: [^.]*\./, '') + ' Equipo: ' + notas.join(', ') + '.';
      c.etiquetas = [...new Set([...c.etiquetas, 'con equipo'])];
    });
  }
  aplicarEquipo();
/*EQUIPO_CREEP:FIN*/"""
    js = js.replace('__TABLA__', json.dumps(tabla, ensure_ascii=False, separators=(',', ':')))
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
