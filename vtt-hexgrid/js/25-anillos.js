// js/25-anillos.js — los anillos Comunes con efecto de combate (2026-10-06, dueño). Va después del arranque: solo define funciones y un reloj.
/* Lo que pasa al empezar y al terminar un combate (el mapa pasa a modo combate / vuelve a narrativo), para lo que maneja cada pantalla (sus
   personajes; el GM, los creeps):
   · Al empezar: **Cáscara protectora** (`cascara` N: una Vida extra de N que no se recarga y dura el combate), **Cambiante** (`cambiante` N:
     se elige en un cartel Res. fuego, hielo o rayo +N) y los anillos de atributo (**Fuerza del Toro**, **Manos Ligeras**, **Clarividencia**, **Piel de
     Roble**: `impulsofue/des/esp/con`, un estado con un botón como el de la Polilla — +2 a tu última tirada de ese atributo, una vez por combate).
     Se marca `anillosDados` (en la ficha o el creep) para no repetirlo.
   · Durante: **Armadura indestructible** (`absorbearmadura`): la primera Armadura rota que le llega en el combate se absorbe (`absorbeUsada`).
   · Al terminar: se sacan esos estados (`anillo: true`) y se liberan las marcas (también la Primera sangre del duelo, js/13).
   Todo se cuenta en la Crónica. Los personajes, con `editarPersonajeMapa`; los creeps, con `modificarCreep`. */
const ANILLO_ATRIB = {impulsofue: {nombre: 'Fuerza del Toro', attr: 'fue', icono: '🐂'}, impulsodes: {nombre: 'Manos Ligeras', attr: 'des', icono: '🪶'},
  impulsoesp: {nombre: 'Clarividencia', attr: 'esp', icono: '🔮'}, impulsocon: {nombre: 'Piel de Roble', attr: 'con', icono: '🌳'}};
const anillosTrabajando = new Set();
const anillosRota = new Map();   // tokenId → stacks de Armadura rota vistos
let anillosModo = null;

