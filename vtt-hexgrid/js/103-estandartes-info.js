// js/103-estandartes-info.js — 🚩 Estandartes: ver qué hacen y sus áreas como estados (2026-11-05, dueño).
// Nombres (dueño): «objetos inertes» para lo general (lo que pone una habilidad y no actúa: `esInerte`, js/73) y «estandartes» para la mecánica del
// poste con efecto en área (el Estandarte de guerra, el Tótem de silencio y los que vengan).
// (1) Pasando el mouse por el nombre del token seleccionado (`#token-etiqueta`) o por el token de un estandarte en el mapa: un globito con lo que hace
//     (aura, efecto, vida). (2) Un inerte no lleva la ficha lite; su carnet 🪪 va en el primer anillo del HUD (js/10). (3) «Todo efecto de área que
//     afecta a los tokens se ve como estado mientras el token está adentro»: `estadosDeArea(t)` arma esos estados a partir de la posición (no se
//     guardan): los muestran los circulitos (js/88), el globo de estados del HUD (js/10) y la ficha lite (js/15). Son informativos: el bono del
//     estandarte lo sigue sumando el duelo (`estandarteBonus`), el silencio lo sigue preguntando `silencioDeLugar` y el aura sanadora la sigue curando
//     js/70; esto no suma nada dos veces. (2026-11-05, cola 17) También «🛡 Muro de escudos (+N Def)» (js/26 `muroDe`) y «⬡ En la zona: <nombre>»
//     mientras está adentro de una zona persistente que le aplica, con qué le va a pasar y cuándo (`zonaEstadoDetalle`).

// La vida de un inerte: el GM ve los números (su ficha privada); el resto, el porcentaje público.
function inerteVida(id, t){
  const sc = soyGM && typeof creepPrivadoDe === 'function' ? creepPrivadoDe(t.fichaId) : null;
  if(sc && sc.hpMax !== undefined) return `${Math.max(0, Math.round(num(sc.hp)))} / ${Math.round(num(sc.hpMax))}`;
  const r = (vinculo(t) || {}).resumen;
  return r && r.hpPct !== undefined ? `${Math.max(0, Math.round(num(r.hpPct)))} %` : '';
}
// Lo que hace un estandarte, en palabras. → {titulo, lineas} o null si no es un estandarte.
function estandarteTexto(id, t){
  const e = typeof estandarteInfo === 'function' ? estandarteInfo(t) : null;
  if(!e) return null;
  const nom = (vinculo(t) || {}).nombre || t.nombre || (e.silencio ? 'Tótem de silencio' : 'Estandarte');
  const quien = t.tipo === 'creep' ? 'de los creeps' : 'de los personajes';
  const lineas = [
    `${e.silencio ? '🤐 Tótem de silencio' : '🚩 Estandarte de guerra'} · objeto inerte ${quien}`,
    `Aura: ${e.radio} casilla${e.radio === 1 ? '' : 's'} alrededor (diámetro ${2 * e.radio + 1}).`,
    e.silencio ? 'Los rivales que están adentro no pueden usar habilidades que cuestan SP.'
      : `Sus aliados adentro: +${e.pdg} a la Probabilidad de Golpe y +${e.dano} al daño.`,
  ];
  const vida = inerteVida(id, t);
  if(vida) lineas.push(`Vida: ${vida} · se rompe al llegar a 0. No actúa ni entra al orden de turnos.`);
  return {titulo: nom, lineas};
}

