// js/02-recompensas-estados-y-atributos.js — tramo 2 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- Recompensas del combate (XP y DDE) ----------
   El GM las publica en campanas/<id>/recompensas (una por personaje); la ficha las aplica UNA sola vez (transacción
   sobre el documento) apenas está abierta y editable, y avisa con un pop-up si sube de nivel. */
let recompensasPendientes = [], recompensasAplicando = false;
function recompensasEscuchar(){
  if(!fbUsuario) return;
  // El GM escucha todas las pendientes: si toma el control de un personaje, le toca aplicarle las suyas (🎮, 2026-09-30).
  const col = fbDb.collection(fbRutaCampana('recompensas'));
  (fbMiembro && fbMiembro.gm ? col.where('aplicada', '==', false) : col.where('duenoUid', '==', fbUsuario.uid).where('aplicada', '==', false)).onSnapshot(snap => {
    recompensasPendientes = snap.docs;
    recompensasRevisar();
  }, err => console.error('Error escuchando las recompensas:', err));
}
// Trampas consumibles que no se dispararon: vuelven a la MOCHILA (se apilan con las iguales, que no ocupan ranura nueva) y, si la mochila no tiene lugar, al CINTURÓN.
// Si tampoco hay lugar allá, se dejan en la mochila igual (que quede de más) antes que perderlas.
function devolverTrampasAlJugador(items){
  let aMochila = 0, aCinturon = 0;
  items.forEach(js => {
    let it = null;
    try{ it = JSON.parse(js); }catch(e){}
    if(!it) return;
    const pila = S.inventario.find(x => !x.equipado && x.consumible && x.nombre === it.nombre);
    if(pila){ pila.unidades = num(pila.unidades) + 1; aMochila++; return; }
    const cap = capMochilaEfectivo();
    if(!(cap > 0) || mochilaUsada() + ranurasDe(it) <= cap){ agregarConsumibleAInventario(it, 1); aMochila++; return; }
    const pilaC = S.cinturon.find(x => x.consumible && x.nombre === it.nombre);
    if(pilaC){ pilaC.unidades = num(pilaC.unidades) + 1; aCinturon++; return; }
    if(S.cinturon.length < capCinturonEfectivo()){
      const c = structuredClone(it); c.id = uid(); c.unidades = 1; c.ranuras = 1; c.equipado = false;
      S.cinturon.push(c); aCinturon++; return;
    }
    agregarConsumibleAInventario(it, 1); aMochila++;   // sin lugar en ningún lado: mejor de más que perdida
  });
  renderInventario(); renderList('cinturon');
  return {total: aMochila + aCinturon, aMochila, aCinturon};
}
async function recompensasRevisar(){
  const f = fichaVivo;
  if(!f || !f.cargada || f.soloLectura || f.editaGM || recompensasAplicando) return;
  const mias = recompensasPendientes.filter(d => d.data().fichaId === f.id);
  if(!mias.length) return;
  recompensasAplicando = true;
  try{
    for(const d of mias){
      const tomada = await fbDb.runTransaction(async tx => {
        const x = await tx.get(d.ref);
        if(!x.exists || x.data().aplicada) return false;
        // El GM con el control no puede marcarla como aplicada (las reglas se lo dejan al dueño), pero sí borrarla: mismo efecto.
        if(fichaControloYo(f)) tx.delete(d.ref); else tx.update(d.ref, {aplicada: true});
        return true;
      });
      if(!tomada || fichaVivo !== f) continue;
      const r = d.data();
      const nivelAntes = num(S.meta.nivel);
      if(num(r.xp) > 0) applyExp(num(S.meta.exp) + num(r.xp));
      if(num(r.dde) > 0){ S.meta.dde = Math.round((num(S.meta.dde) + num(r.dde)) * 100) / 100; $('#f-dde').value = fmt(S.meta.dde); }
      if(num(r.despojos) > 0){ S.loot.normal = num(S.loot.normal) + num(r.despojos); $('#f-loot-normal').value = S.loot.normal; }
      let vueltas = null;
      if(Array.isArray(r.devolver) && r.devolver.length) vueltas = devolverTrampasAlJugador(r.devolver);
      refresh();
      const partes = [];
      if(num(r.xp) > 0) partes.push(`+${fmt(num(r.xp))} XP`);
      if(num(r.dde) > 0) partes.push(`+${fmt(num(r.dde))} DDE`);
      if(num(r.despojos) > 0) partes.push(`+${fmt(num(r.despojos))} despojos`);
      if(partes.length) toast(`🎁 ${partes.join(' · ')}`);
      if(vueltas && vueltas.total) toast(`🪤 ${vueltas.total} trampa${vueltas.total === 1 ? '' : 's'} sin disparar ${vueltas.total === 1 ? 'se desarmó' : 'se desarmaron'} y volvió${vueltas.total === 1 ? '' : 'eron'} ${vueltas.aCinturon ? (vueltas.aMochila ? 'a tu mochila y al cinturón' : 'a tu cinturón') : 'a tu mochila'}`);
    }
  }catch(err){
    console.error('No se pudieron aplicar las recompensas:', err);
  }finally{
    recompensasAplicando = false;
  }
}

/* ---------- Estados que te dejan otros (una habilidad de un creep, una trampa) ----------
   El GM o el mapa dejan un aviso en campanas/<id>/estados; la ficha lo aplica UNA sola vez (transacción sobre el documento) apenas
   está abierta y editable, respetando Invulnerable, Inmunidad a CC, Sangre pura y Coagulación extrema (comun/estados-aplicar.js). */
