/* =========================================================
   TOKENS AUTOMÁTICOS
   Crea de una vez los tokens de los creeps de un mapa o de los personajes de los jugadores, en el mapa que se le pida (o el que el GM
   está mirando). Lo usan GM Tools ("🎯 Poner sus tokens") y el mapa (🎭 "Traer los creeps de este mapa", "Traer tokens de jugadores").
   En qué mapa está cada creep: comun/creeps-mapas.js.

   - Los tokens salen en UNA FILA ORDENADA en el centro de lo que el GM está viendo (el mapa guarda ese centro en
     localStorage 'mapa-centro' cada vez que mueve la vista), mirando hacia abajo. Van en columnas de a dos para que
     la fila quede recta.
   - Si un creep o personaje ya tiene token en ese mapa, se saltea.
   - Los tokens de creeps nacen OCULTOS a los jugadores; los de personajes, visibles.
   Usa las globales de sesion.js (fbDb, fbUsuario, fbRutaCampana). Las reglas de tokens ya dejan al GM crearlos.
   ========================================================= */
const TokensAuto = (() => {
  const MAPA_PRINCIPAL_ID = '_principal';

  function rutaTokens(mapaId){ return mapaId === MAPA_PRINCIPAL_ID ? 'tokens' : `mapas/${mapaId}/tokens`; }
  // La tirada para evitar una trampa, como la guarda el mapa: `salva` adentro del JSON de trampaEstado (2026-10-02; así no hace falta un
  // campo ni reglas nuevas): {stat (id), etq, dif, que: 'todo' | 'efecto' | 'mitad'}. Acepta el stat por su nombre (los asistentes guardan
  // 'Evasión', 'Res.CC'…). null si no hay una tirada completa. `logra`: el texto de la trampa si la resiste («se agarra del borde y no queda
  // Sentado»); lo dicen el cuadro y la Crónica.
  const SALVA_IDS = {'Evasión': 'eva', 'Fuerza': 'fue', 'Res.CC': 'rescc', 'Res.Esp': 'resmg', 'Res.Mt': 'resm', 'Agilidad': 'agl', 'Constitución': 'con'};
  const SALVA_ETQ = {eva: 'Evasión', fue: 'Fuerza', rescc: 'Res.CC', resmg: 'Res.Esp', resm: 'Res.Mt', agl: 'Agilidad', con: 'Constitución'};
  function salvaNorm(s){
    if(!s || !s.stat || !(Number(s.dif) >= 1)) return null;
    const stat = SALVA_IDS[s.stat] || s.stat;
    const logra = String(s.logra || '').trim().slice(0, 120);   // lo que pasa si la resiste, con las palabras de la trampa (dueño, 2026-10-04)
    return {stat, etq: s.etq || SALVA_ETQ[stat] || stat, dif: Math.round(Number(s.dif)), que: ['todo', 'efecto', 'mitad'].includes(s.que) ? s.que : 'todo', ...(logra ? {logra} : {})};
  }
  // El muro (2026-10-03, trampa de muro): {largo: 1 (un pilar justo adelante, 2026-10-04) | 3 (las casillas de adelante) | 5 (y los costados),
  // turnos (4 si no dice)}. null si no hay.
  function muroNorm(m){
    if(!m || typeof m !== 'object') return null;
    const l = Number(m.largo);
    return {largo: l >= 5 ? 5 : l >= 3 || !(l >= 1) ? 3 : 1, turnos: Math.max(1, Math.min(20, Math.round(Number(m.turnos)) || 4))};
  }
  // La superficie de efecto (2026-10-03): {area: 'pisador' | 'trampa' | 'flor', radio: 1 | 2 (solo la flor)}. null si no dice (la deduce el mapa).
  // `centro: 'trampa'` (2026-10-04, dueño: gases que se disparan en una línea de 3 y la nube queda en la flor de 7 que la contiene): la flor va
  // alrededor del centro de la trampa y no de la casilla que se pisó.
  function efectoNorm(e){
    if(!e || !['pisador', 'trampa', 'flor'].includes(e.area)) return null;
    return e.area === 'flor' ? {area: 'flor', radio: Number(e.radio) >= 2 ? 2 : 1, ...(e.centro === 'trampa' ? {centro: 'trampa'} : {})} : {area: e.area};
  }
  // El JSON de trampaEstado: el estado que deja, la salvación, el muro y la superficie de efecto ('' si no hay ninguno).
  // `elemento` (2026-10-04): de qué es el daño ('fuego' | 'hielo' | 'rayo' | 'toxico' | 'acido'): se resta la resistencia a ese elemento.
  // `lento` (2026-10-04, arena movediza): una vez disparada, cada paso que sale de una de sus casillas cuesta ese No2.
  // `extra` (2026-10-04): {pierdeSp: '2d6' (Succión arcana), danoZona: '1d6' (el daño por Mantenimiento de la zona que deja, si no es el mismo)}.
  const formulaOk = f => /^\d{1,2}d\d{1,3}([+-]\d{1,3})?$/i.test(String(f || '').trim()) ? String(f).trim() : '';
  function estadoJson(estado, salvacion, muro, efecto, elemento, lento, extra){
    const sv = salvaNorm(salvacion), mu = muroNorm(muro), ef = efectoNorm(efecto);
    const elem = ['fuego', 'hielo', 'rayo', 'toxico', 'acido'].includes(elemento) ? elemento : '';
    const le = Math.max(0, Math.min(5, Math.round(Number(lento) || 0)));
    const ps = formulaOk(extra && extra.pierdeSp), dz = formulaOk(extra && extra.danoZona);
    const ca = extra && extra.cadena && Number(extra.cadena.rango) >= 1 ? {rango: Math.min(6, Math.round(Number(extra.cadena.rango)))} : null;   // la Descarga: salta de enemigo en enemigo
    const rd = !!(extra && extra.requiereDano);
    const rp = !!(extra && extra.renuevaPaso);   // la Brea (2026-10-04, dueño): cada paso sobre ella le renueva el estado a quien ya lo tiene   // el Dardo (2026-10-04, dueño): lo que deja solo entra si el daño pasó la Defensa
    const po = extra && extra.portal && Number(extra.portal.rango) >= 1 ? {rango: Math.min(20, Math.round(Number(extra.portal.rango))),
      ...(/^-?\d+,-?\d+$/.test(String(extra.portal.destino || '')) ? {destino: String(extra.portal.destino)} : {})} : null;   // destino fijo: Varita del portal (2026-10-05)   // el Portal cósmico: su dueño elige adónde lo manda
    const o = {...(estado && estado.nombre ? estado : {}), ...(sv ? {salva: sv} : {}), ...(mu ? {muro: mu} : {}), ...(ef ? {efecto: ef} : {}), ...(elem ? {elemento: elem} : {}), ...(le ? {lento: le} : {}),
      ...(ps ? {pierdeSp: ps} : {}), ...(dz ? {danoZona: dz} : {}), ...(ca ? {cadena: ca} : {}), ...(po ? {portal: po} : {}), ...(rd ? {requiereDano: true} : {}), ...(rp ? {renuevaPaso: true} : {})};
    const j = Object.keys(o).length ? JSON.stringify(o) : '';
    return j.length <= 300 ? j : '';
  }

  // El mapa que el GM está mirando en este navegador (si eligió uno que ya no existe, el publicado).
  async function mapaQueMiraElGM(){
    let elegido = null;
    try{ elegido = localStorage.getItem('mapa-viendo') || null; }catch(e){}
    if(elegido && elegido !== MAPA_PRINCIPAL_ID){
      try{ const d = await fbDb.doc(fbRutaCampana(`mapas/${elegido}`)).get(); if(!d.exists) elegido = null; }catch(e){ elegido = null; }
    }
    if(elegido) return elegido;
    const act = await fbDb.doc(fbRutaCampana('mapa/activo')).get();
    return act.exists && act.data().mapaId ? act.data().mapaId : MAPA_PRINCIPAL_ID;
  }
  function centroGuardado(){
    try{
      const c = JSON.parse(localStorage.getItem('mapa-centro') || 'null');
      if(c && Number.isInteger(c.col) && Number.isInteger(c.fila)) return c;
    }catch(e){}
    return {col: 0, fila: 0};
  }

  /* items: [{nombre, color, tipo: 'creep'|'pj', fichaId, duenoUid?, oculto?}]
     opts: {mapaId?, centro?}. Devuelve {creados, salteados, mapaId}. */
  async function crear(items, opts){
    opts = opts || {};
    const mapaId = opts.mapaId || await mapaQueMiraElGM();
    const centro = opts.centro || centroGuardado();
    const coleccion = fbDb.collection(fbRutaCampana(rutaTokens(mapaId)));
    const existentes = await coleccion.get();
    const yaEstan = new Set(existentes.docs.map(d => `${d.data().tipo}:${d.data().fichaId || ''}`));
    const nuevos = items.filter(i => i.fichaId && !yaEstan.has(`${i.tipo}:${i.fichaId}`));
    if(!nuevos.length) return {creados: 0, salteados: items.length, mapaId};
    const n = nuevos.length;
    const batch = fbDb.batch();
    nuevos.forEach((it, i) => {
      const doc = {
        nombre: String(it.nombre || '?').slice(0, 40),
        color: /^#[0-9a-fA-F]{6}$/.test(it.color || '') ? it.color : '#B87333',
        tipo: it.tipo,
        duenoUid: it.duenoUid || fbUsuario.uid,
        col: centro.col + 2 * i - (n - 1),   // fila recta: columnas de la misma paridad
        fila: centro.fila,
        fichaId: it.fichaId,
        creado: firebase.firestore.FieldValue.serverTimestamp(),
      };
      if(it.oculto) doc.oculto = true;
      batch.set(coleccion.doc(), doc);
    });
    await batch.commit();
    return {creados: n, salteados: items.length - n, mapaId};
  }

  /* ---------- Trampas automáticas ----------
     Una habilidad de creep con trampa (h.trampaColocar) coloca sola el elemento-trampa en el mapa que el GM está mirando,
     en la casilla libre más cercana al frente del token del que la usa (si está ocupada, prueba las demás vecinas).
     Es un elemento de Terreno y Formas con `trampa: true`: lo ven solo su dueño (el GM) y el GM hasta que se dispara, y el
     mapa tira y aplica el daño (`trampaDano`) cuando alguien la pisa. Las reglas de `elementos` ya lo permiten. */
  function rotarCubo(dq, dr, pasos){
    let q = dq, r = dr, s = -dq - dr;
    for(let i = 0; i < ((pasos % 6) + 6) % 6; i++){ const nq = -r, nr = -s; s = -q; q = nq; r = nr; }
    return {dq: q, dr: r};
  }
  const aCubo = c => ({q: c.col, r: c.fila - (c.col - (c.col & 1)) / 2});
  const deCubo = (q, r) => ({col: q, fila: r + (q - (q & 1)) / 2});
  function celdasFlor(R){
    const res = [];
    for(let dq = -R; dq <= R; dq++) for(let dr = Math.max(-R, -dq - R); dr <= Math.min(R, -dq + R); dr++) res.push(dq, dr);
    return res;
  }
  function celdasAbsolutas(e){
    const o = aCubo(e.origen), pasos = Math.round((e.rotacion || 0) / 60), out = [];
    for(let i = 0; i + 1 < (e.celdas || []).length; i += 2){
      const d = rotarCubo(e.celdas[i], e.celdas[i + 1], pasos);
      const c = deCubo(o.q + d.dq, o.r + d.dr);
      out.push(`${c.col},${c.fila}`);
    }
    return out;
  }
  /* o: {fichaId, tipoToken?, trampa, mapaId?, item?, celda?} — `celda` = {col, fila}: la casilla que eligió quien la coloca con un
     clic en el mapa (2026-09-30, trampas de habilidades ✨ automáticas); sin `celda`, la casilla libre al frente del token, como
     siempre. `trampa` en la forma única de comun/plantillas.js (P123: la misma de las
     trampas del mapa y del catálogo: tipo/tamano, color, alfa, daño, estado, zona que deja al dispararse, turnos que dura, cant).
     Se sigue aceptando la forma vieja suelta {nombre, detalle, dano, radio, cant, fuegoAmigo, color, forma, largo, estado}.
     El teleport no se coloca solo (su destino se marca en el mapa, a mano). Devuelve {colocadas, mapaId, motivo?}
     (motivo: 'sin-token' | 'sin-lugar'). */
  async function colocarTrampas(o){
    if(o.trampa && typeof Plantillas !== 'undefined'){
      const t = Plantillas.trampaDesde(o.trampa);
      const linea = t.tipo === 'linea';
      o = {...o, nombre: t.nombre, detalle: t.detalle, dano: t.dano, ignoraDef: !!t.ignoraDef, fuegoAmigo: !!t.amiga, color: t.color, alfa: t.alfa,
        forma: linea ? 'linea' : 'flor', radio: linea ? 0 : Plantillas.radioDeTrampa(t), largo: linea ? t.tamano : 0, cant: t.cant,
        estado: t.estado ? {nombre: t.estado, ...(t.estadoTurnos ? {turnos: t.estadoTurnos} : {}), ...(t.estadoMods ? {mods: t.estadoMods} : {}), ...(t.estadoStacks ? {stacks: t.estadoStacks} : {}), ...(t.estadoHp ? {hp: t.estadoHp} : {}), ...(t.soltar ? {soltar: t.soltar} : {})} : null,
        salvacion: t.salvacion || null, muro: t.muro || null, efecto: t.efecto || null, elemento: t.elemento || '', lento: t.lento || 0,
        extraJson: {pierdeSp: t.pierdeSp || '', danoZona: t.danoZona || '', cadena: t.cadena || null, portal: t.portal || null, requiereDano: !!t.requiereDano, renuevaPaso: !!t.renuevaPaso},
        dejaZona: t.dejaZona ? t : null, turnos: Math.max(0, Math.round(Number(t.turnos) || 0)), detectar: t.detectar};
    }
    const mapaId = o.mapaId || await mapaQueMiraElGM();
    const tokens = await fbDb.collection(fbRutaCampana(rutaTokens(mapaId))).get();
    const mio = tokens.docs.find(d => d.data().fichaId === o.fichaId && d.data().tipo === (o.tipoToken || 'creep'));
    if(!mio && !o.celda) return {colocadas: 0, mapaId, motivo: 'sin-token'};
    const elCol = fbDb.collection(fbRutaCampana(mapaId === MAPA_PRINCIPAL_ID ? 'elementos' : `mapas/${mapaId}/elementos`));
    const els = await elCol.get();
    const ocupadas = new Set(tokens.docs.map(d => `${d.data().col},${d.data().fila}`));
    els.docs.forEach(d => { const e = d.data(); if(e.solido) celdasAbsolutas(e).forEach(k => ocupadas.add(k)); });
    const t = mio ? mio.data() : {col: o.celda.col, fila: o.celda.fila, rotacion: 0}, base = aCubo({col: t.col, fila: t.fila});
    const frente = ((Math.round((t.rotacion || 0) / 60) % 6) + 6) % 6;   // 0 = mira hacia abajo
    const elegidas = [];
    // Casilla elegida en el mapa: esa (y, si deja varias, las libres de alrededor).
    if(o.celda){ const c = {col: o.celda.col, fila: o.celda.fila, dir: frente}; elegidas.push(c); ocupadas.add(`${c.col},${c.fila}`); }
    const centro = o.celda ? aCubo(o.celda) : base;
    [0, 1, 5, 2, 4, 3].forEach(k => {
      const d = rotarCubo(0, 1, frente + k);
      const c = deCubo(centro.q + d.dq, centro.r + d.dr);
      if(elegidas.length < (o.cant || 1) && !ocupadas.has(`${c.col},${c.fila}`)){ c.dir = (frente + k) % 6; elegidas.push(c); }   // dir: hacia dónde apunta (la línea se extiende hacia afuera del token)
    });
    if(!elegidas.length) return {colocadas: 0, mapaId, motivo: 'sin-lugar'};
    // Una trampa con duración se va sola: vence en el Mantenimiento actual + N (mismo dato que las formas con turnos del mapa).
    let venceMant = null;
    if(o.turnos > 0){
      try{ const m = await fbDb.doc(fbRutaCampana('mapa/mantenimiento')).get(); venceMant = Math.round(Number(m.exists ? m.data().numero : 0) || 0) + o.turnos; }
      catch(e){ venceMant = null; }
    }
    const z = o.dejaZona;
    // El texto de la trampa entero (2026-10-04: el cartel del mapa lo muestra al seleccionarla); con las reglas viejas (tope 200) se reintenta
    // cortado en el último punto, así no queda una frase por la mitad.
    const cortar = (txt, n) => { const s = String(txt || ''); if(s.length <= n) return s; const c = s.slice(0, n); const p = c.lastIndexOf('. '); return p > 40 ? c.slice(0, p + 1) : c; };
    const armar = tope => { const lote = fbDb.batch(); elegidas.forEach(c => {
      const linea = o.forma === 'linea';
      const celdasLinea = []; for(let i = 0; i < Math.max(1, Math.min(20, o.largo || 3)); i++) celdasLinea.push(0, i);   // recta hacia afuera: (0,0), (0,1), (0,2)…, rotada según hacia dónde mira
      lote.set(elCol.doc(), {
        tipo: linea ? 'linea' : 'flor', origen: {col: c.col, fila: c.fila}, celdas: linea ? celdasLinea : celdasFlor(o.radio || 0), rotacion: linea ? ((c.dir % 6) + 6) % 6 * 60 : 0,
        color: /^#[0-9a-fA-F]{6}$/.test(o.color || '') ? o.color : '#D9A21B', alfa: Number.isFinite(o.alfa) ? Math.max(10, Math.min(100, Math.round(o.alfa))) : 45, solido: false, invisible: false,
        imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: false,
        trampa: true, trampaNombre: String(o.nombre || 'Trampa').slice(0, 40), trampaDetalle: cortar(o.detalle, tope),
        disparada: false, fuegoAmigo: !!o.fuegoAmigo, trampaDano: String(o.dano || '').slice(0, 12),
        ...(o.ignoraDef ? {trampaIgnoraDef: true} : {}),
        ...(Number.isFinite(Number(o.detectar)) && Number(o.detectar) >= 1 ? {trampaDetectar: Math.round(Number(o.detectar))} : {}),
        ...(o.item ? {trampaItem: String(o.item).slice(0, 4000), trampaFicha: String(o.fichaId || '').slice(0, 80)} : {}),   // trampa que salió de un consumible: al cerrar el botín, si no se disparó, se desarma (50 % de romperse) y, si aguanta, vuelve a su dueño
        ...(estadoJson(o.estado, o.salvacion, o.muro, o.efecto, o.elemento, o.lento, o.extraJson) ? {trampaEstado: estadoJson(o.estado, o.salvacion, o.muro, o.efecto, o.elemento, o.lento, o.extraJson)} : {}),   // el estado y la salvación (la tira el mapa solo)
        ...(venceMant !== null ? {turnos: o.turnos, venceMant} : {}),
        // Trampa persistente: al dispararse queda como zona (el mapa la convierte, ver trampaResolver) — mismos campos que pone el mapa.
        ...(z ? {trampaDejaZona: true, zonaTurnos: Math.max(1, Math.round(Number(z.zonaTurnos) || 3)), zonaEnMantenimiento: z.zonaEnMantenimiento !== false, zonaCadaPaso: !!z.zonaCadaPaso,
          ...(z.zonaResistStat ? {zonaResistStat: String(z.zonaResistStat), zonaResistValor: Math.round(Number(z.zonaResistValor) || 12)} : {})} : {}),
        duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }); return lote; };
    try{ await armar(600).commit(); }
    catch(err){ if(String(o.detalle || '').length <= 200) throw err; await armar(200).commit(); }
    return {colocadas: elegidas.length, mapaId};
  }

  /* ---------- Trampas consumibles sin disparar (2026-09-26, pedido del dueño) ----------
     Al cerrar el botín (el GM reparte XP y despoja lo que nadie tomó), las trampas que un jugador puso desde un consumible y que NO se
     dispararon se desarman solas y vuelven a su dueño: se borra el elemento y se deja un aviso en `recompensas` con el ítem en `devolver`;
     la ficha del dueño lo suma a la mochila (o al cinturón si la mochila no tiene lugar). Devuelve cuántas trampas se desarmaron. */
  // Al terminar el combate (regla del dueño, 2026-10-03; antes volvían todas): cada trampa consumible que no se disparó se desarma y tiene
  // 50 % de romperse (`ROMPE_AL_DESARMAR`); las que aguantan vuelven a la mochila de su dueño. → {total, vuelven, rotas: [nombres]}.
  // `azar` (opcional, para las pruebas): la función que tira, de 0 a 1.
  const ROMPE_AL_DESARMAR = 0.5;
  async function desarmarTrampasConsumibles(mapaId, azar){
    azar = azar || Math.random;
    mapaId = mapaId || await mapaQueMiraElGM();
    const col = fbDb.collection(fbRutaCampana(mapaId === MAPA_PRINCIPAL_ID ? 'elementos' : `mapas/${mapaId}/elementos`));
    const snap = await col.get();
    const lote = fbDb.batch(), porFicha = new Map(), rotas = [];
    let n = 0;
    snap.docs.forEach(d => {
      const e = d.data();
      if(!e.trampaItem || e.disparada || !e.duenoUid || !e.trampaFicha) return;
      lote.delete(d.ref);
      n++;
      if(azar() < ROMPE_AL_DESARMAR){ rotas.push(String(e.trampaNombre || 'Trampa')); return; }
      const g = porFicha.get(e.trampaFicha) || {duenoUid: e.duenoUid, nombre: '', items: []};
      g.items.push(e.trampaItem);
      porFicha.set(e.trampaFicha, g);
    });
    if(!n) return {total: 0, vuelven: 0, rotas: []};
    porFicha.forEach((g, fichaId) => lote.set(fbDb.collection(fbRutaCampana('recompensas')).doc(), {
      fichaId, duenoUid: g.duenoUid, nombre: g.nombre, xp: 0, dde: 0, despojos: 0, estado: 'trampas', aplicada: false, devolver: g.items,
      creado: firebase.firestore.FieldValue.serverTimestamp(),
    }));
    await lote.commit();
    return {total: n, vuelven: n - rotas.length, rotas};
  }

  return {salvaNorm, muroNorm, efectoNorm, estadoJson, crear, mapaQueMiraElGM, centroGuardado, rutaTokens, colocarTrampas, desarmarTrampasConsumibles, ROMPE_AL_DESARMAR};
})();
