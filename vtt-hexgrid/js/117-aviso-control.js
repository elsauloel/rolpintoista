/* 🎮 El GM maneja a tu personaje (dueño, 2026-11-11: «el aviso de que el GM está controlando a Rockardo debería estar visible siempre, sí, pero
   además un jugador no debería poder usar su propio token mientras lo controla el GM… sólo observar»).
   Mientras el GM tiene el 🎮 control de un personaje (resumen.control = su uid), en la pantalla de su dueño queda un aviso fijo arriba al centro
   (no un toast) y el personaje no se puede usar desde acá: los permisos de js/04, js/09, js/10 y js/11 (controlAjeno) frenan moverlo, su
   Botonera, la vida y los estados; si la Botonera estaba abierta, se cierra. Al devolver el control, el aviso se va y todo vuelve.
   La ficha suelta ya quedaba en solo lectura con su cartel (ficha-personaje/js/12, fichaControlCambio). */
let avisoControlUltimo = '';
function avisoControlPintar(){
  if(typeof fbUsuario === 'undefined' || !fbUsuario || typeof fichasPub === 'undefined') return;
  const nombres = [];
  if(!soyGM){
    fichasPub.forEach((f, id) => {
      if(f && f.duenoUid === fbUsuario.uid && controlAjeno(id)) nombres.push(f.nombre || (f.resumen && f.resumen.nombre) || 'tu personaje');
    });
  }
  const clave = nombres.join('|');
  if(clave === avisoControlUltimo) return;
  avisoControlUltimo = clave;
  let el = document.getElementById('aviso-control');
  if(!nombres.length){ if(el) el.hidden = true; return; }
  if(!el){
    el = document.createElement('div');
    el.id = 'aviso-control';
    el.setAttribute('role', 'status');
    el.style.cssText = 'position:fixed;top:calc(58px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);z-index:9000;'
      + 'background:#2a2140;color:#f3ecff;border:2px solid #9b7bff;border-radius:10px;padding:8px 16px;font:600 14px/1.35 system-ui,sans-serif;'
      + 'box-shadow:0 6px 18px rgba(0,0,0,.45);max-width:min(92vw,720px);text-align:center;pointer-events:none';
    document.body.appendChild(el);
  }
  el.innerHTML = nombres.map(n => esc(Combatiente.AVISO_CONTROL_TXT(n))).join('<br>');
  el.hidden = false;
  // Si la Botonera de ese personaje estaba abierta en esta pantalla, se cierra (ya no la puede usar).
  try{
    if(typeof bn !== 'undefined' && bn && bn.host && !bn.host.hidden && controlAjeno(bn.fichaId)) cerrarBotoneraNueva();
  }catch(e){ /* sin Botonera abierta */ }
}
setInterval(avisoControlPintar, 1000);
