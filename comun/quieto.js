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
     · Apuntada +N: «si no te moviste en este turno» → no se movió en ESTA ronda. Desde el 2026-11-23 (P271, dueño: «la Apuntada simple tampoco
       debería valer desde la ronda 1. Tampoco en el anillo»), recién desde la ronda 2, como la firme y el anillo.
     · Apuntada firme +N: «si no te moviste ni en este turno ni en el anterior» → la misma regla que el anillo (`activo`: desde la ronda 2). */
  const apuntada = (movidos, id, ronda) => n(ronda) >= 2 && !movio(movidos, id, ronda);
  const apuntadaFirme = activo;
  // ¿Está activo un bono según su regla? ('anillo' | 'firme' = ni esta ronda ni la anterior; 'apuntada' = no se movió en esta ronda; los dos desde la 2)
  const activoSegun = (regla, movidos, id, ronda) => regla === 'apuntada' ? apuntada(movidos, id, ronda) : activo(movidos, id, ronda);
  /* Por qué un bono suma o no (para la 🔍 de Atacar y el cuadro del duelo, P271): → {suma, por}. `hayOrden` = false: sin orden de turnos, lo que
     recuerda esa pantalla (`movioAhora` / `movioAntes`). */
  function porque(regla, o){
    o = o || {};
    if(o.hayOrden !== false && n(o.ronda) < 2) return {suma: false, por: 'es la ronda 1 del combate: vale recién desde la ronda 2, porque no hubo una ronda anterior quieta'};
    const ahora = o.hayOrden === false ? !!o.movioAhora : movio(o.movidos, o.id, o.ronda);
    const antes = regla === 'apuntada' ? false : (o.hayOrden === false ? !!o.movioAntes : movio(o.movidos, o.id, n(o.ronda) - 1));
    if(ahora) return {suma: false, por: o.hayOrden === false ? 'se movió en este turno' : 'se movió en esta ronda'};
    if(antes) return {suma: false, por: o.hayOrden === false ? 'se movió en el turno anterior' : 'se movió en la ronda anterior'};
    return {suma: true, por: regla === 'apuntada' ? 'no se movió en esta ronda' : 'no se movió ni en esta ronda ni en la anterior'};
  }
  // Las Apuntadas de las armas en la mano (las de rango): la más alta de cada una → {apuntada, apuntadaFirme} (lo publica el resumen de un personaje).
  function deArmas(armas){
    const out = {apuntada: 0, apuntadaFirme: 0};
    (Array.isArray(armas) ? armas : []).forEach(a => {
      if(!a || !a.armaDeRango) return;
      out.apuntada = Math.max(out.apuntada, Math.min(5, Math.max(0, Math.round(n(a.apuntada)))));
      out.apuntadaFirme = Math.max(out.apuntadaFirme, Math.min(5, Math.max(0, Math.round(n(a.apuntadaFirme)))));
    });
    return out;
  }
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
    {stat: 'pulso', icono: '🎯', nombre: 'Puntería certera', a: 'PdG', fem: true, regla: 'anillo'},
    {stat: 'foco', icono: '🔮', nombre: 'Foco', a: 'PdG.Esp', regla: 'anillo'},
  ];
  // 🎯 Las Apuntadas de las ballestas, con la misma pieza (P271, 2026-11-23): el cartel dorado y el aviso antes de moverse.
  const APUNTADAS = [
    {stat: 'apuntada', icono: '🎯', nombre: 'Apuntada', a: 'PdG', fem: true, regla: 'apuntada'},
    {stat: 'apuntadaFirme', icono: '🎯', nombre: 'Apuntada firme', a: 'PdG', fem: true, regla: 'firme'},
  ];
  // De los valores de un token ({pulso, foco, apuntada, apuntadaFirme}) → los bonos que tiene: [{stat, icono, nombre, a, val, regla}].
  const bonos = valores => [...ANILLOS, ...APUNTADAS].map(a => ({...a, val: Math.max(0, n(valores && valores[a.stat]))})).filter(a => a.val > 0);
  const cartel = b => `${b.icono} ${b.nombre}`;
  // El aviso antes de moverse con el bono activo. `con` (2026-11-21): el nombre de la habilidad o el ítem que lo mueve (Dash, Salto, Takle, Carga,
  // Parpadeo…): el aviso sale al usarla, antes de cobrar, y no al caminar.
  const aviso = (lista, nombre, propio, con) => {
    const que = lista.map(b => `${b.nombre} ${b.fem ? 'activa' : 'activo'} (+${b.val} a ${b.a})`).join(' y ');   // (2026-11-21: «Foco activo», no «Foco activa»)
    const la = lista.length > 1 ? (lista.every(b => b.fem) ? 'las' : 'los') : (lista[0] && lista[0].fem ? 'la' : 'lo');
    if(con) return propio !== false ? `Tenés ${que}. Si te movés con ${con}, ${la} perdés.` : `${nombre || 'Este token'} tiene ${que}. Si se mueve con ${con}, ${la} pierde.`;
    return propio !== false ? `Tenés ${que}. Si te movés, ${la} perdés.` : `${nombre || 'Este token'} tiene ${que}. Si lo movés, ${la} pierde.`;
  };
  /* 🏃 ¿Esta habilidad (o arma especial) mueve a quien la usa? (2026-11-21, cola: «Dash, Salto, Carga, Takle y Parpadeo: ¿apagan el anillo como
     caminar?, ¿avisa antes?»: apagaban el anillo pero no avisaban). El Dash (personaje `dashMapa`, creep `dash`), el Parpadeo / blink (habilidad o la
     Varita del blink, `especial.blink`) y las Ejecuciones que saltan o corren hasta el objetivo (`duelo.salto`: el Salto y el Takle; `duelo.embestida`
     y `duelo.cargaDerriba`: tomar carrera y la Carga que derriba). */
  const habMueve = h => {
    if(!h || typeof h !== 'object') return false;
    const d = h.duelo || (h.especial && h.especial.duelo) || null;
    return !!(h.dashMapa || h.dash || h.blink || (h.especial && h.especial.blink) || (d && (n(d.salto) > 0 || d.embestida || n(d.cargaDerriba) > 0)));
  };
  return {movio, activo, apuntada, apuntadaFirme, activoSegun, porque, deArmas, marcar, podar, unir, ANILLOS, APUNTADAS, bonos, cartel, aviso, habMueve};
})();
if(typeof window !== 'undefined') window.Quieto = Quieto;
