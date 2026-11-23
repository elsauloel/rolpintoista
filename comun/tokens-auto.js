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
    const elem = ['fuego', 'hielo', 'rayo', 'toxico', 'acido', 'luz', 'siniestro'].includes(elemento) ? elemento : '';
    const le = Math.max(0, Math.min(5, Math.round(Number(lento) || 0)));
    const ps = formulaOk(extra && extra.pierdeSp), dz = formulaOk(extra && extra.danoZona);
    const ca = extra && extra.cadena && Number(extra.cadena.rango) >= 1 ? {rango: Math.min(6, Math.round(Number(extra.cadena.rango)))} : null;   // la Descarga: salta de enemigo en enemigo
    const rd = !!(extra && extra.requiereDano);
    const rp = !!(extra && extra.renuevaPaso);
    const ex = !!(extra && extra.explota);
    const pf = Math.max(0, Math.min(5, Math.round(Number(extra && extra.perfora) || 0)));   // 🗡 Perfora N (2026-10-27, la Aguja): N del daño pasan siempre la Defensa
    const ad = !!(extra && extra.adelante);   // 🪢 al caer, una casilla más allá (el Cordón oculto, 2026-10-27)
    const vi = extra && ['cordon'].includes(extra.visual) ? extra.visual : '';   // cómo se dibuja (el cordón entre dos estacas)
    const dc = !!(extra && extra.disparo === 'centro');   // 🎯 solo la dispara pisar el centro (2026-11-10, prueba del dueño: mitad de las trampas en flor así)
    const mg = !!(extra && extra.magica);   // 🪄 mágica (2026-10-19, dueño): se desarma —o se disipa— con el Efecto especial; la mecánica, con la Destreza   // 💥 explota (2026-10-17): la animación al pisarla (vtt-hexgrid/js/19)
    const al = extra && ['piso', 'aire', 'ambos'].includes(extra.altura) ? extra.altura : '';   // dónde está su efecto (2026-10-07: Levitar y las Suelas)   // la Brea (2026-10-04, dueño): cada paso sobre ella le renueva el estado a quien ya lo tiene   // el Dardo (2026-10-04, dueño): lo que deja solo entra si el daño pasó la Defensa
    const po = extra && extra.portal && Number(extra.portal.rango) >= 1 ? {rango: Math.min(20, Math.round(Number(extra.portal.rango))),
      ...(/^-?\d+,-?\d+$/.test(String(extra.portal.destino || '')) ? {destino: String(extra.portal.destino)} : {})} : null;   // destino fijo: Varita del portal (2026-10-05)   // el Portal cósmico: su dueño elige adónde lo manda
    const o = {...(estado && estado.nombre ? estado : {}), ...(sv ? {salva: sv} : {}), ...(mu ? {muro: mu} : {}), ...(ef ? {efecto: ef} : {}), ...(elem ? {elemento: elem} : {}), ...(le ? {lento: le} : {}),
      ...(ps ? {pierdeSp: ps} : {}), ...(dz ? {danoZona: dz} : {}), ...(ca ? {cadena: ca} : {}), ...(po ? {portal: po} : {}), ...(rd ? {requiereDano: true} : {}), ...(rp ? {renuevaPaso: true} : {}), ...(al ? {altura: al} : {}), ...(ex ? {explota: true} : {}), ...(mg ? {magica: true} : {}), ...(pf ? {pf} : {}), ...(ad ? {adelante: true} : {}), ...(vi ? {visual: vi} : {}), ...(dc ? {dc: true} : {})};
    const j = Object.keys(o).length ? JSON.stringify(o) : '';
    if(j.length > 300) return '';
    // Quién la colocó (2026-10-07, dueño: «siempre los turnos contando al caster»): `de` = "ref|tipo"; el mapa le descuenta los turnos al
    // empezar los de esa persona (js/07 zonasDelQueLaTiro). Solo si entra en el tope: lo demás manda.
    const de = extra && extra.de && /^[^|]{1,64}\|(pj|creep)$/.test(String(extra.de)) ? String(extra.de) : '';
    if(de){ const j2 = JSON.stringify({...o, de}); if(j2.length <= 300) return j2; }
    return j;
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
        extraJson: {pierdeSp: t.pierdeSp || '', danoZona: t.danoZona || '', cadena: t.cadena || null, portal: t.portal || null, requiereDano: !!t.requiereDano, renuevaPaso: !!t.renuevaPaso, altura: t.altura || '', explota: !!t.explota, perfora: t.perfora || 0, adelante: !!t.adelante, visual: t.visual || '', disparo: t.disparo || '', magica: t.detectarStat === 'dmgesp', de: o.fichaId ? `${o.fichaId}|${o.tipoToken === 'pj' ? 'pj' : 'creep'}` : ''},
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
    let ids = [];   // los elementos que quedaron (js/116: la Percepción de los rivales cercanos, 2026-11-11)
    const armar = tope => { const lote = fbDb.batch(); ids = []; elegidas.forEach(c => {
      const linea = o.forma === 'linea';
      const celdasLinea = []; for(let i = 0; i < Math.max(1, Math.min(20, o.largo || 3)); i++) celdasLinea.push(0, i);   // recta hacia afuera: (0,0), (0,1), (0,2)…, rotada según hacia dónde mira
      const ref = elCol.doc(); ids.push(ref.id);
      lote.set(ref, {
        tipo: linea ? 'linea' : 'flor', origen: {col: c.col, fila: c.fila}, celdas: linea ? celdasLinea : celdasFlor(o.radio || 0), rotacion: linea ? ((c.dir % 6) + 6) % 6 * 60 : 0,
        color: /^#[0-9a-fA-F]{6}$/.test(o.color || '') ? o.color : '#D9A21B', alfa: Number.isFinite(o.alfa) ? Math.max(10, Math.min(100, Math.round(o.alfa))) : 45, solido: false, invisible: false,
        imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: false,
        trampa: true, trampaNombre: String(o.nombre || 'Trampa').slice(0, 40), trampaDetalle: cortar(o.detalle, tope),
        disparada: false, fuegoAmigo: !!o.fuegoAmigo, trampaDano: String(o.dano || '').slice(0, 12),
        ...(o.descubierta ? {descubierta: true} : {}),   // 👁 colocada a la vista de un rival (2026-11-03, js/79): la ve todo el mundo
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
    anunciarIncierta(o, mio, elegidas.length);
    return {colocadas: elegidas.length, mapaId, ids, celdas: elegidas.map(c => ({col: c.col, fila: c.fila}))};
  }
  // 🎭 Acción incierta (2026-10-09, idea de Pablo: «colocar trampas se anuncia en el log para el equipo rival»): una línea en la Mesa con el
  // detalle; su bando la ve entera y el rival solo «X está realizando una acción incierta», si lo ve (decide el mapa de cada uno, js/29).
  function anunciarIncierta(o, mio, n){
    const tok = mio ? mio.data() : null;
    const quien = String((tok && tok.nombre) || '').slice(0, 60);
    if(!quien || !fbUsuario) return;
    const nombre = String(o.nombre || 'Trampa').slice(0, 40);
    fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: (typeof fbMiembro !== 'undefined' && fbMiembro && fbMiembro.nombre) || '', quien,
      origen: `🪤 ${quien} colocó ${n > 1 ? n + ' trampas' : 'una trampa'} («${nombre}»)`, formula: '', rolls: [], mod: 0, total: 0,
      desde: (o.tipoToken || 'creep') === 'pj' ? 'incierta-pj' : 'incierta-creep', ficha: String(o.fichaId || '').slice(0, 80),
      cuando: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(err => console.error('No se pudo anunciar la trampa en la Mesa:', err));
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

  /* 🌿 El modo de un mapa (narrativo / combate). Una sola escritura para todos: el interruptor del mapa (vtt-hexgrid/js/04) y el fin del
     combate (comun/combate-fin.js). Lo demás (lo que cada pantalla libera o arranca al cambiar el modo) lo hace cada mapa abierto cuando le
     llega el cambio (escucharModo, js/04; js/25). */
  function rutaModo(mapaId){ return mapaId === MAPA_PRINCIPAL_ID || !mapaId ? 'mapa/modo' : `mapas/${mapaId}/estado/modo`; }
  function ponerModo(mapaId, modo){
    return fbDb.doc(fbRutaCampana(rutaModo(mapaId))).set({modo: modo === 'combate' ? 'combate' : 'narrativo', actualizado: firebase.firestore.FieldValue.serverTimestamp()});
  }
  /* 🏁 Al terminar «Finalizar combate» (dueño, 2026-11-20: «al poner finalizar combate y terminar con todo ese proceso, el mapa automáticamente
     se vuelva a poner en modo narrativo»): si el mapa publicado está en combate, pasa a narrativo. → true si lo cambió (si ya estaba en
     narrativo no escribe nada). */
  async function volverANarrativo(){
    const p = await publicadoEnCombate();
    if(!p.combate) return false;
    await ponerModo(p.mapaId, 'narrativo');
    try{ await limpiarIniciativa(p.mapaId); }catch(err){ console.error('No se pudo limpiar el orden de turnos:', err); }
    return true;
  }
  /* 🧹 Al terminar el combate se limpia también la lista de iniciativa (P252, dueño, 2026-11-22: «sí, la lista de iniciativa se limpia al terminar
     el combate»): lo mismo que el botón «Limpiar» del orden de turnos (vtt-hexgrid/js/04). Solo el fin del combate; el interruptor a mano no
     la toca (no se pidió). */
  function rutaIniciativa(mapaId){ return mapaId === MAPA_PRINCIPAL_ID || !mapaId ? 'mapa/iniciativa' : `mapas/${mapaId}/estado/iniciativa`; }
  const INICIATIVA_VACIA = {orden: [], turno: 0, ronda: 1, paso: 0, actuaron: [], empezados: [], demoras: {}, ordenPendientes: [], mufas: {}, movidos: {}, iniciado: false};
  function limpiarIniciativa(mapaId){
    return fbDb.doc(fbRutaCampana(rutaIniciativa(mapaId))).set({...INICIATIVA_VACIA, actualizado: firebase.firestore.FieldValue.serverTimestamp()});
  }
  // El mapa publicado (el que ven los jugadores) y si está en modo combate. → {mapaId, combate}
  async function publicadoEnCombate(){
    const act = await fbDb.doc(fbRutaCampana('mapa/activo')).get();
    const mapaId = act.exists && act.data().mapaId ? act.data().mapaId : MAPA_PRINCIPAL_ID;
    const d = await fbDb.doc(fbRutaCampana(rutaModo(mapaId))).get();
    return {mapaId, combate: d.exists && d.data().modo === 'combate'};
  }

  /* 🏷 Los tokens de un personaje se llaman como su ficha (2026-11-20, dueño, al ver en el clon de El origen una ficha con un nombre y sus tokens
     con otros dos: «estaría bueno que lo solucione la pantalla del jugador y que además el GM tenga permiso para modificarlo»). El token guarda su
     `nombre` al colocarse; si después se renombra el personaje, quedaba el viejo. La pantalla del jugador DUEÑO (el mapa al abrirse, la ficha al
     abrirse y al guardar un nombre nuevo) pone al día sus tokens en TODOS los mapas de la partida. Las invocaciones guardan su propio nombre.
     Si algo no se puede (sin permiso, sin conexión), calla. */
  const nombreDeFicha = n => { n = String(n == null ? '' : n).trim(); return n && n !== '?' ? n.slice(0, 40) : ''; };
  // Qué tokens hay que renombrar. docs = [{id, tipo, fichaId, nombre}], fichaId, nombre → [{id, nombre}]
  function nombresCambios(docs, fichaId, nombre){
    const n = nombreDeFicha(nombre);
    if(!n || !fichaId) return [];
    return (docs || []).filter(t => t && t.tipo === 'pj' && t.fichaId === fichaId && !String(t.fichaId).includes('~') && t.nombre !== n).map(t => ({id: t.id, nombre: n}));
  }
  const nombresHechos = new Map();   // fichaId -> nombre ya puesto al día (una vez por nombre y por pantalla)
  // → Promise<cuántos tokens cambió> (0 si no había nada, si ya se hizo o si no se pudo).
  async function nombresPonerAlDia(o){
    const fichaId = o && o.fichaId, n = nombreDeFicha(o && o.nombre);
    const db = (o && o.db) || (typeof fbDb !== 'undefined' ? fbDb : null), ruta = (o && o.ruta) || (typeof fbRutaCampana === 'function' ? fbRutaCampana : null);   // (db y ruta: para las pruebas)
    if(!fichaId || !n || !db || !ruta || String(fichaId).includes('~')) return 0;
    if(nombresHechos.get(fichaId) === n) return 0;
    nombresHechos.set(fichaId, n);
    let cambiados = 0;
    try{
      const mapas = [MAPA_PRINCIPAL_ID];
      try{ (await db.collection(ruta('mapas')).get()).forEach(d => { if(d.id !== MAPA_PRINCIPAL_ID) mapas.push(d.id); }); }catch(e){}
      for(const m of mapas){
        let snap = null;
        try{ snap = await db.collection(ruta(rutaTokens(m))).where('fichaId', '==', fichaId).get(); }catch(e){ continue; }
        const docs = snap.docs.map(d => ({id: d.id, ...d.data()}));
        for(const c of nombresCambios(docs, fichaId, n)){
          try{ await db.collection(ruta(rutaTokens(m))).doc(c.id).update({nombre: c.nombre}); cambiados++; }catch(e){ /* sin permiso: calla */ }
        }
      }
    }catch(e){ nombresHechos.delete(fichaId); }
    return cambiados;
  }
  // 🎭 Los personajes de `uid` que todavía no tienen token en el mapa que se está viendo (2026-11-20, dueño: «lo del botón de personajes y el
  // botón de tokens es poco claro»). `fichas`: pares [id, {nombre, duenoUid}]; `tokens`: los tokens de ese mapa. Devuelve los pares, por nombre.
  // Lo usan el panel 👥 Personajes y tokens del mapa («🎭 Ponerlo en el mapa», filasPersonajes) y el cartel al entrar al mapa.
  function sinToken(fichas, tokens, uid){
    if(!uid) return [];
    const enMapa = new Set([...(tokens || [])].map(t => t && t.fichaId).filter(Boolean));
    return [...(fichas || [])].filter(([id, f]) => f && f.duenoUid === uid && !enMapa.has(id))
      .sort((a, b) => String(a[1].nombre || '').localeCompare(String(b[1].nombre || ''), 'es'));
  }
  // El texto del cartel: con uno lo nombra; con varios deja elegir.
  function sinTokenTexto(nombres){
    const n = (nombres || []).map(x => String(x || 'Tu personaje'));
    if(!n.length) return '';
    return n.length === 1 ? `${n[0]} todavía no está en este mapa.` : 'Tus personajes todavía no están en este mapa. ¿A cuál ponés?';
  }
  // 👥 Personajes y tokens (2026-11-22, dueño, opción A: un solo botón en el menú de la izquierda del mapa): una fila por personaje de la
  // partida, con sus invocaciones debajo. `fichas`: pares [id, {nombre, duenoUid, resumen}]; `tokens`: los del mapa que se está viendo;
  // `o`: {uid, gm}. Cada fila: {id, nombre, duenoUid, propio, enMapa, puedePoner, invocaciones: [{ref, nombre, enMapa, puedePoner}]}.
  // Ponerlo en el mapa: su dueño o el GM (que lo trae a nombre del jugador); las invocaciones solo se listan para quien las puede poner.
  function filasPersonajes(fichas, tokens, o){
    const uid = (o && o.uid) || '', gm = !!(o && o.gm);
    const enMapa = new Set([...(tokens || [])].map(t => t && t.fichaId).filter(Boolean));
    return [...(fichas || [])].filter(([id, f]) => f && !String(id).includes('~'))
      .sort((a, b) => String(a[1].nombre || '').localeCompare(String(b[1].nombre || ''), 'es'))
      .map(([id, f]) => {
        const propio = !!uid && f.duenoUid === uid, puede = !!uid && (propio || gm);
        const invs = puede ? ((f.resumen && f.resumen.invocaciones) || []).filter(i => i && i.id) : [];
        return {id, nombre: String(f.nombre || 'Personaje'), duenoUid: f.duenoUid || '', propio, enMapa: enMapa.has(id), puedePoner: puede && !enMapa.has(id),
          invocaciones: invs.map(i => { const ref = id + '~' + i.id; return {ref, nombre: String(i.nombre || 'Invocación'), enMapa: enMapa.has(ref), puedePoner: !enMapa.has(ref)}; })};
      });
  }
  // ＋ Token suelto (2026-11-22, dueño: «que a los jugadores también se les ofrezca la opción de agregar un token suelto. Que le puedan cargar una
  // imagen, un nombre y una descripción»): un token sin ficha ni creep (un NPC, un cofre, un objeto). Lo edita y lo borra quien lo puso y el GM.
  const DESCRIPCION_MAX = 600;
  const esSuelto = t => !!t && !t.fichaId && !t.trampa;
  const sueltoPuedeEditar = (t, uid, gm) => esSuelto(t) && !!uid && (gm || t.duenoUid === uid);
  // Lo que se guarda: nombre (1–40), descripción (hasta 600, sin espacios de más) e imagen. Devuelve {nombre, descripcion} o {falta: '…'}.
  // 📦 Paso a paso (2026-11-23, dueño: «esto es para objetos inanimados»): además, ¿ocupa lugar en la iniciativa? (`iniciativa`, sí / no) y
  // ¿tiene vida? (`conVida` + `hpMax`, de 1 a VIDA_MAX). Devuelve también {iniciativa, conVida, hpMax}.
  const VIDA_MAX = 9999;
  function sueltoNorm(d){
    const nombre = String((d && d.nombre) || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    const descripcion = String((d && d.descripcion) || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, DESCRIPCION_MAX);
    if(!nombre) return {falta: 'Ponele un nombre.'};
    const iniciativa = !!(d && d.iniciativa), conVida = !!(d && d.conVida);
    const hpMax = Math.round(Number(d && d.hpMax));
    if(conVida && !(Number.isFinite(hpMax) && hpMax >= 1 && hpMax <= VIDA_MAX)) return {falta: `Poné cuánta vida tiene (un número de 1 a ${VIDA_MAX}).`};
    return {nombre, descripcion, iniciativa, conVida, hpMax: conVida ? hpMax : 0};
  }
  // La vida de un token suelto que la tiene: {hp, max} (el hp, entre 0 y el máximo); null si no tiene (o no es suelto).
  function sueltoVida(t){
    if(!esSuelto(t)) return null;
    const max = Math.round(Number(t.hpMax));
    if(!(Number.isFinite(max) && max > 0)) return null;
    const hp = Math.round(Number(t.hp));
    return {hp: Number.isFinite(hp) ? Math.max(0, Math.min(max, hp)) : max, max};
  }
  // Los campos que se escriben al crear (t0 = null) o al editar uno que ya está (t0): `poner` y `quitar` (lo que se borra del documento).
  // La vida: al crear, llena; al editar, se conserva la que tenía (sin pasarse del máximo nuevo); si deja de tener vida, se borra.
  function sueltoCampos(n, t0){
    const poner = {iniciativa: !!n.iniciativa}, quitar = [];
    if(n.conVida){
      const antes = t0 ? sueltoVida(t0) : null;
      poner.hpMax = n.hpMax;
      poner.hp = antes ? Math.min(antes.hp, n.hpMax) : n.hpMax;
    }else if(t0 && (t0.hpMax !== undefined || t0.hp !== undefined)) quitar.push('hp', 'hpMax');
    return {poner, quitar};
  }
  // Un golpe a un token suelto con vida (2026-11-23, «que se lo pueda elegir como objetivo de ataques… y hasta ahí nomás»): sin Defensa, sin estados;
  // entra entero y la vida no baja de 0. → {antes, despues, max, entro} o null si no tiene vida.
  function sueltoGolpe(t, monto){
    const v = sueltoVida(t); if(!v) return null;
    const m = Math.max(0, Math.round(Number(monto) || 0));
    const despues = Math.max(0, v.hp - m);
    return {antes: v.hp, despues, max: v.max, entro: v.hp - despues};
  }
  // Cambiar la vida a mano (el círculo del HUD): «12», «+5», «-3» → el valor nuevo entre 0 y el máximo, o null si no se entiende.
  function sueltoVidaAMano(t, texto){
    const v = sueltoVida(t); if(!v) return null;
    const s = String(texto || '').replace(/\s+/g, '');
    const m = s.match(/^([+-]?)(\d{1,5})$/); if(!m) return null;
    const n = Number(m[2]), nuevo = m[1] === '+' ? v.hp + n : m[1] === '-' ? v.hp - n : n;
    return Math.max(0, Math.min(v.max, nuevo));
  }
  // Lo que se cuenta de un token suelto en su tarjeta 🪪 y al pasar el mouse: la vida (o «roto» en 0; `veVida` = false: sin los números, como la de
  // un creep para los jugadores) y si ocupa lugar en la iniciativa (sin el campo: sí, como antes del paso a paso).
  function sueltoRasgos(t, o){
    if(!esSuelto(t)) return [];
    const v = sueltoVida(t), ve = !o || o.veVida !== false, out = [];
    if(v) out.push(v.hp <= 0 ? (ve ? `💥 Roto (0 de ${v.max} de vida)` : '💥 Roto') : ve ? `❤ Vida ${v.hp} de ${v.max} · se lo puede atacar` : '❤ Tiene vida · se lo puede atacar');
    out.push(t.iniciativa === false ? '🪨 No ocupa lugar en la iniciativa' : '🎲 Ocupa lugar en la iniciativa');
    return out;
  }
  return {filasPersonajes, esSuelto, sueltoPuedeEditar, sueltoNorm, sueltoVida, sueltoRasgos, sueltoCampos, sueltoGolpe, sueltoVidaAMano, VIDA_MAX, DESCRIPCION_MAX, sinToken, sinTokenTexto, nombresCambios, nombresPonerAlDia, nombreDeFicha, salvaNorm, muroNorm, efectoNorm, estadoJson, crear, mapaQueMiraElGM, centroGuardado, rutaTokens, colocarTrampas, desarmarTrampasConsumibles, ROMPE_AL_DESARMAR, rutaModo, ponerModo, volverANarrativo, publicadoEnCombate, rutaIniciativa, limpiarIniciativa};
})();