let estadosPendientes = [], estadosAplicando = false;
function estadosEscuchar(){
  if(!fbUsuario) return;
  // El GM escucha todos los pendientes: si toma el control de un personaje, le toca aplicarle los suyos (🎮, 2026-09-30).
  const col = fbDb.collection(fbRutaCampana('estados'));
  (fbMiembro && fbMiembro.gm ? col.where('aplicada', '==', false) : col.where('duenoUid', '==', fbUsuario.uid).where('aplicada', '==', false)).onSnapshot(snap => {
    estadosPendientes = snap.docs;
    estadosRevisar();
  }, err => console.error('Error escuchando los estados recibidos:', err));
}
async function estadosRevisar(){
  const f = fichaVivo;
  if(!f || !f.cargada || f.soloLectura || f.editaGM || estadosAplicando) return;
  const mios = estadosPendientes.filter(d => d.data().fichaId === f.id);
  if(!mios.length) return;
  estadosAplicando = true;
  try{
    for(const d of mios){
      const tomada = await fbDb.runTransaction(async tx => {
        const x = await tx.get(d.ref);
        if(!x.exists || x.data().aplicada) return false;
        if(fichaControloYo(f)) tx.delete(d.ref); else tx.update(d.ref, {aplicada: true});   // 🎮 el GM lo borra en vez de marcarlo
        return true;
      });
      if(!tomada || fichaVivo !== f) continue;
      let spec = null;
      try{ spec = JSON.parse(d.data().spec || 'null'); }catch(e){}
      if(spec && spec.nombre) aplicarEstadoRecibido(spec, d.data().origen);
    }
  }catch(err){
    console.error('No se pudieron aplicar los estados recibidos:', err);
  }finally{
    estadosAplicando = false;
  }
}
// Un preset se encuentra por su nombre o por un nombre viejo (alias): "Escudo especial" pasó a llamarse "Escudo especial" (2026-09-24).
// comun/ficha-habilidades.js (paso 5, nivel B, área 3).
const presetPorNombre = FichaHabilidades.presetPorNombre;
// Un estado armado a partir de lo que manda una habilidad o una trampa ({nombre, turnos, mods, hp, stacks, escudoMagico…}):
// el preset con ese nombre con los números de la habilidad encima (comun/combatiente.js, ajustarPreset), o uno propio.
// Lo usan lo que le llega al personaje y lo que una invocación se pone a sí misma.
function estadoDeSpec(spec){ return FichaAcciones.estadoDeSpec(spec, EFECTOS_PRESET); }   // comun/ficha-acciones.js
function aplicarEstadoRecibido(spec, origen){ FichaAcciones.aplicarEstadoRecibido(S, spec, origen, habUi); }

// (Acumular Veneno/Sangrado/Escarcha, inmunidades y renovar: Combatiente.agregarEstado, comun/combatiente.js — ver agregarEstadoConAviso.)

// Los atributos y stats (📊): comun/ficha-stats.js (A6a, 2026-10-02; el mapa usa lo mismo). Acá, dónde se dibujan.
function attrBudget(){ return FichaStats.presupuesto(S); }
function renderAttrs(){
  $('#attr-points').innerHTML = FichaStats.puntosHtml(S);
  const htmlAttrs = FichaStats.atributosHtml(S, openStat);
  $('#attrs').innerHTML = htmlAttrs;
  if($('#stats-mapa-attrs')){   // la copia del menú de Stats de la ficha liviana del mapa
    $('#stats-mapa-attrs').innerHTML = htmlAttrs;
    $('#stats-mapa-puntos').innerHTML = $('#attr-points').innerHTML;
  }
}
function statTile(d, c, showMod=true){ return FichaStats.statTile(d, c, showMod); }
function breakdown(id, c){ return FichaStats.desglose(S, id, c); }

const TIPOS_IDS = FichaBotonera.TIPOS_IDS;   // comun/ficha-botonera.js

function renderArmadura(){
  const c = compute();
  const m = c.modTotal.def;
  const tile = $('#def-tile');
  tile.classList.toggle('boosted', m > 0);
  tile.classList.toggle('nerfed', m < 0);
  $('#v-def').textContent = Number.isNaN(c.final.def) ? '?' : fmt(c.final.def);
  $('#def-breakdown').innerHTML = openStat === 'def' ? breakdown('def', c) : '';
  const tv = $('#vision-tile');
  tv.classList.toggle('boosted', c.modTotal.vision > 0);
  tv.classList.toggle('nerfed', c.modTotal.vision < 0);
  $('#v-vision').textContent = Number.isNaN(c.final.vision) ? '?' : fmt(c.final.vision);
  $('#vision-breakdown').innerHTML = openStat === 'vision' ? breakdown('vision', c) : '';

  $('#tipos').innerHTML = TIPOS_IDS.map(id => {
    const d = EXTRA.find(e => e.id === id);
    return statTile(d, c, false);
  }).join('');
  $('#tipos-breakdown').innerHTML = TIPOS_IDS.includes(openStat) ? breakdown(openStat, c) : '';

  renderEfectosArmas();
  renderEfectosOtros();
}

function asignarManos(){ return FichaCombate.asignarManos(S); }   // comun/ficha-combate.js