// Lo que importa de un token que maneja esta pantalla (null: no corresponde).
function anillosDatos(t){
  if(!t || !t.fichaId || String(t.fichaId).includes(SEP_INVOCACION)) return null;
  if(t.tipo === 'creep'){
    if(!soyGM) return null;
    const sc = creepPrivadoDe(t.fichaId);
    if(!sc) return null;
    const v = st => Math.max(0, num(CreepCalculo.modTotal(sc, st)));
    const rota = (sc.estados || []).filter(e => e && e.activo !== false && e.armaduraRota).reduce((a, e) => a + Math.max(1, num(e.stacks) || 1), 0);
    return {creep: true, v, dados: !!sc.anillosDados, absorbe: !!sc.absorbeUsada, rota, conAnillo: (sc.estados || []).some(e => e && e.anillo), cargas: !!(sc.cargasEsp && Object.keys(sc.cargasEsp).length)};
  }
  if(typeof bnManejo !== 'function' || !bnManejo(t.fichaId)) return null;
  const r = (fichasPub.get(t.fichaId) || {}).resumen || {};
  const v = st => Math.max(0, num(r[st]));
  const rota = (r.estados || []).filter(e => e && e.armaduraRota).reduce((a, e) => a + Math.max(1, num(e.stacks) || 1), 0);
  return {creep: false, v, dados: !!r.anillosDados, campana: !!r.campanaUsada || !!r.trebolUsado, absorbe: !!r.absorbeUsada, rota, conAnillo: (r.estados || []).some(e => e && e.anillo), cargas: !!r.cargasUsadas};
}
const anillosTiene = d => d && (d.v('cascara') > 0 || d.v('cambiante') > 0 || d.v('madrugador') > 0 || Object.keys(ANILLO_ATRIB).some(k => d.v(k) > 0));
// Cambia los datos del token (personaje o creep) con `fn(lista de estados, objeto)` → bool (hubo cambio).
async function anillosCambiar(t, fn){
  if(t.tipo === 'creep') return modificarCreep(t.fichaId, sc => { sc.estados = sc.estados || []; fn(sc.estados, sc); });
  return editarPersonajeMapa(t.fichaId, S => { S.efectos = S.efectos || []; return fn(S.efectos, S) !== false; });
}
const anillosId = () => 'an' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// El cartel del Cambiante: qué resistencia elige (cerrarlo = fuego).
function anillosElegirElemento(quien, n){
  return new Promise(res => {
    let listo = false;
    const fin = v => { if(listo) return; listo = true; AvisoCombate.cerrar(); res(v); };
    AvisoCombate.mostrar({clave: 'cambiante', icono: '💍', titulo: `${quien}: Anillo cambiante`,
      pasos: [{titulo: 'Empieza el combate', texto: `Elegí qué resistencia te da el anillo durante este combate: +${n}.`}],
      botones: [{texto: '🔥 Fuego', alClic: () => fin('fuego')}, {texto: '❄ Hielo', alClic: () => fin('hielo')}, {texto: '⚡ Rayo', alClic: () => fin('rayo')}],
      alCerrar: () => fin('fuego')});
  });
}
async function anillosEmpezar(id, t, d){
  if(anillosTrabajando.has(id)) return;
  anillosTrabajando.add(id);
  const quien = t.oculto ? 'Alguien' : nombreDe(t), lineas = [];
  try{
    const n = d.v('cambiante');
    const el = n > 0 ? await anillosElegirElemento(quien, n) : '';
    await anillosCambiar(t, (lista, obj) => {
      if(obj.anillosDados) return false;
      obj.anillosDados = true;
      // 💍 El Anillo del madrugador (2026-10-19): el primer combate del día, No2 por encima del máximo (la próxima recarga los saca).
      const mad = d.creep ? 0 : d.v('madrugador'), dia = typeof diaActual !== 'undefined' ? diaActual : 0;
      if(mad > 0 && (obj.meta || {}).madrugadorDia !== dia){ obj.nitros = num(obj.nitros) + mad; obj.meta = {...(obj.meta || {}), madrugadorDia: dia}; lineas.push(`Madrugador: +${mad} No2 (primer combate del día)`); }
      const c = d.v('cascara');
      if(c > 0){ lista.push({id: anillosId(), nombre: 'Cáscara protectora', polaridad: 'buff', activo: true, permanente: true, anillo: true, sinRecarga: true,
        escudoMagico: c, escudoMagicoActual: c, detalle: `Vida extra de ${c} que no se recarga: dura hasta que termine el combate.`}); lineas.push(`Cáscara protectora: Vida extra ${c}`); }
      if(el){ const e = Combatiente.ELEMENTOS[el]; lista.push({id: anillosId(), nombre: `Cambiante (${e.etq.replace('Res. ', '')})`, polaridad: 'buff', activo: true, permanente: true, anillo: true,
        mods: [{stat: 'res' + el, val: n}], detalle: `${e.etq} +${n} durante este combate.`}); lineas.push(`Cambiante: ${e.etq} +${n}`); }
      Object.entries(ANILLO_ATRIB).forEach(([st, a]) => {
        if(d.v(st) > 0){ lista.push({id: anillosId(), nombre: a.nombre, polaridad: 'buff', activo: true, permanente: true, anillo: true, impulso: a.attr, impulsoVal: d.v(st),
          detalle: `Una vez en este combate: +${d.v(st)} a tu última tirada de ${FichaCalculo.STAT_LABEL[a.attr] || a.attr} (el botón ${a.icono}, como la Polilla).`}); lineas.push(`${a.nombre}: +${d.v(st)} una vez`); }
      });
      return true;
    });
  }catch(err){ console.error('Anillos al empezar el combate:', err); }
  anillosTrabajando.delete(id);
  if(lineas.length) momentoAbrir({tipo: 'anillos', icono: '💍', titulo: `${quien}: sus anillos despiertan`, estado: 'listo', datos: {lineas}});
}
async function anillosTerminar(id, t){
  if(anillosTrabajando.has(id)) return;
  anillosTrabajando.add(id);
  try{
    await anillosCambiar(t, (lista, obj) => {
      const cargas = !!(obj.cargasEsp && Object.keys(obj.cargasEsp).length);
      const hay = lista.some(e => e && e.anillo) || obj.anillosDados || obj.absorbeUsada || obj.primeraSangreUsada || cargas || !!(obj.meta && (obj.meta.campanaUsada || obj.meta.trebolUsado));
      if(!hay) return false;
      for(let i = lista.length - 1; i >= 0; i--) if(lista[i] && lista[i].anillo) lista.splice(i, 1);
      obj.anillosDados = false; obj.absorbeUsada = false; obj.primeraSangreUsada = false;
      if(obj.meta && obj.meta.campanaUsada) obj.meta = {...obj.meta, campanaUsada: false};   // 🔔 la Campana de bronce, de nuevo (js/53)
      if(obj.meta && obj.meta.trebolUsado) obj.meta = {...obj.meta, trebolUsado: false};   // 🍀 el Anillo del trébol, de nuevo
      if(cargas) obj.cargasEsp = {};   // las varitas de cargas se vuelven a llenar
      return true;
    });
  }catch(err){ console.error('Anillos al terminar el combate:', err); }
  anillosTrabajando.delete(id);
}
// Armadura indestructible: la Armadura rota que acaba de llegar se deshace (vuelve a los stacks de antes).
async function anillosAbsorber(id, t, previo){
  if(anillosTrabajando.has(id)) return;
  anillosTrabajando.add(id);
  let hecho = false;
  try{
    await anillosCambiar(t, (lista, obj) => {
      if(obj.absorbeUsada) return false;
      const e = lista.find(x => x && x.armaduraRota);
      if(!e) return false;
      if(previo > 0) e.stacks = previo; else lista.splice(lista.indexOf(e), 1);
      obj.absorbeUsada = true; hecho = true;
      return true;
    });
  }catch(err){ console.error('Armadura indestructible:', err); }
  anillosTrabajando.delete(id);
  if(hecho){
    const quien = t.oculto ? 'Alguien' : nombreDe(t);
    try{ mesaLinea(`💍 ${quien}: el anillo absorbió la Armadura rota`); }catch(err){}
    momentoAbrir({tipo: 'anillos', icono: '💍', titulo: `${quien}: Armadura indestructible`, estado: 'listo', resultado: 'El anillo absorbió la Armadura rota (una vez por combate).'});
  }
}
setInterval(() => {
  if(!fbMiembro) return;
  const modo = modoMapa;
  tokens.forEach((t, id) => {
    const d = anillosDatos(t);
    if(!d){ anillosRota.delete(id); return; }
    const antes = anillosRota.get(id);
    anillosRota.set(id, d.rota);
    if(modo !== 'combate'){
      if(d.dados || d.absorbe || d.conAnillo || d.cargas || d.campana) anillosTerminar(id, t);   // (y las cargas de las varitas, 2026-10-08)
      return;
    }
    if(!d.dados && anillosTiene(d)) anillosEmpezar(id, t, d);
    if(d.v('absorbearmadura') > 0 && !d.absorbe && antes !== undefined && d.rota > antes) anillosAbsorber(id, t, antes);
  });
  if(modo !== anillosModo){
    if(modo !== 'combate'){ primeraSangreUsadas.clear(); if(typeof emboscadaUsadas !== 'undefined'){ emboscadaUsadas.clear(); primerDisparoUsados.clear(); remachadoraCuenta.clear(); cargadorUsados.clear(); arcoLectura.clear(); } }   // + la Emboscada de los arcos (js/35)
    // (Lo de «al terminar el combate» —la piel de troll, el cuero de troll, la Polilla, Desarmar trampas— ya no va acá: lo dispara «Finalizar combate», finCombateMomento.)
    if(modo === 'combate') finCombateHecho = false;
    anillosModo = modo;
  }
}, 1000);

