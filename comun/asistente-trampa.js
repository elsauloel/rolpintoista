/* =========================================================
   ASISTENTE PARA CREAR (O EDITAR) UNA TRAMPA, PASO A PASO (2026-09-25, pedido del dueño)
   Un menú didáctico para armar una trampa del mapa sin perderse: cómo se llama y qué efecto tiene, qué superficie ocupa, quién la
   dispara, si hace daño (y si contempla la armadura), si deja un estado (elegido de una CUADRÍCULA con una mini descripción de cada
   uno), si se puede evitar con una tirada, cuánto dura la trampa y, al final, un resumen. No conoce el mapa: devuelve un resultado
   neutro y el mapa lo convierte en los campos de la trampa.

   Uso:
     AsistenteTrampa.abrir({
       contexto: 'mapa' | 'habilidad',      // 'habilidad': la trampa la coloca una habilidad al lado del token (se elige radio y cantidad, no se dibuja)
       editando: false,                     // true: es una trampa YA colocada (la forma no se cambia, solo lo demás)
       inicial: {...},                      // valores de partida (ver `ini`)
       estados: [{nombre, detalle, turnos, permanente}],   // los debuffs que se pueden dejar (con su mini descripción)
       colores: ['#3F6FB0', …],
       alTerminar: res => {...},
       alCancelar: () => {...}              // opcional: se cerró sin terminar
     });
   res = {nombre, descripcion, forma: 'flor'|'linea'|'libre', color, alfa, radio, cant (habilidad), amiga, dano ('' o '2d6+1'), contemplaArmadura,
          estado ('' o nombre), estadoTurnos, salvacion: {stat, dif} | null, turnos (0 = sin límite), guardar}
   ========================================================= */
