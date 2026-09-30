/* =========================================================
   COMBATIENTE — el motor de reglas común (paso 1 de docs/plan-consolidacion.md, 2026-09-30)
   Un personaje, una invocación y un creep son lo mismo para las reglas: alguien con stats, estados, No2, HP y escudo.
   Acá viven, UNA sola vez, las reglas que antes estaban copiadas en la ficha, GM Tools, el mapa y comun/estados-aplicar.js.
   Son funciones puras: reciben los datos (la lista de estados, el valor actual…) y devuelven el resultado, sin tocar la
   pantalla ni Firebase. Cada herramienta las llama con lo suyo (S.efectos en la ficha, sc.estados en un creep,
   inv.estados en una invocación). Cada regla que se sume acá suma sus pruebas en comun/pruebas.html.
   No depende de nada: se carga antes que estados-presets.js / estados-aplicar.js en cada herramienta.
   ========================================================= */
const Combatiente = (() => {
  const n = v => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
  const activos = estados => (estados || []).filter(e => e && e.activo !== false);

  /* ---------- Tiradas a la mitad (2026-09-24, dueño) ----------
     Pajaritos (PdG y Evasión), Lisiado (PdG y Parry) y Sentado (Evasión) parten la TIRADA a la mitad: se tira el dado
     completo y al resultado se lo divide por 2, para abajo, mínimo 1 — una vez por cada uno. Parálisis (PdG, Parry y
     Evasión) es una sola mitad por stat y no se suma a Lisiado ni a Pajaritos. Devuelve cuántas veces se parte. */
  function mitadesDeTirada(estados, statId){
    const act = activos(estados);
    let m = 0;
    if(['pdg', 'eva'].includes(statId) && act.some(e => e.mitadPdgEva)) m++;
    if(['pdg', 'parry'].includes(statId) && act.some(e => e.lisiado)) m++;
    if(['pdg', 'parry', 'eva'].includes(statId) && m === 0 && act.some(e => e.paralisis)) m++;
    if(statId === 'eva' && act.some(e => e.sentado)) m++;
    return m;
  }
  function aplicarMitades(total, veces){ for(let i = 0; i < veces; i++) total = Math.max(1, Math.floor(total / 2)); return total; }
  // Los estados que parten esa tirada, para mostrarlos ("Pajaritos ÷2"): uno por cada mitad que cuenta mitadesDeTirada
  // (dos estados con la misma marca parten una sola vez, así que se muestra el primero).
  function estadosQueParten(estados, statId){
    const act = activos(estados), out = [];
    const primero = marca => act.find(e => e[marca]);
    if(['pdg', 'eva'].includes(statId) && primero('mitadPdgEva')) out.push(primero('mitadPdgEva'));
    if(['pdg', 'parry'].includes(statId) && primero('lisiado')) out.push(primero('lisiado'));
    if(['pdg', 'parry', 'eva'].includes(statId) && !out.length && primero('paralisis')) out.push(primero('paralisis'));
    if(statId === 'eva' && primero('sentado')) out.push(primero('sentado'));
    return out;
  }

  /* ---------- Escudo especial y Excedente de vida: cambiar el valor a mano (2026-09-24, dueño) ----------
     El texto puede ser un número (valor nuevo), +N / −N (sumar o restar) o «max N» (cambia el máximo). `max === null` =
     excedente de vida (valor neto, sin tope ni «max N»). Devuelve {max, actual} o null si el texto no se entiende. */
  function escudoParsear(txt, actual, max){
    const t = String(txt || '').trim().replace(',', '.').replace('−', '-');
    if(!t) return null;
    const neto = max === null;
    if(!neto){
      const m = /^max\s*(\d+(?:\.\d+)?)$/i.exec(t);
      if(m){ const nm = Math.max(1, parseFloat(m[1])); return {max: nm, actual: Math.min(actual, nm)}; }
    }
    let v;
    if(/^[+-]\d+(?:\.\d+)?$/.test(t)) v = actual + parseFloat(t);
    else if(/^\d+(?:\.\d+)?$/.test(t)) v = parseFloat(t);
    else return null;
    return {max: neto ? null : max, actual: Math.max(0, neto ? v : Math.min(max, v))};
  }

  /* ---------- Estados que se acumulan ----------
     Devuelven el estado que ya estaba (actualizado) o null si no había uno igual (entonces se agrega el nuevo). */
  // Veneno: suma sus stacks enteros y dura tantos turnos como stacks. Veneno severo (permanente) no se acumula.
  function acumularVeneno(estados, nuevo){
    if(!nuevo || !nuevo.esVeneno) return null;
    const ya = (estados || []).find(e => e.esVeneno && e.nombre === nuevo.nombre);
    if(!ya) return null;
    if(!nuevo.permanente){
      ya.stacks = Math.max(1, n(ya.stacks) || 1) + Math.max(1, n(nuevo.stacks) || 1);
      ya.turnos = ya.stacks;
      ya.activo = true;
    }
    return ya;
  }
  // Sangrado (2026-09-22) y Escarcha (2026-09-25): cada reaplicación suma +1 stack (el daño por turno sube de a 1; la
  // Escarcha además renueva su duración), no una tirada nueva de stacks.
  function acumularSangrado(estados, nuevo){
    const clave = nuevo && nuevo.esSangrado ? 'esSangrado' : nuevo && nuevo.esEscarcha ? 'esEscarcha' : '';
    if(!clave) return null;
    const ya = (estados || []).find(e => e[clave] && e.nombre === nuevo.nombre);
    if(!ya) return null;
    ya.stacks = Math.max(1, n(ya.stacks) || 1) + 1;
    ya.activo = true;
    if(clave === 'esEscarcha') ya.turnos = Math.max(n(ya.turnos), n(nuevo.turnos));
    return ya;
  }

  /* ---------- Inmunidades ----------
     ¿Este debuff rebota en quien lo recibe? Devuelve el motivo ('Invulnerable', 'Inmunidad a CC', 'Sangre pura',
     'Coagulación extrema', 'Protección de jefe') o false. `o.jefe`: un creep jefe es inmune a Stun (P95). */
  function inmunidad(estados, est, o){
    if(!est || est.polaridad !== 'debuff') return false;
    if(o && o.jefe && est.nombre === 'Stun') return 'Protección de jefe';
    const act = activos(estados);
    if(act.some(e => e.invulnerable)) return 'Invulnerable';
    if(est.esCC && act.some(e => e.inmunidadCC)) return 'Inmunidad a CC';
    if(est.esVeneno && act.some(e => e.sangrePura)) return 'Sangre pura';
    if(est.esSangrado && act.some(e => e.coagulacionExtrema)) return 'Coagulación extrema';
    return false;
  }

  return {mitadesDeTirada, aplicarMitades, estadosQueParten, escudoParsear, acumularVeneno, acumularSangrado, inmunidad};
})();