function renderEfectosArmas(){
  const enManos = S.inventario.filter(i => i.equipado && ES_MANO(i.tipoItem));
  if(!enManos.length){
    $('#efectos-armas').innerHTML = `<div class="empty">No tenés nada equipado en las manos.</div>`;
    actualizarTextosCombate();
    return;
  }
  const dosManos = enManos.find(a => a.tipoItem === 'arma_2m' || a.tipoItem === 'escudo_2m');
  const manos = asignarManos();
  const m1 = enManos.find(a => manos.get(a.id) === 1) || null;
  const m2 = enManos.find(a => manos.get(a.id) === 2) || null;
  const esDosManos = !!(dosManos && m1 && m1.id === dosManos.id);

  const manoHtml = (item, label) => {
    if(!item) return `<div class="mano-box"><div class="mano-label">${label}</div><div class="mano-vacio">—</div></div>`;
    const esElDosManos = esDosManos && item.id === dosManos.id;
    const dano = armaDanoTxt(item);
    const esArma = ES_ARMA(item.tipoItem);
    return `<div class="mano-box">
      <div class="mano-label">${label}${esElDosManos ? ' (dos manos)' : ''}</div>
      <div class="mano-nombre">${esc(item.nombre)}</div>
      ${esArma ? `<div class="mano-tipo">Tipo ${num(item.tipoDado)||8}</div>` : ''}
      ${dano ? `<div class="mano-dano">${dano}</div>` : ''}
      ${item.detalle ? `<div class="mano-fx">${esc(item.detalle)}</div>` : ''}
    </div>`;
  };

  $('#efectos-armas').innerHTML = esDosManos
    ? `<div class="manos-grid manos-grid-single">${manoHtml(m1, 'Mano 1')}</div>`
    : `<div class="manos-grid">${manoHtml(m1, 'Mano 1')}${manoHtml(m2, 'Mano 2')}</div>`;

  actualizarTextosCombate();
}

// Fórmulas de las 4 tiradas de Combate — se usa tanto para los botones
// de la caja Combate como para las tiles de la Botonera, así siempre
// muestran lo mismo.
function formulasCombate(){ return FichaCombate.formulasCombate(S); }   // comun/ficha-combate.js

// Los botones de Combate muestran qué van a tirar, para no tener que
// adivinar antes de apretar.
function actualizarTextosCombate(){
  const f = formulasCombate();
  $('#btn-atacar-pdg').textContent = `🎲 Atacar (PdG)${f.pdg ? ` · ${f.pdg}` : ''}`;
  $('#btn-esquivar').textContent = `🎲 Esquivar (Eva)${f.eva ? ` · ${f.eva}` : ''}`;
  $('#btn-parry').textContent = `🎲 Parry${f.parry ? ` · ${f.parry}` : ''}`;
  $('#btn-bloqueo').textContent = `🎲 Bloqueo${f.bloqueo ? ` · ${f.bloqueo}` : ''}`;
  $('#btn-danio-arma').textContent = `🎲 Daño Arma · ${f.danio}`;
}

function armasEquipadasConDano(){ return FichaCombate.armasEquipadasConDano(S); }   // comun/ficha-combate.js

function tirarDanoDeArma(it){ FichaAcciones.tirarDanoDeArma(S, it, combateUi); }   // comun/ficha-acciones.js

function pedirArmaYTirar(){ FichaAcciones.pedirArmaYTirar(S, combateUi); }

function renderEfectosOtros(){
  const equipados = S.inventario.filter(i => i.equipado);
  const lineas = [];
  equipados.forEach(i => {
    const otrosMods = (i.mods||[]).filter(m => m.stat && m.stat !== 'def' && !TIPOS_IDS.includes(m.stat));
    if(otrosMods.length){
      const partes = otrosMods.map(m => `${STAT_LABEL[m.stat]||m.stat} ${num(m.val)>0?'+':''}${fmt(num(m.val))}`).join(', ');
      lineas.push(`<div class="efecto-otro"><b>${esc(i.nombre)}</b> — ${esc(partes)}</div>`);
    }
    if(!ES_MANO(i.tipoItem) && i.detalle && i.detalle.trim()){
      lineas.push(`<div class="efecto-otro"><b>${esc(i.nombre)}</b> — ${esc(i.detalle)}</div>`);
    }
  });
  $('#efectos-otros').innerHTML = lineas.length ? lineas.join('') : `<div class="empty">Sin efectos adicionales equipados.</div>`;
}

function computeSlots(){ return FichaEquipo.slots(S); }   // comun/ficha-equipo.js

// Consume 1 unidad del Ankh (esté donde esté) y revive con 25% del HP
// máximo (mínimo 1, para no reventar todos los Ankh de un saque si el HP
// máximo es muy bajo). No toca S.muerto — eso lo resuelve revisarMuerte()
// en el siguiente renderVitals().
// La vida (Ankh, HP, estado de muerte): lo que cambia en el personaje está en comun/ficha-acciones.js; acá, lo que se ve.
function aplicarRevivirConAnkh(key, id){
  const nombre = FichaAcciones.aplicarRevivirConAnkh(S, key, id);
  if(nombre === null) return null;
  $('#f-hp').value = S.hp;
  return nombre;
}

/* Toda baja de HP pasa por acá. Antes cada camino asignaba S.hp por su
   cuenta y algunos dejaban valores negativos: la cabecera mostraba 0 pero
   por dentro había un pozo (-40, por ejemplo), así que curar +5 dejaba -35
   y el jugador seguía muerto sin entender por qué. El HP nunca baja de 0. */
