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
   - `estado(S, doc, ui)`: al personaje (FichaAcciones.aplicarEstadoRecibido) o a su invocación (InvHabilidades.ponerEstado).
     ui = {presets, toast, cambio(lista)}. → {inv?} (la invocación que cambió).
   - `recompensa(S, doc)`: XP (con la subida de nivel), DDE, despojos y trampas devueltas. → {partes: ['+52 XP', …], subio, vueltas}.
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
  async function tomar(d, borrar){
    return fbDb.runTransaction(async tx => {
      const x = await tx.get(d.ref);
      if(!x.exists || x.data().aplicada) return false;
      if(borrar) tx.delete(d.ref); else tx.update(d.ref, {aplicada: true});
      return true;
    });
  }

  /* ---------- Estados ---------- */
  function spec(d){
    try{ return JSON.parse((d.data() || {}).spec || 'null'); }catch(e){ return null; }
  }
  function estado(S, d, ui){
    const sp = spec(d), origen = (d.data() || {}).origen || '';
    if(!sp || !sp.nombre) return {};
    const invId = fichaDe(d).split(SEP)[1];
    if(!invId){ FichaAcciones.aplicarEstadoRecibido(S, sp, origen, ui); return {}; }
    const inv = (S.invocaciones || []).find(i => i && i.id === invId);
    if(!inv){ ui.toast(`${origen ? origen + ': ' : ''}${sp.nombre} — la invocación ya no está`); return {}; }
    if(sp.nombre === 'Acortar estado'){   // Recuperarse rápido (2026-10-04): le saca turnos a un estado de la invocación
      const e = (inv.estados || []).find(x => x && x.activo !== false && x.nombre === sp.estado && !x.permanente);
      if(!e){ ui.toast(`${inv.nombre}: ya no tiene ${sp.estado}`); return {}; }
      e.turnos = Math.max(0, num(e.turnos) - Math.max(1, Math.round(num(sp.stacks) || 1)));
      if(e.turnos <= 0) inv.estados = inv.estados.filter(x => x !== e);
      ui.toast(`${origen ? origen + ' → ' : ''}${inv.nombre}: ${sp.estado} ${e.turnos > 0 ? `queda en ${e.turnos} turno${e.turnos === 1 ? '' : 's'}` : 'se terminó'}`);
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
    const txt = InvHabilidades.ponerEstado(inv, FichaAcciones.estadoDeSpec(sp, ui.presets));
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
    const capCinturon = () => { const b = FichaCalculo.calcular(S).final.capcinturon; return num(S.caps.cinturon) + (Number.isNaN(b) ? 0 : b); };
    items.forEach(js => {
      let it = null;
      try{ it = JSON.parse(js); }catch(e){}
      if(!it) return;
      const pila = S.inventario.find(x => !x.equipado && x.consumible && x.nombre === it.nombre);
      if(pila){ pila.unidades = num(pila.unidades) + 1; aMochila++; return; }
      const cap = FichaEquipo.capMochila(S);
      if(!(cap > 0) || FichaEquipo.mochilaUsada(S) + FichaEquipo.ranuras(it) <= cap){ FichaTienda.agregarConsumible(S, it, 1); aMochila++; return; }
      const pilaC = S.cinturon.find(x => x.consumible && x.nombre === it.nombre);
      if(pilaC){ pilaC.unidades = num(pilaC.unidades) + 1; aCinturon++; return; }
      if(S.cinturon.length < capCinturon()){
        const c = structuredClone(it); c.id = uid(); c.unidades = 1; c.ranuras = 1; c.equipado = false;
        S.cinturon.push(c); aCinturon++; return;
      }
      FichaTienda.agregarConsumible(S, it, 1); aMochila++;   // sin lugar en ningún lado: mejor de más que perdida
    });
    return {total: aMochila + aCinturon, aMochila, aCinturon};
  }
  function recompensa(S, d){
    const r = d.data() || {};
    let subio = false, vueltas = null;
    if(num(r.xp) > 0) subio = aplicarExp(S, num(S.meta.exp) + num(r.xp));
    if(num(r.dde) > 0) S.meta.dde = Math.round((num(S.meta.dde) + num(r.dde)) * 100) / 100;
    if(num(r.despojos) > 0) S.loot.normal = num(S.loot.normal) + num(r.despojos);
    if(Array.isArray(r.devolver) && r.devolver.length) vueltas = devolverTrampas(S, r.devolver);
    const partes = [];
    if(num(r.xp) > 0) partes.push(`+${fmt(num(r.xp))} XP`);
    if(num(r.dde) > 0) partes.push(`+${fmt(num(r.dde))} DDE`);
    if(num(r.despojos) > 0) partes.push(`+${fmt(num(r.despojos))} despojos`);
    return {partes, subio, vueltas};
  }
  // "🪤 2 trampas sin disparar se desarmaron y volvieron a tu mochila"
  function textoVueltas(v){
    if(!v || !v.total) return '';
    const uno = v.total === 1;
    return `🪤 ${v.total} trampa${uno ? '' : 's'} sin disparar ${uno ? 'se desarmó' : 'se desarmaron'} y volvió${uno ? '' : 'eron'} ${v.aCinturon ? (v.aMochila ? 'a tu mochila y al cinturón' : 'a tu cinturón') : 'a tu mochila'}`;
  }

  return {escuchar, deFicha, tomar, spec, estado, aplicarExp, expParaNivel, devolverTrampas, recompensa, textoVueltas};
})();