/* Equipo que se repara solo (dueño, 2026-10-08, P171: la piel de troll): un ítem con `autoRepara` N recupera N puntos de durabilidad al terminar
   cada combate (no saca la Armadura rota). Por turno sería casi indestructible; quizás más adelante, un pulso intermedio. Lo hace la pantalla que
   maneja a cada personaje, al ver que el mapa sale del modo combate. */
// La Polilla mística que no se usó (dueño, 2026-10-08): al terminar el combate se va y deja su valor en despojos (un cuarto de su precio).
/* 📜 Lo que un consumible le da a todo el grupo (dueño, 2026-10-19: Buena Fortuna, Inmunidad a CC y Blindaje, «3 turnos, pero a todo el
   party»): quien lo usa ya lo tiene; a cada aliado de este mapa (personajes e invocaciones) le llega el mismo estado por el aviso de siempre
   (`EstadosAplicar.encolarPj`: lo aplica la pantalla que lo maneja). */
async function bnEfectoAlGrupo(fichaId, estado, it){
  const spec = {nombre: String(it.efectoPreset || estado.nombre || '').trim(), turnos: num(it.efectoTurnos) || num(estado.turnos) || 3, polaridad: 'buff',
    ...((it.efectoMods || []).length ? {mods: it.efectoMods} : {}), ...(num(it.efectoHpTurno) ? {hp: num(it.efectoHpTurno)} : {}),
    ...(it.efectoDetalle ? {detalle: it.efectoDetalle} : {})};
  if(!spec.nombre) return;
  const vistos = new Set([String(fichaId)]), nombres = [];
  for(const [, t] of tokens){
    if(!t || t.tipo !== 'pj' || !t.fichaId || vistos.has(String(t.fichaId)) || !t.duenoUid) continue;
    vistos.add(String(t.fichaId));
    try{ await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec, origen: it.nombre}); nombres.push(nombreDe(t)); }
    catch(err){ console.error('No se pudo pasar el estado a un aliado:', err); }
  }
  toast(nombres.length ? `📜 ${it.nombre}: también a ${nombres.join(', ')}` : `📜 ${it.nombre}: no hay aliados en el mapa`);
  if(nombres.length && typeof mesaLinea === 'function') mesaLinea(`📜 ${it.nombre}: ${spec.nombre} ${spec.turnos} turnos también a ${nombres.join(', ')}`);
}
// 📜 «Hasta el fin del combate» (dueño, 2026-10-19): los pergaminos de todo el combate se van al «Finalizar combate» (también los viejos, por el nombre).
const finDelCombate = e => !!e && (e.finCombate || (e.permanente && /\(pergamino\)\s*$/i.test(String(e.nombre || ''))));
async function pergaminosAlTerminar(){
  for(const [, t] of tokens){
    if(!t || t.tipo !== 'pj' || !t.fichaId || String(t.fichaId).includes(SEP_INVOCACION)) continue;
    if(typeof bnManejo !== 'function' || !bnManejo(t.fichaId)) continue;
    let fuera = [];
    try{
      await editarPersonajeMapa(t.fichaId, S => {
        const q = (S.efectos || []).filter(finDelCombate);
        if(!q.length) return false;
        fuera = q.map(e => e.nombre);
        S.efectos = S.efectos.filter(e => !q.includes(e));
        return true;
      });
    }catch(err){ console.error('No se pudieron sacar los pergaminos:', err); }
    if(fuera.length) momentoAbrir({tipo: 'pergaminos', icono: '📜', titulo: `${nombreDe(t)}: terminó lo de sus pergaminos`, estado: 'listo', resultado: fuera.join(', ')});
  }
}
async function polillaAlTerminar(){
  for(const [, t] of tokens){
    if(!t || t.tipo !== 'pj' || !t.fichaId || String(t.fichaId).includes(SEP_INVOCACION)) continue;
    if(typeof bnManejo !== 'function' || !bnManejo(t.fichaId)) continue;
    let n = 0;
    try{
      await editarPersonajeMapa(t.fichaId, S => {
        const i = (S.efectos || []).findIndex(e => e && e.activo !== false && /^Polilla revoloteando/i.test(String(e.nombre || '')));
        if(i < 0) return false;
        S.efectos.splice(i, 1);
        const item = typeof CATALOGO_BASE !== 'undefined' ? CATALOGO_BASE.find(x => x.efectoNombre === 'Polilla revoloteando') : null;
        n = Math.ceil(num(item ? item.precioCompra : 50) / 4);
        S.loot = S.loot || {}; S.loot.normal = num(S.loot.normal) + n;
        return true;
      });
    }catch(err){ console.error('No se pudo convertir la Polilla en despojos:', err); }
    if(n) momentoAbrir({tipo: 'polilla', icono: '🦋', titulo: `${nombreDe(t)}: la Polilla que no usó se va`, estado: 'listo', resultado: `Terminó el combate: +${fmt(n)} despojos.`});
  }
}
async function autoRepararAlTerminar(){
  for(const [, t] of tokens){
    if(!t || t.tipo !== 'pj' || !t.fichaId || String(t.fichaId).includes(SEP_INVOCACION)) continue;
    if(typeof bnManejo !== 'function' || !bnManejo(t.fichaId)) continue;
    const lineas = [];
    try{
      await editarPersonajeMapa(t.fichaId, S => {
        lineas.length = 0;
        (S.inventario || []).forEach(it => {
          const n = Math.round(num(it && it.autoRepara));
          if(!it || !it.equipado || n <= 0 || !FichaCalculo.durableItem(it)) return;
          const max = FichaCalculo.durMax(it), antes = FichaCalculo.durActual(it);
          if(antes >= max) return;
          it.dur = Math.min(max, antes + n);
          lineas.push(`${it.nombre}: se reparó sola, durabilidad ${antes} → ${it.dur}`);
        });
        return lineas.length > 0;
      });
    }catch(err){ console.error('No se pudo reparar el equipo al terminar el combate:', err); }
    if(lineas.length) momentoAbrir({tipo: 'reparacion', icono: '🧵', titulo: `${t.oculto ? 'Alguien' : nombreDe(t)}: su equipo se repara solo`, estado: 'listo', datos: {lineas}});
  }
}
/* El botón de los anillos de atributo (como la Polilla mística, js/02): con un estado `impulso` activo en tu personaje, un botón abajo a la izquierda
   suma su +N a tu última tirada; si esa tirada no es de ese atributo (ni de algo que sale de él), pregunta antes (lo decide la mesa). Se gasta. */
