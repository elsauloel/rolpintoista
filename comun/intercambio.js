/* =========================================================
   INTERCAMBIO — pasarle cosas a otro personaje y el baúl común (2026-10-05, P157, decisiones del dueño)
   Reemplaza a la vieja «mesa común» de la ficha. Lo usan la ficha y el mapa, con la misma regla y las mismas ventanas.

   1) Ofrecer a otro personaje (fuera de combate, a cualquiera: «los jugadores determinan cuándo sí y cuándo no»):
      el ítem (o parte de una pila), DDE o despojos. El ítem queda RESERVADO en quien lo ofrece hasta que el otro acepta
      (sigue ocupando su lugar y no se puede usar, equipar ni vender); el oro y los despojos se descuentan al ofrecer y vuelven si
      lo rechaza o si se cancela. Quien recibe ve «Fulano te ofrece X — Aceptar / Rechazar».
      campanas/<id>/paquetes/{id} = {tipo: item|dde|despojos, nombre, json, itemId, cantidad, despojo, despojoNombre,
        deFicha, deNombre, paraFicha, paraNombre, uids: [quien lo creó, dueño de deFicha, dueño de paraFicha], creadoPor,
        estado: pendiente|aceptado|rechazado, resolvio, creado}
      Quien recibe lo marca aceptado (y se lo suma) o rechazado; la pantalla que maneja a quien lo ofreció ve el cambio, borra el
      aviso (transacción: una sola pantalla) y saca el ítem reservado o lo libera. Al aceptar, una línea en la Mesa.
   2) El baúl común (dueño: «como el cajero del centro Pokémon»): se abre SOLO desde una tienda abierta y fuera de combate.
      Entran 10 ranuras por integrante del grupo (cada personaje de la partida); el oro y los despojos no ocupan lugar.
      campanas/<id>/baul/{id}: un ítem por documento {tipo: 'item', nombre, json, ranuras, puso, pusoNombre, creado}; el oro en
      baul/dde {tipo: 'dde', cantidad}; los despojos en baul/desp-<tipo> {tipo: 'despojos', despojo, despojoNombre, cantidad}.
      Cada movimiento queda en el registro (campanas/<id>/baulLog, «para que nadie se haga el vivo sin que nadie más se entere»)
      y en la Mesa.
   3) En combate (dueño, 2026-10-05): solo a un aliado al lado y solo ítems; cuesta 1 No2 si sale del cinturón (0 con Pasamanos) y 2 si sale de
      la mochila; lo que llega va al cinturón si entra. Alforja compartida: un aliado al lado le saca a quien la tiene un consumible de la
      mochila por 1 No2 (paquete `tipo: 'pedido'`: lo pide quien lo saca, la pantalla del dueño de la alforja lo entrega sola y quien lo pidió lo
      recibe y paga).
   La pantalla («host») le dice a esta pieza cómo tocar a un personaje — Intercambio.iniciar(host):
     host = {maneja(fichaId) → ¿esta pantalla lo maneja?, leer(fichaId) → S o null (para dibujar),
             con(fichaId, async S => bool) → cambia al personaje y lo guarda (true = cambió),
             enCombate() → bool, tienda() → la tienda abierta o null, toast(t), propias() → los personajes que maneja,
             adyacentes?(fichaId) → los ids de los personajes al lado de su token (sin esto, en combate se ofrecen todos con un aviso)}
   Ventanas: abrirDar(fichaId, {itemId}) (sin itemId: DDE y despojos, y lo que ya ofreciste), abrirBaul(fichaId).
   Para el resto: reservado(it), botonDar(it) (el botón de la mochila).
   ========================================================= */
