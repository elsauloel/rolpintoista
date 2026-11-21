/* comun/hex-info.js — ⬡ Qué afecta a una casilla del mapa (2026-11-05, dueño: «que uno pueda seleccionar un hexágono libre y que donde hoy
   muestra… el nombre, que diga hexágono libre… si ese hexágono está siendo afectado por algún efecto público, por ejemplo, algún aura, algún muro,
   alguna zona… que te permita ver también los distintos efectos aplicados a ese hexágono»).
   Lo puro: arma la lista del cartel a partir de los elementos que YA pasaron el filtro de visibilidad del mapa (puedeVerElemento, la niebla, el
   sigilo: eso lo decide vtt-hexgrid/js/104-hex-info.js, que es quien sabe quién mira). Acá no se decide qué se ve: solo cómo se cuenta.
   HexInfo.describir(el, {quedan, oculto}) → [{icono, titulo, detalle, clase, orden}] (un elemento puede dar más de una línea: una zona de fuego sólida)
   HexInfo.armar({items, sinExplorar, recordada, ocupada}) → {titulo, items} (ordenado, sin repetidos; si no hay nada, «Nada la afecta»). */
const HexInfo = (() => {
  const ORDEN = {bloqueo: 1, trampa: 2, peligro: 3, superficie: 4, zona: 5, aura: 6, portal: 7, nube: 8, luz: 9, objeto: 10, forma: 11, vista: 12};
  const s = n => (n === 1 ? '' : 's');
  const corto = (txt, max = 220) => {
    const t = String(txt || '').replace(/\s*⚙[\s\S]*$/, '').replace(/\s+/g, ' ').trim();
    if(t.length <= max) return t;
    const c = t.slice(0, max), p = c.lastIndexOf('. ');
    return (p > 60 ? c.slice(0, p + 1) : c.replace(/\s+\S*$/, '') + ' …');
  };
  const spec = el => { if(!el || !el.zonaEstado) return {}; try{ const o = JSON.parse(el.zonaEstado); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } };
  const item = (clase, icono, titulo, detalle) => ({icono, titulo, detalle: detalle || '', clase, orden: ORDEN[clase] || 50});

  function describir(el, o){
    if(!el) return [];
    o = o || {};
    const out = [], sp = spec(el), sup = el.zona && typeof sp.superficie === 'string' ? sp.superficie : '';
    if(el.colision) out.push(item('bloqueo', '🧱', 'Pared del mapa', 'Colisión: no se puede pasar ni quedarse acá.'));
    if(el.arma) out.push(item('objeto', '🗡', el.armaNombre || 'Arma en el piso', 'La levanta cualquiera que esté encima o al lado, por 1 No2.'));
    if(el.townPortal) out.push(item('portal', '🌀', 'Town portal', 'Un portal de regreso: al pisarlo, lleva al pueblo.'));
    else if(el.portal) out.push(item('portal', '🌀', 'Portal', 'Lo usan los aliados de quien lo abrió: lleva al otro portal.'));
    if(el.acelerador) out.push(item('objeto', '⏩', 'Acelerador', `Quien empieza el turno acá recibe ${Math.round(el.acelerador)} No2 extra.`));
    if(el.trampa){
      if(el.disparada) out.push(item('trampa', '💥', `Trampa detonada · ${el.trampaNombre || 'sin nombre'}`, 'Ya se disparó.'));
      else out.push(item('trampa', '⚠', `Trampa armada · ${el.trampaNombre || 'sin nombre'}`, corto(el.trampaDetalle) || 'Se dispara al pisarla.'));
    }
    if(el.fuego) out.push(item('peligro', '🔥', 'Terreno en llamas', `Quema a quien lo pisa o se queda: ${Math.round(Number(el.fuegoDano)) || 5} de daño de fuego.`));
    if(el.zona){
      if(sup === 'hielo') out.push(item('superficie', '🧊', 'Hielo', 'Cada paso encima pide una tirada de Agilidad: quien falla queda Sentado. Al irse, deja un charco.'));
      else if(sup === 'agua') out.push(item('superficie', '💧', 'Charco de agua', 'Quien está parado acá recibe el rayo ×1,5 y la Parálisis le entra con el doble de chance (salvo que vuele o levite). El fuego lo seca.'));
      else if(el.zonaLuz && !sp.nombre) out.push(item('luz', '💡', el.zonaNombre || 'Luz', 'Ilumina: deja ver lo que hay acá (también trampas y lo escondido).'));
      else {
        const partes = [];
        if(sp.nombre) partes.push(`aplica ${sp.nombre}`);
        if(el.zonaDano) partes.push(`${el.zonaDano} de daño${el.zonaDanoTipo ? ' de ' + el.zonaDanoTipo : ''}`);
        if(el.zonaAmiga) partes.push('a favor de los aliados de quien la puso');
        const quien = el.zonaCadaPaso ? 'a quien la cruza, en cada paso' : 'a quien entra y a quien sigue adentro en el Mantenimiento';
        let det = partes.length ? `${partes.join(' · ')}; ${quien}.` : `Afecta ${quien}.`;
        det = det.charAt(0).toUpperCase() + det.slice(1);
        if(el.zonaNota) det += ' ' + corto(el.zonaNota, 140);
        out.push(item('zona', '🌫', `Zona · ${el.zonaNombre || 'efecto persistente'}`, det));
      }
    }
    if(el.niebla) out.push(item('nube', '☁', 'Nube', 'Tapa la vista: quien está adentro no se ve desde afuera.'));
    if(el.solido && !el.colision) out.push(item('bloqueo', '🧱', 'Sólido', 'Bloquea el paso y la vista.'));
    else if(!out.length) out.push(item('forma', '⬡', 'Forma transitable', 'Una forma dibujada: se puede pisar.'));
    // Lo que acompaña a cada línea: los turnos que le quedan y si los jugadores no lo ven.
    const quedan = Number.isFinite(o.quedan) ? Math.max(0, Math.round(o.quedan)) : null;
    out.forEach(x => {
      if(quedan !== null && !el.colision) x.detalle += ` ⏳ Queda${s(quedan) ? 'n' : ''} ${quedan} turno${s(quedan)}.`;
      if(o.oculto) x.oculto = true;
    });
    return out;
  }

  function armar(d){
    d = d || {};
    if(d.sinExplorar) return {titulo: 'Hexágono sin explorar', items: [item('vista', '🌫', 'Sin explorar', 'Tus personajes todavía no vieron esta casilla.')]};
    const vistos = new Set(), items = [];
    (d.items || []).forEach(x => {
      if(!x || !x.titulo) return;
      const k = `${x.icono}|${x.titulo}|${x.detalle}`;
      if(vistos.has(k)) return;
      vistos.add(k); items.push({...x, orden: Number.isFinite(x.orden) ? x.orden : 50});
    });
    items.sort((a, b) => a.orden - b.orden);
    const bloqueada = items.some(x => x.clase === 'bloqueo');
    if(d.recordada) items.push(item('vista', '👁', 'Fuera de la vista', 'La vieron antes, pero ahora nadie la mira: puede haber cambiado.'));
    if(!items.length) items.push(item('vista', '·', 'Nada la afecta', 'Ni zonas, ni auras, ni terreno a la vista.'));
    const titulo = d.ocupada ? 'Hexágono ocupado' : bloqueada ? 'Hexágono bloqueado' : 'Hexágono libre';
    return {titulo, items};
  }

  return {describir, armar};
})();
if(typeof module !== 'undefined' && module.exports) module.exports = HexInfo;