function impulsoActivo(){
  const t = miTokenPrincipal();
  if(!t) return null;
  const est = (((fichasPub.get(t.fichaId) || {}).resumen || {}).estados || []);
  const i = est.findIndex(e => e && e.activo !== false && e.impulso);
  return i < 0 ? null : {t, i, e: est[i]};
}
function impulsoEsDelAtributo(origen, attr){
  const o = String(origen || '').toLowerCase();
  const grupo = (FichaCalculo.GRUPOS || []).find(g => g.id === attr);
  const nombres = grupo ? [grupo.label, grupo.full, ...(grupo.derived || []).flatMap(s => [s.label, s.full])].filter(Boolean) : [];
  return nombres.some(nm => o.includes(String(nm).toLowerCase()));
}
function renderImpulsoBoton(){
  const a = impulsoActivo();
  let b = document.getElementById('impulso-flotante');
  if(!a){ if(b){ b.remove(); if(typeof Flotantes !== 'undefined') Flotantes.apilar(); } return; }
  const info = Object.values(ANILLO_ATRIB).find(x => x.attr === a.e.impulso) || {icono: '💍', nombre: a.e.nombre};
  if(!b){
    b = document.createElement('button');
    b.type = 'button'; b.id = 'impulso-flotante';
    b.style.cssText = 'position:fixed;left:16px;bottom:74px;z-index:999998;background:#2f2a14;color:#ffe9a8;border:2px solid #e0b84a;border-radius:16px;padding:10px 16px;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 8px 26px rgba(0,0,0,.6)';
    b.onclick = usarImpulso;
    document.body.appendChild(b);
  }
  const n = Math.max(1, num(a.e.impulsoVal) || 2);
  b.innerHTML = `<div>${info.icono} ${esc(info.nombre)}</div><small style="display:block;font-weight:500;font-size:11px;opacity:.9">${mesaMiUltima ? `+${n} a tu última tirada: ${esc(mesaMiUltima.origen)} (${fmt(num(mesaMiUltima.total))})` : 'todavía no hiciste ninguna tirada'}</small>`;
  if(typeof Flotantes !== 'undefined') Flotantes.apilar();   // la Polilla, este y la moneda, uno arriba del otro (comun/flotantes.js)
}
async function usarImpulso(){
  const a = impulsoActivo();
  if(!a) return;
  if(!mesaMiUltima){ toast('Todavía no hiciste ninguna tirada para sumarle el bono'); return; }
  const n = Math.max(1, num(a.e.impulsoVal) || 2), origen = mesaMiUltima.origen, nuevo = num(mesaMiUltima.total) + n;
  if(!impulsoEsDelAtributo(origen, a.e.impulso) && !(await AvisoCombate.preguntar(`«${origen}» no parece una tirada de ${FichaCalculo.STAT_LABEL[a.e.impulso] || a.e.impulso}. ¿Sumarle el +${n} igual? (Lo decide la mesa.)`, {icono: '💍', titulo: 'Impulso', si: 'Sí, sumarlo'}))) return;
  try{ await hudEstadoCambiar(a.t, a.i, 'quitar'); }catch(err){ console.error('No se pudo gastar el anillo:', err); return; }
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: nombreDe(a.t),
      origen: `💍 ${nombreDe(a.t)} usó ${a.e.nombre}`, formula: `+${n} a su última tirada — ${origen}: ahora ${fmt(nuevo)}`,
      rolls: [], mod: 0, total: 0, desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){ console.error('No se pudo avisar el uso del anillo:', err); }
  toast(`💍 ${a.e.nombre}: +${n} a "${origen}" (ahora ${fmt(nuevo)})`);
  mesaMiUltima = null;
  renderImpulsoBoton();
}
setInterval(renderImpulsoBoton, 1500);
/* 🍀 El Anillo del trébol (2026-10-18, dueño): una vez por combate, el botón pone el estado «🍀 Trébol» (Afortunado en cualquier tirada,
   `afortunadoTodo`) y la próxima tirada lo gasta (comun/ficha-acciones.js, tirarValorStat). La marca `S.meta.trebolUsado` se libera al volver a
   narrativo (anillosTerminar). Personajes. */
