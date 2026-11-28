/* ---------- ⚡ Botones de las habilidades Flash (2026-10-21, dueño: «rastrear las habilidades auditadas y automatizadas que tengan Flash… y
   crearles un botón»; eligió Blindaje, Shield, Estoicismo y Shockwave) ----------
   Como el 💪 de Empower (js/37): en combate, quien maneja a un personaje que tiene una de estas habilidades (lo publica su resumen:
   `resumen.flashBotones`, comun/ficha-resumen.js) ve su botón fijo arriba (Flotantes.blindaje / shield / estoicismo / shockwave), o al costado del
   cuadro del duelo cuando hay uno abierto (comun/flotantes.js los muda solos). Aparece solo si le alcanza el SP (en turno ajeno, lo de turno
   ajeno: el doble). Tocarlo ejecuta la habilidad como desde la Botonera (FichaAcciones.ejecutarHabilidad): pregunta lo que haga falta y cobra. */
const FLASH_BOTONES = {
  'tanque-blindaje': {flot: 'blindaje', que: 'un escudo de 8 sobre vos, antes del golpe'},
  'support-shield': {flot: 'shield', que: 'un escudo de 14 a vos o a un aliado'},
  'warrior-estoicismo': {flot: 'estoicismo', que: '+1 a las Res. a crítico y +2 Defensa'},
  'tanque-shockwave': {flot: 'shockwave', que: 'onda alrededor: Pajaritos a los que pierden'},
};
// La habilidad de ese personaje, si se puede usar ahora: {clave, id, costo, ajeno} o null.
function flashBotonDe(t, clave){
  const r = ((fichasPub.get(t.fichaId) || {}).resumen) || {};
  if(r.muerto) return null;
  const b = (r.flashBotones || []).find(x => x && x.clave === clave);
  if(!b) return null;
  const ajeno = typeof esSuTurno === 'function' && esSuTurno(idDeToken(t)) === false;
  const costo = ajeno ? (num(b.spAjeno) || num(b.sp) * 2) : num(b.sp);
  if(num(r.sp) < costo) return null;
  return {...b, costo, ajeno};
}
function flashBotonToken(clave){
  if(modoMapa !== 'combate' || !fbUsuario) return null;
  const ok = t => t && t.tipo === 'pj' && t.fichaId && !String(t.fichaId).includes(SEP_INVOCACION) && puedoMover(t) && !!flashBotonDe(t, clave);
  const sel = seleccion ? tokens.get(seleccion) : null;
  if(ok(sel)) return sel;
  for(const t of tokens.values()) if(ok(t)) return t;
  return null;
}
function renderFlashBotones(){
  if(typeof Flotantes === 'undefined') return;
  for(const [clave, cfg] of Object.entries(FLASH_BOTONES)){
    const f = Flotantes[cfg.flot];
    if(!f) continue;
    const t = flashBotonToken(clave);
    if(!t){ f(null); continue; }
    const b = flashBotonDe(t, clave), id = idDeToken(t);
    f({mostrar: true, sub: `${nombreDe(t)}: ${cfg.que} · ${fmt(b.costo)} SP${b.ajeno ? ' (Flash en turno ajeno)' : ''}`, alClic: () => flashBotonUsar(id, b)});
  }
}
setInterval(() => { try{ renderFlashBotones(); }catch(e){} }, 1500);

// Ejecuta la habilidad como desde la Botonera (con su pregunta de Flash, el objetivo si hace falta y el cobro).
async function flashBotonUsar(tokenId, b){
  const yo = tokens.get(tokenId);
  if(!yo) return;
  abrirBotonera(yo.fichaId);
  for(let i = 0; i < 40 && !(bn && bn.fichaId === yo.fichaId && bn.S && bn.sesion && bn.sesion.cargada); i++) await new Promise(r => setTimeout(r, 150));
  if(!(bn && bn.S)){ toast('No se pudo abrir el personaje'); return; }
  const it = (bn.S.habilidades || []).find(h => h && (String(h.id) === String(b.id) || h.habClaseId === b.clave));
  if(!it){ toast(`${nombreDe(yo)} ya no tiene esa habilidad`); return; }
  FichaAcciones.ejecutarHabilidad(bn.S, it.id, undefined, false, bnHabUi());
}
