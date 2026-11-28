/* =========================================================
   RECIBIDOS — lo que le llega a un personaje desde afuera (2026-10-02, hoja de ruta B-8)
   A un personaje no se le escribe la ficha desde afuera: quien le da algo deja un aviso y lo aplica quien lo maneja, una sola vez.
   - campanas/<id>/estados: los estados que le dejan una habilidad de creep, una trampa, una zona o la Ejecución ✨ de otro
     (`EstadosAplicar.encolarPj`), al personaje o a una invocación suya (`fichaId~invId`).
   - campanas/<id>/recompensas: lo que reparte el GM al terminar un combate (XP, DDE, despojos y las trampas consumibles que no se
     dispararon, que vuelven).
   Antes los aplicaba solo la ficha abierta (con el mapa solo, quedaban esperando); ahora la ficha y el mapa usan esta pieza.
   - `escuchar(col, cb)`: los avisos pendientes ('estados' | 'recompensas') que le tocan a este usuario (el GM, todos: puede tener 🎮
     el control de alguno). cb(docs). Devuelve la función que corta la escucha.
   - `deFicha(docs, fichaId)`: los de ese personaje y los de sus invocaciones.
   - `tomar(doc, borrar)`: transacción; true si lo tomó esta pantalla (si otra ya lo aplicó, false). `borrar` = el GM con el control
     (las reglas solo le dejan marcarlo como aplicado al dueño).
   - `devolver(doc)` / `noAplicados(docs, quien, motivo, ui)`: un aviso tomado que no se pudo aplicar vuelve a la cola (no se pierde en silencio).
   - `estado(S, doc, ui)`: al personaje (FichaAcciones.aplicarEstadoRecibido) o a su invocación (InvHabilidades.ponerEstado).
     ui = {presets, toast, cambio(lista)}. → {inv?} (la invocación que cambió).
   - `recompensa(S, doc)`: XP (con la subida de nivel), DDE, despojos y trampas devueltas. → {partes: ['+52 XP', …], subio, vueltas}.
     Un aviso con `regalo: true` (🤝 lo que el GM dio a mano, comun/dar-jugador.js) lo aplica DarJugador.recibir y vuelve además en `regalo`.
   - `aplicarExp(S, exp)` (la ficha la usa también al escribir la XP a mano) y `devolverTrampas(S, items)`.
   Necesita sesion.js, ficha-acciones.js, ficha-calculo.js, ficha-equipo.js, ficha-tienda.js e (invocaciones) inv-habilidades.js.
   ========================================================= */
