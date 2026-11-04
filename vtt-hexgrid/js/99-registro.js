// js/99-registro.js — 🗂 El registro del combate, lo que anota el mapa del GM (2026-11-04).
//
// Dueño: «al iniciar la última sesión uno de los jugadores estaba convencido de que el punto de partida no era como lo habíamos dejado, y no
// teníamos un historial de movimientos o duelos». Lo que se guarda y cuánto dura lo maneja comun/registro.js (este combate y el anterior).
// Acá, la pantalla del GM (una sola pestaña: historialEsLider) anota en el 📜 Historial:
//   🦶 cada movimiento de un token del mapa publicado: de qué casilla a qué casilla, cuántas y en qué ronda (al de los jugadores, solo lo que
//      ellos ven: ni ocultos ni en sigilo);
//   📸 la foto al pausar (⏸): dónde está cada token y su vida, SP, No2 y estados (a los jugadores, de los creeps a la vista, sin la vida).
// La Mesa (tiradas y resúmenes de duelos) ya quedaba; ahora también dura hasta el registro nuevo.

const regMovBase = new Map();   // tokenId → {col, fila}
let regMovMapa = null;
const regCasilla = t => `${num(t.col)}·${num(t.fila)}`;
const regVisible = t => !t.oculto && !(typeof enSigilo === 'function' && enSigilo(t));

function regMovimientos(){
  if(!soyGM || window.parent !== window || typeof historialRegistrar !== 'function' || typeof historialEsLider !== 'function') return;
  if(mapaMostrado !== mapaActivo){ regMovMapa = null; regMovBase.clear(); return; }   // armando otro escenario: no se anota
  if(!historialEsLider('mov')) return;
  const primera = regMovMapa !== mapaActivo;
  regMovMapa = mapaActivo;
  const vistos = new Set();
  const ronda = modoMapa === 'combate' && iniciativa && num(iniciativa.ronda) ? ` (ronda ${num(iniciativa.ronda)})` : '';
  for(const [id, t] of tokens){
    if(!t || t.col === undefined || t.fila === undefined) continue;
    vistos.add(id);
    const antes = regMovBase.get(id);
    regMovBase.set(id, {col: num(t.col), fila: num(t.fila)});
    if(primera) continue;   // al cargar, solo se toma nota
    const nombre = nombreDe(t);
    let texto = '';
    if(!antes) texto = `🦶 entró al mapa en la casilla ${regCasilla(t)}${ronda}`;
    else if(antes.col !== num(t.col) || antes.fila !== num(t.fila)){
      const n = distanciaHex(antes, {col: num(t.col), fila: num(t.fila)});
      texto = `🦶 se movió ${fmt(n)} casilla${n === 1 ? '' : 's'}: de ${antes.col}·${antes.fila} a ${regCasilla(t)}${ronda}`;
    }
    if(!texto) continue;
    historialRegistrar('mov', nombre, texto);
    if(regVisible(t) && typeof historialPublicar === 'function') historialPublicar('mov', nombre, texto);
  }
  if(primera) return;
  for(const [id] of regMovBase) if(!vistos.has(id)){ regMovBase.delete(id); historialRegistrar('mov', 'Mapa', '🦶 un token salió del mapa'); }
}
setInterval(() => { try{ regMovimientos(); }catch(err){ console.error('Registro: los movimientos', err); } }, 1000);

