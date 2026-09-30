/* comun/confirmar-turno.js — «¿Es tu turno?» (2026-09-28, pedido del dueño).
   Antes de tener el mapa avisando solo de quién es el turno (mucho trabajo, queda para más adelante — ver
   docs/pendientes.md), un paso intermedio: una habilidad puede marcarse "el costo en SP es distinto si no es
   tu turno" (paso Costo del 🎯/✨, `it.turnoAjenoSp`) y, al ejecutarla, un cartelito pregunta antes de cobrar
   nada — ni el jugador ni el sistema tienen que acordarse de duplicar el costo a mano.
   Uso: const costoSp = await ConfirmarTurno.pedir(nombre, costoPropio, costoAjeno); // null si se cancela
   Con `o` (2026-09-30, Flash, P136): `o.unidad` ('SP' por defecto), `o.quien` (el nombre de un creep: la pregunta pasa a
   "¿Es el turno de X?"), `o.textos` = [texto propio, texto ajeno] (entonces los costos pueden ser objetos) y `o.pregunta`.
   ⚡ Flash: `ConfirmarTurno.flash(nombre, {sp, cd, hp}, {quien, spAjeno})` → Promise<{sp, cd, hp}|null>: en turno ajeno cuesta
   el doble (Combatiente.costoFlash); sin nada que cobrar no pregunta. `textoFlash(costo, o)`: el texto de los dos costos.
   Mismo patrón que EstadoPreguntas.preguntar (comun/estado-preguntas.js): una Promise, sin Firebase. */
const ConfirmarTurno = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  function estilos(){
    if(document.getElementById('ct-css')) return;
    const s = document.createElement('style');
    s.id = 'ct-css';
    s.textContent = `#ct-fondo{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px}
#ct-caja{width:min(340px,100%);background:#1A1418;border:1px solid #C98545;border-radius:6px;box-shadow:0 16px 40px rgba(0,0,0,.7);padding:16px 18px;font-family:"Space Grotesk",system-ui,sans-serif;color:#EDE3D2;text-align:left}
#ct-caja .ct-titulo{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9A867E;margin-bottom:2px}
#ct-caja .ct-nombre{font-size:17px;font-weight:700;color:#E0A458;margin-bottom:10px}
#ct-caja .ct-pregunta{font-size:15px;margin-bottom:12px}
#ct-caja button{display:block;width:100%;background:#221A1E;border:1px solid #3B2E34;border-radius:4px;color:#EDE3D2;padding:10px 12px;font:inherit;font-weight:700;cursor:pointer;margin-bottom:8px;text-align:left}
#ct-caja button:hover{border-color:#C98545}
#ct-caja button.ct-primario{background:#C98545;border-color:#C98545;color:#180F08}
#ct-caja button.ct-cancelar{background:none;border:none;color:#9A867E;font-weight:400;text-align:center;margin-bottom:0;padding:6px}`;
    document.head.appendChild(s);
  }
  // pedir(nombre, costoPropio, costoAjeno, o) → Promise<number|null> (lo que se cobra; null = canceló, no cobra nada).
  function pedir(nombre, costoPropio, costoAjeno, o){
    o = o || {};
    const unidad = o.unidad || 'SP';
    estilos();
    return new Promise(resolver => {
      const fondo = document.createElement('div');
      fondo.id = 'ct-fondo';
      fondo.innerHTML = `<div id="ct-caja" role="dialog" aria-modal="true">
        <div class="ct-titulo">${o.quien ? `¿Es el turno de ${esc(o.quien)}?` : '¿Es tu turno?'}</div>
        <div class="ct-nombre">${esc(nombre)}</div>
        <div class="ct-pregunta">${esc(o.pregunta || 'Esta habilidad cuesta distinto según de quién sea el turno.')}</div>
        <button type="button" class="ct-primario" id="ct-si">${o.quien ? 'Sí, es su turno' : 'Sí, es mi turno'} — ${o.textos ? esc(o.textos[0]) : `${esc(costoPropio)} ${esc(unidad)}`}</button>
        <button type="button" id="ct-no">No, es turno ajeno — ${o.textos ? esc(o.textos[1]) : `${esc(costoAjeno)} ${esc(unidad)}`}</button>
        <button type="button" class="ct-cancelar" id="ct-cancelar">Cancelar</button>
      </div>`;
      document.body.appendChild(fondo);
      const cerrar = v => { document.removeEventListener('keydown', teclas, true); fondo.remove(); resolver(v); };
      const teclas = e => { if(e.key === 'Escape'){ e.preventDefault(); cerrar(null); } };
      document.addEventListener('keydown', teclas, true);
      fondo.addEventListener('mousedown', e => { if(e.target === fondo) cerrar(null); });
      fondo.querySelector('#ct-si').onclick = () => cerrar(costoPropio);
      fondo.querySelector('#ct-no').onclick = () => cerrar(costoAjeno);
      fondo.querySelector('#ct-cancelar').onclick = () => cerrar(null);
    });
  }
  const fmtN = n => Number.isInteger(n) ? n : Math.round(n * 100) / 100;
  function textoCosto(c){
    const p = [];
    if(c.sp > 0) p.push(`${fmtN(c.sp)} SP`);
    if(c.cd > 0) p.push(`${fmtN(c.cd)} turno${c.cd === 1 ? '' : 's'} de cooldown`);
    if(c.hp > 0) p.push(`${fmtN(c.hp)} HP`);
    return p.join(' + ') || 'sin costo';
  }
  function textoFlash(costo, o){
    const a = Combatiente.costoFlash(costo, true, o), b = Combatiente.costoFlash(costo, false, o);
    return `${textoCosto(a)} · turno ajeno: ${textoCosto(b)}`;
  }
  function flash(nombre, costo, o){
    o = o || {};
    const a = Combatiente.costoFlash(costo, true, o), b = Combatiente.costoFlash(costo, false, o);
    if(textoCosto(a) === 'sin costo' && textoCosto(b) === 'sin costo') return Promise.resolve(a);   // nada que cobrar: no pregunta
    return pedir(nombre, a, b, {quien: o.quien, textos: [textoCosto(a), textoCosto(b)], pregunta: 'Un ⚡ Flash cuesta el doble fuera del propio turno.'});
  }
  return {pedir, flash, textoFlash, textoCosto};
})();