const Recibidos = (() => {
  const SEP = '~';
  const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
  const uid = () => Math.random().toString(36).slice(2, 9);

  function escuchar(col, cb){
    if(typeof fbDb === 'undefined' || !fbDb || !fbUsuario) return () => {};
    const c = fbDb.collection(fbRutaCampana(col));
    const q = fbMiembro && fbMiembro.gm ? c.where('aplicada', '==', false) : c.where('duenoUid', '==', fbUsuario.uid).where('aplicada', '==', false);
    return q.onSnapshot(snap => cb(snap.docs), err => console.error(`Error escuchando ${col} pendientes:`, err));
  }
  const fichaDe = d => String((d.data() || {}).fichaId || '');
  function deFicha(docs, fichaId){
    const id = String(fichaId || '');
    return id ? (docs || []).filter(d => { const f = fichaDe(d); return f === id || f.startsWith(id + SEP); }) : [];
  }
  /* 🐞 (2026-11-03, «No se pudo aplicar lo recibido: Missing or insufficient permissions» en la consola de los jugadores): si otra pantalla
     ya lo tomó y lo BORRÓ (el GM con el 🎮 control, o su ficha), leerlo de nuevo choca con las reglas (un jugador solo lee los avisos que
     existen y son suyos) y la transacción falla con permission-denied. Eso es «ya lo aplicó otro»: no se toma, sin error. */
  async function tomar(d, borrar){
    try{
      return await fbDb.runTransaction(async tx => {
        const x = await tx.get(d.ref);
        if(!x.exists || x.data().aplicada) return false;
        if(borrar) tx.delete(d.ref); else tx.update(d.ref, {aplicada: true});
        return true;
      });
    }catch(err){
      if(err && err.code === 'permission-denied') return false;   // ya lo tomó (y borró) otra pantalla
      throw err;
    }
  }

  /* 🐞 Un aviso tomado que no se pudo aplicar no se pierde (2026-11-20, «después de revivir con el Pacto dejan de entrarle los debuffs»): las reglas no
     dejan «des-tomarlo» (solo pasa de pendiente a aplicado), así que vuelve a la cola como un aviso NUEVO igual (cualquier miembro puede dejar uno).
     Quien llama cuenta los reintentos (`intentos(d)` / `reintento(d)`: hasta MAX_REINTENTOS por aviso en esta pantalla) y, si se agotan, avisa. */
  const MAX_REINTENTOS = 3;
  const reintentos = new Map();
  const clave = d => { const x = (d && d.data && d.data()) || {}; return `${x.fichaId}|${x.origen}|${x.spec}`; };
  const intentos = d => reintentos.get(clave(d)) || 0;
  async function devolver(d){
    const x = d.data() || {};
    reintentos.set(clave(d), intentos(d) + 1);
    await fbDb.collection(fbRutaCampana('estados')).add({fichaId: String(x.fichaId || ''), duenoUid: String(x.duenoUid || ''), spec: String(x.spec || '').slice(0, 600),
      origen: String(x.origen || '').slice(0, 80), aplicada: false, creado: firebase.firestore.FieldValue.serverTimestamp()});
  }
  const hecho = d => { reintentos.delete(clave(d)); };   // se aplicó bien: la cuenta vuelve a cero
  // Cómo se nombra un aviso en un cartel: «Miedo (Blanco creep · Grito espeluznante)».
  function nombreDe(d){
    const sp = spec(d) || {}, origen = String((d.data() || {}).origen || '').trim();
    const que = sp.nombre === 'Quitar estado' || sp.nombre === 'Acortar estado' ? `${sp.nombre} (${sp.estado || '?'})` : (sp.nombre || 'un estado');
    return origen ? `${que} (${origen})` : que;
  }
  /* Lo que se hace con los avisos de estado que se tomaron y no quedaron aplicados. `lista` = los documentos; `motivo` = por qué, en palabras
     («no se pudo guardar su ficha», «falló al aplicarlo»). Cada uno vuelve a la cola (se reintenta solo) hasta MAX_REINTENTOS; después, se le pide al
     GM que lo aplique a mano. `ui = {toast(t), mesa(t)}` (la Mesa: una línea roja para todos). → {devueltos, agotados}. */
  async function noAplicados(lista, quien, motivo, ui){
    let devueltos = 0, agotados = 0;
    for(const d of (lista || [])){
      const que = nombreDe(d);
      if(intentos(d) >= MAX_REINTENTOS){
        agotados++; reintentos.delete(clave(d));
        try{ ui.mesa(`⚠ ${quien || 'Un personaje'}: no se le pudo aplicar ${que} — ${motivo}. Ya se reintentó ${MAX_REINTENTOS} veces: aplicáselo a mano (◎ del token).`); }catch(e){}
        try{ ui.toast(`⚠ No se te pudo aplicar ${que}: avisale al GM`); }catch(e){}
        continue;
      }
      try{
        await devolver(d); devueltos++;
        if(intentos(d) === 1) try{ ui.mesa(`⚠ ${quien || 'Un personaje'}: no se le pudo aplicar ${que} — ${motivo}. Se reintenta solo.`); }catch(e){}
      }catch(err){
        console.error('No se pudo devolver el aviso a la cola:', err);
        try{ ui.mesa(`⚠ ${quien || 'Un personaje'}: no se le pudo aplicar ${que} — ${motivo}. Aplicáselo a mano (◎ del token).`); }catch(e){}
      }
    }
    return {devueltos, agotados};
  }

  /* ---------- Estados ---------- */
  function spec(d){
    try{ return JSON.parse((d.data() || {}).spec || 'null'); }catch(e){ return null; }
  }
  function estado(S, d, ui){
    const sp = spec(d), origen = (d.data() || {}).origen || '';
    if(!sp || !sp.nombre) return {};
    const invId = fichaDe(d).split(SEP)[1];
    if(!invId){ FichaAcciones.aplicarEstadoRecibido(S, sp, origen, ui, {ref: fichaDe(d)}); return {}; }   // (`ref`: para el cartel flotante de lo que frena una inmunidad)
    const inv = (S.invocaciones || []).find(i => i && i.id === invId);
    if(!inv){ ui.toast(`${origen ? origen + ': ' : ''}${sp.nombre} — la invocación ya no está`); return {}; }
    if(sp.nombre === 'Quitar estado'){ inv.estados = (inv.estados || []).filter(x => !(x && x.nombre === sp.estado)); return {inv}; }   // los Estandartes (2026-10-18)
    if(sp.nombre === 'Acortar estado'){   // Recuperarse rápido (2026-10-04): le saca turnos a un estado de la invocación
      const e = (inv.estados || []).find(x => x && x.activo !== false && x.nombre === sp.estado && !x.permanente);
      if(!e){ ui.toast(`${inv.nombre}: ya no tiene ${sp.estado}`); return {}; }
      e.turnos = Math.max(0, num(e.turnos) - Math.max(1, Math.round(num(sp.stacks) || 1)));
      if(e.turnos <= 0) inv.estados = inv.estados.filter(x => x !== e);
      ui.toast(`${origen ? origen + ' → ' : ''}${inv.nombre}: ${sp.estado} ${e.turnos > 0 ? `queda en ${e.turnos} turno${e.turnos === 1 ? '' : 's'}` : 'se terminó'}`);
      return {inv};
    }
    if(sp.nombre === 'Revivir'){ ui.toast(`${origen ? origen + ' → ' : ''}${inv.nombre}: revivir una invocación va a mano`); return {}; }
    if(sp.nombre === 'Cura robada'){   // 🪱 la Sanguijuela que lanzó la invocación (2026-11-03): hasta su máximo, el resto como Vida extra; caída, se pierde
      const m = Math.max(0, Math.round(num(sp.vida))), antes = num(inv.hp);
      const r = Combatiente.repartoCuraRobada(antes, num(inv.hpMax), m);
      if(r.perdida){ ui.toast(`🪱 ${inv.nombre} está caída: la cura que robó su Sanguijuela se pierde`); return {}; }
      inv.hp = antes + r.cura;
      let veTxt = '';
      if(r.extra > 0){
        const ve = Combatiente.sumarVidaExtraTope(inv.estados, r.extra, num(inv.hpMax), {id: uid(), fuente: 'Sanguijuela'});   // ❤ una sola Vida extra (2026-11-03), con el tope (P354)
        inv.estados = ve.estados;
        veTxt = ve.tope.recortado ? ` (Vida extra ${Combatiente.vidaExtraTopeTxt(ve.tope, {su: true})})` : ` (${fmt(ve.tope.suma)} de Vida extra)`;
      }
      ui.toast(`🪱 ${origen ? origen + ' → ' : ''}${inv.nombre}: +${fmt(m)} de vida robada${veTxt}`);
      return {inv};
    }
    if(sp.nombre === 'Gana No2'){   // 🧉 el Matelisto (2026-10-18): aunque pase su máximo (dueño)
      const antes = num(inv.nitros);
      inv.nitros = antes + Math.max(0, Math.round(num(sp.stacks)));
      ui.toast(`${origen ? origen + ' → ' : ''}${inv.nombre}: +${fmt(inv.nitros - antes)} No2`);
      return {inv};
    }
    if(sp.nombre === 'Pierde No2'){   // Sonic Boom (2026-10-02): a una invocación
      const n = Math.max(0, Math.round(num(sp.stacks))), antes = num(inv.nitros);
      inv.nitros = Math.max(0, antes - n);
      let t2 = `−${fmt(n)} No2 (${fmt(antes)} → ${fmt(inv.nitros)})`;
      if(inv.nitros <= 0 && sp.sentadoEnCero) t2 += ' · ' + InvHabilidades.ponerEstado(inv, FichaAcciones.estadoDeSpec({nombre: 'Sentado'}, ui.presets));
      ui.toast(`🎯 ${origen ? origen + ' → ' : ''}${inv.nombre}: ${t2}`);
      return {inv};
    }
    const txt = InvHabilidades.ponerEstado(inv, FichaAcciones.estadoDeSpec(sp, ui.presets), {deAfuera: true, ref: fichaDe(d)});
    ui.toast(`🎯 ${origen ? origen + ' → ' : ''}${inv.nombre}: ${txt}`);
    return {inv};
  }

  /* ---------- Recompensas del combate ---------- */
  // La XP sube de nivel sola: cada nivel pide nivel × 100 (antes applyExp de la ficha, sin lo que dibuja).
  const expParaNivel = nivel => Math.max(1, num(nivel) || 1) * 100;
  function aplicarExp(S, valor){
    let nivel = Math.max(1, num(S.meta.nivel) || 1), exp = Math.max(0, num(valor)), subio = false, thr = expParaNivel(nivel);
    while(exp >= thr){ exp -= thr; nivel += 1; subio = true; thr = expParaNivel(nivel); }
    S.meta.exp = exp;
    S.meta.nivel = nivel;
    return subio;
  }
  // Trampas consumibles que no se dispararon: vuelven a la MOCHILA (se apilan con las iguales, que no ocupan ranura nueva) y, si la
  // mochila no tiene lugar, al CINTURÓN. Si tampoco hay lugar allá, se dejan en la mochila igual (que quede de más) antes que perderlas.
  // (antes devolverTrampasAlJugador de la ficha)
  function devolverTrampas(S, items){
    let aMochila = 0, aCinturon = 0;
    items.forEach(js => {
      let it = null;
      try{ it = JSON.parse(js); }catch(e){}
      if(!it) return;
      const pila = S.inventario.find(x => !x.equipado && x.consumible && x.nombre === it.nombre);
      if(pila){ pila.unidades = num(pila.unidades) + 1; aMochila++; return; }
      const cap = FichaEquipo.capMochila(S);
      if(!(cap > 0) || FichaEquipo.mochilaUsada(S) + FichaEquipo.ranuras(it) <= cap){ FichaTienda.agregarConsumible(S, it, 1); aMochila++; return; }
      if(FichaEquipo.cinturonLibre(S) > 0){   // 1 ranura = 1 unidad (2026-10-04): solo si queda lugar
        const c = structuredClone(it); c.unidades = 1; c.consumible = true;
        S.inventario.push(c);
        if(FichaEquipo.alCinturon(S, c, 1).movidas){ aCinturon++; return; }
        S.inventario = S.inventario.filter(x => x !== c);
      }
      FichaTienda.agregarConsumible(S, it, 1); aMochila++;   // sin lugar en ningún lado: mejor de más que perdida
    });
    return {total: aMochila + aCinturon, aMochila, aCinturon};
  }
  // Lo reclamado del botín (2026-10-08, reclamar y disputar): cada plantilla, a la mochila (los trofeos iguales se apilan; si no entra, se suma
  // igual: mejor de más que perdido). → los nombres.
  function itemsDelBotin(S, lista){
    const nombres = [];
    S.inventario = S.inventario || [];
    lista.forEach(js => {
      let it = null;
      try{ it = JSON.parse(js); }catch(e){}
      if(!it) return;
      const igual = it.trofeo ? S.inventario.find(i => i.trofeo && i.nombre === it.nombre) : null;
      if(igual) igual.unidades = num(igual.unidades) + 1;
      else{
        const nuevo = structuredClone(it);
        nuevo.id = uid();
        nuevo.equipado = false;
        nuevo.unidades = 1;
        nuevo.ranuras = it.ranuras ?? 1;
        S.inventario.push(nuevo);
      }
      nombres.push(it.nombre || '?');
    });
    return nombres;
  }
  function recompensa(S, d){
    const r = d.data() || {};
    // 🤝 Lo que el GM le dio a mano (comun/dar-jugador.js, 2026-11-21): mismo aviso, marcado `regalo`. Directo a la mochila / DDE / despojos;
    // `regalo` lleva lo que muestra el cartel de quien lo recibe (DarJugador.cartel).
    if(r.regalo === true && typeof DarJugador !== 'undefined'){
      const g = DarJugador.recibir(S, r);
      return {partes: g.partes, subio: false, vueltas: null, items: g.items, regalo: g};
    }
    let subio = false, vueltas = null, items = [];
    if(num(r.xp) > 0) subio = aplicarExp(S, num(S.meta.exp) + num(r.xp));
    if(num(r.dde) > 0) S.meta.dde = Math.round((num(S.meta.dde) + num(r.dde)) * 100) / 100;
    if(num(r.despojos) > 0) S.loot.normal = num(S.loot.normal) + num(r.despojos);
    if(Array.isArray(r.devolver) && r.devolver.length) vueltas = trampasADespojos(S, r.devolver);
    if(Array.isArray(r.items) && r.items.length) items = itemsDelBotin(S, r.items);
    const partes = [];
    if(num(r.xp) > 0) partes.push(`+${fmt(num(r.xp))} XP`);
    if(num(r.dde) > 0) partes.push(`+${fmt(num(r.dde))} DDE`);
    if(num(r.despojos) > 0) partes.push(`+${fmt(num(r.despojos))} despojos`);
    if(items.length) partes.push(`🎁 ${items.join(', ')} → mochila`);
    return {partes, subio, vueltas, items};
  }
  // Las trampas propias que no se usaron en el combate (dueño, 2026-10-08): no vuelven a la mochila, se convierten en su valor en despojos
  // (un cuarto del precio de compra, para arriba, como ♻ Convertir en despojos). → {total, despojos}.
  function trampasADespojos(S, items){
    let total = 0, despojos = 0;
    items.forEach(js => { let it = null; try{ it = JSON.parse(js); }catch(e){} if(!it) return; total++; despojos += Math.ceil(num(it.precioCompra) / 4); });
    if(despojos > 0){ S.loot = S.loot || {}; S.loot.normal = num(S.loot.normal) + despojos; }
    return {total, despojos};
  }
  // "🪤 2 trampas sin usar → +14 despojos" (antes: «volvieron a tu mochila»)
  function textoVueltas(v){
    if(!v || !v.total) return '';
    if(v.despojos !== undefined) return `🪤 ${v.total} trampa${v.total === 1 ? '' : 's'} sin usar → +${fmt(v.despojos)} despojos`;
    const uno = v.total === 1;
    return `🪤 ${v.total} trampa${uno ? '' : 's'} sin disparar ${uno ? 'se desarmó' : 'se desarmaron'} y volvió${uno ? '' : 'eron'} ${v.aCinturon ? (v.aMochila ? 'a tu mochila y al cinturón' : 'a tu cinturón') : 'a tu mochila'}`;
  }

  return {escuchar, deFicha, tomar, devolver, intentos, hecho, nombreDe, noAplicados, MAX_REINTENTOS, spec, estado, aplicarExp, expParaNivel, devolverTrampas, trampasADespojos, itemsDelBotin, recompensa, textoVueltas};
})();
