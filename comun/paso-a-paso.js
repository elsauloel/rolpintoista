/* =========================================================
   PASO-A-PASO — la ventana única para crear y editar cualquier cosa paso a paso (2026-10-02, pedido del dueño: "visual y
   conceptualmente unificado"; plan en docs/plan-paso-a-paso.md). La referencia es el asistente de creeps de GM Tools.
   - Cabecera: "<titulo> · paso N de M: <Nombre>" y Cancelar.
   - Pestañas: "1. QUÉ ES", "2. ATRIBUTOS"…; un clic salta a ese paso (salvo que `puedeIr(i)` diga por qué no todavía).
   - Cuerpo: la ayuda del paso (una línea que explica qué se decide ahí) y su contenido (`html`).
   - Pie: «← Atrás» · «Siguiente →» y, al editar, **Guardar** siempre visible; al crear, el último paso tiene «✔ Crear».
   PasoAPaso.abrir(o) → api. o:
     titulo: 'Crear un creep' | 'Editar creep' (o una función que lo devuelve),
     crear: true (crear) | false (editar),
     pasos: [{id, nombre, ayuda?, html(api) → string, alMontar?(cuerpo, api)}] o una función que devuelve esa lista (pasos que dependen
       de lo elegido),
     inicio?: índice o id del paso inicial,
     puedeIr?(i, api) → '' o el motivo por el que todavía no se puede ir a ese paso (se muestra; no se cambia de paso),
     alClic?(e, api), alInput?(e, api), alCambio?(e, api): los eventos del contenido (el elemento real es e.composedPath()[0]),
     alGuardar?(api) / alCrear?(api) → false para no cerrar (puede ser una promesa),
     alCancelar?(api), confirmarCancelar?: texto (o función → texto, '' = no preguntar) antes de descartar (por defecto, solo al crear),
     extras?: [{id, texto, alClic(api)}] botones más en el pie (a la izquierda de Siguiente),
     textoCrear?, textoGuardar?, ancho? (px, 720), z? (z-index, 90), contenedor? (un elemento o un ShadowRoot: adentro de los recuadros
       del mapa; por defecto, document.body).
   api: {raiz, cuerpo, paso() (índice), pasoId(), irA(i|id), redibujar(), aviso(texto), cerrar(), abierto()}.
   Sin dependencias. El contenido usa sus propias clases; acá vienen solo algunas de base: .pap-campo (con su label), .pap-fila,
   .pap-nota, .pap-boton.
   ========================================================= */
