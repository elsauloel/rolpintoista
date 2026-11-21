#!/usr/bin/env node
// Etapa 2: ESCRIBE el clon a partir de un volcado (el archivo que dejó leer.js). Primero lo vacía y después lo llena.
// Solo puede escribir adentro de la partida clon: lo impide la página (pagina-escritura.html) y lo vuelve a revisar este script.
// Uso:  node escribir.js <etiqueta del volcado>
'use strict';
const {entorno, abrirNavegador, abrirPagina, fs, path} = require('./base.js');

const NO_SE_COPIA = ['miembros', 'traspaso', 'historial', 'historial_jugadores', 'tiradas', 'pausaLog', 'recompensas', 'botin', 'ppt', 'mesaComun',
  'paquetes', 'baulLog', 'duelos', 'momentos', 'areas', 'estados', 'combate', 'pings'];
const AHORA = {__clon: 'ahora'};
const sinIds = ruta => ruta.split('/').map((p, i) => i % 2 ? '…' : p).join('/');
const segundos = d => (d.datos.creado && d.datos.creado.s) || 0;

(async () => {
  const dir = entorno('CLON_DIR'), nombreOrigen = entorno('CLON_ORIGEN'), nombreDestino = entorno('CLON_DESTINO');
  const personajes = entorno('CLON_PERSONAJES').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const asignar = {};   // nombre de personaje (minúsculas) → 'J1' | 'J2'
  (process.env.CLON_ASIGNAR || '').split(',').map(s => s.trim()).filter(Boolean).forEach(par => { const [p, c] = par.split('='); asignar[p.trim().toLowerCase()] = c.trim().toUpperCase(); });
  const volcado = JSON.parse(fs.readFileSync(path.join(dir, `volcado-${process.argv[2] || 'ultimo'}.json`), 'utf8'));
  if(volcado.partida.datos.nombre !== nombreOrigen) throw new Error('El volcado no es de la partida original que dice CLON_ORIGEN');
  if(nombreDestino === nombreOrigen) throw new Error('ABORTO: el destino tiene el mismo nombre que la original');
  if(!/CLON/.test(nombreDestino)) throw new Error('ABORTO: el nombre del destino tiene que decir «CLON»');
  if(volcado.fallas.length) console.log(`Ojo: al leer la original hubo ${volcado.fallas.length} colecciones que no se pudieron leer (no se copian).`);

  const navegador = await abrirNavegador();
  const informe = {escritos: {}, salteados: {}, fallas: []};
  const sumar = (donde, ruta, n) => { const c = ruta.split('/')[0]; donde[c] = (donde[c] || 0) + (n || 1); };
  try{
    const cuentas = {};
    for(const c of ['GM', 'J1', 'J2']) cuentas[c] = await abrirPagina(navegador, 'escritura', entorno(`ROL_${c}_EMAIL`), entorno(`ROL_${c}_CLAVE`));
    const gm = cuentas.GM;

    // ── Confirmar el destino ANTES de la primera escritura ──
    const destino = await gm.page.evaluate(n => ClonPagina.partidaPorNombre(n), nombreDestino);
    if(destino.id === volcado.partida.id) throw new Error('ABORTO: el destino ES la partida original');
    if(destino.datos.nombre !== nombreDestino || !/CLON/.test(destino.datos.nombre)) throw new Error('ABORTO: el destino no es el clon');
    if(destino.datos.gmUid !== gm.uid || !(destino.miembro && destino.miembro.gm)) throw new Error('ABORTO: la cuenta GM de pruebas no es la dueña del destino');
    if(volcado.partida.datos.gmUid === gm.uid) throw new Error('ABORTO: la cuenta que escribe es la dueña de la partida original: no sigo');
    for(const c of ['J1', 'J2']){
      const m = await cuentas[c].page.evaluate(n => ClonPagina.partidaPorNombre(n), nombreDestino);
      if(m.id !== destino.id || !m.miembro || m.miembro.gm) throw new Error(`ABORTO: ${c} no es jugador del clon (tiene que unirse antes, con «Unirme como jugador»)`);
    }
    for(const c of Object.keys(cuentas)) await cuentas[c].page.evaluate(({d, o}) => Candado.fijar(d, o), {d: destino.id, o: volcado.partida.id});
    console.log(`Destino: «${destino.datos.nombre}». Confirmado: es el clon, no es la original, y su GM es la cuenta de pruebas.`);

    // Toda escritura pasa por acá. `ops` son rutas RELATIVAS al clon; la página arma la ruta completa y rechaza lo que no sea del clon.
    async function escribir(cuenta, ops){
      for(const op of ops) if(/^\/|\.\.|campanas/.test(op.ruta) || op.ruta.split('/').includes(volcado.partida.id)) throw new Error('ABORTO: ruta rara');
      try{ await cuentas[cuenta].page.evaluate(o => ClonPagina.escribir(o), ops); ops.forEach(op => { if(!op.borrar && !op.cambiar) sumar(informe.escritos, op.ruta); }); return true; }
      catch(e){
        if(ops.length > 1){ for(const op of ops) await escribir(cuenta, [op]); return false; }   // de a uno, para saber cuál falló
        informe.fallas.push({ruta: sinIds(ops[0].ruta), error: String(e && e.message || e).replace(/\s+/g, ' ').slice(0, 140)});
        return false;
      }
    }
    async function enLotes(cuenta, ops){
      let lote = [], peso = 0;
      for(const op of ops){
        const p = JSON.stringify(op).length;
        if(lote.length && (lote.length >= 100 || peso + p > 3000000)){ await escribir(cuenta, lote); lote = []; peso = 0; }
        lote.push(op); peso += p;
      }
      if(lote.length) await escribir(cuenta, lote);
    }

    // ── 1. Vaciar el clon (todo menos la partida y sus miembros) ──
    const colecciones = await gm.page.evaluate(() => CLON_COLECCIONES);
    let borrados = 0;
    const mapaClon = await gm.page.evaluate(id => ClonPagina.leerColeccion(id, 'mapa', {}, []), destino.id);
    const usosClon = mapaClon.docs.find(d => d.ruta === 'mapa/usos'), activoClon = mapaClon.docs.find(d => d.ruta === 'mapa/activo');
    const idsMapasClon = [...Object.keys((usosClon && usosClon.datos.ids) || {}), ...(activoClon && activoClon.datos.mapaId ? [activoClon.datos.mapaId] : [])];
    for(const c of Object.keys(colecciones).filter(c => c !== 'miembros')){
      const r = await gm.page.evaluate(({id, c, subs, extra}) => ClonPagina.leerColeccion(id, c, subs, extra).then(x => ({rutas: x.docs.map(d => d.ruta), fallas: x.fallas})),
        {id: destino.id, c, subs: colecciones[c], extra: c === 'mapas' ? idsMapasClon : []});
      const rutas = r.rutas.sort((a, b) => b.split('/').length - a.split('/').length);   // primero lo de más adentro
      await enLotes('GM', rutas.map(ruta => ({ruta, borrar: true})));
      borrados += rutas.length;
    }
    console.log(`Clon vaciado: ${borrados} documentos borrados.`);

    // ── 2. Qué personajes van y quién los maneja ──
    const D = volcado.docs;
    const fichas = D.filter(d => /^fichas\/[^/]+$/.test(d.ruta));
    const van = {};   // id de ficha → {nombre, cuenta}
    for(const p of personajes){
      const f = fichas.filter(x => (x.datos.nombre || '').toLowerCase().includes(p));
      if(f.length !== 1) throw new Error(`El personaje «${p}» coincide con ${f.length} fichas de la original: tiene que ser una`);
      van[f[0].ruta.split('/')[1]] = {nombre: f[0].datos.nombre, cuenta: asignar[p] || 'GM', uidOriginal: f[0].datos.duenoUid};
    }
    const fichaDe = ref => String(ref || '').split('~')[0];
    const uidNuevo = {};   // uid del jugador original → uid de la cuenta de pruebas (si maneja un solo personaje de los que van)
    Object.values(van).forEach(v => { uidNuevo[v.uidOriginal] = uidNuevo[v.uidOriginal] === undefined ? cuentas[v.cuenta].uid : null; });
    console.log('Personajes: ' + Object.values(van).map(v => `${v.nombre} → ${v.cuenta === 'GM' ? 'sin jugador (queda a nombre del GM)' : v.cuenta}`).join(' · '));
    const idsCreeps = new Set(D.filter(d => /^creeps\/[^/]+$/.test(d.ruta)).map(d => d.ruta.split('/')[1]));

    // ── 3. Las fichas: la crea un jugador (las reglas no dejan que la cree el GM) y, si queda sin jugador, el GM se la pasa a sí mismo ──
    for(const [id, v] of Object.entries(van)){
      const f = fichas.find(x => x.ruta === `fichas/${id}`);
      const creador = v.cuenta === 'GM' ? 'J1' : v.cuenta;
      const resumen = {...(f.datos.resumen || {})}; delete resumen.control;   // «el GM tomó el control» no se copia
      const ok = await escribir(creador, [{ruta: f.ruta, datos: {...f.datos, duenoUid: cuentas[creador].uid, resumen}}]);
      if(ok && v.cuenta === 'GM') await escribir('GM', [{ruta: f.ruta, cambiar: {duenoUid: gm.uid}}]);
    }

    // ── 4. Lo que el GM escribe tal cual, por tandas ──
    const tal = [];
    for(const d of D){
      const p = d.ruta.split('/'), c = p[0];
      if(NO_SE_COPIA.includes(c)){ sumar(informe.salteados, d.ruta); continue; }
      if(c === 'fichas'){
        if(p.length === 2) { if(!van[p[1]]) sumar(informe.salteados, d.ruta); continue; }
        if(!van[p[1]]){ sumar(informe.salteados, d.ruta); continue; }
        tal.push(p[3] === 'control' ? {ruta: d.ruta, datos: {...d.datos, json: 'null'}} : d);
      }
      else if(c === 'creeps' || c === 'tienda' || c === 'tiendas' || c === 'gmBitacora') tal.push(d);
      else if(c === 'gm') tal.push(d.ruta === 'gm/personajes' ? {ruta: d.ruta, datos: {...d.datos, fuera: (d.datos.fuera || []).filter(x => van[x])}} : d);
      else if(c === 'ajustes'){ if(p[1] === 'partida') tal.push(d); else sumar(informe.salteados, d.ruta); }   // la pausa y el registro de sesión no
      else if(c === 'baul') tal.push(d.datos.tipo === 'item' ? {ruta: d.ruta, datos: {...d.datos, puso: gm.uid}} : d);
      else if(c === 'mapa'){
        if(p[1] === 'iniciativa') sumar(informe.salteados, d.ruta);   // el combate a medias no se copia
        else tal.push(p[1] === 'modo' ? {ruta: d.ruta, datos: {...d.datos, modo: 'narrativo'}} : d);
      }
      else if(c === 'mapas'){
        if(p.length === 2) tal.push({ruta: d.ruta, datos: {nombre: d.datos.nombre, creado: d.datos.creado === undefined ? null : d.datos.creado}});
        else if(p[2] === 'estado'){
          if(p[3] === 'iniciativa') sumar(informe.salteados, d.ruta);
          else tal.push(p[3] === 'modo' ? {ruta: d.ruta, datos: {...d.datos, modo: 'narrativo'}} : d);
        }
        else if(p[2] === 'pings') sumar(informe.salteados, d.ruta);
      }
    }
    await enLotes('GM', tal);

    // ── 5. Tokens, dibujos y elementos del mapa: de a uno y en su orden (las reglas piden la hora del servidor en «creado») ──
    const esDe = (d, col) => new RegExp(`(^|/)${col}/[^/]+$`).test(d.ruta) && (d.ruta.startsWith(col + '/') || d.ruta.startsWith('mapas/'));
    for(const d of D.filter(d => esDe(d, 'tokens')).sort((a, b) => segundos(a) - segundos(b))){
      const t = d.datos, f = fichaDe(t.fichaId);
      if(t.tipo === 'creep'){ await escribir('GM', [{ruta: d.ruta, datos: {...t, duenoUid: gm.uid, creado: AHORA}}]); continue; }
      if(f && !van[f] && !idsCreeps.has(f)){ sumar(informe.salteados, d.ruta); continue; }   // token de un personaje que no va
      const uid = van[f] ? cuentas[van[f].cuenta].uid : (uidNuevo[t.duenoUid] || gm.uid);
      await escribir('GM', [{ruta: d.ruta, datos: {...t, duenoUid: uid, creado: AHORA}}]);
    }
    for(const d of D.filter(d => esDe(d, 'trazos')).sort((a, b) => segundos(a) - segundos(b))){
      if(!d.datos.permanente){ sumar(informe.salteados, d.ruta); continue; }   // las estelas del lápiz se borran solas
      await escribir('GM', [{ruta: d.ruta, datos: {...d.datos, duenoUid: gm.uid, creado: AHORA}}]);
    }
    for(const d of D.filter(d => esDe(d, 'elementos')).sort((a, b) => segundos(a) - segundos(b))){
      const e = d.datos, ref = fichaDe(e.zonaCasteadorRef || e.armaDe);
      if(e.zonaCasteadorTipo !== 'creep' && ref && !van[ref] && !idsCreeps.has(ref) && fichas.some(x => x.ruta === `fichas/${ref}`)){ sumar(informe.salteados, d.ruta); continue; }   // de un personaje que no va
      const nuevo = uidNuevo[e.duenoUid];
      const cuenta = (nuevo && !e.invisible && !e.colision) ? Object.keys(cuentas).find(c => cuentas[c].uid === nuevo) : 'GM';   // lo que puso un jugador que tiene cuenta de pruebas, lo pone esa cuenta
      await escribir(cuenta, [{ruta: d.ruta, datos: {...e, duenoUid: cuentas[cuenta].uid, creado: AHORA}}]);
    }

    // ── 6. La bitácora compartida: la escribe el GM de pruebas (las reglas piden que quien la crea sea quien firma), con el autor original en el nombre ──
    const paginas = D.filter(d => /^bitacora\/[^/]+$/.test(d.ruta)).sort((a, b) => segundos(a) - segundos(b));
    for(const pg of paginas){
      await escribir('GM', [{ruta: pg.ruta, datos: {nombre: pg.datos.nombre, creado: AHORA, creadoUid: gm.uid, creadoPor: pg.datos.creadoPor || ''}}]);
      for(const en of D.filter(d => d.ruta.startsWith(pg.ruta + '/entradas/')).sort((a, b) => segundos(a) - segundos(b)))
        await escribir('GM', [{ruta: en.ruta, datos: {texto: en.datos.texto, uid: gm.uid, autor: en.datos.autor || '', creado: AHORA}}]);
    }

    // ── Informe ──
    informe.personajes = Object.values(van).map(v => ({nombre: v.nombre, cuenta: v.cuenta}));
    fs.writeFileSync(path.join(dir, 'informe-escritura.json'), JSON.stringify(informe, null, 1));
    const tabla = o => Object.keys(o).sort().map(c => `${c} ${o[c]}`).join(' · ') || '(nada)';
    console.log('Copiado:   ' + tabla(informe.escritos));
    console.log('No copiado: ' + tabla(informe.salteados));
    if(informe.fallas.length){ console.log(`NO SE PUDO ESCRIBIR (${informe.fallas.length}):`); informe.fallas.forEach(f => console.log(`  ${f.ruta}: ${f.error}`)); }
    else console.log('Sin fallas de escritura.');
  }finally{ await navegador.close(); }
})().catch(e => { console.error('FALLÓ:', String(e && e.message || e).slice(0, 400)); process.exit(1); });