function fijarHp(valor){
  FichaAcciones.fijarHp(S, valor);
  const campo = $('#f-hp');
  if(campo) campo.value = fmt(S.hp);
  renderVitals();   // acá adentro se revisa el Ankh y el estado de muerte
  return S.hp;
}

// Si el HP llega a 0 y hay un Ankh de Reencarnación en el cinturón, se
// activa solo (auto-consumo). Si está en la mochila en vez de equipado,
// NO se activa solo — hay un botón de Consumir aparte para activarlo a
// mano (pensado para el caso de un aliado a distancia cero).
function revisarAnkh(){
  const nombre = FichaAcciones.revisarAnkh(S);
  if(!nombre) return;
  $('#f-hp').value = S.hp;
  renderList('cinturon');
  toast(`¡${nombre} se activó solo! Revivís con ${fmt(S.hp)} HP.`);
}

function revisarMuerte(){
  const r = FichaAcciones.revisarMuerte(S);
  if(r.vivo){
    if(r.revivio) $('#overlay-muerte').classList.remove('open');
    return;
  }
  if(r.cayo) $('#scrim-muerte').classList.add('open');
  renderOverlayMuerte();
}

function renderOverlayMuerte(){
  // Dentro del mapa (iframe): le avisa el estado de muerte para que tiña TODA la pantalla del mapa, no solo esta ventana.
  try{ botoneraAvisarMapa('muerte-estado', {activo: !!(S.muerto && S.muerto.activo), turnos: num(S.muerto && S.muerto.turnos), definitivo: !!(S.muerto && S.muerto.definitivo)}); }catch(e){}
  if(!S.muerto || !S.muerto.activo){ $('#overlay-muerte').classList.remove('open'); return; }
  $('#overlay-muerte').classList.add('open');
  $('#btn-revivir').style.display = S.muerto.definitivo ? 'none' : '';
  $('#overlay-muerte-centro').innerHTML = S.muerto.definitivo
    ? `<div class="muerte-final">TE HAS MORIDO BIEN MUERTO Y YA NO HAY VUELTA ATRÁS</div>`
    : `<div class="muerte-label">INCONSCIENTE · turnos hasta morir:</div><div class="muerte-numero">${fmt(S.muerto.turnos)}</div>`;
}

function renderVitals(){
  revisarAnkh();
  revisarMuerte();
  const c = compute();
  const hpmax = Number.isNaN(c.final.hpmax) ? 0 : c.final.hpmax;
  $('#v-hpmax').textContent = fmt(hpmax);
  // El HP puede quedar en negativo internamente (overkill), pero en el
  // contador de la cabecera nunca se muestra por debajo de 0.
  if(document.activeElement !== $('#f-hp')) $('#f-hp').value = fmt(Math.max(0, num(S.hp)));
  $('#bar-hp').style.width = pct(S.hp, hpmax);

  // capacidad
  const crg = Number.isNaN(c.final.crgmax) ? 0 : c.final.crgmax;
  setCap('equipo', c.pesoEquipado, crg);
  const capMochilaTotal = capMochilaEfectivo();
  setCap('mochila', S.inventario.filter(i=>!i.equipado).reduce((a,i)=>a+ranurasDe(i),0), capMochilaTotal);
  const bonusMochila = capMochilaTotal - num(S.caps.mochila);
  $('#cap-mochila-bonus-txt').textContent = bonusMochila ? ` (+${fmt(bonusMochila)} de la mochila equipada)` : '';
  const capCinturonBase = num(S.caps.cinturon);
  const capCinturonTotal = capCinturonEfectivo();
  setCap('cinturon', S.cinturon.length, capCinturonTotal);
  $('#cap-cinturon-total').textContent = fmt(capCinturonTotal);
  const bonusCinturon = capCinturonTotal - capCinturonBase;
  $('#cap-cinturon-bonus-txt').textContent = bonusCinturon ? ` (+${fmt(bonusCinturon)} del cinturón equipado)` : '';
  $('#cap-equipo-t').textContent = fmt(crg);

  // SP: se gasta con habilidades; al pasar turno recupera SP Regen.
  const spMax = spMaximo(c);
  const gastado = num(S.spGastado);
  const sp = spMax - gastado;
  // Segunda barra del recuadro de vida (arriba de todo).
  if(document.activeElement !== $('#f-sp-vital')) $('#f-sp-vital').value = fmt(Math.max(0, sp));
  $('#v-spmax-vital').textContent = fmt(spMax);
  $('#bar-sp').style.width = pct(Math.max(0, sp), spMax);
  $('#equipo-over').innerHTML = c.sobrecarga > 0
    ? `Te pasás por ${fmt(c.sobrecarga)}: −${fmt(c.sobrecarga)} a la Evasión al tirarla, o pagás 1 No2 para evitarlo. ${IT2_PENDIENTE('regla de sobrepeso en prueba')}` : '';
}

// SP máximo = el calculado (Especial × 3 + bonos) + un ajuste a mano (`S.meta.spMaxExtra`, puede ser negativo) que se fija desde el
// token del mapa (2026-09-24, pedido de los jugadores): así se puede subir o bajar el máximo sin tocar la fórmula.
function spMaximo(c){ return FichaBotonera.spMaximo(S, c); }   // comun/ficha-botonera.js

function nitrosMaximo(c){ return FichaBotonera.nitrosMaximo(S, c); }