/* ---------- 📸 La foto al pausar ---------- */
function regEstadosTxt(lista){
  const n = (Array.isArray(lista) ? lista : []).filter(e => e && e.nombre && e.activo !== false && !e.derivado)
    .map(e => `${e.nombre}${num(e.stacks) > 1 ? ` ×${fmt(num(e.stacks))}` : ''}${e.permanente ? '' : num(e.turnos) ? ` (${fmt(num(e.turnos))}t)` : ''}`);
  return n.length ? n.join(', ') : 'sin estados';
}
async function regFotoPausa(){
  if(!soyGM || window.parent !== window || typeof historialRegistrar !== 'function') return;
  let lista = [];
  try{
    const snap = await coleccionTokensDe(mapaActivo).get();
    lista = snap.docs.map(d => ({id: d.id, ...d.data()}));
  }catch(err){ console.error('Registro: no se pudieron leer los tokens para la foto', err); return; }
  const ronda = modoMapa === 'combate' && iniciativa && num(iniciativa.ronda) ? `, ronda ${num(iniciativa.ronda)}` : '';
  const cab = `📸 Foto de la pausa: ${lista.length} token${lista.length === 1 ? '' : 's'} en «${typeof nombreMapa === 'function' ? nombreMapa(mapaActivo) : 'el mapa'}»${ronda}`;
  historialRegistrar('foto', 'Mapa', cab);
  if(typeof historialPublicar === 'function') historialPublicar('foto', 'Mapa', cab);
  for(const t of lista){
    if(t.col === undefined || t.fila === undefined) continue;
    const nombre = nombreDe(t), v = vinculo(t), r = (v && v.resumen) || {};
    let hp = '', sp = '', no2 = '';
    try{
      const d = hudDatos(t);
      if(d.hp !== null && d.hp !== undefined) hp = ` · HP ${fmt(d.hp)}${d.hpMax ? '/' + fmt(d.hpMax) : ''}`;
      else if(r.hpPct !== undefined) hp = ` · vida ${fmt(num(r.hpPct))} %`;
      if(d.sp !== null && d.sp !== undefined) sp = ` · SP ${fmt(d.sp)}${d.spMax ? '/' + fmt(d.spMax) : ''}`;
      if(d.no2 !== null && d.no2 !== undefined) no2 = ` · No2 ${fmt(d.no2)}${d.no2Max ? '/' + fmt(d.no2Max) : ''}`;
    }catch(e){}
    const donde = `📸 casilla ${regCasilla(t)}${t.oculto ? ' · 🙈 oculto' : ''}`;
    const estados = regEstadosTxt(r.estados);
    historialRegistrar('foto', nombre, `${donde}${hp}${sp}${no2} · ${estados}`);
    if(typeof historialPublicar === 'function' && regVisible(t)) historialPublicar('foto', nombre, t.tipo === 'creep' ? `${donde} · ${estados}` : `${donde}${hp}${sp}${no2} · ${estados}`);
  }
  toast('📸 Foto de la pausa guardada en el 📜 Historial');
}
// El mapa del GM mira la pausa: cuando pasa a pausada (una pausa nueva, no la que ya estaba al entrar), saca la foto.
function regEscucharPausa(){
  if(!(fbMiembro && fbMiembro.gm) || window.parent !== window || !fbDb) return;
  let previa = null;
  fbDb.doc(fbRutaCampana('ajustes/pausa')).onSnapshot(s => {
    const p = s.exists ? s.data() : null, pausada = !!(p && p.pausada);
    const clave = p && p.desde && p.desde.toMillis ? String(p.desde.toMillis()) : '';
    if(previa === false && pausada && historialEsLider('foto')){
      let ya = '';
      try{ ya = localStorage.getItem('reg-foto-' + FB_CAMPANA) || ''; }catch(e){}
      if(!clave || clave !== ya){
        try{ localStorage.setItem('reg-foto-' + FB_CAMPANA, clave); }catch(e){}
        regFotoPausa();
      }
    }
    previa = pausada;
  }, err => console.error('Registro: no se pudo mirar la pausa', err));
}
// (lo arranca el mapa cuando ya entró a la partida; si todavía no, reintenta)
(function regArrancar(){
  if(typeof fbMiembro !== 'undefined' && fbMiembro && typeof fbDb !== 'undefined' && fbDb){ try{ regEscucharPausa(); }catch(err){ console.error(err); } return; }
  setTimeout(regArrancar, 2000);
})();
