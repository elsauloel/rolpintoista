/* =========================================================
   ASISTENTE-MAPA — «＋ Mapa nuevo» paso a paso (2026-10-02, tanda 6 de docs/plan-paso-a-paso.md), en la ventana común
   (comun/paso-a-paso.js). Antes eran dos cartelitos de texto distintos (el del mapa y el de GM Tools).
   Pasos: Nombre → Creeps (cuáles se mudan a este mapa; solo si se pasan creeps) → Listo («✔ Crear el mapa»).
   No escribe nada: quien lo abre crea el mapa y muda los creeps a su manera.
     AsistenteMapa.abrir({
       nombre: 'Mapa 3',                                   // sugerido (opcional)
       creeps: [{id, nombre, donde}],                      // opcional: donde = 'Reserva' o el nombre de su mapa
       marcados: ['id'],                                   // opcional: los que arrancan marcados
       alCrear: async ({nombre, creeps: [ids]}) => {...},  // false = no cerrar
       alCancelar: () => {...},
       z,
     });
   ========================================================= */
const AsistenteMapa = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  let cssPuesto = false;
  function estilos(){
    if(cssPuesto) return;
    cssPuesto = true;
    const s = document.createElement('style');
    s.textContent = `
.am-c .am-grupo{margin:0 0 14px}
.am-c .am-grupo h4{margin:0 0 6px;font-family:"Space Mono",ui-monospace,monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--pap-tenue,#9A867E)}
.am-c .am-lista{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px}
.am-c .am-creep{display:flex;gap:8px;align-items:center;padding:7px 10px;border:1px solid var(--pap-linea,#3B2E34);border-radius:3px;cursor:pointer;font-size:14px}
.am-c .am-creep input{width:16px;height:16px;flex:none;margin:0}
.am-c .am-creep.on{border-color:var(--pap-laton,#E0A458);background:rgba(224,164,88,.1)}
.am-c .am-resumen{font-size:15px;line-height:1.6}
.am-c .am-resumen b{color:var(--pap-laton,#E0A458)}`;
    document.head.appendChild(s);
  }

  function abrir(cfg){
    cfg = cfg || {};
    estilos();
    const creeps = cfg.creeps || [];
    const st = {nombre: String(cfg.nombre || ''), creeps: new Set(cfg.marcados || [])};
    const grupos = () => {
      const g = new Map();
      creeps.forEach(c => { const d = c.donde || 'Reserva'; if(!g.has(d)) g.set(d, []); g.get(d).push(c); });
      return [...g.entries()].sort((a, b) => (a[0] === 'Reserva' ? -1 : b[0] === 'Reserva' ? 1 : a[0].localeCompare(b[0], 'es')));
    };
    const pasos = () => [
      {id: 'nombre', nombre: 'Nombre', ayuda: '<b>¿Cómo se llama?</b> Un mapa es un escenario: la cueva, la taberna, la cubierta del barco. Los jugadores no lo ven hasta que lo publiques.',
        html: () => `<div class="am-c"><div class="pap-campo"><label>Nombre del mapa</label><input id="am-nombre" maxlength="40" placeholder="Ej.: Cueva de los goblins" value="${esc(st.nombre)}"></div></div>`,
        alMontar: (c, a) => { const n = a.raiz.querySelector('#am-nombre'); if(n) setTimeout(() => { n.focus(); n.select(); }, 30); }},
      ...(creeps.length ? [{id: 'creeps', nombre: 'Creeps', ayuda: '<b>¿Qué creeps viven acá?</b> Los que marques se mudan a este mapa (si tenían token en otro mapa, el token se muda con ellos, oculto). Se puede dejar para después.',
        html: () => `<div class="am-c">${grupos().map(([donde, l]) => `<div class="am-grupo"><h4>${esc(donde === 'Reserva' ? '🎒 Reserva (en ningún mapa)' : '🗺 En «' + donde + '»')}</h4><div class="am-lista">${l.map(c =>
          `<label class="am-creep${st.creeps.has(c.id) ? ' on' : ''}"><input type="checkbox" data-am-creep="${esc(c.id)}"${st.creeps.has(c.id) ? ' checked' : ''}> ${esc(c.nombre)}</label>`).join('')}</div></div>`).join('')}
          <div class="pap-fila"><button type="button" class="pap-boton" data-am-todos="Reserva">Marcar toda la Reserva</button><button type="button" class="pap-boton" data-am-todos="">Desmarcar todos</button></div></div>`}] : []),
      {id: 'listo', nombre: 'Listo', ayuda: '<b>Así queda.</b> Después le cargás el fondo desde 🗺 Mapas, en el mapa.',
        html: () => `<div class="am-c"><div class="am-resumen">🗺 <b>${esc(st.nombre.trim() || '—')}</b><br>${st.creeps.size
          ? `Se mudan ${st.creeps.size} creep${st.creeps.size === 1 ? '' : 's'}: ${esc(creeps.filter(c => st.creeps.has(c.id)).map(c => c.nombre).join(', '))}`
          : 'Sin creeps por ahora.'}</div></div>`},
    ];
    const falta = () => st.nombre.trim() ? '' : 'Ponele un nombre al mapa.';
    const crear = () => {
      const f = falta();
      if(f){ api.irA(0); api.aviso(f); return false; }
      return cfg.alCrear ? cfg.alCrear({nombre: st.nombre.trim().slice(0, 40), creeps: [...st.creeps]}) : undefined;
    };
    const api = PasoAPaso.abrir({
      titulo: '＋ Mapa nuevo', crear: true, z: cfg.z || 95, textoCrear: '✔ Crear el mapa',
      pasos,
      puedeIr: i => i > 0 ? falta() : '',
      alInput: e => { if(e.target.id === 'am-nombre') st.nombre = e.target.value; },
      alCambio: e => {
        const id = e.target.dataset.amCreep;
        if(id === undefined) return;
        if(e.target.checked) st.creeps.add(id); else st.creeps.delete(id);
        const l = e.target.closest('.am-creep'); if(l) l.classList.toggle('on', e.target.checked);
      },
      alClic: e => {
        const b = e.target.closest('[data-am-todos]'); if(!b) return;
        if(b.dataset.amTodos) creeps.filter(c => (c.donde || 'Reserva') === b.dataset.amTodos).forEach(c => st.creeps.add(c.id));
        else st.creeps.clear();
        api.redibujar();
      },
      alTecla: e => {
        if(e.key !== 'Enter' || e.target.tagName === 'BUTTON') return;
        e.preventDefault();
        if(api.paso() < pasos().length - 1) api.irA(api.paso() + 1);
        else Promise.resolve(crear()).then(r => { if(r !== false && api.abierto()) api.cerrar(); });
      },
      confirmarCancelar: '',
      alCrear: () => crear(),
      alCancelar: () => { if(cfg.alCancelar) cfg.alCancelar(); },
    });
    return api;
  }
  return {abrir};
})();