function setCap(key, used, total){
  $('#cap-'+key+'-n').textContent = fmt(used);
  const bar = $('#cap-'+key+'-bar');
  bar.classList.toggle('over', total>0 && used>total);
  bar.firstElementChild.style.width = pct(used, total);
}

function pct(v, max){ return max>0 ? Math.min(100, Math.max(0, v/max*100))+'%' : '0%'; }
function fmt(n){ return Number.isInteger(n) ? n : Math.round(n*100)/100; }
function esc(s){ return String(s??'').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch])); }

function statOptions(sel){
  const opt = s => `<option value="${s.id}" ${sel===s.id?'selected':''}>${s.label} — ${s.full}</option>`;
  return `<optgroup label="Atributos">${ATTR_LIST.map(opt).join('')}</optgroup>`
       + GRUPOS.map(g => `<optgroup label="${g.label} · ${g.full}">${g.derived.map(opt).join('')}</optgroup>`).join('')
       + `<optgroup label="Otros">${EXTRA.map(opt).join('')}</optgroup>`;
}

function jobTag(i){
  if(i.job === false){
    return i.origen
      ? `<span class="tag origen">${esc(i.origen)}</span>`
      : `<span class="tag origen">fuera de Job</span>`;
  }
  const costo = jobCostoDe(i);
  return `<span class="tag job">${costo === 1 ? "Job" : `Job ${fmt(costo)}`}</span>`;
}

const modTags = mods => FichaEquipo.modTags(mods);   // comun/ficha-equipo.js
const thumb = i => FichaEquipo.thumb(i);

function ranurasDe(i){
  return (i.ranuras === undefined || i.ranuras === '') ? 1 : num(i.ranuras);
}

function unitStepper(i, key){
  return `<div class="unit-stepper">
    <span class="unit-label">Cantidad</span>
    <button class="unit-btn" data-unit="${key}:${i.id}:-1">−</button>
    <span class="unit-n">${fmt(num(i.unidades))}</span>
    <button class="unit-btn" data-unit="${key}:${i.id}:1">+</button>
  </div>`;
}

function cargaIndicator(i){
  const cargaMax = Math.max(1, num(i.cargaMax) || 1);
  if(cargaMax <= 1) return '';
  const carga = Math.min(cargaMax, Math.max(0, num(i.cargaActual ?? cargaMax)));
  return `<div class="unit-stepper"><span class="unit-label">Cargas de la unidad actual</span><span class="unit-n">${carga}/${cargaMax}</span></div>`;
}

// Lo que está en la mochila es una copia del ítem del catálogo hecha en el
// momento de comprarlo. Si el efecto se configuró después, esa copia no lo
// tiene y el consumible no hace nada. Se busca el original por nombre, que
// es la única referencia al catálogo que sobrevive a la copia.
// El catálogo es la referencia compartida y siempre gana sobre lo que haya quedado copiado en el ítem al
// comprarlo/agregarlo — comun/ficha-habilidades.js (paso 5, nivel B, área 3) tiene el comentario largo original.
function configEfectoDe(it){ return FichaHabilidades.configEfectoDe(S, it); }

// Invulnerable, Inmunidad a CC, Sangre pura y Coagulación extrema (comun/combatiente.js). objEfecto: un preset o un draft del editor.
function estaBloqueadoElDebuff(objEfecto){ return FichaHabilidades.estaBloqueadoElDebuff(S, objEfecto); }

// Oleo reparador: quita Armadura rota si está activa (es permanente, no vence sola). Devuelve cuántas se quitaron.
function repararArmadura(){ return FichaAcciones.repararArmadura(S); }   // comun/ficha-acciones.js

/* ---------- Sigilo: entrar y salir con un botón (Botonera) ----------
   Quien tiene la habilidad "Sigilo" ve en la Botonera un botón directo, sin
   pasar por "+ Estado". Entrar cuesta IT2.nitrosSigilo (1 No2, a revisar) y
   aplica el estado alterado "Sigilo" sobre uno mismo (el mapa lo lee de ahí);
   salir es gratis. No se avisa en la Mesa: el sigilo no se anuncia. */
const tieneSigilo = () => FichaBotonera.tieneSigilo(S);   // comun/ficha-botonera.js
const efectoSigilo = () => FichaBotonera.efectoSigilo(S);

// Lo que hacen Sigilo y Levantarse: comun/ficha-acciones.js (el mismo que usa la Botonera nueva del mapa); acá, lo que se ve.
const accionesUi = {
  get presets(){ return EFECTOS_PRESET; },
  toast: t => toast(t),
  avisarSinNitros: (costo, accion, continuar) => avisarSinNitros(costo, accion, continuar),
  cambio: lista => { renderList('efectos'); if(lista.includes('nitros')) renderNitros(); refresh(); },
};
function alternarSigilo(forzar){ FichaAcciones.alternarSigilo(S, forzar, accionesUi); }

/* ---------- Sentado: levantarse cuesta 1 No2 ----------
   El estado Sentado no vence solo; el botón "Levantarse" de la Botonera lo saca y cobra IT2.nitrosLevantarse. */
