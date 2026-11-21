// comun/quieto.js — 💍 «Quieto»: los anillos que piden no haberse movido (Puntería certera = `pulso`, PdG; Foco arcano = `foco`, PdG.Esp).
/* (2026-11-20, dueño, con Bizzante en El origen: «le aparecía el bono a la probabilidad de golpe independientemente de si se había cumplido la
   condición o no… estaría bueno que cuando se active el bono aparezca algún tipo de cartel flotante que diga "Puntería certera", y que una vez que
   la tenés activada, si te vas a mover, te aparezca una notificación».)

   La regla del ítem: «si no te moviste ni en esta ronda ni en la anterior». Antes, «quién se movió» era memoria de UNA pantalla (y de su
   navegador): si el token lo movía una pantalla y el ataque salía de otra (el jugador y el GM con 🎮 el control, otra compu, otro navegador), la
   que atacaba no sabía nada y daba el bono igual. Ahora, con orden de turnos, se anota en la partida, al lado del orden (`movidos` en el
   documento de la iniciativa: {tokenId: [rondas en las que se movió]}; las reglas de Firestore ya dejan a cualquier miembro tocar ese documento
   si no cambia turno, ronda ni la cantidad de filas), así todas las pantallas ven lo mismo y no se pierde al recargar.

   Acá van solo las cuentas (sin pantalla ni Firebase), para el mapa (vtt-hexgrid/js/126-quieto.js) y para las pruebas automáticas.
   - El bono está ACTIVO en la ronda N si no se movió en la N ni en la N−1, y la N−1 existió en este combate: recién desde la ronda 2 (en la
     ronda 1 no hay «ronda anterior» que haya pasado quieto — P en docs/preguntas-abiertas.md).
   - `movidos` guarda, por token, solo esta ronda y la anterior. */
const Quieto = (() => {
  const n = v => Math.round(Number(v) || 0);
  const lista = (movidos, id) => { const l = movidos && typeof movidos === 'object' ? movidos[id] : null; return Array.isArray(l) ? l.map(n) : []; };
  // ¿Se movió en esa ronda?
  const movio = (movidos, id, ronda) => lista(movidos, id).includes(n(ronda));
  // ¿Tiene el bono en esta ronda? (con orden de turnos)
  const activo = (movidos, id, ronda) => n(ronda) >= 2 && !movio(movidos, id, ronda) && !movio(movidos, id, n(ronda) - 1);
  /* 🎯 Las Apuntadas de las ballestas (2026-11-21, dueño: «arreglalo también»: tenían la misma memoria de una sola pantalla que el anillo).
     · Apuntada +N: «si no te moviste en este turno» → no se movió en ESTA ronda (vale desde la ronda 1).
     · Apuntada firme +N: «si no te moviste ni en este turno ni en el anterior» → la misma regla que el anillo (`activo`: desde la ronda 2). */
  const apuntada = (movidos, id, ronda) => !movio(movidos, id, ronda);
  const apuntadaFirme = activo;
  // La lista de un token después de moverse en esta ronda (queda esta y la anterior).
  const marcar = (l, ronda) => [...new Set([...(Array.isArray(l) ? l : []).map(n).filter(r => r === n(ronda) - 1), n(ronda)])].sort((a, b) => a - b);
  // Lo que se guarda al pasar de ronda o tocar el orden: solo esta ronda y la anterior; sin orden de turnos, nada.
  const podar = (movidos, ronda, hayOrden) => {
    const out = {};
    if(!hayOrden || !movidos || typeof movidos !== 'object') return out;
    Object.keys(movidos).forEach(id => { const l = [...new Set(lista(movidos, id).filter(r => r === n(ronda) || r === n(ronda) - 1))].sort((a, b) => a - b); if(l.length) out[id] = l; });
    return out;
  };
  // Dos `movidos` juntos (lo guardado y lo que esta pantalla acaba de anotar).
  const unir = (a, b) => {
    const out = {};
    [a, b].forEach(m => { if(m && typeof m === 'object') Object.keys(m).forEach(id => { out[id] = [...new Set([...(out[id] || []), ...lista(m, id)])].sort((x, y) => x - y); }); });
    return out;
  };
  // Los anillos: qué stat, cómo se llama el bono y a qué suma.
  const ANILLOS = [
    {stat: 'pulso', icono: '🎯', nombre: 'Puntería certera', a: 'PdG', fem: true},
    {stat: 'foco', icono: '🔮', nombre: 'Foco', a: 'PdG.Esp'},
  ];
  // De los valores de un token ({pulso, foco}) → los bonos que tiene: [{stat, icono, nombre, a, val}].
  const bonos = valores => ANILLOS.map(a => ({...a, val: Math.max(0, n(valores && valores[a.stat]))})).filter(a => a.val > 0);
  const cartel = b => `${b.icono} ${b.nombre}`;
  // El aviso antes de moverse con el bono activo.
  const aviso = (lista, nombre, propio) => {
    const que = lista.map(b => `${b.nombre} ${b.fem ? 'activa' : 'activo'} (+${b.val} a ${b.a})`).join(' y ');   // (2026-11-21: «Foco activo», no «Foco activa»)
    const la = lista.length > 1 ? (lista.every(b => b.fem) ? 'las' : 'los') : (lista[0] && lista[0].fem ? 'la' : 'lo');
    return propio !== false ? `Tenés ${que}. Si te movés, ${la} perdés.` : `${nombre || 'Este token'} tiene ${que}. Si lo movés, ${la} pierde.`;
  };
  return {movio, activo, apuntada, apuntadaFirme, marcar, podar, unir, ANILLOS, bonos, cartel, aviso};
})();
if(typeof window !== 'undefined') window.Quieto = Quieto;
