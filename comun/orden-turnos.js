/* =========================================================
   ORDEN DE TURNOS — mover a alguien en la iniciativa (2026-11-05, dueño: el Toque de carga y el Cambio de guardia del Support, las pasivas
   Marcar el ritmo y Sed de sangre, y la Mufa del Debuffer). Funciones puras: reciben el estado del orden y devuelven el nuevo, sin Firebase.
   Lo usa el mapa (vtt-hexgrid/js/102-orden-turnos.js) y lo prueban las pruebas del motor (comun/pruebas.html).

   Reglas (aprobadas por el dueño):
   - Nadie juega dos veces en la misma ronda: subir a alguien que ya jugó no lo hace jugar de nuevo (sigue contando como que jugó), y bajar a
     alguien que ya jugó por debajo del que tiene el turno lo deja anotado como que ya jugó. Nadie pasa por encima del que tiene el turno.
   - Subir y bajar se cancelan entre sí: los movimientos del mismo momento se suman por personaje (un +1 y un −1 dan 0).
   - Como mucho UN efecto de estos por personaje y por ronda (`usados`).

   Estado: {orden: [id…], turno: índice del que juega (−1 = nadie: el arranque de la ronda), actuaron: [id…]}.
   ========================================================= */
const OrdenTurnos = (() => {
  const num = v => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
  const copia = st => ({orden: (st.orden || []).slice(), turno: Math.round(num(st.turno)), actuaron: [...new Set(st.actuaron || [])]});
  // ¿Ya jugó esta ronda? (está antes del que tiene el turno, o figura en `actuaron`)
  const yaJugo = (st, id) => { const i = (st.orden || []).indexOf(id); return (i >= 0 && st.turno >= 0 && i < st.turno) || (st.actuaron || []).includes(id); };
  // Los movimientos del mismo momento, sumados por personaje: [{id, delta}] → [{id, delta}] (sin los que dan 0; en el orden en que aparecieron).
  function neto(movs){
    const m = new Map();
    for(const x of movs || []){ if(!x || !x.id) continue; m.set(x.id, (m.get(x.id) || 0) + Math.round(num(x.delta))); }
    return [...m.entries()].filter(([, d]) => d !== 0).map(([id, delta]) => ({id, delta}));
  }
  // Mueve a `id` `delta` lugares (positivo = sube). → {st, cambio: {id, desde, hasta} | null, nota}
  function mover(st0, id, delta){
    const st = copia(st0), d = Math.round(num(delta));
    const i = st.orden.indexOf(id);
    if(i < 0) return {st, cambio: null, nota: 'no está en el orden de turnos'};
    if(!d) return {st, cambio: null, nota: 'no se mueve'};
    if(i === st.turno) return {st, cambio: null, nota: 'es su turno: no se mueve'};
    const activo = st.turno >= 0 ? st.orden[st.turno] : null;
    let j;
    if(d > 0){
      const piso = st.turno >= 0 && i > st.turno ? st.turno + 1 : 0;   // no pasa por encima del que tiene el turno
      j = Math.max(i - d, piso);
      if(j >= i) return {st, cambio: null, nota: i === 0 ? 'ya es el primero' : 'ya es el siguiente en jugar: no sube más'};
    }else{
      j = Math.min(i - d, st.orden.length - 1);
      if(j <= i) return {st, cambio: null, nota: 'ya es el último: no baja más'};
    }
    const [x] = st.orden.splice(i, 1); st.orden.splice(j, 0, x);
    if(activo) st.turno = st.orden.indexOf(activo);
    if(i < num(st0.turno) && j > st.turno && st.turno >= 0 && !st.actuaron.includes(id)) st.actuaron.push(id);   // ya jugó y queda después: no le vuelve a tocar
    return {st, cambio: {id, desde: i, hasta: j}, nota: ''};
  }
  // Varios movimientos juntos (el arranque de la ronda, o uno suelto): se cancelan entre sí, uno por personaje y por ronda.
  // `usados` = los que ya tuvieron su efecto esta ronda. → {st, cambios, saltados: [{id, motivo}], usados}
  function aplicar(st0, movs, usados){
    let st = copia(st0);
    const ya = new Set(usados || []), cambios = [], saltados = [];
    for(const m of neto(movs)){
      if(ya.has(m.id)){ saltados.push({id: m.id, motivo: 'ya tuvo su efecto de orden esta ronda'}); continue; }
      const r = mover(st, m.id, m.delta);
      st = r.st;
      if(r.cambio){ cambios.push({...r.cambio, delta: m.delta}); ya.add(m.id); }
      else saltados.push({id: m.id, motivo: r.nota});
    }
    return {st, cambios, saltados, usados: [...ya]};
  }
  // Intercambia los lugares de `a` y `b` (el Cambio de guardia). Cuenta como su efecto de la ronda para los dos.
  function intercambiar(st0, a, b, usados){
    const st = copia(st0), ya = new Set(usados || []);
    const i = st.orden.indexOf(a), j = st.orden.indexOf(b);
    if(i < 0 || j < 0 || a === b) return {st, cambio: null, nota: 'tienen que ser dos del orden de turnos', usados: [...ya]};
    if(ya.has(a) || ya.has(b)) return {st, cambio: null, nota: 'uno de los dos ya tuvo su efecto de orden esta ronda', usados: [...ya]};
    if(i === st.turno || j === st.turno) return {st, cambio: null, nota: 'uno de los dos tiene el turno', usados: [...ya]};
    const activo = st.turno >= 0 ? st.orden[st.turno] : null;
    st.orden[i] = b; st.orden[j] = a;
    if(activo) st.turno = st.orden.indexOf(activo);
    ya.add(a); ya.add(b);
    return {st, cambio: {a, b, desdeA: i, desdeB: j}, nota: '', usados: [...ya]};
  }
  // 🎺 Toque de carga: 3 SP la primera vez en el combate y +2 por cada vez que se vuelve a usar (3, 5, 7…). `usos` = las veces que ya lo usó.
  const costoToque = usos => 3 + 2 * Math.max(0, Math.round(num(usos)));
  return {yaJugo, neto, mover, aplicar, intercambiar, costoToque};
})();
if(typeof window !== 'undefined') window.OrdenTurnos = OrdenTurnos;