// El personaje que maneja esta pantalla (el suyo, o el que el GM controla con 🎮) con el trébol listo.
function trebolActivo(){
  if(modoMapa !== 'combate') return null;
  const listo = t => {
    if(!t || t.tipo !== 'pj' || !t.fichaId || String(t.fichaId).includes(SEP_INVOCACION)) return null;
    if(typeof bnManejo === 'function' ? !bnManejo(t.fichaId) : t.duenoUid !== (fbUsuario && fbUsuario.uid)) return null;
    const r = (fichasPub.get(t.fichaId) || {}).resumen || {};
    if(!(num(r.trebol) > 0) || r.trebolUsado || (r.estados || []).some(e => e && /trébol/i.test(String(e.nombre || '')))) return null;
    return {t, r};
  };
  const mio = listo(miTokenPrincipal());
  if(mio) return mio;
  for(const t of tokens.values()){ const a = listo(t); if(a) return a; }
  return null;
}
function renderTrebolBoton(){
  const a = trebolActivo();
  let b = document.getElementById('trebol-flotante');
  if(!a){ if(b){ b.remove(); if(typeof Flotantes !== 'undefined') Flotantes.apilar(); } return; }
  if(!b){
    b = document.createElement('button');
    b.type = 'button'; b.id = 'trebol-flotante';
    b.style.cssText = 'position:fixed;left:16px;bottom:74px;z-index:999998;background:#173018;color:#c9f5c0;border:2px solid #4fbf5a;border-radius:16px;padding:10px 16px;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 8px 26px rgba(0,0,0,.6)';
    b.onclick = usarTrebol;
    document.body.appendChild(b);
    b.innerHTML = '<div>🍀 Trébol</div><small style="display:block;font-weight:500;font-size:11px;opacity:.9">tu próxima tirada, como Afortunado</small>';
  }
  if(typeof Flotantes !== 'undefined') Flotantes.apilar();
}
async function usarTrebol(){
  const a = trebolActivo();
  if(!a) return;
  try{
    await editarPersonajeMapa(a.t.fichaId, S => {
      if(S.meta && S.meta.trebolUsado) return false;
      S.meta = {...(S.meta || {}), trebolUsado: true};
      S.efectos = S.efectos || [];
      S.efectos.push({id: anillosId(), nombre: '🍀 Trébol', polaridad: 'buff', activo: true, permanente: true, anillo: true, trebol: true, afortunado: true, afortunadoTodo: true,
        detalle: 'Tu próxima tirada sale como Afortunado: se tira dos veces y vale la mejor. Se va al usarla (Anillo del trébol, una vez por combate).'});
      return ['efectos', 'general'];
    });
  }catch(err){ console.error('El Anillo del trébol:', err); toast('No se pudo usar el trébol'); return; }
  try{ mesaLinea(`🍀 ${nombreDe(a.t)} toca su Anillo del trébol: su próxima tirada sale como Afortunado`, 'recordatorio'); }catch(err){}
  toast('🍀 Tu próxima tirada sale como Afortunado');
  renderTrebolBoton();
}
setInterval(renderTrebolBoton, 1500);
/* 💍 El Anillo de cuero de troll (2026-10-19, dueño; reemplaza a la Armadura indestructible, P196): al terminar el combate, una pieza del equipo que
   el jugador elige recupera 1 punto de durabilidad (`cueroTroll` = cuántos). Lo pregunta la pantalla que maneja a cada personaje, al ver que el mapa
   sale del modo combate. Cerrar el cartel sin elegir no repara nada. */
