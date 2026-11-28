/* =========================================================
   ATAJOS — los atajos de teclado de las habilidades y los consumibles (dueño, 2026-11-03)
   En la Botonera del mapa (personajes) y en las ⚔ Acciones de un creep, a la izquierda de cada habilidad y de cada consumible hay un
   cuadradito: se toca y se aprieta un número (1–9 o 0) para asignárselo; Supr o Backspace lo borra. Después, con ese token
   seleccionado en el mapa, apretar el número (una habilidad) o Shift + número (un consumible) pregunta «¿Ejecutar X?» y hace lo mismo
   que tocar su botón. Los números se guardan en cada personaje (S.meta.atajos) y en cada creep (sc.atajos), no por usuario.
   Forma guardada: {hab: {'3': idHabilidad}, cons: {'1': 'cinturon:idItem'}} (en un creep, el consumible es solo el id del cinturón).
   Acá vive lo que no depende de la pantalla: leer la tecla, asignar (un número, una sola cosa; una cosa, un solo número), qué hace
   una tecla, y el dibujo del cuadradito. El mapa lo engancha en vtt-hexgrid/js/93-atajos.js.
   ========================================================= */
const Atajos = (() => {
  const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[ch]));
  // La tecla de un evento → {n: '3', shift} | null. Lee `code` (Digit3 / Numpad3): anda en cualquier teclado y con Shift
  // (con Shift, `key` sería «#» o «·» según el teclado). Con Ctrl, Alt o Cmd no: son del navegador (Ctrl+1 cambia de pestaña).
  function teclaDe(e){
    if(!e || e.ctrlKey || e.altKey || e.metaKey) return null;
    const m = /^(?:Digit|Numpad)([0-9])$/.exec(String(e.code || ''));
    return m ? {n: m[1], shift: !!e.shiftKey} : null;
  }
  const copia = at => ({hab: {...((at && at.hab) || {})}, cons: {...((at && at.cons) || {})}});
  // El número que tiene algo ('' si ninguno).
  function numeroDe(at, tipo, id){
    const m = (at && at[tipo]) || {};
    return Object.keys(m).find(k => m[k] === id) || '';
  }
  // Asignar `n` a `id` (o sacárselo con n vacío): el número deja de estar en otra cosa del mismo tipo, y la cosa pierde el número que tenía.
  function asignar(at, tipo, id, n){
    const out = copia(at), m = out[tipo === 'cons' ? 'cons' : 'hab'];
    Object.keys(m).forEach(k => { if(m[k] === id) delete m[k]; });
    if(n !== null && n !== undefined && TECLAS.includes(String(n))) m[String(n)] = id;
    return out;
  }
  const quitar = (at, tipo, id) => asignar(at, tipo, id, null);
  // Saca los números de lo que ya no está (una habilidad borrada, un consumible gastado o tirado). → {at, cambio}
  function limpiar(at, existe){
    const out = copia(at);
    let cambio = false;
    ['hab', 'cons'].forEach(t => Object.keys(out[t]).forEach(k => { if(!existe(t, out[t][k])){ delete out[t][k]; cambio = true; } }));
    return {at: out, cambio};
  }
  // Qué hace una tecla: {tipo, n, id} | {tipo, n, vacio: true} (nada asignado, o lo asignado ya no está). Sin Shift, una habilidad;
  // con Shift, un consumible.
  function accion(at, tecla, existe){
    if(!tecla) return null;
    const tipo = tecla.shift ? 'cons' : 'hab';
    const id = ((at && at[tipo]) || {})[tecla.n];
    if(!id) return {tipo, n: tecla.n, vacio: true};
    if(typeof existe === 'function' && !existe(tipo, id)) return {tipo, n: tecla.n, vacio: true, perdido: true};
    return {tipo, n: tecla.n, id};
  }
  const etiqueta = (tipo, n) => n ? (tipo === 'cons' ? '⇧' + n : n) : '';
  const AYUDA = {hab: 'Atajo: tocá y apretá un número (1–9, 0) · Supr lo borra. Después, con el token seleccionado, ese número la ejecuta',
    cons: 'Atajo: tocá y apretá un número (1–9, 0) · Supr lo borra. Después, con el token seleccionado, Shift + ese número lo usa'};
  // El cuadradito: punteado vacío; naranja con el número (⇧ en los consumibles).
  function cuadroHtml(at, tipo, id){
    const n = numeroDe(at, tipo, id);
    return `<button type="button" class="atajo-cuadro${n ? ' on' : ''}" data-atajo="${esc(tipo)}:${esc(id)}" title="${esc(AYUDA[tipo] || AYUDA.hab)}">${esc(etiqueta(tipo, n))}</button>`;
  }
  const CSS = `.atajo-cuadro{flex:none;align-self:center;min-width:28px;height:28px;padding:0 4px;margin-right:10px;border:1px dashed #6b5646;border-radius:6px;background:transparent;color:#a08a76;font:700 14px/1 "Space Grotesk",system-ui,sans-serif;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.atajo-cuadro:hover{border-color:#e3a85a;color:#e3a85a}
.atajo-cuadro.on{border:1.5px solid #e3a85a;background:#e3a85a;color:#1a1412}
.atajo-cuadro.esperando{border:2px solid #f0c27a;background:#3a2e27;color:#f0c27a;animation:atajo-late 1s ease-in-out infinite}
@keyframes atajo-late{50%{box-shadow:0 0 0 4px rgba(227,168,90,.25)}}
.atajo-fila{display:flex;align-items:center;min-width:0}`;
  return {TECLAS, teclaDe, numeroDe, asignar, quitar, limpiar, accion, etiqueta, cuadroHtml, CSS};
})();
if(typeof window !== 'undefined') window.Atajos = Atajos;
