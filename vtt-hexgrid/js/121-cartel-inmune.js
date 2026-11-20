// js/121-cartel-inmune.js — 🛡 El cartel flotante «INVULNERABLE» / «INMUNE A …» (2026-11-20, dueño: «me gustaría que también salte el cartel
// flotante desde el token, en un azul-plateado que diga "INVULNERABLE"… o también "INMUNE A TÓXICO", por ejemplo»).
/* Cuando algo no le entra a alguien por una inmunidad, además de lo que ya se decía (la línea «🛡 … no le hizo nada» de la Mesa, el cuadro del
   duelo), de su token sale un cartel que flota, en azul-plateado, y lo ven todas las pantallas. Es el mismo texto flotante del «−2 EVA» (js/96:
   `ganchoEvaPublicar`, un momento sin tarjeta 'gancho-eva'), con `color: 'inmune'`. Vale igual para personajes, creeps e invocaciones.

   El texto (Combatiente.cartelInmune):
   - «INVULNERABLE»: lo frenó la invulnerabilidad (Invulnerable / Titilando), sea un estado o un daño;
   - «INMUNE A <ESTADO>»: cualquier otra inmunidad a un estado (Inmunidad a CC, Inmunidad mental, Sangre pura, Coagulación, Vuela, Arma natural,
     la Protección de jefe si el GM aplica la regla): el nombre del estado que no entró («INMUNE A MIEDO», «INMUNE A VENENO»);
   - «INMUNE AL FUEGO / A LO TÓXICO / A LO SINIESTRO…»: un daño de ese elemento que no le hace nada (resistencia de 99 o más, o lo siniestro contra
     no-muertos y demonios): las mismas palabras de la etiqueta «INMUNE …» que ya sale al apuntar (js/89).

   De dónde sale:
   - los estados: `window.avisoInmune(info)`, que llama Combatiente.agregarEstado cada vez que una inmunidad frena un estado (lo que llega de un
     duelo, una zona, una trampa, una habilidad, el «+ Estado» a mano de un creep…). El token: por `info.ref` (la ficha o la invocación), por
     `info.id` (el creep) o, si no hay otra cosa, por el nombre;
   - el daño que frena la invulnerabilidad: `inmuneCartelDano(t, r)`, desde los tres caminos del daño (danioCreep / danioPj / danioInv, js/10), por
     donde pasan el duelo, las zonas, las trampas, el rayo en cadena y el Escudo elemental;
   - el daño de un elemento al que es inmune: `inmuneCartelElemento(t, el, res, id)`, donde cada camino lee la resistencia (js/13, js/08, js/19,
     js/106 y el rayo de js/10).
   La Vaquita de San Antonio, la Piedra bezoar, «no tiene armadura» y Marcado (que no deja entrar al Sigilo) no son inmunidades: no llevan cartel. */

const INMUNE_DUR_MS = 2200;
const inmuneRecientes = new Map();   // tokenId → [{texto, t}] (para no repetir el mismo cartel y para apilar dos distintos, uno arriba del otro)

// Publica el cartel sobre ese token (id o el token), para todas las pantallas. El mismo texto sobre el mismo token no se repite en ~1,5 s.
function inmuneCartel(tok, texto){
  const id = typeof tok === 'string' ? tok : (typeof idDeToken === 'function' ? idDeToken(tok) : '');
  texto = String(texto || '').trim();
  if(!id || !texto || !tokens.get(id) || typeof ganchoEvaPublicar !== 'function') return false;
  const ahora = Date.now(), lista = (inmuneRecientes.get(id) || []).filter(x => ahora - x.t < INMUNE_DUR_MS);
  if(lista.some(x => x.texto === texto && ahora - x.t < 1500)){ inmuneRecientes.set(id, lista); return false; }
  const fila = lista.length;   // si todavía se ve otro cartel de inmunidad sobre ese token, este va arriba
  lista.push({texto, t: ahora});
  inmuneRecientes.set(id, lista);
  Promise.resolve(ganchoEvaPublicar(id, texto, {color: 'inmune', dur: INMUNE_DUR_MS, fila})).catch(err => console.error('El cartel de inmunidad:', err));
  return true;
}

// El token de un aviso de Combatiente: por la ficha o la invocación (`ref`), por el creep (`id`) o por el nombre (si hay uno solo con ese nombre).
function inmuneTokenDe(info){
  const todos = [...tokens.entries()];
  if(info.ref){ const p = todos.find(([, t]) => t && t.tipo !== 'creep' && String(t.fichaId || '') === String(info.ref)); if(p) return p[0]; }
  if(info.id){
    const p = todos.find(([, t]) => t && t.tipo === 'creep' && (t.fichaId === info.id || ((typeof creepPrivadoDe === 'function' && creepPrivadoDe(t.fichaId)) || {}).id === info.id));
    if(p) return p[0];
  }
  if(info.quien){ const l = todos.filter(([, t]) => t && t.fichaId && nombreDe(t) === info.quien); if(l.length === 1) return l[0][0]; }
  return '';
}
window.avisoInmune = function(info){
  if(!info || !info.texto) return;
  const id = inmuneTokenDe(info);
  if(id) inmuneCartel(id, info.texto);
};

// Un golpe que frenó la invulnerabilidad (`r` = lo que devuelve resolverGolpe, js/10).
function inmuneCartelDano(t, r){
  if(t && r && r.invulnerable) inmuneCartel(t, Combatiente.cartelInmune('Invulnerable'));
}
// Un daño de un elemento al que es inmune: `res` = su resistencia a ese elemento (99 o más = inmune), `id` = Combatiente.identidadElemento (×0 = nada).
function inmuneElementoTxt(el, res, id){
  if(!el || typeof DEBIL_NOMBRE_INM === 'undefined' || !DEBIL_NOMBRE_INM[el]) return '';
  return (id && id.mult === 0) || num(res) >= 99 ? `INMUNE ${DEBIL_NOMBRE_INM[el].toUpperCase()}` : '';
}
function inmuneCartelElemento(t, el, res, id){
  const txt = inmuneElementoTxt(el, res, id);
  if(t && txt) inmuneCartel(t, txt);
}