async function cueroTrollAlTerminar(){
  for(const [, t] of tokens){
    if(!t || t.tipo !== 'pj' || !t.fichaId || String(t.fichaId).includes(SEP_INVOCACION)) continue;
    if(typeof bnManejo !== 'function' || !bnManejo(t.fichaId)) continue;
    let piezas = null, n = 0;
    try{
      await editarPersonajeMapa(t.fichaId, S => {
        n = (S.inventario || []).filter(i => i && i.equipado && !FichaCalculo.itemRoto(i)).reduce((a, i) => Math.max(a, Math.round(num(i.cueroTroll))), 0);
        if(n > 0) piezas = (S.inventario || []).filter(it => it && it.equipado && FichaCalculo.durableItem(it) && FichaCalculo.durActual(it) < FichaCalculo.durMax(it))
          .map(it => ({id: it.id, nombre: it.nombre, dur: FichaCalculo.durActual(it), max: FichaCalculo.durMax(it)}));
        return false;   // solo mirar
      });
    }catch(err){ console.error('El Anillo de cuero de troll:', err); continue; }
    if(!(n > 0) || !piezas || !piezas.length) continue;
    const elegido = await new Promise(res => {
      let listo = false;
      const fin = v => { if(listo) return; listo = true; AvisoCombate.cerrar(); res(v); };
      AvisoCombate.mostrar({clave: 'cuero-troll-' + t.fichaId, icono: '💍', titulo: `${nombreDe(t)}: Anillo de cuero de troll`,
        pasos: [{titulo: 'Terminó el combate', texto: `Elegí qué pieza de tu equipo recupera ${n} punto${n === 1 ? '' : 's'} de durabilidad.`}],
        botones: piezas.map(p => ({texto: `${p.nombre} (${p.dur}/${p.max})`, alClic: () => fin(p.id)})), alCerrar: () => fin(null)});
    });
    if(!elegido) continue;
    let linea = '';
    try{
      await editarPersonajeMapa(t.fichaId, S => {
        const it = (S.inventario || []).find(i => i && i.id === elegido);
        if(!it) return false;
        const antes = FichaCalculo.durActual(it), max = FichaCalculo.durMax(it);
        if(antes >= max) return false;
        it.dur = Math.min(max, antes + n);
        linea = `${it.nombre}: durabilidad ${antes} → ${it.dur}`;
        return true;
      });
    }catch(err){ console.error('El Anillo de cuero de troll:', err); }
    if(!linea) continue;
    try{ mesaLinea(`💍 ${nombreDe(t)}: el Anillo de cuero de troll repara ${linea}`, 'recordatorio'); }catch(err){}
    momentoAbrir({tipo: 'reparacion', icono: '💍', titulo: `${t.oculto ? 'Alguien' : nombreDe(t)}: Anillo de cuero de troll`, estado: 'listo', datos: {lineas: [linea]}});
  }
}
/* 🏁 Lo de «al terminar el combate» (dueño, 2026-10-19: «que se activen cuando el GM apriete Finalizar combate; a los jugadores primero les
   aparecen los anuncios y, una vez resueltos todos, el botín»). El GM, al abrir «Finalizar combate» (js/18), deja un momento `fin-combate`; cada
   pantalla (js/16) resuelve en orden lo de los personajes que maneja: el equipo que se repara solo, el Anillo de cuero de troll (elegir pieza),
   la Polilla que no se usó y Desarmar trampas. El botín de un jugador (js/12) espera a que termine (`esperarFinDeCombate`). Una vez por combate. */