const PasoAPaso = (() => {
  const CSS = `
.pap-fondo{position:fixed;inset:0;background:rgba(8,5,7,.78);backdrop-filter:blur(3px);overflow:auto;padding:24px;box-sizing:border-box;
  --pap-panel:#1A1418;--pap-panel2:#221A1E;--pap-linea:#3B2E34;--pap-linea2:#2A2126;--pap-cobre:#C98545;--pap-laton:#E0A458;--pap-papel:#EDE3D2;--pap-tenue:#9A867E;--pap-peligro:#D4574E}
.pap{max-width:720px;margin:4vh auto;border:1px solid var(--pap-linea);border-top:3px solid var(--pap-cobre);background:var(--pap-panel);color:var(--pap-papel);
  font-family:"Fraunces",Georgia,serif;font-size:14px;box-shadow:0 18px 40px -12px rgba(0,0,0,.7)}
.pap *{box-sizing:border-box}
.pap-cab{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 15px;border-bottom:1px solid var(--pap-linea)}
.pap-cab h3{margin:0;font-family:"Fraunces",Georgia,serif;font-size:17px;font-weight:600;color:var(--pap-papel)}
.pap-btn{font-family:"Space Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:9px 16px;cursor:pointer;
  border:1px solid var(--pap-linea);border-radius:3px;background:none;color:var(--pap-papel);white-space:nowrap}
.pap-btn:hover{border-color:var(--pap-cobre)}
.pap-btn:disabled{opacity:.4;cursor:default}
.pap-btn.primario{background:var(--pap-cobre);border-color:var(--pap-cobre);color:#180F08;font-weight:700}
.pap-btn.primario:hover{background:var(--pap-laton)}
.pap-btn.tenue{color:var(--pap-tenue)}
.pap-btn.chico{font-size:10.5px;padding:3px 8px;color:var(--pap-tenue)}
.pap-btn.chico:hover{color:var(--pap-laton)}
.pap-cuerpo{padding:14px 16px}
.pap-pestanas{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.pap-pestanas .pap-btn{padding:4px 9px;font-size:12px}
.pap-ayuda{font-family:"Space Mono",ui-monospace,monospace;font-size:11.5px;color:var(--pap-tenue);margin:0 0 12px;line-height:1.5}
.pap-aviso{font-family:"Space Mono",ui-monospace,monospace;font-size:11.5px;color:var(--pap-laton);border:1px solid var(--pap-cobre);background:rgba(201,133,69,.12);
  border-radius:3px;padding:6px 10px;margin:0 0 12px}
.pap-pie{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 15px;border-top:1px solid var(--pap-linea)}
.pap-pie .der{display:flex;gap:8px;flex-wrap:wrap;margin-left:auto}
.pap-campo{margin-bottom:12px}
.pap-campo > label{display:block;font-family:"Space Mono",ui-monospace,monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--pap-tenue);margin-bottom:4px}
.pap-fila{display:flex;gap:12px;flex-wrap:wrap}
.pap-nota{font-family:"Space Mono",ui-monospace,monospace;font-size:11px;color:var(--pap-tenue);margin-top:4px}
.pap input[type=text],.pap input[type=number],.pap select,.pap textarea{width:100%;background:#120D10;border:1px solid var(--pap-linea);border-radius:3px;color:var(--pap-papel);
  padding:8px 10px;font-family:inherit;font-size:14px}
.pap input:focus,.pap select:focus,.pap textarea:focus{outline:2px solid var(--pap-cobre);outline-offset:1px;border-color:var(--pap-cobre)}
.pap input[type=checkbox],.pap input[type=radio]{width:16px;height:16px;accent-color:var(--pap-cobre)}
.pap-boton{font-family:"Space Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:7px 12px;cursor:pointer;
  border:1px dashed var(--pap-cobre);border-radius:3px;background:rgba(201,133,69,.08);color:var(--pap-laton)}
.pap-boton:hover{background:rgba(201,133,69,.2)}
`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  function ponerCss(dondeVive){
    const raiz = dondeVive instanceof ShadowRoot ? dondeVive : document.head;
    if(raiz.querySelector && raiz.querySelector('style[data-pap]')) return;
    const st = document.createElement('style');
    st.dataset.pap = '1';
    st.textContent = CSS;
    raiz.appendChild(st);
  }
  // Escape cancela la ventana de paso a paso solo si es la de más arriba (puede tener otra ventana encima: el editor de un arma, de
  // una habilidad…, que cierra la suya): se mira qué hay en el centro de la pantalla.
  const abiertos = [];
  const estaArriba = fondo => {
    const r = fondo.getRootNode(), x = innerWidth / 2, y = innerHeight / 2;
    const el = r.elementFromPoint ? r.elementFromPoint(x, y) : document.elementFromPoint(x, y);
    return !!el && fondo.contains(el);
  };
  document.addEventListener('keydown', e => {
    if(e.key !== 'Escape' || !abiertos.length) return;
    const arriba = [...abiertos].reverse().find(c => estaArriba(c.fondo));
    if(!arriba) return;
    e.stopPropagation();
    arriba.cancelar();
  }, true);

  function abrir(o){
    const contenedor = o.contenedor || document.body;
    ponerCss(contenedor);
    const fondo = document.createElement('div');
    fondo.className = 'pap-fondo';
    fondo.style.zIndex = String(o.z || 90);
    fondo.innerHTML = `<div class="pap" style="max-width:${Math.round(o.ancho || 720)}px"></div>`;
    contenedor.appendChild(fondo);
    const caja = fondo.firstElementChild;
    const lista = () => (typeof o.pasos === 'function' ? o.pasos() : o.pasos) || [];
    let actual = 0, avisoTxt = '', vivo = true, ocupado = false;
    const api = {
      raiz: caja, cuerpo: null,
      paso: () => actual,
      pasoId: () => (lista()[actual] || {}).id,
      abierto: () => vivo,
      irA, redibujar, aviso, cerrar,
    };
    const indice = x => typeof x === 'number' ? x : Math.max(0, lista().findIndex(p => p.id === x));
    function aviso(t){ avisoTxt = t || ''; redibujar(); }
    function irA(x){
      const i = Math.max(0, Math.min(lista().length - 1, indice(x)));
      if(i !== actual && o.puedeIr){ const motivo = o.puedeIr(i, api); if(motivo){ aviso(motivo); return; } }
      actual = i; avisoTxt = '';
      redibujar();
      fondo.scrollTop = 0;
    }
    function redibujar(){
      if(!vivo) return;
      const pasos = lista();
      if(actual >= pasos.length) actual = Math.max(0, pasos.length - 1);
      const p = pasos[actual] || {nombre: ''};
      const titulo = typeof o.titulo === 'function' ? o.titulo(api) : o.titulo;
      const ultimo = actual === pasos.length - 1;
      const scroll = fondo.scrollTop;
      caja.innerHTML = `<div class="pap-cab"><h3>${esc(titulo)} · paso ${actual + 1} de ${pasos.length}: ${esc(p.nombre)}</h3>
          <button type="button" class="pap-btn chico" data-pap="cancelar">Cancelar</button></div>
        <div class="pap-cuerpo"><div class="pap-pestanas">${pasos.map((x, i) => `<button type="button" class="pap-btn${i === actual ? ' primario' : ''}" data-pap-paso="${i}">${i + 1}. ${esc(x.nombre)}</button>`).join('')}</div>
          ${avisoTxt ? `<div class="pap-aviso">${esc(avisoTxt)}</div>` : ''}${p.ayuda ? `<p class="pap-ayuda">${p.ayuda}</p>` : ''}
          <div class="pap-paso">${p.html ? p.html(api) : ''}</div></div>
        <div class="pap-pie"><button type="button" class="pap-btn tenue" data-pap="atras"${actual === 0 ? ' disabled' : ''}>← Atrás</button>
          <span class="der">${(o.extras || []).map(x => `<button type="button" class="pap-btn" data-pap-extra="${esc(x.id)}">${esc(x.texto)}</button>`).join('')}
            ${ultimo ? '' : `<button type="button" class="pap-btn${o.crear ? ' primario' : ''}" data-pap="sig">Siguiente →</button>`}
            ${o.crear ? (ultimo ? `<button type="button" class="pap-btn primario" data-pap="crear">${esc(o.textoCrear || '✔ Crear')}</button>` : '')
              : `<button type="button" class="pap-btn primario" data-pap="guardar">${esc(o.textoGuardar || 'Guardar')}</button>`}</span></div>`;
      api.cuerpo = caja.querySelector('.pap-paso');
      fondo.scrollTop = scroll;
      if(p.alMontar) p.alMontar(api.cuerpo, api);
    }
    function cerrar(){
      if(!vivo) return;
      vivo = false;
      fondo.remove();
      const k = abiertos.indexOf(control);
      if(k >= 0) abiertos.splice(k, 1);
    }
    function cancelar(){
      const pregunta = typeof o.confirmarCancelar === 'function' ? o.confirmarCancelar(api) : o.confirmarCancelar !== undefined ? o.confirmarCancelar : (o.crear ? '¿Cancelar? Lo que estás armando se descarta.' : '');
      if(pregunta && !confirm(pregunta)) return;
      if(o.alCancelar) o.alCancelar(api);
      cerrar();
    }
    async function terminar(fn){
      if(ocupado || !fn){ if(!fn) cerrar(); return; }
      ocupado = true;
      try{ if(await fn(api) !== false) cerrar(); }
      finally{ ocupado = false; }
    }
    const control = {cancelar, fondo};
    abiertos.push(control);
    const objetivo = e => (e.composedPath && e.composedPath()[0]) || e.target;
    caja.addEventListener('click', e => {
      const el = objetivo(e);
      const b = el.closest && el.closest('[data-pap],[data-pap-paso],[data-pap-extra]');
      if(b && caja.contains(b)){
        e.stopPropagation();
        if(b.dataset.papPaso !== undefined){ irA(+b.dataset.papPaso); return; }
        if(b.dataset.papExtra !== undefined){ const x = (o.extras || []).find(z => z.id === b.dataset.papExtra); if(x && x.alClic) x.alClic(api); return; }
        const que = b.dataset.pap;
        if(que === 'atras') irA(actual - 1);
        else if(que === 'sig') irA(actual + 1);
        else if(que === 'cancelar') cancelar();
        else if(que === 'guardar') terminar(o.alGuardar);
        else if(que === 'crear') terminar(o.alCrear);
        return;
      }
      if(o.alClic) o.alClic(e, api);
    });
    if(o.alInput) caja.addEventListener('input', e => o.alInput(e, api));
    if(o.alCambio) caja.addEventListener('change', e => o.alCambio(e, api));
    actual = o.inicio !== undefined ? indice(o.inicio) : 0;
    redibujar();
    return api;
  }
  return {abrir, CSS};
})();
