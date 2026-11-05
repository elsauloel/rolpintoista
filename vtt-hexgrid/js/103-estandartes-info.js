// js/103-estandartes-info.js — 🚩 Estandartes: ver qué hacen y sus áreas como estados (2026-11-05, dueño).
// Nombres (dueño): «objetos inertes» para lo general (lo que pone una habilidad y no actúa: `esInerte`, js/73) y «estandartes» para la mecánica del
// poste con efecto en área (el Estandarte de guerra, el Tótem de silencio y los que vengan).
// (1) Pasando el mouse por el nombre del token seleccionado (`#token-etiqueta`) o por el token de un estandarte en el mapa: un globito con lo que hace
//     (aura, efecto, vida). (2) Un inerte no lleva la ficha lite; su carnet 🪪 va en el primer anillo del HUD (js/10). (3) «Todo efecto de área que
//     afecta a los tokens se ve como estado mientras el token está adentro»: `estadosDeArea(t)` arma esos estados a partir de la posición (no se
//     guardan): los muestran los circulitos (js/88), el globo de estados del HUD (js/10) y la ficha lite (js/15). Son informativos: el bono del
//     estandarte lo sigue sumando el duelo (`estandarteBonus`), el silencio lo sigue preguntando `silencioDeLugar` y el aura sanadora la sigue curando
//     js/70; esto no suma nada dos veces.

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