let finCombateEnCurso = null, finCombateHecho = false;
const finCombateVistos = new Set();
function finCombateMomento(id){
  if(finCombateVistos.has(id) || finCombateHecho) return;
  finCombateVistos.add(id);
  finCombateHecho = true;
  finCombateEnCurso = (async () => {
    try{ await autoRepararAlTerminar(); }catch(err){ console.error('Fin del combate (reparación):', err); }
    try{ await cueroTrollAlTerminar(); }catch(err){ console.error('Fin del combate (cuero de troll):', err); }
    try{ await polillaAlTerminar(); }catch(err){ console.error('Fin del combate (Polilla):', err); }
    try{ await pergaminosAlTerminar(); }catch(err){ console.error('Fin del combate (pergaminos):', err); }
    try{ if(typeof desarmarAlTerminar === 'function') await desarmarAlTerminar(true); }catch(err){ console.error('Fin del combate (trampas):', err); }
  })().finally(() => { finCombateEnCurso = null; });
}
async function esperarFinDeCombate(){
  for(let i = 0; i < 2400 && finCombateEnCurso; i++) await finCombateEnCurso.catch(() => {});
}
/* 🩹 El Anillo del curandero (2026-10-19, dueño): dos veces por día, te sacás un estado malo a elección. El botón aparece con los de la Polilla y
   la moneda (comun/flotantes.js) cuando el personaje que maneja esta pantalla lo tiene, le quedan usos hoy y tiene algún estado malo. Los usos
   del día viven en S.meta.curanderoDia / curanderoUsos (el día de js/41). */
