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
  return {creep: false, v, dados: !!r.anillosDados, absorbe: !!r.absorbeUsada, rota, conAnillo: (r.estados || []).some(e => e && e.anillo), cargas: !!r.cargasUsadas};
}
const anillosTiene = d => d && (d.v('cascara') > 0 || d.v('cambiante') > 0 || Object.keys(ANILLO_ATRIB).some(k => d.v(k) > 0));
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
      const hay = lista.some(e => e && e.anillo) || obj.anillosDados || obj.absorbeUsada || obj.primeraSangreUsada || cargas;
      if(!hay) return false;
      for(let i = lista.length - 1; i >= 0; i--) if(lista[i] && lista[i].anillo) lista.splice(i, 1);
      obj.anillosDados = false; obj.absorbeUsada = false; obj.primeraSangreUsada = false;
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
      if(d.dados || d.absorbe || d.conAnillo || d.cargas) anillosTerminar(id, t);   // (y las cargas de las varitas, 2026-10-08)
      return;
    }
    if(!d.dados && anillosTiene(d)) anillosEmpezar(id, t, d);
    if(d.v('absorbearmadura') > 0 && !d.absorbe && antes !== undefined && d.rota > antes) anillosAbsorber(id, t, antes);
  });
  if(modo !== anillosModo){ if(modo !== 'combate') primeraSangreUsadas.clear(); anillosModo = modo; }
}, 1000);

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
  if(!a){ if(b) b.remove(); return; }
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
