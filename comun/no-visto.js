/* comun/no-visto.js — 🙈 «Lo que hace alguien que no se ve, no lo nombra» (2026-11-20, dueño: «no puede suceder que la rata haga algo y
   se revele»; «si la rata está bajo la niebla… no tiene que decir "la rata usó Polvareda"; si está a la vista, ahí sí»).
   El criterio único para TODO texto que le llega a una pantalla (la Mesa, la Crónica, un Aviso): se mira a quién NOMBRA el texto.
   - No nombra a ningún escondido → se ve tal cual.
   - Nombra a un escondido y además a alguien que sí se ve (un personaje, un creep a la vista) → se ve, con «Alguien» en lugar del
     nombre del escondido (lo que le pasa a un personaje no se esconde: solo no se dice quién fue).
   - Solo nombra escondidos → no aparece; si alguno ya es conocido (lo vieron alguna vez), queda «🎭 Alguien está realizando una acción
     incierta», sin el nombre ni el detalle. Lo del Mantenimiento de un escondido no aparece nunca.
   Acá van solo las cuentas con textos (sin mapa ni Firebase, con sus pruebas en comun/pruebas.html). Quién está escondido para cada
   pantalla lo decide el mapa (vtt-hexgrid/js/29-accion-incierta.js), que es el único que sabe qué ve cada uno. */
const NoVisto = (() => {
  const ALGUIEN = 'Alguien';
  const INCIERTA = '🎭 Alguien está realizando una acción incierta';
  const esLetra = c => !!c && /[\p{L}\p{N}]/u.test(c);
  // Dónde aparece el nombre como palabra entera (sin importar mayúsculas): «Rata» no está en «Pirata».
  function buscar(texto, nombre, desde){
    const T = texto.toLowerCase(), N = nombre.toLowerCase();
    if(!N || T.length !== texto.length) return -1;
    let i = desde || 0;
    while((i = T.indexOf(N, i)) >= 0){
      if(!esLetra(texto[i - 1]) && !esLetra(texto[i + N.length])) return i;
      i++;
    }
    return -1;
  }
  // Todas las apariciones, los nombres más largos primero: «Rata 2 (copia)» no cuenta además como «Rata 2».
  function hallar(texto, nombres){
    let t = String(texto || '');
    const out = [];
    [...new Set((nombres || []).map(n => String(n || '').trim()).filter(Boolean))].sort((a, b) => b.length - a.length).forEach(n => {
      let i = 0;
      while((i = buscar(t, n, i)) >= 0){
        out.push({i, n});
        t = t.slice(0, i) + '\u0000'.repeat(n.length) + t.slice(i + n.length);
        i += n.length;
      }
    });
    return out;
  }
  const nombrados = (texto, nombres) => [...new Set(hallar(texto, nombres).map(x => x.n))];
  // El texto con «Alguien» en lugar de los nombres de `esconder` (`todos`: todos los nombres que hay, para no cortar uno más largo).
  function anonimo(texto, todos, esconder, por){
    let t = String(texto || '');
    const fuera = new Set(esconder || []);
    hallar(t, [...(todos || []), ...fuera]).filter(x => fuera.has(x.n)).sort((a, b) => b.i - a.i)
      .forEach(x => { t = t.slice(0, x.i) + (por || ALGUIEN) + t.slice(x.i + x.n.length); });
    return t;
  }
  /* ¿Qué se hace con un texto? ctx = {escondidos: [{nombre, conocido}], visibles: [nombre], mantenimiento?}
     → {modo: 'ver' | 'anon' | 'incierta' | 'nada', esconder: [nombres], todos: [nombres]} */
  function decidir(texto, ctx){
    const escondidos = (ctx && ctx.escondidos) || [], visibles = (ctx && ctx.visibles) || [];
    const todos = [...escondidos.map(e => e.nombre), ...visibles];
    const n = nombrados(texto, todos);
    const esc = escondidos.filter(e => n.includes(e.nombre));
    if(!esc.length) return {modo: 'ver', esconder: [], todos};
    const esconder = esc.map(e => e.nombre);
    if(n.some(x => !esconder.includes(x))) return {modo: 'anon', esconder, todos};
    if(ctx && ctx.mantenimiento) return {modo: 'nada', esconder, todos};
    return {modo: esc.some(e => e.conocido) ? 'incierta' : 'nada', esconder, todos};
  }
  // Un objeto con sus textos anonimizados (campos de texto, o listas de textos); no toca el original.
  function anonimoEn(obj, campos, dec){
    const x = {...obj};
    campos.forEach(k => {
      if(typeof x[k] === 'string') x[k] = anonimo(x[k], dec.todos, dec.esconder);
      else if(Array.isArray(x[k])) x[k] = x[k].map(v => typeof v === 'string' ? anonimo(v, dec.todos, dec.esconder) : v);
    });
    return x;
  }
  return {ALGUIEN, INCIERTA, hallar, nombrados, anonimo, decidir, anonimoEn};
})();
if(typeof window !== 'undefined') window.NoVisto = NoVisto;