// (3) Los estados de las áreas para un token, según dónde está. → [{nombre, polaridad, detalle, derivado: true, area: true}]
function estadosDeArea(t){
  if(!t || t.col === undefined || t.fila === undefined || t.bajoTierra) return [];
  if(typeof estandarteInfo === 'function' && estandarteInfo(t)) return [];   // el estandarte mismo no
  const yo = {col: t.col, fila: t.fila}, out = [];
  const nombre = x => (vinculo(x) || {}).nombre || x.nombre || '';
  let est = null, sil = null;
  if(typeof estandarteInfo === 'function') tokens.forEach((x, id) => {
    if(x === t || (x.oculto && !soyGM)) return;
    const e = estandarteInfo(x);
    if(!e || !estandarteEnPie(id, x) || distanciaHex({col: x.col, fila: x.fila}, yo) > e.radio) return;
    if(e.silencio){ if(x.tipo !== t.tipo && !sil) sil = {nom: nombre(x) || 'un tótem de silencio'}; }
    else if(x.tipo === t.tipo && t.tipo === 'creep' && (!est || e.pdg + e.dano > est.pdg + est.dano)) est = {...e, nom: nombre(x) || 'un estandarte'};
  });
  if(est) out.push({nombre: 'Bajo el estandarte', polaridad: 'buff', derivado: true, area: true,
    detalle: `Dentro del aura de ${est.nom}: +${est.pdg} a la Probabilidad de Golpe y +${est.dano} al daño. Se va al salir del aura.`});
  if(sil) out.push({nombre: 'Silenciado (tótem)', polaridad: 'debuff', derivado: true, area: true,
    detalle: `Dentro del aura de ${sil.nom}: no puede usar habilidades que cuestan SP. Se va al salir del aura.`});
  // ✚ El Aura sanadora de un creep (js/70): sus aliados creeps a AURA_CURA_RADIO o menos.
  if(t.tipo === 'creep' && typeof auraCuraEnEstados === 'function' && typeof AURA_CURA_RADIO !== 'undefined'){
    let cura = null;
    tokens.forEach(x => {
      if(cura || x === t || x.tipo !== 'creep' || (x.oculto && !soyGM)) return;
      if(!auraCuraEnEstados(typeof estadoDe === 'function' ? estadoDe(x) : null)) return;
      if(distanciaHex({col: x.col, fila: x.fila}, yo) <= AURA_CURA_RADIO) cura = nombre(x) || 'un aliado';
    });
    if(cura) out.push({nombre: 'En el aura sanadora', polaridad: 'buff', derivado: true, area: true,
      detalle: `Dentro del aura sanadora de ${cura}: se cura en cada pulso. Se va al salir del aura.`});
  }
  // 🛡 Muro de escudos (2026-11-05, dueño, cola 17): quien lleva el Escudo de la falange (`muroescudos`, js/26 `muroDe`) con un aliado con escudo al
  // lado. Solo informa: el +Defensa lo suma el golpe (js/26) como siempre.
  if(typeof muroDe === 'function'){
    let m = null; try{ m = muroDe(t); }catch(err){}
    if(m) out.push({nombre: `Muro de escudos (+${m.val} Def)`, polaridad: 'buff', derivado: true, area: true,
      detalle: `Junto a ${m.nombre}, que lleva escudo: +${m.val} a la Defensa contra cada golpe (Escudo de la falange). Se va si deja de tener al lado un aliado con escudo.`});
  }
  // ⬡ Las zonas persistentes (2026-11-05, dueño, cola 17: «que esté el iconito de estás en una nube tóxica y uno pueda ver qué implica… al llegar tal
  // momento se te va a aplicar tal efecto»): mientras está adentro, un estado que explica qué le va a pasar y cuándo. Lo que la zona le deja (el
  // Veneno…) sigue entrando como siempre (js/08); esto no tira ni aplica nada.
  out.push(...zonasComoEstados(t));
  return out;
}
// Las celdas de cada zona, guardadas mientras el elemento no cambie (esto corre en cada cuadro del dibujo).
const zonaCeldasCache = new WeakMap();
function zonaCeldasSet(el){
  let c = zonaCeldasCache.get(el);
  if(!c){ c = new Set(celdasDeElemento(el).map(x => x.col + ',' + x.fila)); zonaCeldasCache.set(el, c); }
  return c;
}
// Qué le pasa a `t` en la zona `el`, en palabras: cuándo, qué tira contra qué y qué le deja. → texto
function zonaEstadoDetalle(el, t){
  const nomZ = el.zonaNombre || 'la zona';
  if(typeof zonaCuraDe === 'function' && zonaCuraDe(el)) return `Adentro de ${nomZ}: se cura en cada pulso de la zona. Se va al salir.`;
  const spec = typeof zonaSpecDe === 'function' ? zonaSpecDe(el) : {};
  const sup = typeof superficieSpec === 'function' ? superficieSpec(el) : null;
  const lbl = st => (typeof ZONA_STAT_LABEL !== 'undefined' && ZONA_STAT_LABEL[st]) || st;
  const que = [...(spec && spec.nombre ? [typeof EstadosAplicar !== 'undefined' && EstadosAplicar.texto ? EstadosAplicar.texto(spec) : spec.nombre] : []),
    ...(el.zonaDanoDif ? [`daño (la diferencia de las tiradas${el.zonaDano ? ' + ' + el.zonaDano : ''})`] : el.zonaDano ? [`${el.zonaDano} de daño${el.zonaDanoTipo ? ' ' + el.zonaDanoTipo : ''}`] : [])].join(' y ');
  // Cuándo.
  let cuando;
  if((sup && sup.tiraPaso) || spec.tiraPaso) cuando = 'En cada paso que dé adentro';
  else {
    const partes = [el.trampa ? 'al detonar y al entrar' : el.zonaCadaPaso ? 'al entrar (aunque solo la cruce)' : 'al entrar'];
    if(el.zonaEnMantenimiento !== false) partes.push('en cada Mantenimiento (al pasar de ronda) mientras siga adentro');
    else partes.push('no mientras se queda quieto adentro');
    cuando = partes.join(' y ');
    cuando = cuando[0].toUpperCase() + cuando.slice(1);
  }
  // Qué tira.
  let tira = '';
  if(el.zonaResistStat){
    const contra = el.zonaTiraStat && Number.isFinite(el.zonaTiraValor) ? `una tirada de ${lbl(el.zonaTiraStat)} de la zona (${el.zonaTiraValor}; el empate gana la zona)`
      : Number.isFinite(el.zonaResistValor) ? String(el.zonaResistValor) : '';
    tira = `tira ${lbl(el.zonaResistStat)}${contra ? ' contra ' + contra : ''}: si no resiste, ${que || 'le pasa lo que deja la zona'}`;
  }else tira = que ? `le pasa: ${que}` : 'nada que tirar';
  const lineas = [`${cuando}, ${tira}.`];
  if(spec.nombre && (spec.sumaUno || spec.resetea)) lineas.push(`Si ya tiene ${spec.nombre}, en vez de tirar le suma 1 stack.`);
  else if(spec.nombre && spec.unaVez) lineas.push(`Una vez que tiene ${spec.nombre}, la zona ya no le vuelve a tirar.`);
  if(spec.nombre && spec.renuevaPaso) lineas.push(`Con ${spec.nombre} puesto, cada paso adentro se lo renueva.`);
  if(typeof alturaDe === 'function' && alturaDe(el) === 'piso') lineas.push('Es del piso: volando o levitando no lo toca.');
  const turnos = Math.round(num(el.turnos));
  if(turnos > 0) lineas.push(`La zona dura ${turnos} turno${turnos === 1 ? '' : 's'} más.`);
  lineas.push('Este aviso se va al salir de la zona.');
  return lineas.join(' ');
}
function zonasComoEstados(t){
  if(typeof elementos === 'undefined' || typeof zonaAplicaA !== 'function' || !t.fichaId) return [];
  const k = t.col + ',' + t.fila, out = [], vistos = new Set();
  elementos.forEach(el => {
    if(!el || !el.zona || (el.oculto && !soyGM) || !zonaAplicaA(el, t)) return;
    const sup = typeof superficieSpec === 'function' ? superficieSpec(el) : null;
    if(sup && sup.superficie && !sup.nombre && !sup.tiraPaso) return;   // el agua: no le hace nada
    if(!zonaCeldasSet(el).has(k)) return;
    const nomZ = el.zonaNombre || 'zona';
    if(vistos.has(nomZ)) return;
    vistos.add(nomZ);
    out.push({nombre: `En la zona: ${nomZ}`, polaridad: el.zonaAmiga && !el.zonaDano && !el.zonaDanoDif ? 'buff' : 'debuff', derivado: true, area: true, detalle: zonaEstadoDetalle(el, t)});
  });
  return out;
}
// Lo mismo, a partir de la ficha (para la ficha lite: `ref` = el fichaId del token).
function estadosDeAreaRef(ref){
  const t = ref ? [...tokens.values()].find(x => x.fichaId === ref) : null;
  return t ? estadosDeArea(t) : [];
}

