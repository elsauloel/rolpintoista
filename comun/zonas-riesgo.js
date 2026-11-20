/* comun/zonas-riesgo.js — 🕵 «Zonas de riesgo» de quien está en sigilo (2026-11-20, dueño: «cuando uno está en sigilo tiene que haber algún
   comando… que le permita ver exclusivamente los conos de visión de los rivales… cuáles son las zonas de riesgo y cuáles son las zonas
   liberadas para poder caminar sin perder el sigilo»).
   Acá van solo las cuentas (sin mapa ni Firebase, con sus pruebas en comun/pruebas.html). Las zonas de cada rival las calcula el mapa con la
   MISMA función que usa la detección de verdad (`zonasSigilo`, vtt-hexgrid/js/02: el cono y la zona de alerta); esto las junta:
   - riesgo (rojo): la casilla está en el CONO de algún rival → al entrar, lo descubren en el acto y el movimiento se corta ahí;
   - alerta (naranja rayado): está en la zona de alerta de alguno (y en el cono de ninguno) → cada paso ahí pide una tirada de Percepción;
   - libre (sin color): ninguno de los rivales que esa pantalla ve llega ahí.
   Qué rivales cuentan para cada pantalla lo decide el mapa (vtt-hexgrid/js/124-zonas-riesgo.js): solo los que ve. */
const ZonasRiesgo = (() => {
  const conj = x => x instanceof Set ? x : new Set(x || []);
  // zonas = [{cono, alerta}] (listas o Sets de claves de casilla) → {cono: Set, alerta: Set}; el cono de uno le gana a la alerta de otro.
  function unir(zonas){
    const cono = new Set(), alerta = new Set();
    (zonas || []).forEach(z => { if(!z) return; conj(z.cono).forEach(k => cono.add(k)); conj(z.alerta).forEach(k => alerta.add(k)); });
    cono.forEach(k => alerta.delete(k));
    return {cono, alerta};
  }
  // 'riesgo' | 'alerta' | 'libre'
  function estado(union, clave){
    if(!union) return 'libre';
    return conj(union.cono).has(clave) ? 'riesgo' : conj(union.alerta).has(clave) ? 'alerta' : 'libre';
  }
  // De quién se muestran: el token seleccionado si es uno de los míos en sigilo; si no, el primero de los míos en sigilo; si no hay, nadie.
  function referencia(seleccion, candidatos){
    const c = (candidatos || []).filter(Boolean);
    return c.includes(seleccion) ? seleccion : (c[0] || null);
  }
  /* Qué le pasa a un camino (claves de casilla, la primera es donde está parado), con la misma cuenta que el mapa al soltar el token
     (sigiloEvaluarRuta): → {corte: índice de la primera casilla en un cono (ahí lo descubren) o -1, alerta: pasos en zona de alerta hasta ahí}. */
  function camino(union, claves){
    const r = claves || [];
    let corte = -1;
    for(let i = 1; i < r.length && corte < 0; i++) if(estado(union, r[i]) === 'riesgo') corte = i;
    const fin = corte >= 0 ? corte : r.length - 1;
    let alerta = 0;
    for(let i = 1; i <= fin; i++) if(estado(union, r[i]) === 'alerta') alerta++;
    return {corte, alerta};
  }
  // El cartel fijo de arriba mientras el modo está prendido.
  function leyenda(nombre, cuantos, soyGM){
    const de = nombre ? ` de <b>${nombre}</b>` : '';
    if(!cuantos) return `🕵 Zonas de riesgo${de}: ${soyGM ? 'no hay ningún rival a la vista' : 'no ves a ningún rival'}, así que no hay nada que pintar${soyGM ? '' : ' (puede haber rivales que no ves)'}.`;
    return `🕵 Zonas de riesgo${de} · <span class="zr-rojo">■ rojo</span>: te descubren al entrar · <span class="zr-naranja">▨ naranja</span>: cada paso pide una tirada de Percepción · sin color: libre`
      + (soyGM ? '' : ' <span class="zr-nota">(solo de los rivales que ves)</span>');
  }
  return {unir, estado, referencia, camino, leyenda};
})();
if(typeof window !== 'undefined') window.ZonasRiesgo = ZonasRiesgo;