const efectoSentado = () => FichaBotonera.efectoSentado(S);   // comun/ficha-botonera.js
function levantarse(forzar){ FichaAcciones.levantarse(S, forzar, accionesUi); }
// Consumir (comun/ficha-acciones.js): la vida, el estado, las tiradas y la trampa los pone la ficha; redibuja lo que cambió.
const consumoUi = {
  toast: t => toast(t),
  avisarSinNitros: (costo, accion, continuar) => avisarSinNitros(costo, accion, continuar),
  fijarHp: v => fijarHp(v),
  efecto: it => aplicarEfectoDeConsumo(it),
  tirarExtra: it => tirarExtraDeItem(it),
  colocarTrampa: it => colocarTrampaDeItem(it),
  cambio: lista => {
    if(lista.includes('inventario')) renderInventario(); else renderList('cinturon');
    if(lista.includes('efectos')) renderList('efectos');
    renderVitals();
    renderNitros();
  },
};

// El "estado del sistema anterior" que una habilidad o un ítem pone al ejecutarse/consumirse (nombre, turnos, HP por
// turno, escudo, stacks, mods): la regla vive en comun/ficha-habilidades.js (paso 5, nivel B, área 3), con el
// comentario largo original sobre el catálogo que manda y por qué. Acá solo el toast si quedó bloqueado por una
// inmunidad (Invulnerable, Sangre pura…) y devolver lo mismo que antes: el estado armado, o null.
function aplicarEfectoDeConsumo(it){ return FichaAcciones.efectoDeConsumo(S, it, EFECTOS_PRESET, toast); }   // comun/ficha-acciones.js

// Tira la fórmula custom configurada en el ítem/habilidad (si tiene) y
// la publica en la Mesa, igual que un ataque o un chequeo manual.

// Stats secundarios que se pueden tirar (los que tienen 🎲 en Atributos).
function STATS_CON_TIRADA(){ return FichaBotonera.statsConTirada(); }   // comun/ficha-botonera.js

// Al ejecutar: tira el stat vinculado (con su valor del momento, mods
// incluidos) y/o la fórmula manual. Se puede tener las dos.
function tirarExtraDeItem(it){
  let tiro = false;
  const stat = it.tiradaStat;
  if(stat && (ATTR_LIST.some(a => a.id === stat) || STATS_CON_TIRADA().some(s => s.id === stat))){
    tirarValorStat(`${it.nombre} · ${STAT_LABEL[stat]}`, compute().final[stat] + num(it.tiradaBono), stat);
    tiro = true;
  }
  const formula = (it.tiradaExtra || '').trim();
  if(formula){
    const r = tirarDados(formula);
    if(r){ registrarTirada(it.nombre, r); tiro = true; }
  }
  return tiro;
}

/* Ejecutar una habilidad tira SOLO la primera tirada que le corresponde: el stat vinculado (PdG, PdG.Esp u otro) o,
   si no tiene, la fórmula. La segunda (la fórmula: el daño o el efecto) va aparte con el botón 🎲, igual que en las
   armas (Atacar → Daño) — decidido 2026-09-24. */
function habStatTirable(it){ return FichaBotonera.habStatTirable(it); }   // comun/ficha-botonera.js
function habTieneSegundaTirada(it){ return FichaBotonera.habTieneSegundaTirada(it); }
/* ---------- Habilidades dirigidas en el duelo (2026-09-27, docs/duelo-de-habilidades.md) ----------
   Una habilidad con `duelo` = {objetivo: 'enemigo'|'aliado'|'uno mismo', tira: stat (por defecto su tiradaStat), contra: [stats con los que se resiste el objetivo],
   dano: true si la fórmula de la habilidad (tiradaExtra) es daño, tipoDano: 'arcano'|'fuego'|'hielo'|'rayo'|'fisico', efectos: [{nombre, turnos, mods, hp, cura}]}
   abre el duelo al ejecutarla en vez de tirar el stat suelto. */
/* Ataque con arma hecho con una habilidad (2026-09-27): `duelo.modo === 'arma'` + `duelo.arma = {pdg, pdgPorX, dadosPorX, fijo, fijoPorX, sinParry}` y `duelo.x` ('sp' o 'nitros': cuál es la X de
   su costo). Al ejecutarla se abre el duelo de ATAQUE de siempre (PdG, Evasión o Parry, crítico, daño con los efectos del arma) con lo que la habilidad le suma. Los No2 del ataque ya
   los cobró la habilidad: el duelo no los vuelve a cobrar. */