const Intercambio = (() => {
  const POR_INTEGRANTE = 10;   // ranuras del baúl por personaje de la partida (dueño, 2026-10-05)
  const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const E = () => FichaEquipo;
  const ts = () => firebase.firestore.FieldValue.serverTimestamp();
  const col = c => fbDb.collection(fbRutaCampana(c));
  const errTxt = err => err && err.code === 'permission-denied' ? ' (sin permiso: faltan pegar las reglas nuevas)' : '';
  let host = null, paquetes = [], fichas = [], desdeServidor = false;

  const reservado = it => !!(it && (it.reservado || it.enMesa));
  const nombreDe = S => String((S && S.meta && S.meta.nombre) || (typeof fbMiembro !== 'undefined' && fbMiembro && fbMiembro.nombre) || 'Alguien').slice(0, 60);
  function buscar(S, id){
    for(const key of ['inventario', 'cinturon']){
      const it = (S[key] || []).find(x => x && x.id === id);
      if(it) return {it, key};
    }
    return null;
  }

  /* ---------- Despojos y oro de un personaje ---------- */
  const DESP_TXT = {normal: 'normales', magico: 'mágicos'};
  const despTxt = (tipo, nombre) => DESP_TXT[tipo] || String(nombre || 'especiales');
  function despojo(S, tipo, nombre){
    S.loot = S.loot || {};
    if(tipo === 'normal' || tipo === 'magico') return {get: () => num(S.loot[tipo]), set: v => { S.loot[tipo] = v; }};
    const clave = String(nombre || '').trim().toLowerCase();
    const buscarL = () => (S.loot.especial || []).find(l => String(l.nombre).trim().toLowerCase() === clave);
    return {get: () => { const l = buscarL(); return l ? num(l.cantidad) : 0; }, set: v => {
      let l = buscarL();
      if(!l){ l = {id: uid(), nombre: String(nombre), cantidad: 0}; (S.loot.especial = S.loot.especial || []).push(l); }
      l.cantidad = v;
    }};
  }
  const sumarDde = (S, n) => { S.meta.dde = Math.round((num(S.meta.dde) + n) * 100) / 100; };
  const despojosDe = S => [{tipo: 'normal', nombre: '', n: num(S.loot && S.loot.normal)}, {tipo: 'magico', nombre: '', n: num(S.loot && S.loot.magico)},
    ...((S.loot && S.loot.especial) || []).map(l => ({tipo: 'especial', nombre: l.nombre, n: num(l.cantidad)}))].filter(d => d.n > 0);

  // Un ítem a la mochila de quien lo recibe (del paquete o del baúl): copia nueva, sin equipar.
  function aMochila(S, item){
    const nuevo = structuredClone(item);
    nuevo.id = uid(); nuevo.equipado = false;
    delete nuevo.reservado; delete nuevo.reservadoPara; delete nuevo.enMesa; delete nuevo.aMano;
    nuevo.unidades = num(nuevo.unidades) || 1; nuevo.ranuras = nuevo.ranuras ?? 1;
    const igual = nuevo.consumible ? S.inventario.find(i => i.consumible && !reservado(i) && i.nombre === nuevo.nombre) : null;
    if(igual && num(igual.unidades) + nuevo.unidades <= (typeof FichaTienda !== 'undefined' ? FichaTienda.stackMaxDe(igual) : 5)){ igual.unidades = num(igual.unidades) + nuevo.unidades; return igual; }
    S.inventario.push(nuevo);
    return nuevo;
  }
  function entraEnMochila(S, item){
    if(item && item.consumible && S.inventario.some(i => i.consumible && !reservado(i) && i.nombre === item.nombre)) return true;
    const cap = E().capMochila(S);
    return !(cap > 0 && E().mochilaUsada(S) + E().ranuras(item) > cap);
  }
  // Una copia del ítem para mandar: sin lo que es de quien lo tiene.
  function copia(it, unidades){
    const c = structuredClone(it);
    ['id', 'equipado', 'reservado', 'reservadoPara', 'enMesa', 'aMano'].forEach(k => delete c[k]);
    if(unidades != null) c.unidades = unidades;
    if(String(c.imagen || '').length > 40000) c.imagen = '';
    return c;
  }
  // Separa `k` unidades de una pila (si no es toda) y las devuelve como entrada propia; si es toda, la misma.
  function separar(S, f, k){
    const total = num(f.it.unidades) || 1;
    if(!f.it.consumible || k >= total) return f.it;
    f.it.unidades = total - k;
    const parte = {...structuredClone(f.it), id: uid(), unidades: k};
    S[f.key].push(parte);
    return parte;
  }
  // Libera una reserva: vuelve a juntarse con su pila si la hay.
  function liberar(S, docId){
    for(const key of ['inventario', 'cinturon']){
      const L = S[key] || [];
      const it = L.find(x => x && (x.reservado === docId || x.enMesa === docId));
      if(!it) continue;
      delete it.reservado; delete it.reservadoPara; delete it.enMesa;
      const pila = it.consumible ? L.find(x => x !== it && x.consumible && !reservado(x) && x.nombre === it.nombre) : null;
      if(pila){ pila.unidades = num(pila.unidades) + num(it.unidades); S[key] = L.filter(x => x !== it); }
      return true;
    }
    return false;
  }
  function quitarReservado(S, docId){
    for(const key of ['inventario', 'cinturon']){
      const L = S[key] || [];
      if(L.some(x => x && x.reservado === docId)){ S[key] = L.filter(x => !(x && x.reservado === docId)); return true; }
    }
    return false;
  }

  /* ---------- En combate: el costo en No2 ---------- */
  const finalDe = S => { try{ return FichaCalculo.calcular(S).final; }catch(e){ return {}; } };
  // Pasarlo en combate: 1 desde el cinturón (0 con Pasamanos), 2 desde la mochila.
  const costoCombate = (S, key) => key === 'cinturon' ? (num(finalDe(S).pasamanos) > 0 ? 0 : 1) : 2;
  const COSTO_ALFORJA = 1;
  // Paga `costo` No2: si no alcanzan, pregunta (se puede igual, con la línea roja de la Mesa). → false si no quiso.
  function pagarNitros(S, costo, hizo, sinPreguntar){
    if(!(costo > 0)) return true;
    if(num(S.nitros) < costo){
      if(!sinPreguntar && !window.confirm(`Cuesta ${fmt(costo)} No2 y tenés ${fmt(num(S.nitros))}. ¿Hacerlo igual?`)) return false;
      const pagado = typeof FichaAcciones !== 'undefined' && FichaAcciones.gastoNitrosForzado ? FichaAcciones.gastoNitrosForzado(S, costo, hizo) : num(S.nitros);
      S.nitros = Math.max(0, num(S.nitros) - pagado);
      return true;
    }
    S.nitros = num(S.nitros) - costo;
    return true;
  }

  /* ---------- Ofrecer, aceptar, rechazar, cancelar ---------- */
  const paqueteTxt = p => p.tipo === 'item' ? `${p.nombre}${num(p.cantidad) > 1 ? ` ×${fmt(num(p.cantidad))}` : ''}` : p.nombre;
  // que = {tipo: 'item', itemId, unidades} | {tipo: 'dde', cantidad} | {tipo: 'despojos', despojo, despojoNombre, cantidad}; para = {id, nombre, duenoUid}
  async function ofrecer(S, deFicha, que, para){
    if(host && host.enCombate() && que.tipo !== 'item') return 'En combate solo se pasan ítems';
    const base = {deFicha, deNombre: nombreDe(S), paraFicha: para.id, paraNombre: String(para.nombre || '').slice(0, 60), creadoPor: fbUsuario.uid,
      uids: [...new Set([fbUsuario.uid, (fichas.find(f => f.id === deFicha) || {}).duenoUid || fbUsuario.uid, para.duenoUid || ''].filter(Boolean))],
      estado: 'pendiente', resolvio: '', itemId: '', json: '', cantidad: 0, despojo: '', despojoNombre: '', creado: ts()};
    const ref = col('paquetes').doc();
    if(que.tipo === 'item'){
      const f = buscar(S, que.itemId);
      if(!f) return 'Ese ítem ya no está';
      if(f.it.equipado) return 'Está equipado: sacalo primero';
      if(reservado(f.it)) return 'Ya está ofrecido';
      const total = num(f.it.unidades) || 1, k = f.it.consumible ? Math.max(1, Math.min(total, Math.round(num(que.unidades) || total))) : total;
      const json = JSON.stringify(copia(f.it, f.it.consumible ? k : undefined));
      if(json.length > 200000) return 'El ítem es demasiado grande para mandarlo';
      const combate = !!(host && host.enCombate());
      const costo = combate ? costoCombate(S, f.key) : 0;
      const antes = num(S.nitros);
      if(combate && !pagarNitros(S, costo, `le pasó ${f.it.nombre} a ${base.paraNombre}`)) return 'cancelado';
      const pagado = antes - num(S.nitros);
      try{ await ref.set({...base, tipo: 'item', nombre: String(f.it.nombre || '').slice(0, 80), json, cantidad: f.it.consumible ? k : 1}); }
      catch(err){ S.nitros = antes; throw err; }
      if(combate && typeof mesaLinea === 'function')
        mesaLinea(`🤝 ${base.deNombre} le pasa ${f.it.nombre}${k > 1 ? ' ×' + fmt(k) : ''} a ${base.paraNombre} (${f.key === 'cinturon' ? 'del cinturón' : 'de la mochila'} · ${costo ? '−' + fmt(pagado) + ' No2' + (pagado < costo ? ` de ${fmt(costo)}: no le alcanzaban` : '') : 'sin No2: Pasamanos'})`);
      const parte = separar(S, f, k);
      parte.reservado = ref.id; parte.reservadoPara = base.paraNombre;
      return null;
    }
    const n = que.tipo === 'dde' ? Math.floor(num(que.cantidad) * 100) / 100 : Math.floor(num(que.cantidad));
    if(!(n > 0)) return 'Poné una cantidad';
    if(que.tipo === 'dde'){
      if(n > num(S.meta.dde)) return `No tenés tantos DDE (tenés ${fmt(num(S.meta.dde))})`;
      sumarDde(S, -n);
      try{ await ref.set({...base, tipo: 'dde', nombre: `${fmt(n)} DDE`, cantidad: n}); }catch(err){ sumarDde(S, n); throw err; }
      return null;
    }
    const r = despojo(S, que.despojo, que.despojoNombre);
    if(n > r.get()) return `No tenés tantos despojos (tenés ${fmt(r.get())})`;
    r.set(r.get() - n);
    try{ await ref.set({...base, tipo: 'despojos', nombre: `${fmt(n)} despojos ${despTxt(que.despojo, que.despojoNombre)}`, cantidad: n, despojo: que.despojo, despojoNombre: que.despojo === 'especial' ? String(que.despojoNombre).slice(0, 60) : ''}); }
    catch(err){ r.set(r.get() + n); throw err; }
    return null;
  }
  function devolver(S, p){   // lo que se descontó al ofrecer (oro, despojos) o la reserva
    if(p.tipo === 'item') return liberar(S, p.id);
    if(p.tipo === 'dde'){ sumarDde(S, num(p.cantidad)); return true; }
    const r = despojo(S, p.despojo, p.despojoNombre); r.set(r.get() + num(p.cantidad)); return true;
  }
  function recibir(S, p){
    if(p.tipo === 'item' || p.tipo === 'pedido'){
      let it = null; try{ it = JSON.parse(p.json || 'null'); }catch(e){}
      if(!it) return '';
      const nuevo = aMochila(S, it);
      if(host && host.enCombate() && nuevo.consumible && typeof FichaEquipo !== 'undefined'){   // en combate, al cinturón si entra
        const r = FichaEquipo.alCinturon(S, nuevo, num(it.unidades) || 1);
        if(r.movidas) return ' (al cinturón)';
      }
      return '';
    }
    if(p.tipo === 'dde'){ sumarDde(S, num(p.cantidad)); return; }
    const r = despojo(S, p.despojo, p.despojoNombre); r.set(r.get() + num(p.cantidad));
  }
  async function aceptar(p){
    if(!host || !host.maneja(p.paraFicha)) return;
    await host.con(p.paraFicha, async S => {
      if(p.tipo === 'item'){
        let it = null; try{ it = JSON.parse(p.json || 'null'); }catch(e){}
        if(!it){ host.toast('No se pudo leer el ítem'); return false; }
        if(!entraEnMochila(S, it)){ host.toast(`Mochila llena: ${p.nombre} no entra. Hacé lugar y aceptalo de nuevo.`); return false; }
      }
      const ref = col('paquetes').doc(p.id);
      let ok = false;
      try{
        ok = await fbDb.runTransaction(async tx => {
          const d = await tx.get(ref);
          if(!d.exists || d.data().estado !== 'pendiente') return false;
          tx.update(ref, {estado: 'aceptado', resolvio: fbUsuario.uid});
          return true;
        });
      }catch(err){ console.error('No se pudo aceptar:', err); host.toast('No se pudo aceptar' + errTxt(err)); return false; }
      if(!ok){ host.toast(`${paqueteTxt(p)}: ya no está (lo cancelaron)`); return false; }
      const donde = recibir(S, p) || '';
      host.toast(`🤝 ${paqueteTxt(p)} → ${p.paraNombre}${donde}`);
      if(typeof mesaLinea === 'function') mesaLinea(`🤝 ${p.deNombre} le pasó ${paqueteTxt(p)} a ${p.paraNombre}`, 'recompensa');
      return true;
    });
  }
  async function rechazar(p){
    try{
      await fbDb.runTransaction(async tx => {
        const ref = col('paquetes').doc(p.id), d = await tx.get(ref);
        if(d.exists && d.data().estado === 'pendiente') tx.update(ref, {estado: 'rechazado', resolvio: fbUsuario.uid});
      });
      host && host.toast(`${paqueteTxt(p)}: rechazado`);
    }catch(err){ console.error('No se pudo rechazar:', err); host && host.toast('No se pudo rechazar' + errTxt(err)); }
  }
  async function cancelar(p){
    if(!host || !host.maneja(p.deFicha)) return;
    await host.con(p.deFicha, async S => {
      const ref = col('paquetes').doc(p.id);
      let ok = false;
      try{
        ok = await fbDb.runTransaction(async tx => {
          const d = await tx.get(ref);
          if(!d.exists || d.data().estado !== 'pendiente') return false;
          tx.delete(ref);
          return true;
        });
      }catch(err){ console.error('No se pudo cancelar:', err); host.toast('No se pudo cancelar' + errTxt(err)); return false; }
      if(!ok){ host.toast(`${paqueteTxt(p)}: ya lo respondió ${p.paraNombre}`); return false; }
      devolver(S, p);
      host.toast(`${paqueteTxt(p)}: ya no se lo ofrecés a ${p.paraNombre}`);
      return true;
    });
  }
  // Del lado de quien ofreció: lo respondido se cierra (una sola pantalla, por la transacción) y lo que quedó sin aviso se libera.
  const reconciliando = new Set();
  async function reconciliar(fichaId){
    if(!host || reconciliando.has(fichaId)) return;
    const respondidos = paquetes.filter(p => p.tipo !== 'pedido' && p.deFicha === fichaId && p.estado !== 'pendiente');
    const S0 = host.leer(fichaId);
    const sueltas = !S0 ? [] : desdeServidor ? ['inventario', 'cinturon'].flatMap(k => (S0[k] || []).filter(it => it && it.reservado && !paquetes.some(p => p.id === it.reservado))) : [];
    if(!respondidos.length && !sueltas.length) return;
    reconciliando.add(fichaId);
    try{
      // Una reserva sin aviso se mira contra el servidor antes de liberarla (puede ser de un aviso recién creado en otra pantalla).
      const faltan = [];
      for(const it of sueltas){
        try{ const d = await col('paquetes').doc(it.reservado).get(); if(!d.exists) faltan.push(it.reservado); }catch(e){}
      }
      await host.con(fichaId, async S => {
        let hubo = false;
        for(const p of respondidos){
          const ref = col('paquetes').doc(p.id);
          let ok = false;
          try{
            ok = await fbDb.runTransaction(async tx => {
              const d = await tx.get(ref);
              if(!d.exists || d.data().estado === 'pendiente') return false;
              tx.delete(ref);
              return true;
            });
          }catch(err){ console.error('No se pudo cerrar el paquete:', err); continue; }
          if(!ok) continue;
          if(p.estado === 'aceptado'){ if(p.tipo === 'item') quitarReservado(S, p.id); host.toast(`🤝 ${p.paraNombre} aceptó ${paqueteTxt(p)}`); }
          else{ devolver(S, p); host.toast(`${p.paraNombre} no aceptó ${paqueteTxt(p)}: vuelve a ${p.deNombre}`); }
          hubo = true;
        }
        faltan.forEach(id => { if(liberar(S, id)) hubo = true; });
        return hubo;
      });
    }finally{ reconciliando.delete(fichaId); }
  }

  /* ---------- 🎒 Alforja compartida (en combate): un aliado al lado saca un consumible de tu mochila por 1 No2 ----------
     pedirAlforja: quien saca deja el pedido. pedidos(fichaId): la pantalla del dueño de la alforja lo entrega sola (saca la unidad y la manda en
     el json) o lo rechaza; la de quien lo pidió lo recibe, paga y lo anuncia. */
  async function pedirAlforja(S, miFicha, aliado, it){
    if(num(S.nitros) < COSTO_ALFORJA && !window.confirm(`Cuesta ${fmt(COSTO_ALFORJA)} No2 y tenés ${fmt(num(S.nitros))}. ¿Hacerlo igual?`)) return 'cancelado';
    await col('paquetes').add({tipo: 'pedido', nombre: String(it.nombre || '').slice(0, 80), json: '', itemId: it.id, cantidad: 1, despojo: '', despojoNombre: '',
      deFicha: aliado.id, deNombre: String(aliado.nombre || '').slice(0, 60), paraFicha: miFicha, paraNombre: nombreDe(S), creadoPor: fbUsuario.uid,
      uids: [...new Set([fbUsuario.uid, aliado.duenoUid || '', (fichas.find(f => f.id === miFicha) || {}).duenoUid || ''].filter(Boolean))],
      estado: 'pendiente', resolvio: '', creado: ts()});
    return null;
  }
  const pidiendo = new Set();
  async function pedidos(fichaId){
    if(pidiendo.has(fichaId)) return;
    const entregar = paquetes.filter(p => p.tipo === 'pedido' && p.estado === 'pendiente' && p.deFicha === fichaId);
    const recibirlos = paquetes.filter(p => p.tipo === 'pedido' && p.estado !== 'pendiente' && p.paraFicha === fichaId);
    if(!entregar.length && !recibirlos.length) return;
    pidiendo.add(fichaId);
    try{
      await host.con(fichaId, async S => {
        let hubo = false;
        for(const p of entregar){   // soy el dueño de la alforja: la entrego sola (o digo que no se puede)
          const it = (S.inventario || []).find(x => x && x.id === p.itemId && x.consumible && !reservado(x) && num(x.unidades) > 0);
          const ok = !!it && num(finalDe(S).alforja) > 0;
          const ref = col('paquetes').doc(p.id);
          let hecho = false;
          try{
            hecho = await fbDb.runTransaction(async tx => {
              const d = await tx.get(ref);
              if(!d.exists || d.data().estado !== 'pendiente') return false;
              tx.update(ref, ok ? {estado: 'aceptado', resolvio: fbUsuario.uid, json: JSON.stringify(copia(it, 1))} : {estado: 'rechazado', resolvio: fbUsuario.uid});
              return true;
            });
          }catch(err){ console.error('No se pudo entregar de la alforja:', err); continue; }
          if(!hecho || !ok) continue;
          it.unidades = num(it.unidades) - 1;
          if(it.unidades <= 0) S.inventario = S.inventario.filter(x => x !== it);
          host.toast(`🎒 ${p.paraNombre} sacó ${it.nombre} de la alforja de ${p.deNombre}`);
          hubo = true;
        }
        for(const p of recibirlos){   // lo pedí yo: lo recibo y pago
          const ref = col('paquetes').doc(p.id);
          let ok = false;
          try{ ok = await fbDb.runTransaction(async tx => { const d = await tx.get(ref); if(!d.exists) return false; tx.delete(ref); return true; }); }
          catch(err){ console.error('No se pudo cerrar el pedido:', err); continue; }
          if(!ok) continue;
          if(p.estado !== 'aceptado'){ host.toast(`🎒 ${p.nombre}: ya no está en la alforja de ${p.deNombre}`); continue; }
          pagarNitros(S, COSTO_ALFORJA, `sacó ${p.nombre} de la alforja de ${p.deNombre}`, true);
          const donde = recibir(S, p) || '';
          host.toast(`🎒 ${p.nombre} → ${p.paraNombre}${donde}`);
          if(typeof mesaLinea === 'function') mesaLinea(`🎒 ${p.paraNombre} sacó ${p.nombre} de la alforja de ${p.deNombre} (−${fmt(COSTO_ALFORJA)} No2)`);
          hubo = true;
        }
        return hubo;
      });
    }finally{ pidiendo.delete(fichaId); }
  }

  /* ---------- Lo que quedó de la vieja mesa común ----------
     Una vez por personaje: lo que ofreció ahí y nadie se llevó vuelve (el oro y los despojos) o se libera (el ítem); lo que sí se llevaron
     sale de su mochila. Después, sin marcas `enMesa`. */
  const legadoHecho = new Set();
  async function legadoMesaComun(fichaId){
    if(legadoHecho.has(fichaId) || !host.leer(fichaId)) return;
    legadoHecho.add(fichaId);
    let docs = [];
    try{ docs = (await col('mesaComun').where('ofrecidoPor', '==', fbUsuario.uid).get()).docs.filter(d => (d.data().fichaId || '') === fichaId); }catch(e){}
    const S0 = host.leer(fichaId);
    const marcas = S0 && ['inventario', 'cinturon'].some(k => (S0[k] || []).some(it => it && it.enMesa));
    if(!docs.length && !marcas) return;
    await host.con(fichaId, async S => {
      let hubo = false;
      for(const d of docs){
        const x = d.data();
        try{ await d.ref.delete(); }catch(e){ continue; }
        if(x.tomadoPor){ if(x.tipo === 'item') quitarMarcado(S, d.id); }
        else if(x.tipo === 'dde') sumarDde(S, num(x.cantidad));
        else if(x.tipo === 'despojos'){ const r = despojo(S, x.despojo, x.despojoNombre); r.set(r.get() + num(x.cantidad)); }
        hubo = true;
      }
      ['inventario', 'cinturon'].forEach(k => (S[k] || []).forEach(it => { if(it && it.enMesa){ delete it.enMesa; hubo = true; } }));
      return hubo;
    });
  }
  function quitarMarcado(S, docId){ ['inventario', 'cinturon'].forEach(k => { S[k] = (S[k] || []).filter(it => !(it && it.enMesa === docId)); }); }

  /* ---------- Escuchar y avisar ---------- */
  let corte = null, fichasCorte = null;
  function iniciar(h){
    host = h;
    if(corte || typeof fbDb === 'undefined' || !fbDb || !fbUsuario) return;
    const q = fbMiembro && fbMiembro.gm ? col('paquetes') : col('paquetes').where('uids', 'array-contains', fbUsuario.uid);
    corte = q.onSnapshot({includeMetadataChanges: false}, snap => {
      paquetes = snap.docs.map(d => ({id: d.id, ...d.data()}));
      desdeServidor = !snap.metadata.fromCache;
      revisar();
    }, err => console.error('Error escuchando los paquetes:', err));
    fichasCorte = col('fichas').onSnapshot(snap => {
      fichas = snap.docs.map(d => ({id: d.id, nombre: d.data().nombre || '(sin nombre)', duenoUid: d.data().duenoUid || ''}));
    }, err => console.error('Error leyendo los personajes:', err));
    setInterval(() => revisar(), 4000);   // el personaje puede terminar de cargarse después del aviso
  }
  function revisar(){
    if(!host) return;
    const ids = new Set([...paquetes.map(p => p.deFicha), ...paquetes.filter(p => p.tipo === 'pedido').map(p => p.paraFicha), ...((host.propias && host.propias()) || [])]);
    ids.forEach(id => { if(id && host.maneja(id)){ reconciliar(id); pedidos(id); if(desdeServidor) legadoMesaComun(id); } });
    mostrarPendientes();
    if(abierta && abierta.tipo === 'dar') dibujarDar();
  }
  // El cartel de lo que te ofrecen, uno por vez.
  let cartel = null;
  function mostrarPendientes(){
    const p = paquetes.find(x => x.tipo !== 'pedido' && x.estado === 'pendiente' && host.maneja(x.paraFicha));
    if(!p){ if(cartel){ cartel.remove(); cartel = null; } return; }
    if(cartel && cartel.dataset.id === p.id) return;
    estilos();
    if(cartel) cartel.remove();
    let it = null; if(p.tipo === 'item'){ try{ it = JSON.parse(p.json || 'null'); }catch(e){} }
    cartel = document.createElement('div');
    cartel.className = 'ix-fondo ix-sin-fondo';
    cartel.dataset.id = p.id;
    cartel.innerHTML = `<div class="ix-caja ix-chica" role="dialog">
      <div class="ix-cab"><span>🤝 Te ofrecen algo</span></div>
      <div class="ix-cuerpo">
        <div class="ix-paso"><p><b>${esc(p.deNombre)}</b> le ofrece a <b>${esc(p.paraNombre)}</b>:</p>
          <p class="ix-grande">${p.tipo === 'item' ? '🎒' : p.tipo === 'dde' ? '💰' : '🦴'} ${esc(paqueteTxt(p))}</p>
          ${it ? `<p class="ix-hint">${esc(textoItem(it))}</p>` : ''}</div>
        <div class="ix-pie"><button type="button" data-ix-acepto>Aceptar</button><button type="button" class="sec" data-ix-rechazo>Rechazar</button></div>
      </div></div>`;
    cartel.onclick = ev => {
      if(ev.target.closest('[data-ix-acepto]')){ ev.target.disabled = true; aceptar(p).finally(() => { ev.target.disabled = false; }); }
      else if(ev.target.closest('[data-ix-rechazo]')) rechazar(p);
    };
    document.body.appendChild(cartel);
  }
  function textoItem(it){
    const partes = [it.tier, it.tipoItem && typeof FichaEquipo !== 'undefined' && FichaEquipo.CATEGORIA_LABEL ? FichaEquipo.CATEGORIA_LABEL[it.tipoItem] : '', it.detalle].filter(Boolean);
    return partes.join(' · ').slice(0, 300);
  }

  /* ---------- Ventanas ---------- */
  function estilos(){
    if(document.getElementById('intercambio-css')) return;
    const s = document.createElement('style');
    s.id = 'intercambio-css';
    s.textContent = `.ix-fondo{position:fixed;inset:0;z-index:98600;background:rgba(6,8,14,.62);display:flex;align-items:center;justify-content:center;padding:12px;font-family:inherit}
      .ix-fondo.ix-sin-fondo{background:transparent;pointer-events:none;align-items:flex-start;padding-top:70px}
      .ix-fondo.ix-sin-fondo .ix-caja{pointer-events:auto}
      .ix-caja{background:#151a26;color:#e9ecf4;border:1px solid #39435c;border-radius:16px;width:min(640px,100%);max-height:92vh;overflow:auto;box-shadow:0 18px 60px rgba(0,0,0,.6)}
      .ix-caja.ix-chica{width:min(440px,100%)}
      .ix-cab{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 16px;border-bottom:1px solid #2b3347;font-weight:800;font-size:17px}
      .ix-cab button{background:none;border:0;color:#9aa4bd;font-size:18px;cursor:pointer}
      .ix-cuerpo{padding:14px 16px;display:flex;flex-direction:column;gap:12px}
      .ix-paso{background:#1a2030;border:1px solid #2b3347;border-radius:12px;padding:10px 12px}
      .ix-paso h4{margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#9aa4bd;font-weight:600}
      .ix-paso p{margin:0 0 6px;line-height:1.4}
      .ix-grande{font-size:20px;font-weight:800}
      .ix-hint{font-size:12.5px;color:#9aa4bd;line-height:1.4}
      .ix-fila{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #232a3b}
      .ix-fila:last-child{border-bottom:0}
      .ix-fila .ix-q{flex:1;min-width:0}
      .ix-caja button{background:#2d6cdf;color:#fff;border:0;border-radius:9px;padding:7px 11px;font-size:13.5px;font-weight:700;cursor:pointer}
      .ix-caja button.sec{background:#2b3347;color:#d5dbec}
      .ix-caja button:disabled{opacity:.5;cursor:default}
      .ix-caja input,.ix-caja select{background:#0f131c;color:#e9ecf4;border:1px solid #39435c;border-radius:8px;padding:6px 8px;font-size:13.5px}
      .ix-caja input[type=number]{width:90px}
      .ix-pie{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
      .ix-pie button{padding:10px 16px;font-size:15px}
      .ix-grilla{display:flex;flex-wrap:wrap;gap:8px}
      .ix-log{font-size:12.5px;color:#c7cee2;max-height:220px;overflow:auto}
      .ix-log div{padding:3px 0;border-bottom:1px dashed #232a3b}
      .ix-aviso{font-size:13px;color:#ffd58a;background:#2a2312;border:1px solid #5a4a20;border-radius:10px;padding:8px 10px}`;
    document.head.appendChild(s);
  }
  let abierta = null;   // {tipo: 'dar' | 'baul', fichaId, itemId, el}
  function cerrar(){ if(abierta){ abierta.el.remove(); if(abierta.corte) abierta.corte.forEach(c => c()); abierta = null; } }
  function marco(titulo){
    estilos();
    cerrar();
    const el = document.createElement('div');
    el.className = 'ix-fondo';
    el.innerHTML = `<div class="ix-caja" role="dialog" aria-modal="true"><div class="ix-cab"><span>${esc(titulo)}</span><button type="button" data-ix-x title="Cerrar">✕</button></div><div class="ix-cuerpo"></div></div>`;
    el.addEventListener('mousedown', ev => { if(ev.target === el) cerrar(); });
    el.addEventListener('click', ev => { if(ev.target.closest('[data-ix-x]')) cerrar(); });
    document.body.appendChild(el);
    return el;
  }
  document.addEventListener('keydown', ev => { if(abierta && ev.key === 'Escape'){ ev.stopImmediatePropagation(); cerrar(); } }, true);
  const valor = (el, sel) => { const x = el.querySelector(sel); return x ? x.value : ''; };
  async function hacer(fichaId, fn){
    try{ return await host.con(fichaId, fn); }
    catch(err){ console.error(err); host.toast('No se pudo' + errTxt(err)); return null; }
  }

  /* — 🤝 Dar — */
  function abrirDar(fichaId, o){
    if(!host) return;
    o = o || {};
    abierta = null;
    const el = marco('🤝 Pasarle algo a otro personaje');
    abierta = {tipo: 'dar', fichaId, itemId: o.itemId || '', el, alforjas: []};
    el.addEventListener('click', ev => clicDar(ev));
    dibujarDar();
    if(!o.itemId) cargarAlforjas(fichaId);
  }
  // A quién: fuera de combate, a cualquiera; en combate, solo a los aliados al lado (si la pantalla sabe quiénes son).
  function destinos(fichaId){
    let L = fichas.filter(f => f.id !== fichaId);
    if(host.enCombate() && host.adyacentes){ const ady = new Set(host.adyacentes(fichaId) || []); L = L.filter(f => ady.has(f.id)); }
    return L.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
  // 🎒 Alforja compartida: lo que se puede sacar de la mochila de los aliados al lado que la tienen (se leen al abrir la ventana).
  async function cargarAlforjas(fichaId){
    if(!abierta || !host.enCombate() || typeof FichaGuardado === 'undefined') return;
    const lista = [];
    for(const a of destinos(fichaId)){
      try{
        const r = await FichaGuardado.cargar(fbDb, fbRutaCampana(`fichas/${a.id}`));
        if(!r || !r.S || !(num(finalDe(r.S).alforja) > 0)) continue;
        lista.push({aliado: a, items: (r.S.inventario || []).filter(it => it && it.consumible && !it.equipado && !reservado(it) && num(it.unidades) > 0)});
      }catch(e){}
    }
    if(abierta && abierta.tipo === 'dar' && abierta.fichaId === fichaId){ abierta.alforjas = lista; dibujarDar(); }
  }
  function dibujarDar(){
    if(!abierta || abierta.tipo !== 'dar') return;
    const {fichaId, el} = abierta, S = host.leer(fichaId), cuerpo = el.querySelector('.ix-cuerpo');
    if(!S){ cuerpo.innerHTML = '<div class="ix-paso"><p>Cargando al personaje…</p></div>'; return; }
    const previo = {dest: valor(el, '#ix-dest'), u: valor(el, '#ix-u'), dde: valor(el, '#ix-dde'), dn: valor(el, '#ix-dn'), dt: valor(el, '#ix-dt')};
    const f = abierta.itemId ? buscar(S, abierta.itemId) : null;
    const combate = host.enCombate();
    const dest = destinos(fichaId);
    const opcDest = dest.length ? dest.map(d => `<option value="${esc(d.id)}">${esc(d.nombre)}</option>`).join('')
      : `<option value="">${combate ? '(no hay ningún aliado al lado)' : '(no hay otros personajes)'}</option>`;
    const mios = paquetes.filter(p => p.tipo !== 'pedido' && p.deFicha === fichaId && p.estado === 'pendiente');
    const desp = despojosDe(S);
    const propios = ['inventario', 'cinturon'].flatMap(key => (S[key] || []).filter(it => it && !it.equipado && !reservado(it) && (!it.consumible || num(it.unidades) > 0)).map(it => ({it, key})));
    const costoTxt = key => { if(!combate) return ''; const c = costoCombate(S, key); return c ? ` (${fmt(c)} No2)` : ' (0 No2: Pasamanos)'; };
    const sinDest = !dest.length ? ' disabled' : '';
    let que = '';
    if(abierta.itemId){
      if(!f) que = '<div class="ix-paso"><p>Ese ítem ya no está.</p></div>';
      else{
        const total = num(f.it.unidades) || 1;
        que = `<div class="ix-paso"><h4>Qué</h4><p class="ix-grande">${f.key === 'cinturon' ? '🧷' : '🎒'} ${esc(f.it.nombre)}</p><p class="ix-hint">${esc(textoItem(f.it))}</p>
          ${f.it.consumible && total > 1 ? `<p>Cuántas: <input id="ix-u" type="number" min="1" max="${total}" step="1" value="${esc(previo.u || total)}"> <span class="ix-hint">de ${fmt(total)}</span></p>` : ''}
          ${f.it.equipado ? '<p class="ix-aviso">Está equipado: sacalo a la mochila primero.</p>' : reservado(f.it) ? `<p class="ix-aviso">Ya se lo ofreciste a ${esc(f.it.reservadoPara || 'alguien')}.</p>` : ''}</div>`;
      }
    }
    const alforjas = (abierta.alforjas || []).filter(a => a.items.length);
    cuerpo.innerHTML = `
      ${combate ? `<div class="ix-aviso">⚔ En combate: solo a un aliado al lado${host.adyacentes ? '' : ' (fijate en el mapa)'} y solo ítems. Cuesta 1 No2 si sale del cinturón (0 con Pasamanos) y 2 si sale de la mochila; si es un consumible y le entra, le llega al cinturón.</div>` : ''}
      ${que}
      <div class="ix-paso"><h4>A quién</h4><p><select id="ix-dest">${opcDest}</select></p>
        <p class="ix-hint">Le llega un aviso para aceptarlo o rechazarlo. Hasta que acepte, ${abierta.itemId || combate ? 'el ítem queda reservado (sigue ocupando lugar y no se puede usar)' : 'un ítem queda reservado en tu mochila (ocupa su lugar y no se usa) y el oro o los despojos quedan apartados'}; si no lo acepta, vuelve${combate ? ' (los No2, no)' : ''}.</p></div>
      ${abierta.itemId ? (f && !f.it.equipado && !reservado(f.it) ? `<div class="ix-pie"><button type="button" data-ix-dar-item${sinDest}>🤝 Ofrecérselo${costoTxt(f.key)}</button></div>` : '') : `
      ${combate ? '' : `<div class="ix-paso"><h4>Oro y despojos</h4>
        <div class="ix-fila"><span class="ix-q">💰 DDE <span class="ix-hint">(tenés ${fmt(num(S.meta.dde))})</span></span><input id="ix-dde" type="number" min="0" step="1" value="${esc(previo.dde)}"><button type="button" data-ix-dar-dde${sinDest}>Ofrecer</button></div>
        <div class="ix-fila"><span class="ix-q">🦴 Despojos <select id="ix-dt">${desp.map(d => `<option value="${esc(d.tipo === 'especial' ? 'esp:' + d.nombre : d.tipo)}">${esc(d.tipo === 'especial' ? d.nombre : DESP_TXT[d.tipo])} (${fmt(d.n)})</option>`).join('') || '<option value="">(no tenés)</option>'}</select></span><input id="ix-dn" type="number" min="0" step="1" value="${esc(previo.dn)}"><button type="button" data-ix-dar-desp${sinDest || (!desp.length ? ' disabled' : '')}>Ofrecer</button></div>
      </div>`}
      <div class="ix-paso"><h4>Ítems de tu mochila y tu cinturón</h4>
        ${propios.length ? propios.map(({it, key}) => `<div class="ix-fila"><span class="ix-q" title="${esc(textoItem(it))}">${key === 'cinturon' ? '🧷' : '🎒'} ${esc(it.nombre)}${num(it.unidades) > 1 ? ` <span class="ix-hint">(tenés ${fmt(num(it.unidades))})</span>` : ''}</span>${it.consumible && num(it.unidades) > 1 ? `<input data-ix-u="${esc(it.id)}" type="number" min="1" max="${fmt(num(it.unidades))}" step="1" value="1">` : ''}<button type="button" data-ix-dar-este="${esc(it.id)}"${sinDest}>Ofrecer${costoTxt(key)}</button></div>`).join('') : '<p class="ix-hint">No hay nada para ofrecer (lo equipado o lo ya ofrecido no cuenta).</p>'}</div>`}
      ${combate && alforjas.length ? `<div class="ix-paso"><h4>🎒 Sacar de la alforja de un aliado (${fmt(COSTO_ALFORJA)} No2)</h4>
        ${alforjas.map(a => a.items.map(it => `<div class="ix-fila"><span class="ix-q">${esc(it.nombre)} <span class="ix-hint">· de ${esc(a.aliado.nombre)} (tiene ${fmt(num(it.unidades))})</span></span><button type="button" data-ix-alforja="${esc(a.aliado.id)}|${esc(it.id)}">Sacar 1</button></div>`).join('')).join('')}
        <p class="ix-hint">Con Alforja compartida, un aliado al lado saca él mismo un consumible de tu mochila. Llega a tu cinturón si entra.</p></div>` : ''}
      ${mios.length ? `<div class="ix-paso"><h4>Lo que ofreciste y espera respuesta</h4>${mios.map(p => `<div class="ix-fila"><span class="ix-q">${esc(paqueteTxt(p))} → <b>${esc(p.paraNombre)}</b></span><button type="button" class="sec" data-ix-cancelar="${esc(p.id)}">Cancelar</button></div>`).join('')}</div>` : ''}`;
    const sel = el.querySelector('#ix-dest'); if(sel && previo.dest && [...sel.options].some(x => x.value === previo.dest)) sel.value = previo.dest;
    const dt = el.querySelector('#ix-dt'); if(dt && previo.dt && [...dt.options].some(x => x.value === previo.dt)) dt.value = previo.dt;
  }
  async function clicDar(ev){
    const b = ev.target.closest('button');
    if(!b || b.disabled || !abierta) return;
    const {fichaId, el} = abierta;
    if(b.dataset.ixCancelar){ const p = paquetes.find(x => x.id === b.dataset.ixCancelar); if(p) await cancelar(p); dibujarDar(); return; }
    if(b.dataset.ixAlforja){
      const [aliadoId, itemId] = b.dataset.ixAlforja.split('|');
      const a = (abierta.alforjas || []).find(x => x.aliado.id === aliadoId), it = a && a.items.find(x => x.id === itemId);
      if(!a || !it) return;
      b.disabled = true;
      let error = null;
      await hacer(fichaId, async S => { error = await pedirAlforja(S, fichaId, a.aliado, it); return false; });
      if(error && error !== 'cancelado') host.toast(error);
      else if(!error){ host.toast(`🎒 Le pediste ${it.nombre} a la alforja de ${a.aliado.nombre}: llega en un momento`); it.unidades = num(it.unidades) - 1; a.items = a.items.filter(x => num(x.unidades) > 0); dibujarDar(); }
      b.disabled = false;
      return;
    }
    const para = fichas.find(f => f.id === valor(el, '#ix-dest'));
    let que = null;
    if(b.hasAttribute('data-ix-dar-item')) que = {tipo: 'item', itemId: abierta.itemId, unidades: valor(el, '#ix-u')};
    else if(b.dataset.ixDarEste){ const u = el.querySelector(`[data-ix-u="${CSS.escape(b.dataset.ixDarEste)}"]`); que = {tipo: 'item', itemId: b.dataset.ixDarEste, unidades: u ? u.value : ''}; }
    else if(b.hasAttribute('data-ix-dar-dde')) que = {tipo: 'dde', cantidad: valor(el, '#ix-dde')};
    else if(b.hasAttribute('data-ix-dar-desp')){ const v = valor(el, '#ix-dt'); que = {tipo: 'despojos', despojo: v.startsWith('esp:') ? 'especial' : v, despojoNombre: v.startsWith('esp:') ? v.slice(4) : '', cantidad: valor(el, '#ix-dn')}; }
    if(!que) return;
    if(!para){ host.toast(host.enCombate() ? 'En combate, solo a un aliado al lado' : 'Elegí a quién'); return; }
    b.disabled = true;
    let error = null;
    const hubo = await hacer(fichaId, async S => { error = await ofrecer(S, fichaId, que, para); return !error; });
    b.disabled = false;
    if(error){ if(error !== 'cancelado') host.toast(error); return; }
    if(hubo){
      host.toast(`🤝 Se lo ofreciste a ${para.nombre}: le llega un aviso para aceptarlo`);
      if(abierta.itemId) cerrar(); else{ ['#ix-dde', '#ix-dn'].forEach(s => { const x = el.querySelector(s); if(x) x.value = ''; }); dibujarDar(); }
    }
  }

  /* — 📦 El baúl común — */
  let baul = [], baulLog = [];
  const capacidad = () => POR_INTEGRANTE * Math.max(1, fichas.length);
  const enBaul = it => Math.max(1, E().ranuras(it));   // en el baúl todo ocupa al menos 1 ranura (P158)
  const baulUsado = () => baul.filter(x => x.tipo === 'item').reduce((a, x) => a + Math.max(0, num(x.ranuras)), 0);
  function abrirBaul(fichaId){
    if(!host) return;
    if(!host.tienda()){ host.toast('El baúl común se abre desde una tienda abierta'); return; }
    if(host.enCombate()){ host.toast('En combate no se puede usar el baúl'); return; }
    const el = marco('📦 Baúl común');
    abierta = {tipo: 'baul', fichaId, el, corte: []};
    abierta.corte.push(col('baul').onSnapshot(snap => { baul = snap.docs.map(d => ({id: d.id, ...d.data()})); dibujarBaul(); }, err => { console.error('Error leyendo el baúl:', err); host.toast('No se pudo leer el baúl' + errTxt(err)); }));
    abierta.corte.push(col('baulLog').orderBy('cuando', 'desc').limit(40).onSnapshot(snap => { baulLog = snap.docs.map(d => d.data()); dibujarBaul(); }, err => console.error('Error leyendo el registro del baúl:', err)));
    el.addEventListener('click', ev => clicBaul(ev));
    dibujarBaul();
  }
  function cuandoTxt(c){
    const d = c && c.toDate ? c.toDate() : null;
    return d ? d.toLocaleString('es-AR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}) : '';
  }
  function dibujarBaul(){
    if(!abierta || abierta.tipo !== 'baul') return;
    const {fichaId, el} = abierta, S = host.leer(fichaId), cuerpo = el.querySelector('.ix-cuerpo');
    if(!S){ cuerpo.innerHTML = '<div class="ix-paso"><p>Cargando al personaje…</p></div>'; return; }
    const previo = {dde: valor(el, '#ix-bdde'), sdde: valor(el, '#ix-bsdde'), dn: valor(el, '#ix-bdn'), dt: valor(el, '#ix-bdt')};
    const cap = capacidad(), usado = baulUsado();
    const items = baul.filter(x => x.tipo === 'item').sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
    const dde = num((baul.find(x => x.id === 'dde') || {}).cantidad);
    const desps = baul.filter(x => x.tipo === 'despojos' && num(x.cantidad) > 0);
    const propios = (S.inventario || []).filter(it => it && !it.equipado && !reservado(it));
    const desp = despojosDe(S);
    const capM = E().capMochila(S), usM = E().mochilaUsada(S);
    cuerpo.innerHTML = `
      <div class="ix-hint">Lo que está en el baúl es de todo el grupo: cualquiera lo saca. Cada movimiento queda anotado abajo y en la Mesa.</div>
      <div class="ix-paso"><h4>En el baúl · ${fmt(usado)} / ${fmt(cap)} ranuras <span class="ix-hint">(${POR_INTEGRANTE} por integrante · el oro y los despojos no ocupan lugar)</span></h4>
        ${items.length ? items.map(x => { let it = null; try{ it = JSON.parse(x.json || 'null'); }catch(e){} return `<div class="ix-fila"><span class="ix-q" title="${esc(it ? textoItem(it) : '')}">🎒 ${esc(x.nombre)}${it && num(it.unidades) > 1 ? ` ×${fmt(num(it.unidades))}` : ''} <span class="ix-hint">· lo puso ${esc(x.pusoNombre || '—')}</span></span><button type="button" data-ix-sacar="${esc(x.id)}">Sacar</button></div>`; }).join('') : '<p class="ix-hint">No hay ítems.</p>'}
        <div class="ix-fila"><span class="ix-q">💰 ${fmt(dde)} DDE</span><input id="ix-bsdde" type="number" min="0" step="1" value="${esc(previo.sdde)}"><button type="button" data-ix-sacar-dde${dde > 0 ? '' : ' disabled'}>Sacar</button></div>
        ${desps.map(x => `<div class="ix-fila"><span class="ix-q">🦴 ${fmt(num(x.cantidad))} despojos ${esc(despTxt(x.despojo, x.despojoNombre))}</span><input data-ix-sdn="${esc(x.id)}" type="number" min="0" step="1" value=""><button type="button" data-ix-sacar-desp="${esc(x.id)}">Sacar</button></div>`).join('')}
      </div>
      <div class="ix-paso"><h4>Guardar de tu mochila <span class="ix-hint">(${fmt(usM)}${capM > 0 ? ' / ' + fmt(capM) : ''} ranuras)</span></h4>
        ${propios.length ? propios.map(it => `<div class="ix-fila"><span class="ix-q" title="${esc(textoItem(it))}">${esc(it.nombre)}${num(it.unidades) > 1 ? ` ×${fmt(num(it.unidades))}` : ''} <span class="ix-hint">· ${fmt(enBaul(it))} ranura${enBaul(it) === 1 ? '' : 's'}</span></span><button type="button" data-ix-guardar="${esc(it.id)}"${usado + enBaul(it) > cap ? ' disabled title="El baúl está lleno"' : ''}>Guardar</button></div>`).join('') : '<p class="ix-hint">No hay nada para guardar (lo equipado o lo ofrecido no se guarda).</p>'}
        <div class="ix-fila"><span class="ix-q">💰 DDE <span class="ix-hint">(tenés ${fmt(num(S.meta.dde))})</span></span><input id="ix-bdde" type="number" min="0" step="1" value="${esc(previo.dde)}"><button type="button" data-ix-guardar-dde>Guardar</button></div>
        <div class="ix-fila"><span class="ix-q">🦴 <select id="ix-bdt">${desp.map(d => `<option value="${esc(d.tipo === 'especial' ? 'esp:' + d.nombre : d.tipo)}">${esc(d.tipo === 'especial' ? d.nombre : DESP_TXT[d.tipo])} (${fmt(d.n)})</option>`).join('') || '<option value="">(no tenés despojos)</option>'}</select></span><input id="ix-bdn" type="number" min="0" step="1" value="${esc(previo.dn)}"><button type="button" data-ix-guardar-desp${desp.length ? '' : ' disabled'}>Guardar</button></div>
      </div>
      <div class="ix-paso"><h4>Registro de movimientos</h4><div class="ix-log">${baulLog.length ? baulLog.map(l => `<div><span class="ix-hint">${esc(cuandoTxt(l.cuando))}</span> ${l.accion === 'saco' ? '⬆' : '⬇'} <b>${esc(l.personaje || l.jugador || '—')}</b>${l.jugador && l.personaje ? ` <span class="ix-hint">(${esc(l.jugador)})</span>` : ''} ${l.accion === 'saco' ? 'sacó' : 'guardó'} ${esc(l.que)}</div>`).join('') : '<span class="ix-hint">Todavía no hay movimientos.</span>'}</div></div>`;
    const dt = el.querySelector('#ix-bdt'); if(dt && previo.dt && [...dt.options].some(x => x.value === previo.dt)) dt.value = previo.dt;
  }
  async function anotar(S, accion, que){
    const personaje = nombreDe(S);
    try{ await col('baulLog').add({accion, que: String(que).slice(0, 160), quien: fbUsuario.uid, jugador: String((fbMiembro && fbMiembro.nombre) || '').slice(0, 60), personaje, cuando: ts()}); }
    catch(err){ console.error('No se pudo anotar en el registro del baúl:', err); }
    if(typeof mesaLinea === 'function') mesaLinea(`📦 ${personaje} ${accion === 'saco' ? 'sacó del' : 'guardó en el'} baúl común: ${que}`, 'recompensa');
  }
  async function clicBaul(ev){
    const b = ev.target.closest('button');
    if(!b || b.disabled || !abierta || abierta.tipo !== 'baul') return;
    const {fichaId, el} = abierta;
    if(!host.tienda()){ host.toast('La tienda se cerró: el baúl también'); cerrar(); return; }
    if(host.enCombate()){ host.toast('En combate no se puede usar el baúl'); return; }
    b.disabled = true;
    try{
      if(b.dataset.ixGuardar){
        await hacer(fichaId, async S => {
          const it = (S.inventario || []).find(x => x.id === b.dataset.ixGuardar);
          if(!it || it.equipado || reservado(it)) return false;
          const r = enBaul(it);
          if(baulUsado() + r > capacidad()){ host.toast('El baúl está lleno'); return false; }
          await col('baul').add({tipo: 'item', nombre: String(it.nombre || '').slice(0, 80), json: JSON.stringify(copia(it)), ranuras: r, puso: fbUsuario.uid, pusoNombre: nombreDe(S), creado: ts()});
          S.inventario = S.inventario.filter(x => x !== it);
          anotar(S, 'metio', `${it.nombre}${num(it.unidades) > 1 ? ` ×${fmt(num(it.unidades))}` : ''}`);
          return true;
        });
      }else if(b.dataset.ixSacar){
        const x = baul.find(v => v.id === b.dataset.ixSacar);
        let it = null; try{ it = JSON.parse((x && x.json) || 'null'); }catch(e){}
        if(!x || !it) return;
        await hacer(fichaId, async S => {
          if(!entraEnMochila(S, it)){ host.toast(`Mochila llena: ${x.nombre} no entra`); return false; }
          const ref = col('baul').doc(x.id);
          const ok = await fbDb.runTransaction(async tx => { const d = await tx.get(ref); if(!d.exists) return false; tx.delete(ref); return true; });
          if(!ok){ host.toast(`${x.nombre}: ya lo sacó otro`); return false; }
          aMochila(S, it);
          anotar(S, 'saco', `${x.nombre}${num(it.unidades) > 1 ? ` ×${fmt(num(it.unidades))}` : ''}`);
          return true;
        });
      }else if(b.hasAttribute('data-ix-guardar-dde') || b.hasAttribute('data-ix-sacar-dde')){
        const saca = b.hasAttribute('data-ix-sacar-dde'), n = Math.floor(num(valor(el, saca ? '#ix-bsdde' : '#ix-bdde')) * 100) / 100;
        if(!(n > 0)){ host.toast('Poné una cantidad'); return; }
        await hacer(fichaId, async S => {
          if(!saca && n > num(S.meta.dde)){ host.toast(`No tenés tantos DDE (tenés ${fmt(num(S.meta.dde))})`); return false; }
          const ref = col('baul').doc('dde');
          const ok = await fbDb.runTransaction(async tx => {
            const d = await tx.get(ref), hay = d.exists ? num(d.data().cantidad) : 0;
            if(saca && n > hay) return false;
            tx.set(ref, {tipo: 'dde', cantidad: Math.round((hay + (saca ? -n : n)) * 100) / 100});
            return true;
          });
          if(!ok){ host.toast('No hay tantos DDE en el baúl'); return false; }
          sumarDde(S, saca ? n : -n);
          anotar(S, saca ? 'saco' : 'metio', `${fmt(n)} DDE`);
          return true;
        });
        ['#ix-bdde', '#ix-bsdde'].forEach(s => { const i = el.querySelector(s); if(i) i.value = ''; });
      }else if(b.hasAttribute('data-ix-guardar-desp') || b.dataset.ixSacarDesp){
        const saca = !!b.dataset.ixSacarDesp;
        let tipo, nombre, n;
        if(saca){ const x = baul.find(v => v.id === b.dataset.ixSacarDesp); if(!x) return; tipo = x.despojo; nombre = x.despojoNombre; n = Math.floor(num((el.querySelector(`[data-ix-sdn="${CSS.escape(x.id)}"]`) || {}).value)); }
        else{ const v = valor(el, '#ix-bdt'); tipo = v.startsWith('esp:') ? 'especial' : v; nombre = v.startsWith('esp:') ? v.slice(4) : ''; n = Math.floor(num(valor(el, '#ix-bdn'))); }
        if(!tipo){ return; }
        if(!(n > 0)){ host.toast('Poné una cantidad'); return; }
        const docId = tipo === 'especial' ? 'desp-esp-' + String(nombre).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').slice(0, 40) : 'desp-' + tipo;
        await hacer(fichaId, async S => {
          const r = despojo(S, tipo, nombre);
          if(!saca && n > r.get()){ host.toast(`No tenés tantos despojos (tenés ${fmt(r.get())})`); return false; }
          const ref = col('baul').doc(docId);
          const ok = await fbDb.runTransaction(async tx => {
            const d = await tx.get(ref), hay = d.exists ? num(d.data().cantidad) : 0;
            if(saca && n > hay) return false;
            tx.set(ref, {tipo: 'despojos', despojo: tipo, despojoNombre: tipo === 'especial' ? String(nombre).slice(0, 60) : '', cantidad: hay + (saca ? -n : n)});
            return true;
          });
          if(!ok){ host.toast('No hay tantos despojos en el baúl'); return false; }
          r.set(r.get() + (saca ? n : -n));
          anotar(S, saca ? 'saco' : 'metio', `${fmt(n)} despojos ${despTxt(tipo, nombre)}`);
          return true;
        });
        const i = el.querySelector('#ix-bdn'); if(i && !saca) i.value = '';
      }
    }catch(err){ console.error(err); host.toast('No se pudo' + errTxt(err)); }
    finally{ b.disabled = false; dibujarBaul(); }
  }

  // El botón de la mochila (la ficha y la ventana de Equipo): 🤝 Dar, o lo que está ofrecido.
  function botonDar(it){
    if(!it || it.equipado) return '';
    if(it.reservado || it.enMesa) return `<button type="button" class="mini on" data-ix-abrir-dar="" title="Ofrecido a ${esc(it.reservadoPara || 'otro personaje')}: queda reservado hasta que lo acepte. Tocá para cancelar.">🤝 Ofrecido a ${esc(it.reservadoPara || '…')}</button>`;
    return `<button type="button" class="mini" data-ix-dar="${esc(it.id)}" title="Ofrecérselo a otro personaje (fuera de combate)">🤝 Dar</button>`;
  }
  // Un clic de la mochila: true si era de esta pieza.
  function clic(b, fichaId){
    if(!b || !b.dataset) return false;
    if(b.dataset.ixDar){ abrirDar(fichaId, {itemId: b.dataset.ixDar}); return true; }
    if(b.hasAttribute('data-ix-abrir-dar')){ abrirDar(fichaId); return true; }
    return false;
  }

  return {POR_INTEGRANTE, iniciar, revisar, reservado, botonDar, clic, abrirDar, abrirBaul, cerrar,
    // para las pruebas
    _ofrecer: ofrecer, _liberar: liberar, _quitarReservado: quitarReservado, _separar: separar, _aMochila: aMochila, _despojo: despojo};
})();