const AsistenteTrampa = (() => {
  const num = v => { const n = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  const FORMAS = [
    {id: 'flor',  icono: '⬡', texto: 'Zona redonda (flor)',  ayuda: 'Una casilla y las que la rodean. Clic en el centro y arrastrá para elegir cuán grande.'},
    {id: 'linea', icono: '➖', texto: 'Línea',                ayuda: 'Una fila de casillas en la dirección que arrastres: un pasillo, un cable, una ráfaga.'},
    {id: 'libre', icono: '✏️', texto: 'Forma libre',          ayuda: 'Pintás casilla por casilla la figura que quieras.'},
  ];
  const SALVACIONES = [
    {id: 'Evasión', texto: 'Evasión'}, {id: 'Fuerza', texto: 'Fuerza'}, {id: 'Res.CC', texto: 'Res. a controles'},
    {id: 'Res.Mg', texto: 'Res. mágica'}, {id: 'Res.Mt', texto: 'Res. mental'},
  ];

  function estilos(){
    if(document.getElementById('at-css')) return;
    const s = document.createElement('style');
    s.id = 'at-css';
    s.textContent = `
#at-fondo{position:fixed;inset:0;z-index:99985;background:rgba(0,0,0,.62);display:flex;align-items:center;justify-content:center;padding:14px}
#at-caja{width:min(640px,100%);max-height:calc(100vh - 28px);display:flex;flex-direction:column;background:#1A1418;border:1px solid #C98545;border-radius:6px;
  box-shadow:0 16px 40px rgba(0,0,0,.7);font-family:"Space Grotesk",system-ui,sans-serif;color:#EDE3D2;text-align:left}
#at-caja header{padding:14px 18px 8px}
#at-caja .at-sup{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#9A867E}
#at-caja .at-tit{font-size:18px;font-weight:700;color:#E0A458;margin-top:2px}
#at-caja .at-pasos{display:flex;gap:4px;margin-top:8px}
#at-caja .at-pasos i{flex:1;height:4px;border-radius:2px;background:#3B2E34}
#at-caja .at-pasos i.hecho{background:#8A6236}#at-caja .at-pasos i.ahora{background:#E0A458}
#at-caja .at-cuerpo{padding:6px 18px 10px;overflow:auto}
#at-caja .at-preg{font-size:16px;font-weight:600;margin:10px 0 4px}
#at-caja .at-ayuda{font-size:13px;color:#B7A79E;margin:0 0 10px;line-height:1.45}
#at-caja input[type=text],#at-caja input[type=number],#at-caja select,#at-caja textarea{width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid #3B2E34;
  border-radius:4px;color:#EDE3D2;padding:9px 10px;font:inherit;font-size:15px}
#at-caja textarea{min-height:70px;resize:vertical}
#at-caja input:focus,#at-caja select:focus,#at-caja textarea:focus{outline:2px solid #C98545}
#at-caja .at-op{display:flex;gap:10px;align-items:flex-start;width:100%;box-sizing:border-box;text-align:left;background:rgba(255,255,255,.03);border:1px solid #3B2E34;
  border-radius:6px;padding:10px 12px;margin-bottom:8px;color:#EDE3D2;cursor:pointer;font:inherit}
#at-caja .at-op:hover{border-color:#8A6236}#at-caja .at-op.on{border-color:#E0A458;background:rgba(224,164,88,.12)}
#at-caja .at-op .ico{font-size:22px;line-height:1.1;flex:none}
#at-caja .at-op b{display:block;font-size:15px}#at-caja .at-op small{display:block;color:#B7A79E;font-size:12.5px;margin-top:2px;line-height:1.35}
#at-caja .at-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#at-caja .at-grid .at-op{margin:0;flex-direction:column;gap:4px}
#at-caja .at-grid .at-op .cab{display:flex;justify-content:space-between;gap:6px;width:100%;align-items:baseline}
#at-caja .at-grid .at-op .cab em{font-style:normal;font-size:11px;color:#9A867E;font-family:"Space Mono",monospace;flex:none}
#at-caja .at-fila{display:flex;gap:8px;align-items:center;margin-bottom:8px}
#at-caja .at-fila > *{min-width:0}
#at-caja .at-fila label{font-size:13px;color:#B7A79E;flex:none}
#at-caja .at-colores{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}
#at-caja .at-color{width:28px;height:28px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0}
#at-caja .at-color.on{border-color:#EDE3D2}
#at-caja .at-sin{display:flex;gap:8px;align-items:flex-start;margin:10px 0;font-size:14px;cursor:pointer;line-height:1.35}
#at-caja .at-sin input{width:auto!important;flex:none;margin:3px 0 0;padding:0}
#at-caja .at-resumen{background:rgba(0,0,0,.3);border:1px solid #3B2E34;border-radius:6px;padding:12px 14px;margin:8px 0;font-size:15px;line-height:1.5}
#at-caja .at-resumen b{color:#E0A458}#at-caja .at-resumen ul{margin:6px 0 0;padding-left:20px}
#at-caja .at-error{min-height:1.3em;color:#E27B72;font-size:13px;margin:4px 0 0}
#at-caja footer{display:flex;gap:8px;justify-content:space-between;align-items:center;padding:10px 18px 14px;border-top:1px solid #2A2126}
#at-caja footer .der{display:flex;gap:8px}
#at-caja .at-btn{background:#2A2126;border:1px solid #3B2E34;border-radius:5px;color:#EDE3D2;padding:9px 16px;cursor:pointer;font:inherit;font-size:14px}
#at-caja .at-btn:hover{border-color:#C98545}#at-caja .at-btn.prim{background:#C98545;border-color:#C98545;color:#1A1418;font-weight:700}
`;
    document.head.appendChild(s);
  }

  function abrir(cfg){
    cfg = cfg || {};
    estilos();
    const ini = cfg.inicial || {};
    const estadosDisp = cfg.estados || [];
    const colores = cfg.colores && cfg.colores.length ? cfg.colores : ['#3F6FB0', '#D07B3A', '#C4485A', '#8FB84F', '#9B7BD4', '#6FA8D8'];
    const editando = !!cfg.editando;
    const deHab = cfg.contexto === 'habilidad';
    // "2d6+1" → {dados, caras, fijo}
    const m = /^(\d+)d(\d+)([+-]\d+)?$/.exec(String(ini.dano || '').trim());
    const est = {
      paso: 0, error: '',
      nombre: ini.nombre || '', descripcion: ini.descripcion || '',
      radio: Math.max(0, Math.min(6, num(ini.radio))), cant: Math.max(1, Math.min(6, num(ini.cant) || 1)),
      forma: ini.forma || 'flor', color: ini.color || colores[0], alfa: Number.isFinite(ini.alfa) ? ini.alfa : 45,
      amiga: !!ini.amiga,
      haceDano: !!m, dados: m ? num(m[1]) : 2, caras: m ? num(m[2]) : 6, fijo: m && m[3] ? num(m[3]) : 0,
      contemplaArmadura: ini.contemplaArmadura !== false,
      aplicaEstado: !!ini.estado, estado: ini.estado || '', estadoTurnos: num(ini.estadoTurnos) || 0,
      seEvita: !!(ini.salvacion && ini.salvacion.stat), salStat: (ini.salvacion && ini.salvacion.stat) || 'Evasión', salDif: (ini.salvacion && ini.salvacion.dif) || 10,
      dura: num(ini.turnos) > 0, turnos: num(ini.turnos) || 3,
      guardar: false,
    };
    const PASOS = deHab ? ['nombre', 'superficie', 'quien', 'dano', 'estado', 'evita', 'resumen'] : ['nombre', 'superficie', 'quien', 'dano', 'estado', 'evita', 'dura', 'resumen'];
    const danoTxt = () => est.haceDano ? `${Math.max(1, est.dados)}d${est.caras}${est.fijo ? (est.fijo > 0 ? '+' : '') + est.fijo : ''}` : '';
    const preset = () => estadosDisp.find(p => p.nombre === est.estado) || null;
    const durEstado = () => { const p = preset(); if(!p) return 0; if(p.permanente) return 0; return est.estadoTurnos > 0 ? est.estadoTurnos : num(p.turnos); };

    function frases(){
      const f = [];
      if(danoTxt()) f.push(`Hace ${danoTxt()} de daño ${est.contemplaArmadura ? '(contempla la armadura: se le resta la Defensa)' : '(directo a la vida: ignora la armadura)'}`);
      if(est.aplicaEstado && preset()){ const d = durEstado(); f.push(`Deja el estado ${preset().nombre}${preset().permanente ? ' (no vence solo)' : ` durante ${d} turno${d === 1 ? '' : 's'}`}`); }
      if(est.seEvita) f.push(`Se evita con ${est.salStat} contra ${est.salDif} (a mano)`);
      if(!f.length) f.push('No hace daño ni deja estados: solo avisa en la Mesa cuando se activa');
      return f;
    }

    function validar(id){
      if(id === 'nombre' && !est.nombre.trim()) return 'Ponele un nombre a la trampa.';
      if(id === 'dano' && est.haceDano){
        if(!(est.dados >= 1)) return 'Poné cuántos dados de daño (1 o más).';
        if(!(est.caras >= 2)) return 'Elegí de cuántas caras es cada dado.';
      }
      if(id === 'estado' && est.aplicaEstado && !est.estado) return 'Elegí qué estado deja (o marcá "No").';
      if(id === 'evita' && est.seEvita && !(est.salDif >= 1)) return 'Poné la dificultad (un número).';
      if(id === 'dura' && est.dura && !(est.turnos >= 1)) return 'Poné cuántos turnos dura (1 o más).';
      return '';
    }

    const fondo = document.createElement('div');
    fondo.id = 'at-fondo';
    document.body.appendChild(fondo);
    const teclas = e => { if(e.key === 'Escape'){ e.stopPropagation(); cerrar(); } };
    const cerrar = fin => { fondo.remove(); document.removeEventListener("keydown", teclas, true); if(fin !== true && cfg.alCancelar) cfg.alCancelar(); };
    document.addEventListener('keydown', teclas, true);

    function cuerpo(id){
      if(id === 'nombre'){
        return `<div class="at-preg">¿Cómo se llama la trampa?</div>
          <input type="text" id="at-nombre" maxlength="40" placeholder="Ej.: Foso con estacas" value="${esc(est.nombre)}">
          <div class="at-preg">¿Qué efecto tiene?</div>
          <p class="at-ayuda">Contalo en pocas palabras: es lo que va a leer la mesa cuando alguien la active. Si lo dejás vacío, armo una descripción con lo que configures en los pasos siguientes.</p>
          <textarea id="at-desc" maxlength="200" placeholder="Ej.: Una red cae desde el techo y deja atrapado a quien la pisa.">${esc(est.descripcion)}</textarea>`;
      }
      if(id === 'superficie' && deHab){
        return `<div class="at-preg">¿De qué tamaño es y cuántas deja?</div>
          <p class="at-ayuda">Esta trampa no se dibuja: la habilidad la coloca sola, <b>oculta y al lado de tu token</b> cada vez que la usás.</p>
          <div class="at-fila"><label style="flex:1.4">Tamaño (radio)</label><input type="number" id="at-radio" min="0" max="6" value="${esc(est.radio)}" style="width:90px"></div>
          <p class="at-ayuda">0 = una sola casilla · 1 = una flor de 1 (7 casillas) · 2 = una flor de 2…</p>
          <div class="at-fila"><label style="flex:1.4">Cuántas por vez</label><input type="number" id="at-cant" min="1" max="6" value="${esc(est.cant)}" style="width:90px"></div>
          <p class="at-ayuda">Cuántas trampas deja de una vez cada vez que se ejecuta la habilidad (1 a 6).</p>`;
      }
      if(id === 'superficie'){
        const formas = editando
          ? '<p class="at-ayuda">La forma y el tamaño de una trampa ya colocada no se cambian: para eso borrala (Supr) y creá otra. Sí podés cambiarle el color.</p>'
          : `<div class="at-preg">¿Qué superficie ocupa?</div><p class="at-ayuda">Al terminar este menú vas a dibujarla en el mapa: el tamaño lo elegís ahí arrastrando.</p>
            ${FORMAS.map(f => `<button type="button" class="at-op${est.forma === f.id ? ' on' : ''}" data-forma="${f.id}"><span class="ico">${f.icono}</span><span><b>${f.texto}</b><small>${f.ayuda}</small></span></button>`).join('')}`;
        return `${formas}
          <div class="at-preg">Color</div>
          <div class="at-colores">${colores.map(c => `<button type="button" class="at-color${est.color === c ? ' on' : ''}" data-color="${c}" style="background:${c}" title="${c}"></button>`).join('')}</div>
          <div class="at-preg">Transparencia</div>
          <input type="range" id="at-alfa" min="10" max="100" step="5" value="${est.alfa}">`;
      }
      if(id === 'quien'){
        return `<div class="at-preg">¿Quién la activa?</div>
          <p class="at-ayuda">Una trampa está <b>oculta</b>: solo la ves vos (y el GM) hasta que alguien la pisa; ahí se muestra a todos y se dispara sola.</p>
          <button type="button" class="at-op${!est.amiga ? ' on' : ''}" data-amiga="0"><span class="ico">🎯</span><span><b>Solo los rivales</b><small>La activan los enemigos de quien la puso. Los aliados pasan sin problemas.</small></span></button>
          <button type="button" class="at-op${est.amiga ? ' on' : ''}" data-amiga="1"><span class="ico">🔥</span><span><b>Todos (fuego amigo)</b><small>La activa cualquiera que la pise: rivales, aliados y hasta quien la puso.</small></span></button>`;
      }
      if(id === 'dano'){
        return `<div class="at-preg">¿Hace daño?</div>
          <label class="at-sin"><input type="checkbox" id="at-haceDano"${est.haceDano ? ' checked' : ''}> Sí, la trampa hace daño a quien la activa (y a los que están dentro si es de área)</label>
          ${est.haceDano ? `<div class="at-preg">¿Cuánto?</div>
            <p class="at-ayuda">Se tira solo cuando se activa. Por ejemplo 2 dados de 6 caras más 1 fijo = 2d6+1.</p>
            <div class="at-fila"><input type="number" id="at-dados" min="1" max="20" value="${esc(est.dados)}" style="width:70px"><label>d</label>
              <select id="at-caras" style="width:90px">${[4, 6, 8, 10, 12, 20].map(c => `<option value="${c}"${est.caras === c ? ' selected' : ''}>${c}</option>`).join('')}</select>
              <label>+</label><input type="number" id="at-fijo" value="${esc(est.fijo)}" style="width:80px"><label>= <b id="at-dvista" style="color:#E0A458">${esc(danoTxt())}</b></label></div>
            <label class="at-sin"><input type="checkbox" id="at-armadura"${est.contemplaArmadura ? ' checked' : ''}> <span><b>Contempla la armadura</b><br><small style="color:#B7A79E">Tildado: al daño se le resta la Defensa de quien lo recibe (como un golpe). Destildado: va directo a la vida y la armadura no sirve (fuego, hielo, electricidad, explosiones…).</small></span></label>` : ''}`;
      }
      if(id === 'estado'){
        return `<div class="at-preg">¿Aplica algún estado?</div>
          <p class="at-ayuda">Por ejemplo dejar a quien la pisa Inmovilizado, Rengo o con Escarcha. Se aplica solo, mientras dure.</p>
          <div class="at-fila"><button type="button" class="at-op${!est.aplicaEstado ? ' on' : ''}" data-aplica="0" style="margin:0"><span><b>No</b></span></button>
            <button type="button" class="at-op${est.aplicaEstado ? ' on' : ''}" data-aplica="1" style="margin:0"><span><b>Sí, deja un estado</b></span></button></div>
          ${est.aplicaEstado ? `<div class="at-preg">¿Cuál?</div><div class="at-grid">${estadosDisp.map(p => `<button type="button" class="at-op${est.estado === p.nombre ? ' on' : ''}" data-estado="${esc(p.nombre)}">
            <span class="cab"><b>${esc(p.nombre)}</b><em>${p.permanente ? 'no vence' : num(p.turnos) + ' turnos'}</em></span><small>${esc(p.detalle || '')}</small></button>`).join('')}</div>
            ${preset() && !preset().permanente ? `<div class="at-preg">¿Cuántos turnos dura el estado?</div>
              <p class="at-ayuda">Cada ⟳ Mantenimiento del GM cuenta un turno.</p>
              <input type="number" id="at-estadoTurnos" min="1" max="20" value="${esc(est.estadoTurnos || num(preset().turnos))}">` : ''}` : ''}`;
      }
      if(id === 'evita'){
        return `<div class="at-preg">¿Se puede evitar con una tirada?</div>
          <p class="at-ayuda">Solo queda escrito en la descripción para que la mesa la resuelva a mano (la tirada no es automática).</p>
          <label class="at-sin"><input type="checkbox" id="at-seEvita"${est.seEvita ? ' checked' : ''}> Sí: quien la activa puede tirar algo para evitarla</label>
          ${est.seEvita ? `<div class="at-fila"><select id="at-salStat" style="flex:1.4">${SALVACIONES.map(s => `<option value="${s.id}"${est.salStat === s.id ? ' selected' : ''}>${s.texto}</option>`).join('')}</select>
            <label>contra</label><input type="number" id="at-salDif" min="1" value="${esc(est.salDif)}" style="width:80px"></div>` : ''}`;
      }
      if(id === 'dura'){
        return `<div class="at-preg">${editando ? '¿Cuántos turnos le quedan?' : '¿Cuánto dura la trampa?'}</div>
          <p class="at-ayuda">Por defecto queda en el mapa hasta que alguien la borre. También puede eliminarse sola después de unos turnos (cada ⟳ Mantenimiento del GM cuenta uno).</p>
          <label class="at-sin"><input type="checkbox" id="at-dura"${est.dura ? ' checked' : ''}> Que se elimine sola después de unos turnos</label>
          ${est.dura ? `<input type="number" id="at-turnos" min="1" max="99" value="${esc(est.turnos)}">` : ''}`;
      }
      const fr = frases();
      return `<div class="at-preg">Así queda tu trampa</div>
        <div class="at-resumen">🪤 <b>${esc(est.nombre.trim())}</b> · ${est.amiga ? '🔥 fuego amigo' : '🎯 solo rivales'}${editando ? '' : deHab ? ' · radio ' + est.radio + ' × ' + est.cant : ' · ' + esc((FORMAS.find(f => f.id === est.forma) || {}).texto || '')}
          <ul>${fr.map(x => `<li>${esc(x)}</li>`).join('')}<li>${est.dura ? `Se elimina sola tras ${est.turnos} turno${est.turnos === 1 ? '' : 's'}` : 'Queda hasta que alguien la borre'}</li></ul>
          ${est.descripcion.trim() ? `<div style="margin-top:8px;color:#B7A79E;font-size:13px">“${esc(est.descripcion.trim())}”</div>` : ''}</div>
        <p class="at-ayuda">${editando ? 'Al confirmar se guardan los cambios en la trampa.' : deHab ? 'Al confirmar se guarda en la habilidad; se coloca sola cada vez que la ejecutes.' : 'Al confirmar te queda la trampa lista: <b>hacé clic en el mapa y arrastrá</b> para dibujarla donde quieras.'}</p>
        ${editando || deHab ? '' : '<label class="at-sin"><input type="checkbox" id="at-guardar"' + (est.guardar ? ' checked' : '') + '> ⭐ Guardarla también como recurrente para usarla de nuevo</label>'}`;
    }

    function dibujar(){
      const id = PASOS[est.paso], ultimo = est.paso === PASOS.length - 1;
      fondo.innerHTML = `<div id="at-caja" role="dialog" aria-modal="true">
        <header><div class="at-sup">Paso ${est.paso + 1} de ${PASOS.length}</div><div class="at-tit">${editando ? 'Editar la trampa' : 'Crear una trampa'}</div>
          <div class="at-pasos">${PASOS.map((_, i) => `<i class="${i < est.paso ? 'hecho' : i === est.paso ? 'ahora' : ''}"></i>`).join('')}</div></header>
        <div class="at-cuerpo">${cuerpo(id)}<div class="at-error">${esc(est.error)}</div></div>
        <footer><button type="button" class="at-btn" data-cancelar="1">Cancelar</button>
          <div class="der">${est.paso > 0 ? '<button type="button" class="at-btn" data-atras="1">◀ Volver</button>' : ''}
            <button type="button" class="at-btn prim" data-sigue="1">${ultimo ? (editando ? '✓ Guardar cambios' : '✓ Crear la trampa') : 'Siguiente ▶'}</button></div></footer></div>`;
      const foco = fondo.querySelector('#at-nombre, #at-dados, #at-turnos');
      if(foco) setTimeout(() => { foco.focus(); if(foco.select) foco.select(); }, 30);
    }

    const resultado = () => ({
      nombre: est.nombre.trim(), descripcion: est.descripcion.trim(), forma: est.forma, color: est.color, alfa: est.alfa, amiga: est.amiga,
      radio: est.radio, cant: est.cant,
      dano: danoTxt(), contemplaArmadura: est.contemplaArmadura,
      estado: est.aplicaEstado && preset() ? est.estado : '', estadoTurnos: est.aplicaEstado && preset() ? durEstado() : 0,
      salvacion: est.seEvita ? {stat: est.salStat, dif: est.salDif} : null,
      turnos: est.dura ? est.turnos : 0, guardar: !!est.guardar,
    });

    const siguiente = () => {
      const p = validar(PASOS[est.paso]);
      if(p){ est.error = p; dibujar(); return; }
      est.error = '';
      if(est.paso === PASOS.length - 1){ const r = resultado(); cerrar(true); if(cfg.alTerminar) cfg.alTerminar(r); return; }
      est.paso++; dibujar();
    };

    fondo.addEventListener('mousedown', e => { if(e.target === fondo) cerrar(); });
    fondo.addEventListener('click', e => {
      const b = e.target.closest('button'); if(!b) return;
      const d = b.dataset;
      if(d.cancelar){ cerrar(); return; }
      if(d.atras){ est.error = ''; est.paso = Math.max(0, est.paso - 1); dibujar(); return; }
      if(d.sigue){ siguiente(); return; }
      if(d.forma){ est.forma = d.forma; dibujar(); return; }
      if(d.color){ est.color = d.color; dibujar(); return; }
      if(d.amiga !== undefined){ est.amiga = d.amiga === '1'; dibujar(); return; }
      if(d.aplica !== undefined){ est.aplicaEstado = d.aplica === '1'; if(!est.aplicaEstado){ est.estado = ''; } est.error = ''; dibujar(); return; }
      if(d.estado){ est.estado = d.estado; est.estadoTurnos = 0; est.error = ''; dibujar(); return; }
    });
    fondo.addEventListener('input', e => {
      const t = e.target;
      if(t.id === 'at-nombre') est.nombre = t.value;
      else if(t.id === 'at-desc') est.descripcion = t.value;
      else if(t.id === 'at-alfa') est.alfa = Math.round(num(t.value));
      else if(t.id === 'at-radio') est.radio = Math.max(0, Math.min(6, Math.round(num(t.value))));
      else if(t.id === 'at-cant') est.cant = Math.max(1, Math.min(6, Math.round(num(t.value)) || 1));
      else if(t.id === 'at-dados'){ est.dados = Math.max(0, Math.round(num(t.value))); const v = fondo.querySelector('#at-dvista'); if(v) v.textContent = danoTxt(); }
      else if(t.id === 'at-fijo'){ est.fijo = Math.round(num(t.value)); const v = fondo.querySelector('#at-dvista'); if(v) v.textContent = danoTxt(); }
      else if(t.id === 'at-estadoTurnos') est.estadoTurnos = Math.max(0, Math.round(num(t.value)));
      else if(t.id === 'at-salDif') est.salDif = Math.round(num(t.value));
      else if(t.id === 'at-turnos') est.turnos = Math.max(0, Math.round(num(t.value)));
    });
    fondo.addEventListener('change', e => {
      const t = e.target;
      if(t.id === 'at-haceDano'){ est.haceDano = t.checked; est.error = ''; dibujar(); }
      else if(t.id === 'at-caras'){ est.caras = num(t.value); const v = fondo.querySelector('#at-dvista'); if(v) v.textContent = danoTxt(); }
      else if(t.id === 'at-armadura') est.contemplaArmadura = t.checked;
      else if(t.id === 'at-seEvita'){ est.seEvita = t.checked; est.error = ''; dibujar(); }
      else if(t.id === 'at-salStat') est.salStat = t.value;
      else if(t.id === 'at-dura'){ est.dura = t.checked; est.error = ''; dibujar(); }
      else if(t.id === 'at-guardar') est.guardar = t.checked;
    });
    fondo.addEventListener('keydown', e => {
      if(e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON'){ e.preventDefault(); siguiente(); }
    });
    dibujar();
  }

  // Texto que se guarda en la trampa (≤ 200 caracteres, el tope del mapa): la descripción que escribió quien la armó o, si la dejó vacía,
  // un resumen de lo que hace; y, si se puede evitar con una tirada, cómo (a mano).
  function detalleFinal(r){
    const partes = [];
    if(r.descripcion) partes.push(r.descripcion.replace(/[.!?]+$/, ''));
    else{
      if(r.dano) partes.push(`${r.dano} de daño${r.contemplaArmadura ? '' : ' directo'}`);
      if(r.estado) partes.push(`deja ${r.estado}${r.estadoTurnos ? ' ' + r.estadoTurnos + ' turnos' : ''}`);
      if(!partes.length) partes.push('solo avisa cuando se activa');
    }
    if(r.salvacion) partes.push(`${r.salvacion.stat} contra ${r.salvacion.dif} la evita (a mano)`);
    return (partes.join('. ') + '.').slice(0, 200);
  }
  return {abrir, detalleFinal};
})();