// (1) El globito (sobre el token del estandarte, o sobre el cartel con su nombre cuando está seleccionado).
let inerteGloboEl = null;
function inerteGlobo(){
  if(inerteGloboEl) return inerteGloboEl;
  const el = document.createElement('div');
  el.id = 'inerte-globo';
  el.style.cssText = 'position:fixed;z-index:9500;max-width:300px;pointer-events:none;background:rgba(20,16,24,.96);color:#EFE6D2;border:1px solid #E3B04B;'
    + 'border-radius:8px;padding:8px 10px;font:13px/1.4 system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.5)';
  el.hidden = true;
  document.body.appendChild(el);
  return (inerteGloboEl = el);
}
function inerteGloboMostrar(id, t, x, y){
  const info = t && estandarteTexto(id, t);
  const el = inerteGlobo();
  if(!info){ el.hidden = true; return; }
  el.innerHTML = `<b style="color:#E3B04B">${esc(info.titulo)}</b>` + info.lineas.map(l => `<div>${esc(l)}</div>`).join('');
  el.hidden = false;
  const w = el.offsetWidth || 280, h = el.offsetHeight || 80;
  el.style.left = Math.max(8, Math.min(innerWidth - w - 8, x + 14)) + 'px';
  el.style.top = Math.max(8, Math.min(innerHeight - h - 8, y + 14)) + 'px';
}
function inerteGloboOcultar(){ if(inerteGloboEl) inerteGloboEl.hidden = true; }
(function inerteGloboConectar(){
  const etq = document.getElementById('token-etiqueta');
  if(etq){
    etq.addEventListener('mousemove', e => { const t = seleccion ? tokens.get(seleccion) : null; inerteGloboMostrar(seleccion, t, e.clientX, e.clientY); });
    etq.addEventListener('mouseleave', inerteGloboOcultar);
  }
  const cv = document.getElementById('lienzo');
  if(!cv) return;
  cv.addEventListener('mousemove', e => {
    if(e.buttons){ inerteGloboOcultar(); return; }
    // El cartel del nombre no recibe el mouse (pointer-events: none, para no tapar el mapa): se mira acá si el puntero está encima.
    const ts = seleccion ? tokens.get(seleccion) : null, er = etq && !etq.hidden ? etq.getBoundingClientRect() : null;
    if(ts && er && e.clientX >= er.left && e.clientX <= er.right && e.clientY >= er.top && e.clientY <= er.bottom && estandarteInfo(ts)){
      inerteGloboMostrar(seleccion, ts, e.clientX, e.clientY); return;
    }
    const r = cv.getBoundingClientRect();
    const mx = (e.clientX - r.left - vista.x) / vista.zoom, my = (e.clientY - r.top - vista.y) / vista.zoom;
    const id = typeof tokenEn === 'function' ? tokenEn(mx, my) : null;
    const t = id ? tokens.get(id) : null;
    if(t && typeof estandarteInfo === 'function' && estandarteInfo(t)) inerteGloboMostrar(id, t, e.clientX, e.clientY);
    else inerteGloboOcultar();
  });
  cv.addEventListener('mouseleave', inerteGloboOcultar);
})();
