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
   res = {nombre, descripcion, forma: 'flor'|'linea'|'libre', color, alfa, radio, largo, cant (habilidad), amiga, dano ('' o '2d6+1'), contemplaArmadura,
          estado ('' o nombre), estadoTurnos, salvacion: {stat, dif} | null, turnos (0 = sin límite), guardar}

   Una sola forma de trampa (P123, 2026-09-29): una habilidad arma la trampa con los mismos pasos que el mapa (forma y tamaño,
   color, daño, estado, zona que deja al dispararse, cuánto dura…) salvo el teleport (su destino se marca con un clic en el mapa)
   y la forma libre (se pinta a mano). `aTrampa(res)` lo pasa a la forma única de comun/plantillas.js (lo que se guarda en
   `trampaColocar` y en el catálogo) e `inicialDe(trampa)` hace el camino inverso; `resumenTexto(trampa)` la describe corta.
   Desde 2026-10-02 (tanda 5 de docs/plan-paso-a-paso.md) se abre en la ventana común paso a paso (comun/paso-a-paso.js): título
   con el paso, pestañas con el nombre de cada paso que saltan (hasta donde lo anterior está completo), Atrás/Siguiente.
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
    {id: 'Res.Esp', texto: 'Res. especial'}, {id: 'Res.Mt', texto: 'Res. mental'},
  ];

  function estilos(){
    if(document.getElementById('at-css')) return;
    const s = document.createElement('style');
    s.id = 'at-css';
    s.textContent = `
.at-c .at-preg{font-size:16px;font-weight:600;margin:10px 0 4px}
.at-c .at-ayuda{font-size:13px;color:#B7A79E;margin:0 0 10px;line-height:1.45}
.at-c input[type=text],.at-c input[type=number],.at-c select,.at-c textarea{width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid #3B2E34;
  border-radius:4px;color:#EDE3D2;padding:9px 10px;font:inherit;font-size:15px}
.at-c textarea{min-height:70px;resize:vertical}
.at-c input:focus,.at-c select:focus,.at-c textarea:focus{outline:2px solid #C98545}
.at-c .at-op{display:flex;gap:10px;align-items:flex-start;width:100%;box-sizing:border-box;text-align:left;background:rgba(255,255,255,.03);border:1px solid #3B2E34;
  border-radius:6px;padding:10px 12px;margin-bottom:8px;color:#EDE3D2;cursor:pointer;font:inherit}
.at-c .at-op:hover{border-color:#8A6236}.at-c .at-op.on{border-color:#E0A458;background:rgba(224,164,88,.12)}
.at-c .at-op .ico{font-size:22px;line-height:1.1;flex:none}
.at-c .at-op b{display:block;font-size:15px}.at-c .at-op small{display:block;color:#B7A79E;font-size:12.5px;margin-top:2px;line-height:1.35}
.at-c .at-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px}
.at-c .at-grid .at-op{margin:0;flex-direction:column;gap:4px}
.at-c .at-grid .at-op .cab{display:flex;justify-content:space-between;gap:6px;width:100%;align-items:baseline}
.at-c .at-grid .at-op .cab em{font-style:normal;font-size:11px;color:#9A867E;font-family:"Space Mono",monospace;flex:none}
.at-c .at-fila{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.at-c .at-fila > *{min-width:0}
.at-c .at-fila label{font-size:13px;color:#B7A79E;flex:none}
.at-c .at-colores{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}
.at-c .at-color{width:28px;height:28px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0}
.at-c .at-color.on{border-color:#EDE3D2}
.at-c .at-sin{display:flex;gap:8px;align-items:flex-start;margin:10px 0;font-size:14px;cursor:pointer;line-height:1.35}
.at-c .at-sin input{width:auto!important;flex:none;margin:3px 0 0;padding:0}
.at-c .at-resumen{background:rgba(0,0,0,.3);border:1px solid #3B2E34;border-radius:6px;padding:12px 14px;margin:8px 0;font-size:15px;line-height:1.5}
.at-c .at-resumen b{color:#E0A458}.at-c .at-resumen ul{margin:6px 0 0;padding-left:20px}
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
      error: '',
      nombre: ini.nombre || '', descripcion: ini.descripcion || '',
      radio: Math.max(0, Math.min(6, num(ini.radio))), cant: Math.max(1, Math.min(6, num(ini.cant) || 1)), largo: Math.max(1, Math.min(20, num(ini.largo) || 3)),
      forma: ini.forma || 'flor', color: ini.color || colores[0], alfa: Number.isFinite(ini.alfa) ? ini.alfa : 45,
      amiga: !!ini.amiga,
      haceDano: !!m, dados: m ? num(m[1]) : 2, caras: m ? num(m[2]) : 6, fijo: m && m[3] ? num(m[3]) : 0,
      contemplaArmadura: ini.contemplaArmadura !== false,
      aplicaEstado: !!ini.estado, estado: ini.estado || '', estadoTurnos: num(ini.estadoTurnos) || 0,
      estadoPropio: ini.estado || '', estadoMods: Array.isArray(ini.estadoMods) ? ini.estadoMods : null,   // un estado propio (fuera de la lista) que ya traía
      estadoStacks: num(ini.estadoStacks) || 0, estadoDeStacks: ini.estado || '',   // los stacks que ya traía (Veneno, Sangrado): se conservan si no cambia el estado
      seEvita: !!(ini.salvacion && ini.salvacion.stat), salStat: (ini.salvacion && (ini.salvacion.etq || ini.salvacion.stat)) || 'Evasión', salDif: (ini.salvacion && ini.salvacion.dif) || 10,
      salQue: (ini.salvacion && ini.salvacion.que) || 'todo', salLogra: (ini.salvacion && ini.salvacion.logra) || '',   // el texto al resistirla se conserva
      elemento: ini.elemento || '', lento: ini.lento || 0, pierdeSp: ini.pierdeSp || '', danoZona: ini.danoZona || '', cadena: ini.cadena || null,   // el elemento del daño y el terreno lento (2026-10-04) se conservan   // qué evita: 'todo' | 'efecto' (el estado) | 'mitad' (la mitad del daño)
      dura: num(ini.turnos) > 0, turnos: num(ini.turnos) || 3,
      teleport: !!ini.teleport,
      // Trampa persistente (2026-09-28, pedido del dueño): al dispararse, además de su efecto de siempre, queda
      // como una zona con el mismo daño/estado — ver comun/CLAUDE.md "Trampas persistentes". Desde P123 (2026-09-29)
      // también para las que coloca una habilidad.
      dejaZona: !!ini.dejaZona, zonaTurnos: num(ini.zonaTurnos) || 3, zonaEnMant: ini.zonaEnMant !== false, zonaCadaPaso: !!ini.zonaCadaPaso,
      zonaSeResiste: !!ini.zonaResistStat, zonaResistStat: ini.zonaResistStat || 'resmg', zonaResistValor: num(ini.zonaResistValor) || 12,
      // Dificultad para detectarla (2026-10-02, dueño, P145): con Percepción aumentada se tira contra este número. En el mapa, un número
      // (trampa común: 8; un espacio de diseño: trampas de buena o mala calidad); en una habilidad, sale de quien la coloca (su Destreza
      // —trampas físicas— o su Efecto especial —mágicas—).
      detectar: Math.max(1, Math.round(num(ini.detectar)) || 8), detectarStat: ini.detectarStat === 'dmgesp' ? 'dmgesp' : 'des',
      guardar: false,
    };
    const ZSTATS = [['resmg', 'Res.Esp'], ['resm', 'Res.Mt'], ['eva', 'Evasión'], ['con', 'Constitución'], ['fue', 'Fuerza'], ['agl', 'Agilidad'], ['des', 'Destreza'], ['esp', 'Especial']];
    const PASOS = deHab ? ['nombre', 'superficie', 'quien', 'dano', 'estado', 'persistente', 'evita', 'detecta', 'dura', 'resumen'] : ['nombre', 'superficie', 'quien', 'dano', 'estado', 'persistente', 'teleport', 'evita', 'detecta', 'dura', 'resumen'];
    const danoTxt = () => est.haceDano ? `${Math.max(1, est.dados)}d${est.caras}${est.fijo ? (est.fijo > 0 ? '+' : '') + est.fijo : ''}` : '';
    // La lista de estados, más el estado propio que ya traía la trampa si no está en ella (para no perderlo al re-editar).
    const listaEstados = () => est.estadoPropio && !estadosDisp.some(p => p.nombre === est.estadoPropio)
      ? [...estadosDisp, {nombre: est.estadoPropio, detalle: '(estado propio que ya traía esta trampa)', turnos: est.estadoTurnos || 0, permanente: false}] : estadosDisp;
    const preset = () => listaEstados().find(p => p.nombre === est.estado) || null;
    const durEstado = () => { const p = preset(); if(!p) return 0; if(p.permanente) return 0; return est.estadoTurnos > 0 ? est.estadoTurnos : num(p.turnos); };

    function frases(){
      const f = [];
      if(danoTxt()) f.push(`Hace ${danoTxt()} de daño ${est.contemplaArmadura ? '(contempla la armadura: se le resta la Defensa)' : '(directo a la vida: ignora la armadura)'}`);
      if(est.aplicaEstado && preset()){ const d = durEstado(); f.push(`Deja el estado ${preset().nombre}${preset().permanente ? ' (no vence solo)' : ` durante ${d} turno${d === 1 ? '' : 's'}`}`); }
      if(est.dejaZona) f.push(`Al dispararse queda ${est.zonaTurnos} turno${est.zonaTurnos === 1 ? '' : 's'} como zona con el mismo efecto${est.zonaSeResiste ? ` (se resiste con ${(ZSTATS.find(s => s[0] === est.zonaResistStat) || [])[1]} contra ${est.zonaResistValor})` : ''}`);
      if(est.teleport && !deHab) f.push('Teletransporta a quien la pisa a otro punto del mapa (el destino se elige en el mapa)');
      if(est.seEvita) f.push(`${est.salStat} contra ${est.salDif} ${est.salQue === 'mitad' ? 'le saca la mitad del daño' : est.salQue === 'efecto' ? 'evita el efecto' : 'la evita'} (la tira el mapa solo)`);
      f.push(deHab ? `Para detectarla: Percepción contra ${est.detectarStat === 'dmgesp' ? 'el Efecto especial' : 'la Destreza'} de quien la coloca` : `Para detectarla: Percepción contra ${est.detectar}`);
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
      if(id === 'detecta' && !deHab && !(est.detectar >= 1)) return 'Poné qué tan difícil es detectarla (un número).';
      if(id === 'dura' && est.dura && !(est.turnos >= 1)) return 'Poné cuántos turnos dura (1 o más).';
      if(id === 'persistente' && est.dejaZona){
        if(!(est.zonaTurnos >= 1)) return 'Poné cuántos turnos dura la zona (1 o más).';
        if(est.zonaSeResiste && !(est.zonaResistValor >= 1)) return 'Poné la dificultad de la zona (un número).';
      }
      return '';
    }

    // La ventana es la común (comun/paso-a-paso.js, 2026-10-02): pestañas que saltan hasta donde lo anterior está completo.
    let api = null;
    const NOMBRES = {nombre: 'Nombre', superficie: deHab ? 'Forma' : 'Superficie', quien: 'A quién', dano: 'Daño', estado: 'Estado', persistente: 'Zona',
      teleport: 'Teleport', evita: 'Se evita', detecta: 'Detectarla', dura: 'Duración', resumen: 'Resumen'};
    // ¿Se puede ir al paso i? Todo lo anterior tiene que estar completo (el problema se muestra arriba del paso).
    const faltaAntes = i => { for(let k = 0; k < Math.min(i, PASOS.length); k++){ const p = validar(PASOS[k]); if(p) return p; } return ''; };
    const vista = () => api && api.raiz.querySelector('#at-dvista');

    function cuerpo(id){
      if(id === 'nombre'){
        return `<div class="at-preg">¿Cómo se llama la trampa?</div>
          <input type="text" id="at-nombre" maxlength="40" placeholder="Ej.: Foso con estacas" value="${esc(est.nombre)}">
          <div class="at-preg">¿Qué efecto tiene?</div>
          <p class="at-ayuda">Contalo en pocas palabras: es lo que va a leer la mesa cuando alguien la active. Si lo dejás vacío, armo una descripción con lo que configures en los pasos siguientes.</p>
          <textarea id="at-desc" maxlength="200" placeholder="Ej.: Una red cae desde el techo y deja atrapado a quien la pisa.">${esc(est.descripcion)}</textarea>`;
      }
      if(id === 'superficie' && deHab){
        const linea = est.forma === 'linea';
        return `<div class="at-preg">¿Qué forma tiene, de qué tamaño y cuántas deja?</div>
          <p class="at-ayuda">Esta trampa no se dibuja: la habilidad la coloca sola, <b>oculta y al lado de tu token</b> cada vez que la usás (una línea sale hacia afuera del token).</p>
          ${FORMAS.filter(f => f.id !== 'libre').map(f => `<button type="button" class="at-op${(linea ? 'linea' : 'flor') === f.id ? ' on' : ''}" data-forma="${f.id}"><span class="ico">${f.icono}</span><span><b>${f.texto}</b></span></button>`).join('')}
          ${linea ? `<div class="at-fila"><label style="flex:1.4">Largo (casillas)</label><input type="number" id="at-largo" min="1" max="20" value="${esc(est.largo)}" style="width:90px"></div>`
            : `<div class="at-fila"><label style="flex:1.4">Tamaño (radio)</label><input type="number" id="at-radio" min="0" max="6" value="${esc(est.radio)}" style="width:90px"></div>
          <p class="at-ayuda">0 = una sola casilla · 1 = una flor de 1 (7 casillas) · 2 = una flor de 2…</p>`}
          <div class="at-fila"><label style="flex:1.4">Cuántas por vez</label><input type="number" id="at-cant" min="1" max="6" value="${esc(est.cant)}" style="width:90px"></div>
          <p class="at-ayuda">Cuántas trampas deja de una vez cada vez que se ejecuta la habilidad (1 a 6).</p>
          <div class="at-preg">Color</div>
          <div class="at-colores">${colores.map(c => `<button type="button" class="at-color${est.color === c ? ' on' : ''}" data-color="${c}" style="background:${c}" title="${c}"></button>`).join('')}</div>`;
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
        return `<div class="at-preg">¿Su efecto alcanza a los aliados?</div>
          <p class="at-ayuda">Una trampa está <b>oculta</b> y la activan <b>solo los rivales</b> de quien la puso: los aliados nunca la disparan. La pregunta es qué pasa con los aliados que queden <b>dentro del área</b> cuando salta. Regla general: lo <b>físico</b> (púas, cuchillas, derrumbes, gases, explosiones) daña a todos; lo <b>mágico</b> (arcano, relámpago, runas) distingue aliados de rivales.</p>
          <button type="button" class="at-op${!est.amiga ? ' on' : ''}" data-amiga="0"><span class="ico">🎯</span><span><b>Solo a los rivales (mágica)</b><small>El efecto distingue: alcanza a quien la activó y a los rivales que estén dentro del área; los aliados salen ilesos.</small></span></button>
          <button type="button" class="at-op${est.amiga ? ' on' : ''}" data-amiga="1"><span class="ico">🔥</span><span><b>A todos los del área (fuego amigo, física)</b><small>El efecto (daño y estado) alcanza a todos los que estén dentro del área, aliados incluidos. Igual la dispara un rival.</small></span></button>`;
      }
      if(id === 'dano'){
        return `<div class="at-preg">¿Hace daño?</div>
          <label class="at-sin"><input type="checkbox" id="at-haceDano"${est.haceDano ? ' checked' : ''}> Sí, la trampa hace daño a quien la activa (y a los que están dentro si es de área, según lo elegido antes)</label>
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
          ${est.aplicaEstado ? `<div class="at-preg">¿Cuál?</div><div class="at-grid">${listaEstados().map(p => `<button type="button" class="at-op${est.estado === p.nombre ? ' on' : ''}" data-estado="${esc(p.nombre)}">
            <span class="cab"><b>${esc(p.nombre)}</b><em>${p.permanente ? 'no vence' : num(p.turnos) + ' turnos'}</em></span><small>${esc(p.detalle || '')}</small></button>`).join('')}</div>
            ${preset() && !preset().permanente ? `<div class="at-preg">¿Cuántos turnos dura el estado?</div>
              <p class="at-ayuda">Cada ⟳ Mantenimiento del GM cuenta un turno.</p>
              <input type="number" id="at-estadoTurnos" min="1" max="20" value="${esc(est.estadoTurnos || num(preset().turnos))}">` : ''}` : ''}`;
      }
      if(id === 'persistente'){
        return `<div class="at-preg">¿Al dispararse, queda además como una zona?</div>
          <p class="at-ayuda">Una trampa normal actúa una sola vez, sobre quien la pisó. Marcada esto, además queda puesta un tiempo, con el mismo daño y/o estado de los pasos anteriores, para cualquiera que entre o se quede adentro — como una nube de gas que sigue ahí después del disparo.</p>
          <label class="at-sin"><input type="checkbox" id="at-dejaZona"${est.dejaZona ? ' checked' : ''}> Sí, queda como zona</label>
          ${est.dejaZona ? `<div class="at-preg">¿Cuántos turnos dura la zona?</div>
            <input type="number" id="at-zonaTurnos" min="1" max="99" value="${esc(est.zonaTurnos)}">
            <div class="at-preg">¿Sigue afectando a quien se queda adentro?</div>
            <div class="at-fila"><button type="button" class="at-op${est.zonaEnMant ? ' on' : ''}" data-zona-en-mant="1" style="margin:0"><span><b>Sí, en cada Mantenimiento</b></span></button>
              <button type="button" class="at-op${!est.zonaEnMant ? ' on' : ''}" data-zona-en-mant="0" style="margin:0"><span><b>No, solo al moverse</b></span></button></div>
            <div class="at-preg">¿Se dispara con cada paso, o alcanza con entrar?</div>
            <div class="at-fila"><button type="button" class="at-op${!est.zonaCadaPaso ? ' on' : ''}" data-zona-cada-paso="0" style="margin:0"><span><b>Alcanza con entrar</b></span></button>
              <button type="button" class="at-op${est.zonaCadaPaso ? ' on' : ''}" data-zona-cada-paso="1" style="margin:0"><span><b>Cada paso caminado adentro</b></span></button></div>
            <div class="at-preg">¿La zona se resiste con algo?</div>
            <p class="at-ayuda">Aparte de "se evita" de más abajo (que es a mano, solo para el disparo): esto es automático, para cada uno que la zona chequea mientras dura. Como nadie la tira, le ponés vos la dificultad.</p>
            <label class="at-sin"><input type="checkbox" id="at-zonaSeResiste"${est.zonaSeResiste ? ' checked' : ''}> Sí, hay algo que resistir</label>
            ${est.zonaSeResiste ? `<div class="at-fila"><select id="at-zonaResistStat" style="flex:1.4">${ZSTATS.map(([v, t]) => `<option value="${v}"${est.zonaResistStat === v ? ' selected' : ''}>${t}</option>`).join('')}</select>
              <label>contra</label><input type="number" id="at-zonaResistValor" min="1" value="${esc(est.zonaResistValor)}" style="width:80px"></div>` : ''}` : ''}`;
      }
      if(id === 'teleport'){
        return `<div class="at-preg">¿Teletransporta a quien la pisa?</div>
          <p class="at-ayuda">Al saltar, mueve a quien la activó a <b>otro punto del mapa</b>, que tiene que ser un <b>punto transitable a pie</b> (una casilla donde un personaje podría pararse: sin Sólido ni pared; no hace falta que haya camino hasta ahí). Si la casilla está ocupada, va a la libre más cercana. Después de confirmar te pide hacer clic en el mapa para marcar el destino; se puede cambiar desde el ⚙ de la trampa. Puede combinarse con daño o estado.</p>
          <label class="at-sin"><input type="checkbox" id="at-teleport"${est.teleport ? ' checked' : ''}> Sí: teletransporta a quien la activa</label>`;
      }
      if(id === 'evita'){
        return `<div class="at-preg">¿Se puede evitar con una tirada?</div>
          <p class="at-ayuda">La tira el mapa solo, por quien la pisa (y por cada uno del área), con su stat: si llega a la dificultad, se salva de lo que elijas acá. Sale en la Mesa y en el Aviso.</p>
          <label class="at-sin"><input type="checkbox" id="at-seEvita"${est.seEvita ? ' checked' : ''}> Sí: quien la activa tira algo para evitarla</label>
          ${est.seEvita ? `<div class="at-fila"><select id="at-salStat" style="flex:1.4">${SALVACIONES.map(s => `<option value="${s.id}"${est.salStat === s.id ? ' selected' : ''}>${s.texto}</option>`).join('')}</select>
            <label>contra</label><input type="number" id="at-salDif" min="1" value="${esc(est.salDif)}" style="width:80px"></div>
            <div class="at-preg">Si la pasa…</div>
            ${[['todo', 'La evita entera', 'Ni daño ni estado.'], ['efecto', 'Evita el efecto', 'El estado no le entra; el daño, sí.'], ['mitad', 'Recibe la mitad del daño', 'El estado le entra igual.']].map(([v, t, d]) =>
              `<button type="button" class="at-op${est.salQue === v ? ' on' : ''}" data-sal-que="${v}"><span><b>${t}</b><small>${d}</small></span></button>`).join('')}` : ''}`;
      }
      if(id === 'detecta'){
        return deHab
          ? `<div class="at-preg">¿Qué tan escondida queda?</div>
          <p class="at-ayuda">Quien tiene <b>Percepción aumentada</b> y pasa al lado tira Percepción contra este número; si gana, la ve (y la ve todo su equipo). En una habilidad, la dificultad sale de quien la coloca, al colocarla.</p>
          <label class="at-sin"><input type="radio" name="at-detectarStat" value="des"${est.detectarStat !== 'dmgesp' ? ' checked' : ''}> Su <b>Destreza</b> (trampas físicas: cepos, púas, cables)</label>
          <label class="at-sin"><input type="radio" name="at-detectarStat" value="dmgesp"${est.detectarStat === 'dmgesp' ? ' checked' : ''}> Su <b>Efecto especial</b> (trampas mágicas: runas, glifos, nubes)</label>`
          : `<div class="at-preg">¿Qué tan difícil es detectarla?</div>
          <p class="at-ayuda">Quien tiene <b>Percepción aumentada</b> y pasa al lado tira Percepción contra este número; si gana, la ve (y la ve todo su equipo). Una trampa común: <b>8</b>. Más alto = mejor escondida (de buena calidad); más bajo = burda.</p>
          <input type="number" id="at-detectar" min="1" max="99" value="${esc(est.detectar)}">`;
      }
      if(id === 'dura'){
        return `<div class="at-preg">${editando ? '¿Cuántos turnos le quedan?' : deHab ? '¿Cuánto dura cada trampa que deja?' : '¿Cuánto dura la trampa?'}</div>
          <p class="at-ayuda">Por defecto queda en el mapa hasta que alguien la borre. También puede eliminarse sola después de unos turnos (cada ⟳ Mantenimiento del GM cuenta uno).</p>
          <label class="at-sin"><input type="checkbox" id="at-dura"${est.dura ? ' checked' : ''}> Que se elimine sola después de unos turnos</label>
          ${est.dura ? `<input type="number" id="at-turnos" min="1" max="99" value="${esc(est.turnos)}">` : ''}`;
      }
      const fr = frases();
      return `<div class="at-preg">Así queda tu trampa</div>
        <div class="at-resumen">🪤 <b>${esc(est.nombre.trim())}</b> · ${est.amiga ? '🔥 daña también a aliados en el área' : '🎯 efecto solo a rivales'}${editando ? '' : deHab ? (est.forma === 'linea' ? ' · línea de ' + est.largo : ' · radio ' + est.radio) + ' × ' + est.cant : ' · ' + esc((FORMAS.find(f => f.id === est.forma) || {}).texto || '')}
          <ul>${fr.map(x => `<li>${esc(x)}</li>`).join('')}<li>${est.dura ? `Se elimina sola tras ${est.turnos} turno${est.turnos === 1 ? '' : 's'}` : 'Queda hasta que alguien la borre'}</li></ul>
          ${est.descripcion.trim() ? `<div style="margin-top:8px;color:#B7A79E;font-size:13px">“${esc(est.descripcion.trim())}”</div>` : ''}</div>
        <p class="at-ayuda">${editando ? 'Al confirmar se guardan los cambios en la trampa.' : deHab ? 'Al confirmar se guarda en la habilidad; se coloca sola cada vez que la ejecutes.' : 'Al confirmar te queda la trampa lista: <b>hacé clic en el mapa y arrastrá</b> para dibujarla donde quieras.'}</p>
        ${editando || deHab ? '' : '<label class="at-sin"><input type="checkbox" id="at-guardar"' + (est.guardar ? ' checked' : '') + '> ⭐ Guardarla también como recurrente para usarla de nuevo</label>'}`;
    }

    const dibujar = () => { if(api) api.redibujar(); };

    const resultado = () => ({
      nombre: est.nombre.trim(), descripcion: est.descripcion.trim(), forma: est.forma, color: est.color, alfa: est.alfa, amiga: est.amiga,
      radio: est.radio, cant: est.cant, largo: est.largo,
      dano: danoTxt(), contemplaArmadura: est.contemplaArmadura,
      estado: est.aplicaEstado && preset() ? est.estado : '', estadoTurnos: est.aplicaEstado && preset() ? durEstado() : 0,
      estadoMods: est.aplicaEstado && est.estado === est.estadoPropio && est.estadoMods ? est.estadoMods : null,
      estadoStacks: est.aplicaEstado && est.estado === est.estadoDeStacks && est.estadoStacks ? est.estadoStacks : 0,
      teleport: !deHab && !!est.teleport,
      salvacion: est.seEvita ? {stat: est.salStat, dif: est.salDif, que: est.salQue, ...(est.salLogra ? {logra: est.salLogra} : {})} : null,
      ...(est.elemento ? {elemento: est.elemento} : {}), ...(est.lento ? {lento: est.lento} : {}), ...(est.pierdeSp ? {pierdeSp: est.pierdeSp} : {}), ...(est.danoZona ? {danoZona: est.danoZona} : {}), ...(est.cadena ? {cadena: est.cadena} : {}),
      turnos: est.dura ? est.turnos : 0, guardar: !!est.guardar,
      dejaZona: !!est.dejaZona, zonaTurnos: est.zonaTurnos, zonaEnMant: est.zonaEnMant, zonaCadaPaso: est.zonaCadaPaso,
      zonaResistStat: est.zonaSeResiste ? est.zonaResistStat : '', zonaResistValor: est.zonaResistValor,
      ...(deHab ? {detectarStat: est.detectarStat} : {detectar: est.detectar}),
    });

    // Terminar (el «✓» del último paso): todo completo → el resultado (la ventana se cierra sola); si falta algo, avisa y sigue abierta.
    function terminar(){
      const problema = faltaAntes(PASOS.length);
      if(problema){ api.aviso(problema); return false; }
      const r = resultado();
      if(cfg.alTerminar) cfg.alTerminar(r);
    }
    const siguiente = () => api.irA(api.paso() + 1);

    const alClic = e => {
      const b = e.target.closest('button'); if(!b) return;
      const d = b.dataset;
      if(d.forma){ est.forma = d.forma; dibujar(); return; }
      if(d.color){ est.color = d.color; dibujar(); return; }
      if(d.amiga !== undefined){ est.amiga = d.amiga === '1'; dibujar(); return; }
      if(d.aplica !== undefined){ est.aplicaEstado = d.aplica === '1'; if(!est.aplicaEstado){ est.estado = ''; } est.error = ''; dibujar(); return; }
      if(d.estado){ est.estado = d.estado; est.estadoTurnos = 0; est.error = ''; dibujar(); return; }
      if(d.zonaEnMant !== undefined){ est.zonaEnMant = d.zonaEnMant === '1'; dibujar(); return; }
      if(d.zonaCadaPaso !== undefined){ est.zonaCadaPaso = d.zonaCadaPaso === '1'; dibujar(); return; }
      if(d.salQue){ est.salQue = d.salQue; dibujar(); return; }
    };
    // Los campos se guardan al escribir (sin volver a dibujar, para no perder el foco).
    const alInput = e => {
      const t = e.target;
      if(t.id === 'at-nombre') est.nombre = t.value;
      else if(t.id === 'at-desc') est.descripcion = t.value;
      else if(t.id === 'at-alfa') est.alfa = Math.round(num(t.value));
      else if(t.id === 'at-radio') est.radio = Math.max(0, Math.min(6, Math.round(num(t.value))));
      else if(t.id === 'at-cant') est.cant = Math.max(1, Math.min(6, Math.round(num(t.value)) || 1));
      else if(t.id === 'at-largo') est.largo = Math.max(1, Math.min(20, Math.round(num(t.value)) || 1));
      else if(t.id === 'at-dados'){ est.dados = Math.max(0, Math.round(num(t.value))); const v = vista(); if(v) v.textContent = danoTxt(); }
      else if(t.id === 'at-fijo'){ est.fijo = Math.round(num(t.value)); const v = vista(); if(v) v.textContent = danoTxt(); }
      else if(t.id === 'at-estadoTurnos') est.estadoTurnos = Math.max(0, Math.round(num(t.value)));
      else if(t.id === 'at-salDif') est.salDif = Math.round(num(t.value));
      else if(t.id === 'at-turnos') est.turnos = Math.max(0, Math.round(num(t.value)));
      else if(t.id === 'at-zonaTurnos') est.zonaTurnos = Math.max(0, Math.round(num(t.value)));
      else if(t.id === 'at-zonaResistValor') est.zonaResistValor = Math.round(num(t.value));
      else if(t.id === 'at-detectar') est.detectar = Math.max(0, Math.round(num(t.value)));
    };
    const alCambio = e => {
      const t = e.target;
      if(t.id === 'at-haceDano'){ est.haceDano = t.checked; est.error = ''; dibujar(); }
      else if(t.id === 'at-caras'){ est.caras = num(t.value); const v = vista(); if(v) v.textContent = danoTxt(); }
      else if(t.id === 'at-armadura') est.contemplaArmadura = t.checked;
      else if(t.id === 'at-teleport'){ est.teleport = t.checked; }
      else if(t.id === 'at-seEvita'){ est.seEvita = t.checked; est.error = ''; dibujar(); }
      else if(t.id === 'at-salStat') est.salStat = t.value;
      else if(t.id === 'at-dura'){ est.dura = t.checked; est.error = ''; dibujar(); }
      else if(t.id === 'at-guardar') est.guardar = t.checked;
      else if(t.id === 'at-dejaZona'){ est.dejaZona = t.checked; est.error = ''; dibujar(); }
      else if(t.id === 'at-zonaSeResiste'){ est.zonaSeResiste = t.checked; dibujar(); }
      else if(t.id === 'at-zonaResistStat') est.zonaResistStat = t.value;
      else if(t.name === 'at-detectarStat') est.detectarStat = t.value === 'dmgesp' ? 'dmgesp' : 'des';
    };
    const inicial = JSON.stringify(est);
    api = PasoAPaso.abrir({
      titulo: editando ? 'Editar la trampa' : deHab ? 'Trampa de la habilidad' : 'Crear una trampa', crear: !editando, z: 99985,
      textoCrear: '✓ Crear la trampa', textoGuardar: '✓ Guardar cambios',
      pasos: () => PASOS.map(id => ({id, nombre: NOMBRES[id] || id, html: () => `<div class="at-c">${cuerpo(id)}</div>`,
        alMontar: (c, a) => { const foco = a.raiz.querySelector('#at-nombre, #at-dados, #at-turnos'); if(foco) setTimeout(() => { foco.focus(); if(foco.select) foco.select(); }, 30); }})),
      puedeIr: i => faltaAntes(i),
      alClic, alInput, alCambio,
      alTecla: e => { if(e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON'){ e.preventDefault(); if(api.paso() < PASOS.length - 1) siguiente(); else if(terminar() !== false) api.cerrar(); } },
      confirmarCancelar: () => JSON.stringify(est) === inicial ? '' : editando ? '¿Descartar los cambios de esta trampa?' : '¿Cancelar? La trampa que estás armando se descarta.',
      alCrear: () => terminar(), alGuardar: () => terminar(),
      alCancelar: () => { if(cfg.alCancelar) cfg.alCancelar(); },
    });
  }

  // Texto que se guarda en la trampa (≤ 200 caracteres, el tope del mapa): la descripción que escribió quien la armó o, si la dejó vacía,
  // un resumen de lo que hace; y, si se puede evitar con una tirada, cómo (a mano).
  function detalleFinal(r){
    const partes = [];
    if(r.descripcion) partes.push(r.descripcion.replace(/[.!?]+$/, ''));
    else{
      if(r.dano) partes.push(`${r.dano} de daño${r.contemplaArmadura ? '' : ' directo'}`);
      if(r.estado) partes.push(`deja ${r.estado}${num(r.estadoStacks) > 0 ? ' ×' + r.estadoStacks : ''}${r.estadoTurnos ? ' ' + r.estadoTurnos + ' turnos' : ''}`);
      if(r.teleport) partes.push('teletransporta a quien la pisa');
      if(!partes.length) partes.push('solo avisa cuando se activa');
    }
    if(r.salvacion){ const s = r.salvacion, etq = s.etq || s.stat; partes.push(`${etq} contra ${s.dif} ${s.que === 'mitad' ? 'le saca la mitad del daño' : s.que === 'efecto' ? 'evita el efecto' : 'la evita'}`); }
    return (partes.join('. ') + '.').slice(0, 200);
  }
  // El resultado del asistente (contexto 'habilidad') en la forma única de trampa (comun/plantillas.js).
  function aTrampa(r){
    const linea = r.forma === 'linea';
    return {nombre: String(r.nombre || '').trim().slice(0, 40), detalle: detalleFinal(r), amiga: !!r.amiga, ignoraDef: !r.contemplaArmadura, dano: r.dano || '',
      estado: r.estado || '', estadoTurnos: r.estado ? Math.max(0, num(r.estadoTurnos)) : 0, ...(r.estado && r.estadoMods ? {estadoMods: r.estadoMods} : {}),
      ...(r.estado && num(r.estadoStacks) > 0 ? {estadoStacks: Math.min(20, Math.round(num(r.estadoStacks)))} : {}),
      ...(r.salvacion && r.salvacion.stat ? {salvacion: {stat: r.salvacion.stat, dif: num(r.salvacion.dif), que: r.salvacion.que || 'todo', ...(r.salvacion.logra ? {logra: r.salvacion.logra} : {})}} : {}),
      ...(r.elemento ? {elemento: r.elemento} : {}), ...(r.lento ? {lento: r.lento} : {}), ...(r.pierdeSp ? {pierdeSp: r.pierdeSp} : {}), ...(r.danoZona ? {danoZona: r.danoZona} : {}), ...(r.cadena ? {cadena: r.cadena} : {}),
      tipo: linea ? 'linea' : 'flor', tamano: linea ? Math.max(1, Math.min(20, num(r.largo) || 3)) : Math.max(0, Math.min(6, num(r.radio))),
      color: r.color, alfa: Number.isFinite(r.alfa) ? r.alfa : 45, ...(r.teleport ? {teleport: true} : {}),
      ...(r.dejaZona ? {dejaZona: true, zonaTurnos: Math.max(1, num(r.zonaTurnos) || 3), zonaEnMantenimiento: r.zonaEnMant !== false, zonaCadaPaso: !!r.zonaCadaPaso,
        zonaResistStat: r.zonaResistStat || '', zonaResistValor: num(r.zonaResistValor) || 12} : {}),
      turnos: Math.max(0, num(r.turnos)), cant: Math.max(1, Math.min(6, num(r.cant) || 1)), detectarStat: r.detectarStat === 'dmgesp' ? 'dmgesp' : 'des'};
  }
  // Una trampa (cualquier forma, también las viejas de las habilidades) como valores de partida del asistente.
  function inicialDe(t0){
    const t = typeof Plantillas !== 'undefined' && Plantillas.trampaDesde ? Plantillas.trampaDesde(t0 || {}) : (t0 || {});
    const linea = t.tipo === 'linea';
    return {nombre: t.nombre || '', descripcion: t.detalle || '', forma: linea ? 'linea' : 'flor', radio: linea ? 0 : Math.max(0, num(t.tamano)), largo: linea ? num(t.tamano) || 3 : 3,
      cant: t.cant || 1, color: t.color, alfa: t.alfa, amiga: !!t.amiga, dano: t.dano || '', contemplaArmadura: !t.ignoraDef,
      estado: t.estado || '', estadoTurnos: t.estadoTurnos || 0, estadoMods: t.estadoMods, estadoStacks: t.estadoStacks || 0, teleport: !!t.teleport, salvacion: t.salvacion || null,
      dejaZona: !!t.dejaZona, zonaTurnos: t.zonaTurnos, zonaEnMant: t.zonaEnMantenimiento !== false, zonaCadaPaso: !!t.zonaCadaPaso,
      zonaResistStat: t.zonaResistStat || '', zonaResistValor: t.zonaResistValor, turnos: t.turnos || 0, detectar: t.detectar, detectarStat: t.detectarStat};
  }
  // "2d6 de daño (contempla la armadura) · deja Rengo · radio 1 × 2 · deja zona 3 turnos · efecto solo a rivales"
  function resumenTexto(t0){
    const t = typeof Plantillas !== 'undefined' && Plantillas.trampaDesde ? Plantillas.trampaDesde(t0 || {}) : (t0 || {});
    const p = [];
    if(t.dano) p.push(`${t.dano} de daño ${t.ignoraDef ? '(directo a la vida)' : '(contempla la armadura)'}`);
    if(t.estado) p.push(`deja ${t.estado}${num(t.estadoStacks) > 0 ? ' ×' + t.estadoStacks : ''}${num(t.estadoTurnos) > 0 ? ' ' + t.estadoTurnos + ' turnos' : ''}`);
    if(!p.length) p.push('solo avisa cuando se activa');
    p.push(t.tipo === 'linea' ? `línea de ${t.tamano}` : `radio ${Math.max(0, num(t.tamano))}`);
    if((t.cant || 1) > 1) p.push(`×${t.cant}`);
    if(t.dejaZona) p.push(`deja zona ${t.zonaTurnos || 3} turnos`);
    if(num(t.turnos) > 0) p.push(`dura ${t.turnos} turnos`);
    p.push(t.amiga ? 'daña también a aliados en el área' : 'el efecto solo alcanza a rivales');
    return p.join(' · ');
  }
  return {abrir, detalleFinal, aTrampa, inicialDe, resumenTexto};
})();