function curanderoActivo(){
  const dia = typeof diaActual !== 'undefined' ? diaActual : 0;
  for(const t of tokens.values()){
    if(!t || t.tipo !== 'pj' || !t.fichaId || String(t.fichaId).includes(SEP_INVOCACION)) continue;
    if(typeof bnManejo === 'function' ? !bnManejo(t.fichaId) : t.duenoUid !== (fbUsuario && fbUsuario.uid)) continue;
    const r = (fichasPub.get(t.fichaId) || {}).resumen || {};
    const tope = Math.round(num(r.curandero));
    if(!(tope > 0)) continue;
    const quedan = tope - (num(r.curanderoDia) === dia ? Math.round(num(r.curanderoUsos)) : 0);
    const malos = (r.estados || []).filter(e => e && e.polaridad === 'debuff' && !e.derivado && !e.anillo);
    if(quedan > 0 && malos.length) return {t, quedan, malos, dia};
  }
  return null;
}
function renderCuranderoBoton(){
  const a = curanderoActivo();
  let b = document.getElementById('curandero-flotante');
  if(!a){ if(b){ b.remove(); if(typeof Flotantes !== 'undefined') Flotantes.apilar(); } return; }
  if(!b){
    b = document.createElement('button');
    b.type = 'button'; b.id = 'curandero-flotante';
    b.style.cssText = 'position:fixed;left:16px;bottom:74px;z-index:999998;background:#132a26;color:#bff0e2;border:2px solid #4fbf9a;border-radius:16px;padding:10px 16px;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 8px 26px rgba(0,0,0,.6)';
    b.onclick = usarCurandero;
    document.body.appendChild(b);
  }
  b.innerHTML = `<div>🩹 Curandero</div><small style="display:block;font-weight:500;font-size:11px;opacity:.9">te quedan ${a.quedan} hoy</small>`;
  if(typeof Flotantes !== 'undefined') Flotantes.apilar();
}
async function usarCurandero(){
  const a = curanderoActivo();
  if(!a) return;
  const v = await Confirmar.elegir(`${nombreDe(a.t)}: ¿qué estado te sacás? (te quedan ${a.quedan} hoy)`, {titulo: 'Anillo del curandero', icono: '🩹', no: 'Cancelar',
    opciones: a.malos.map(e => ({valor: e.nombre, texto: e.nombre, detalle: e.permanente ? 'sin límite' : num(e.turnos) > 0 ? `${fmt(num(e.turnos))} turno${num(e.turnos) === 1 ? '' : 's'}` : ''}))});
  if(!v) return;
  let sacado = '';
  try{
    await editarPersonajeMapa(a.t.fichaId, S => {
      const i = (S.efectos || []).findIndex(e => e && e.nombre === v && e.polaridad === 'debuff' && !e.derivado && !e.origenItem);
      if(i < 0) return false;
      sacado = S.efectos[i].nombre;
      S.efectos.splice(i, 1);
      const m = S.meta || (S.meta = {});
      m.curanderoUsos = num(m.curanderoDia) === a.dia ? Math.round(num(m.curanderoUsos)) + 1 : 1;
      m.curanderoDia = a.dia;
      return ['efectos', 'general'];
    });
  }catch(err){ console.error('El Anillo del curandero:', err); toast('No se pudo usar el curandero'); return; }
  if(!sacado){ toast('Ese estado ya no está'); return; }
  try{ mesaLinea(`🩹 ${nombreDe(a.t)} usa su Anillo del curandero: se saca ${sacado}`, 'recordatorio'); }catch(err){}
  toast(`🩹 Te sacaste ${sacado}`);
  renderCuranderoBoton();
}
setInterval(renderCuranderoBoton, 1500);