// El duelo de una habilidad: el que se le configuró con 🎯 (null = se lo sacaron) o, si nunca se tocó, el de la skill de clase de la que salió (así las que ya estaban en la mochila también lo traen).
function dueloDe(it){ return FichaBotonera.dueloDe(it); }   // comun/ficha-botonera.js
// El ataque con arreglos lo arma la regla común (comun/combatiente.js, ataqueConArreglos), la misma que usa un creep; esto vive
// en comun/ficha-acciones.js (paso 3c-5b). ⚡ Critical Matters: los efectos/nota de `c.critico` solo se suman si el golpe
// termina siendo crítico (comun/duelo.js).
function ataqueDeHabArma(it, arma, xSp, xNitros){ return FichaAcciones.ataqueDeHabArma(S, it, arma, xSp, xNitros, habUi); }
function xDeHab(it, xSp, xNitros){ return FichaAcciones.xDeHab(it, xSp, xNitros); }
// Reemplaza el token «X» (sin importar mayúsculas) de una fórmula de dados o de un texto libre por un número —
// mismo criterio que ya usa danoFijoPorX, generalizado para tirada personalizada y efecto a mano/personalizado.
// \bx\b sola no alcanza: en «1dX» la X queda pegada a la «d» (las dos son \w, sin borde de palabra ahí) y no
// la tocaba — la fórmula quedaba con una X literal y tirarDados fallaba en silencio (bug real, 2026-09-28).
// Por eso hay una segunda pasada para «dX»/«Xd» (dado de X caras / X dados), sin tocar el resto del texto
// libre (una palabra como "excedente" no tiene "dx"/"xd" pegados, así que no se toca).
function sustituirX(formula, X){ return Combatiente.sustituirX(formula, X); }   // comun/combatiente.js
// Aplica un efecto del cuadro de Ejecución directo sobre el propio personaje, sin esperar al GM (2026-09-29,
// bug real reportado con Blindaje: un buff sobre uno mismo se quedaba en «Aplicando…» para siempre si el GM no
// tenía el mapa abierto y conectado — antes SOLO el mapa del GM podía aplicar un efecto, comun/duelo.js
// cfgEscuchar.aplicarEfecto, gateado a soyGM()). Escribir la propia ficha nunca necesita el permiso de nadie
// más, así que este hook (pasado a Duelo.escuchar) se habilita también para `esMio(d.defensor)` — ver el
// cambio de esa fecha en comun/duelo.js. Cualquier otro caso (un aliado, un rival) sigue dependiendo del mapa.
function dueloAplicarEfectoPropio(d, ef){ return FichaAcciones.dueloAplicarEfectoPropio(S, fichaVivo && fichaVivo.id, d, ef, habUi); }
// Lo último que hace ejecutar una habilidad: anunciarla y tirar su primera tirada, o abrir el duelo (habilidad
// dirigida o ataque con arma). La tirada personalizada de una habilidad dirigida (ver habDueloDatos) ya vive
// DENTRO del duelo (hab.tira.formula), no acá — no hace falta ninguna ventanita aparte en la ficha.
function terminarEjecucionHab(it, arma, xSp, xNitros){ FichaAcciones.terminarEjecucionHab(S, it, arma, xSp, xNitros, habUi); }   // comun/ficha-acciones.js (paso 3c-5b)
// Manda al mapa (la ficha corre en su iframe) todo lo que hace falta para crear la zona: radio, duración, estado
// y/o daño, y con qué resistencia. Si hay tirada («tira» del 🎯), la tira UNA vez acá y manda el total — esa
// misma tirada es la que se reusa contra cada uno que entra o sigue adentro en el Mantenimiento (mismo criterio
// que la PdG.Esp compartida de los hechizos de área). Devuelve false si no se pudo avisar (sin mapa abierto).
function colocarZonaDeHab(it, xSp, xNitros){ return FichaAcciones.colocarZonaDeHab(S, it, xSp, xNitros, habUi); }   // comun/ficha-acciones.js (paso 3c-5c)
// Alcance en casilleros de un ataque: cuerpo a cuerpo = 1 + el Alcance del arma (su bono `rng`); arma de rango = su Rango.
function alcanceDeArma(arma){ return FichaCombate.alcanceDeArma(S, arma); }   // comun/ficha-combate.js
// La Ejecución para el cuadro del duelo: la regla común (comun/combatiente.js, habEjecucion), la misma de invocaciones y
// creeps, en comun/ficha-acciones.js. La X ya se eligió al pagar el costo variable: daño por X, tirada personalizada y
// textos a mano llegan con la X ya sustituida.
function habDueloDatos(it, xSp, xNitros){ return FichaAcciones.habDueloDatos(S, it, xSp, xNitros); }
// Resumen de una ejecución paso a paso, en una línea (para el editor y la tarjeta).
function resumenEjecucionHab(c){
  if(!c || typeof c !== 'object') return '';
  if(c.modo === 'arma') return 'ataque con tu arma';
  if(c.modo === 'flash') return 'flash';
  const OBJ = {enemigo: 'a un enemigo', aliado: 'a un aliado', 'uno mismo': 'sobre vos', area: 'en un área', onda: 'onda alrededor tuyo', zona: 'zona persistente'};
  const tira = c.tiraFormula ? (c.tiraEtiqueta || 'tirada propia') : c.tira ? (STAT_LABEL[c.tira] || c.tira) : '';
  const partes = [OBJ[c.objetivo] || c.objetivo || 'a un enemigo'];
  if(tira) partes.push(`tira ${tira}${(c.contra || []).length ? ' contra ' + c.contra.map(s => STAT_LABEL[s] || s).join('/') : ''}`);
  if(c.dano) partes.push('hace daño');
  if((c.efectos || []).length) partes.push(c.efectos.map(e => e.nombre || (e.cura ? 'cura' : 'efecto')).join(', '));
  return partes.join(' · ');
}
// Abre el cuadro que arma la ejecución paso a paso de una habilidad (comun/asistente-duelo-hab.js). Guardarla la deja
// en ✨ Automático; sacarla la deja en 💰 Semiautomático.
function abrirEjecucionHab(it, alTerminar){
  AsistenteDueloHab.abrir({nombre: it.nombre || 'Habilidad', inicial: dueloDe(it) || null, siempreActivo: true, tieneFormula: !!String(it.tiradaExtra || '').trim(), costoVariable: spVariable(it) ? 'sp' : nitrosVariable(it) ? 'nitros' : '',
    costoInicial: {sp: it.costo, nitrosCosto: it.nitrosCosto, hpCosto: it.hpCosto, turnoAjenoSp: it.turnoAjenoSp}, elegirEstado: elegirEstadoDuelo,
    alGuardar: r => {
      if(r){ it.duelo = r.duelo; it.costo = r.costo.sp; it.nitrosCosto = r.costo.nitrosCosto; it.hpCosto = r.costo.hpCosto; it.turnoAjenoSp = r.costo.turnoAjenoSp || ''; it.modo = 'auto'; it.automatizada = true; }
      else{
        if(it.habClaseId && (function(){ const base = CLASES_SKILLS.flatMap(c => c.habilidades).find(h => h.id === it.habClaseId); return base && base.duelo; })()) it.duelo = null;
        else delete it.duelo;
        if(modoHab(it) === 'auto' || it.modo === 'auto') it.modo = 'semi';
      }
      if(alTerminar) alTerminar(r);
    }});
}
// ✨ Automática, solo sobre uno mismo y sin tiradas (Blindaje y parecidos): se aplica directo, sin abrir el cuadro, y se anuncia
// en la Mesa con lo que pasó. Devuelve false si no es ese caso (entonces sigue el cuadro de siempre).
function aplicarHabSobreMiDirecto(it, h){ return FichaAcciones.aplicarHabSobreMiDirecto(S, it, h, habUi); }

function tirarPrimeraDeHab(it){ return FichaAcciones.tirarPrimeraDeHab(S, it, habUi); }   // comun/ficha-acciones.js
function tirarSegundaDeHab(id){ FichaAcciones.tirarSegundaDeHab(S, id, habUi); }
const botonSegundaHab = it => FichaBotonera.botonSegundaHab(it);   // comun/ficha-botonera.js

function restaurarSpDeConsumo(it){ return FichaAcciones.restaurarSpDeConsumo(S, it); }   // comun/ficha-acciones.js

// Nitros que cuesta consumir un ítem según de dónde sale.
/* ---------- Moneda Re-Roll (2026-09-27, regla del dueño; docs/reroll.md) ----------
   Con una Moneda Re-Roll equipada (cinturón o mochila) se puede volver a hacer CUALQUIER tirada tuya, sin costo de No2: se abre una ventana con tus últimas tiradas y elegís
   cuál repetir («una moneda por tirada»: cada tirada solo se puede re-rolear una vez — la que sale de repetirla es una tirada nueva, que se puede re-rolear de nuevo con otra
   moneda). Después de usarla se tira una moneda: par (2) se conserva, impar (1) se rompe (gasta una unidad, como cualquier consumible). Botón 🪙 fijo en el mapa (jugadores) y
   en la cabecera de la Botonera; en el duelo, el botón flotante 🪙 reabre la última tirada tuya del duelo (docs/duelo-de-habilidades.md). */
const esMonedaReroll = FichaDuelo.esMonedaReroll;   // comun/ficha-duelo.js
function monedaReroll(){ return FichaDuelo.monedaReroll(S); }
// Tira la moneda: par se conserva, impar se rompe.
function tirarMonedaReroll(m){ return FichaDuelo.tirarMonedaReroll(S, m, combateUi); }
// Vuelve a tirar los mismos dados de una tirada anterior (con sus mismos bonos y mitades). `u` es una entrada de dadosHistorial.
function repetirTirada(u){ return FichaDuelo.repetirTirada(u, registrarTirada, toast); }   // comun/ficha-duelo.js (A6a)
// Qué tiradas ya usaron su moneda (una por tirada): S.rerollUsados, las claves de comun/tiradas-propias.js — se guarda en la ficha (P138).
function renderReroll(){
  const r = FichaDuelo.rerollHtml(S, tiradasPropias());   // comun/ficha-duelo.js (A6a; el mapa usa lo mismo)
  $('#reroll-aviso').innerHTML = r.aviso;
  $('#reroll-lista').innerHTML = r.filas;
}
function abrirReroll(){
  renderReroll();
  $('#scrim-reroll').classList.add('open');
}
$('#reroll-x').onclick = () => $('#scrim-reroll').classList.remove('open');
$('#scrim-reroll').addEventListener('mousedown', e => { if(e.target.id === 'scrim-reroll') $('#scrim-reroll').classList.remove('open'); });
$('#reroll-lista').addEventListener('click', e => {
  const b = e.target.closest('[data-rerollpick]');
  if(!b) return;
  const h = tiradasPropias().find(x => x.clave === b.dataset.rerollpick);
  if(!FichaDuelo.usarReroll(S, h, combateUi)) return;
  renderReroll();
});
// Botón 🪙 (Botonera y mapa): abre la ventana de re-roll.
function rerollFuera(){ abrirReroll(); }

function costoConsumirNitros(key){ return FichaBotonera.costoConsumirNitros(key); }   // comun/ficha-botonera.js

// conLupa: en la Botonera la 🔍 va dentro del botón (sin "disabled", que no deja abrirla).
function consumeButton(i, key, conLupa){ return FichaBotonera.consumeButton(i, key, conLupa, lupaBotonHtml); }

function priceTags(i){
  const c = num(i.precioCompra), v = precioVentaDe(i);
  let out = '';
  if(c) out += `<span class="tag price buy">compra ${fmt(c)}</span>`;
  if(v) out += `<span class="tag price sell">venta ${fmt(v)}</span>`;
  return out;
}

function precioVentaDe(i){ return FichaTienda.precioVenta(i); }   // comun/ficha-tienda.js (A5)

function armaDanoTxt(i, extra){ return FichaCombate.armaDanoTxt(i, extra); }   // comun/ficha-combate.js

