/* comun/asistente-duelo-hab.js — «⚔ Duelo» de una habilidad (2026-09-27, docs/duelo-de-habilidades.md).
   Ventana PASO A PASO (2026-09-27, pedido del dueño — mismo criterio que el resto de los asistentes del
   juego: comun/asistente-item.js, comun/asistente-trampa.js, comun/asistente-estado.js) para decidir cómo
   se juega una habilidad dirigida en el duelo: a quién apunta, qué tira quien la usa, con qué se resiste
   el objetivo, si hace daño (y de qué tipo), y qué efectos deja (estados o cura). Cada paso tiene su propio
   título y explicación, como los demás asistentes — nada de scroll largo con todo junto. Sin tocar ningún
   dato a mano: devuelve el objeto `duelo` que guarda la habilidad (o null = sin duelo).

   Uso:  AsistenteDueloHab.abrir({nombre, inicial, tieneFormula, costoVariable: 'sp'|'nitros'|'',
   costoInicial: {sp, nitrosCosto, hpCosto}, alGuardar: resultado => …});
   `resultado` es `null` (sin duelo — o se sacó desde "Sacar el duelo de esta habilidad": no toca el costo) o
   `{duelo, costo: {sp, nitrosCosto, hpCosto}}` — el paso "Costo" (2026-09-27, pedido del dueño: "al principio te
   tiene que preguntar qué se cobra al ejecutar") es el mismo dato de siempre de la habilidad, editable también
   desde acá; quien llama tiene que aplicar `resultado.costo` a `it.costo`/`it.nitrosCosto`/`it.hpCosto` igual que
   `resultado.duelo` a `it.duelo`. `duelo` = {objetivo, tira, tiraFormula?, tiraEtiqueta?, contra: [stats], dano,
   tipoDano, danoFijoPorX?, efectoLibre?, efectosNota?, radio?, efectos: [{nombre, turnos} | {cura}],
   zonaTurnos?, zonaAmiga?, zonaEstado?: {nombre, turnos, stacks?}} — los tres últimos solo con objetivo:'zona'
   (2026-09-28, ver comun/CLAUDE.md "Zona persistente"): `tira`/`contra` son la misma resistencia de siempre
   (se tira una sola vez al crearla, se reusa contra cada uno que entra o sigue adentro en el Mantenimiento) y
   `dano`/`tipoDano`/`ignoraDano` el mismo daño de siempre — la parte nueva es solo que queda puesta y se
   chequea de a uno, en vez de resolverse toda junta al ejecutar.
   Los ids de stat son los de la ficha y los de gm-tools (pdg, pdgmg, fue, con, agl, des, esp / eva, resmg, resm). Sin Firebase.
   `costoVariable` (P119, 2026-09-27): si la habilidad ya tiene costo "X" en SP o Nitros (spVariable/nitrosVariable en
   ficha.html), el paso de Daño ofrece "+N de daño fijo por cada punto de X" (`danoFijoPorX`) — quien ejecuta la habilidad
   arma la fórmula final sumando `danoFijoPorX * X` a la fórmula base (`it.tiradaExtra`). Los creeps de gm-tools no tienen
   costo variable todavía, así que ahí `costoVariable` siempre es '' y esta sección no aparece.
   **Tirada personalizada y efecto a mano** (2026-09-27, pedido del dueño — herramienta general, no a medida de una
   skill puntual): en el paso "Tirada", en vez de un stat se puede escribir una fórmula propia (`tiraFormula`, admite
   «X») con su propio texto (`tiraEtiqueta`) — reemplaza a `tira` (que queda '' en ese caso); quien la ejecuta arma la
   fórmula final (con la X ya resuelta) antes de crear el duelo, igual que ya hacía `danoFijoPorX`. En el paso "Daño"
   se puede tildar además "Tiene un efecto que no se puede automatizar" y escribir un texto libre (`efectoLibre`) que
   el cuadro del duelo muestra junto al resultado (con la diferencia entre las dos tiradas, si la hubo) para
   resolverlo a mano. Pensado para habilidades como Drenar vida (tira «X + 1dX», el efecto es "drená la diferencia"),
   pero sirve para cualquier skill que se trabe en un paso puntual — el resto de la habilidad sigue automatizada.
   El paso "Efectos" (2026-09-27, mismo pedido) tiene el mismo "Personalizar": un texto libre (`efectosNota`) además
   de los ◎ Estado/💚 Cura de siempre, para un efecto que no encaja en esa lista — se muestra junto a los demás,
   sin botón «Aplicar». Existe tanto en modo:'hab' como en modo:'arma' (ambos usan `cuerpoEfectos`). */
const AsistenteDueloHab = (() => {
  const TIRA = [['pdgmg', 'PdG.Esp (magia u otros efectos del Especial)'], ['pdg', 'PdG (probabilidad de golpe)'], ['fue', 'Fuerza'], ['con', 'Constitución'], ['agl', 'Agilidad'], ['des', 'Destreza'], ['esp', 'Especial']];
  const CONTRA = [['eva', 'Evasión (esquivar un proyectil)'], ['resmg', 'Res.Esp (resistir magia u otros efectos del Especial)'], ['resm', 'Res.Mt (resistir la mente)'], ['con', 'Constitución'], ['fue', 'Fuerza'], ['esp', 'Especial'], ['des', 'Destreza'], ['agl', 'Agilidad']];
  const ALCANCES = [['auto', 'Automático (los hechizos usan su Rango de casteo)'], ['casteo', 'Rango de casteo'], ['rango', 'Rango (el de las armas a distancia)'], ['adyacente', 'Cuerpo a cuerpo (casilleros de al lado)'], ['fijo', 'Un número de casilleros'], ['ilimitado', 'Sin límite (no resalta nada)']];
  const BONOS = [['pdg', 'PdG'], ['dmg', 'Daño'], ['eva', 'Evasión'], ['def', 'Defensa'], ['nitros', 'No2'], ['resmg', 'Res.Esp'], ['resm', 'Res.Mt'], ['parry', 'Parry'], ['bloqueo', 'Bloqueo']];
  const TIPOS = [['arcano', 'Arcano (mágico)'], ['fuego', 'Fuego (mágico)'], ['hielo', 'Hielo (mágico)'], ['rayo', 'Rayo (mágico)'], ['fisico', 'Físico (respeta la Defensa)']];
  const STAT_TXT = Object.fromEntries([...TIRA, ...CONTRA]);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  function css(){
    if(document.getElementById('adh-css')) return;
    const s = document.createElement('style');
    s.id = 'adh-css';
    s.textContent = `#adh-fondo{position:fixed;inset:0;z-index:99500;background:rgba(6,8,14,.78);display:flex;align-items:center;justify-content:center;padding:12px;font-family:inherit}
#adh-fondo .adh{background:#151a26;color:#e9ecf4;border:1px solid #39435c;border-radius:14px;width:min(640px,100%);max-height:94vh;overflow:auto;box-shadow:0 18px 60px rgba(0,0,0,.6)}
#adh-fondo header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #2b3347;font-weight:800;font-size:17px}
#adh-fondo .cuerpo{padding:14px 16px;display:flex;flex-direction:column;gap:14px}
#adh-fondo h4{margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#9aa4bd}
#adh-fondo .nota{font-size:12.5px;color:#aab3ca;margin:0 0 6px}
#adh-fondo select,#adh-fondo input[type=number],#adh-fondo input[type=text]{background:#0e1220;color:#fff;border:1px solid #39435c;border-radius:8px;padding:8px;font-size:14px;max-width:100%}
#adh-fondo label.op{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:14px;cursor:pointer}
#adh-fondo .fila{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:4px 0}
#adh-fondo button{background:#2d6cdf;color:#fff;border:0;border-radius:10px;padding:9px 14px;font-size:14px;font-weight:700;cursor:pointer}
#adh-fondo button.sec{background:#2b3347;color:#d5dbec}
#adh-fondo button.rojo{background:#5a2530;color:#fbd0d7}
#adh-fondo .pie{display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid #2b3347;flex-wrap:wrap}
#adh-fondo .aviso{background:rgba(255,210,90,.12);border:1px solid #d9b45a;border-radius:8px;padding:8px 10px;font-size:12.5px;color:#f8ecc6}
#adh-fondo .adh-chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:2px}
#adh-fondo .adh-chip{font-size:10.5px;padding:4px 9px;border:1px solid #39435c;border-radius:99px;color:#9aa4bd;background:none;cursor:pointer;font-weight:700}
#adh-fondo .adh-chip.hecho{color:#e9ecf4}
#adh-fondo .adh-chip.activo{color:#fff;background:#2d6cdf;border-color:#2d6cdf}
#adh-fondo .adh-titulo{font-size:16px;font-weight:800;margin:2px 0 4px}
#adh-fondo .adh-ayuda{color:#aab3ca;font-size:12.5px;margin:0 0 10px;line-height:1.45}
#adh-fondo .adh-ayuda b{color:#8db3ff}
#adh-fondo .adh-nav{display:flex;justify-content:space-between;gap:8px;margin-top:6px;padding-top:10px;border-top:1px solid #2b3347}
#adh-fondo .adh-resumen{border:1px solid #2b3347;background:#12172a;padding:10px 12px;border-radius:10px;font-size:13px;line-height:1.6}
#adh-fondo .adh-resumen b{color:#8db3ff}`;
    document.head.appendChild(s);
  }

  function abrir(cfg){
    css();
    const ini = cfg.inicial || null;
    const st = {
      paso: 0,
      activo: !!ini, objetivo: (ini && ini.objetivo) || 'enemigo',
      tira: ini ? (ini.tira === undefined ? 'pdgmg' : ini.tira) : 'pdgmg',
      // Tirada personalizada (2026-09-27, pedido del dueño): para habilidades que no tiran ningún stat de la
      // ficha (ej. Drenar vida: «X + 1dX») — reemplaza a `tira` cuando tiraModo === 'custom'. Se anuncia en la
      // Mesa con `tiraEtiqueta` en vez del nombre de un stat; `tiraFormula` puede llevar «X» (costo variable).
      tiraModo: (ini && ini.tiraFormula) ? 'custom' : 'stat',
      tiraFormula: (ini && ini.tiraFormula) || '', tiraEtiqueta: (ini && ini.tiraEtiqueta) || '',
      contra: new Set(ini && Array.isArray(ini.contra) ? ini.contra : ['resmg']),
      dano: !!(ini && ini.dano), tipoDano: (ini && ini.tipoDano) || 'arcano',
      // Efecto que no se puede automatizar del todo (2026-09-27, pedido del dueño): texto libre que se muestra
      // en el cuadro del duelo junto al resultado, para lo que hay que resolver a mano (ej. "drenás la diferencia").
      efectoLibreOn: !!(ini && ini.efectoLibre), efectoLibre: (ini && ini.efectoLibre) || '',
      // Personalizar los Efectos (2026-09-27, pedido del dueño — mismo patrón que la Tirada y el Daño):
      // además de los ◎ Estado/💚 Cura automáticos, un texto libre para un efecto que no encaja en esa lista
      // (ej. "invertí el orden de turno de todos los presentes"). Se muestra en el cuadro del duelo junto a
      // los demás efectos, sin botón «Aplicar» — es a mano.
      efectosNotaOn: !!(ini && ini.efectosNota), efectosNota: (ini && ini.efectosNota) || '',
      // Daño que escala con la X del costo variable (P119, 2026-09-27): un fijo extra por cada punto de X
      // (ej. Rayo Mágico "amplifica el daño en el doble de X" → danoFijoPorX: 2). Solo tiene sentido si la
      // habilidad ya tiene costo en SP o No2 marcado como "X" (cfg.costoVariable la avisa).
      danoFijoPorX: (ini && ini.danoFijoPorX) || 0,
      // Independiente del tipo (2026-09-27, Paso 1 de las reglas de casteo: lo que ignora la armadura no es el
      // elemento, es cómo se narra la habilidad — una "ráfaga de hielo" ignora, una "aguja de hielo" física no).
      // Arranca según el tipo elegido (mágico = sí, físico = no) y se puede destildar a mano para la excepción.
      ignoraDano: (ini && ini.ignoraDano !== undefined) ? !!ini.ignoraDano : ((ini && ini.tipoDano) || 'arcano') !== 'fisico',
      efectos: ini && Array.isArray(ini.efectos) ? ini.efectos.map(e => ({...e})) : [],
      alcance: (ini && ini.alcance) || 'auto', alcanceN: (ini && ini.alcanceN) || 3,
      radio: (ini && ini.radio) || 2,   // hechizo de área (Paso 4/7 del casteo): radio del área, en casilleros
      modo: (ini && ini.modo) || 'hab', x: (ini && ini.x) || 'nitros',
      flashEn: new Set(ini && ini.flash && Array.isArray(ini.flash.en) ? ini.flash.en : ['pdg', 'parry', 'bloqueo', 'dano']), flashBono: (ini && ini.flash && ini.flash.bono) || 2,
      arma: {pdg: 0, pdgPorX: 0, dadosPorX: 0, fijo: 0, fijoPorX: 0, sinParry: false, ignoraResistCrit: 0, ...((ini && ini.arma) || {})},
      // ¿Cuánto cuesta ejecutarla? (2026-09-27, pedido del dueño: "al principio te tiene que preguntar qué se
      // cobra al ejecutar" — antes solo vivía en el paso "Costo" del editor de la habilidad, aparte del 🎯).
      // Mismo dato de siempre (it.costo/nitrosCosto/hpCosto): este paso lo lee y lo escribe también, así el 🎯
      // queda autosuficiente. cfg.costoInicial = {sp, nitrosCosto, hpCosto} (ver ficha.html).
      costoSp: String((cfg.costoInicial && cfg.costoInicial.sp) ?? '').trim(),
      costoNitrosModo: (cfg.costoInicial && cfg.costoInicial.nitrosCosto) === 'ATAQUE' ? 'ataque'
        : String((cfg.costoInicial && cfg.costoInicial.nitrosCosto) ?? '').trim().toUpperCase() === 'X' ? 'x' : 'num',
      costoNitrosNum: (() => { const n = cfg.costoInicial && cfg.costoInicial.nitrosCosto; return (n === 'ATAQUE' || String(n ?? '').trim().toUpperCase() === 'X') ? 1 : Math.max(0, Math.round(Number(n) || 0)); })(),
      costoHp: Math.max(0, Math.round(Number(cfg.costoInicial && cfg.costoInicial.hpCosto) || 0)),
      // Zona persistente (2026-09-28, pedido del dueño — Nube tóxica): dura varios turnos, no un solo momento.
      // El radio ya lo comparte con área/onda (st.radio). `tira`/`contra` (los mismos pasos de siempre) son la
      // resistencia: quien la crea tira una sola vez al lanzarla, y esa tirada se reusa contra cada uno que entra
      // o sigue adentro en el Mantenimiento — igual que ya hacen los hechizos de área entre sí.
      zonaTurnos: (ini && ini.zonaTurnos) || 3,
      zonaAmiga: !!(ini && ini.zonaAmiga),
      zonaEstadoNombre: (ini && ini.zonaEstado && ini.zonaEstado.nombre) || '',
      zonaEstadoTurnos: (ini && ini.zonaEstado && ini.zonaEstado.turnos) ?? 2,
      zonaEstadoStacks: (ini && ini.zonaEstado && ini.zonaEstado.stacks) || '',
    };
    const prev = document.getElementById('adh-fondo');
    if(prev) prev.remove();
    const f = document.createElement('div');
    f.id = 'adh-fondo';
    document.body.appendChild(f);
    const cerrar = () => f.remove();
    const sinOp = () => st.tiraModo === 'stat' && !st.tira;

    // Lista de pasos: cambia según activo/modo/objetivo/tira, igual que en asistente-item.js (pasos()).
    function pasos(){
      const L = [{id: 'activo', corto: '¿Se juega?'}];
      if(!st.activo){ L.push({id: 'listo', corto: 'Listo'}); return L; }
      L.push({id: 'costo', corto: 'Costo'});
      if(st.modo === 'flash'){
        L.push({id: 'flash', corto: 'Flash'});
      }else if(st.modo === 'arma'){
        L.push({id: 'arma', corto: 'Tu ataque'}, {id: 'alcance', corto: 'Alcance'}, {id: 'efectos', corto: 'Al pegar'});
      }else{
        L.push({id: 'objetivo', corto: 'Objetivo'});
        if(st.objetivo !== 'uno mismo' && st.objetivo !== 'area' && st.objetivo !== 'onda' && st.objetivo !== 'zona') L.push({id: 'alcance', corto: 'Alcance'});
        L.push({id: 'tira', corto: 'Tirada'});
        if(!sinOp()) L.push({id: 'contra', corto: 'Resistencia'});
        L.push({id: 'dano', corto: 'Daño'});
        if(st.objetivo !== 'zona') L.push({id: 'efectos', corto: 'Efectos'});
      }
      L.push({id: 'listo', corto: 'Listo'});
      return L;
    }

    const titulo = (h, t, ayuda) => h + `<div class="adh-titulo">${t}</div><p class="adh-ayuda">${ayuda}</p>`;

    function cuerpoCosto(){
      let h = titulo('', '¿Cuánto cuesta ejecutarla?', 'Se cobra apenas tocás Ejecutar, antes de que se abra el duelo. Es el mismo costo de siempre de la habilidad (podés cambiarlo desde acá o desde su editor, es un solo dato). «X» en SP o Nitros significa que elegís cuánto pagar cada vez que la uses — esa misma X es la que podés usar en la Tirada o el Daño escribiendo «X» en la fórmula.');
      h += `<div class="fila"><span style="min-width:90px">SP</span><input type="text" style="width:100px" data-costo-sp value="${esc(st.costoSp)}" placeholder="ej. 3 o X"></div>`;
      h += `<div class="fila"><span style="min-width:90px">No2</span>
        <select data-costo-nitros-modo><option value="num"${st.costoNitrosModo === 'num' ? ' selected' : ''}>Un número</option><option value="x"${st.costoNitrosModo === 'x' ? ' selected' : ''}>X (se elige al usarla)</option><option value="ataque"${st.costoNitrosModo === 'ataque' ? ' selected' : ''}>Lo mismo que un ataque</option></select>
        ${st.costoNitrosModo === 'num' ? `<input type="number" min="0" style="width:70px" data-costo-nitros-num value="${esc(st.costoNitrosNum)}">` : ''}</div>`;
      h += `<div class="fila"><span style="min-width:90px">HP</span><input type="number" min="0" style="width:100px" data-costo-hp value="${esc(st.costoHp)}"><span class="nota" style="margin:0">0 = no gasta vida</span></div>`;
      return h;
    }
    function cuerpoAlcance(esArma){
      const lista = esArma ? [['auto', 'El de tu arma (cuerpo a cuerpo: 1 + su Alcance; a distancia: su Rango)'], ...ALCANCES.slice(1)] : ALCANCES;
      let h = titulo('', 'Alcance', 'No limita a quién podés apuntar: al elegir el objetivo, <b>los tokens que están a tu alcance brillan</b> en el mapa.');
      h += `<div class="fila"><select data-alcance>${lista.map(([v, t]) => `<option value="${v}"${st.alcance === v ? ' selected' : ''}>${t}</option>`).join('')}</select>${st.alcance === 'fijo' ? `<input type="number" min="1" style="width:70px" data-alcanceN value="${esc(st.alcanceN)}"><span>casilleros</span>` : ''}</div>`;
      return h;
    }
    const FLASH_EN = [['pdg', 'La tirada de quien la usa (PdG, PdG.Esp…)'], ['eva', 'Evasión'], ['parry', 'Parry'], ['bloqueo', 'Bloqueo'], ['fuerza', 'Fuerza del golpe'], ['dano', 'El daño']];
    function cuerpoFlash(){
      let h = titulo('', 'Reacción Flash en el duelo', 'Una habilidad Flash se usa <b>antes de una tirada</b> del duelo (nunca después de verla) y <b>no cuesta No2</b>, solo sus SP. En el cuadro del duelo aparece un botón «⚡» en las tiradas donde vale; al marcarlo y tirar, se cobran los SP y el bono se suma a esa tirada. Una vez por tirada.');
      h += `<div class="fila"><span>Suma</span><input type="number" style="width:70px" data-flashbono value="${esc(st.flashBono)}"><span>a la tirada</span></div>
        <p class="nota" style="margin-top:8px">Vale para:</p>
        ${FLASH_EN.map(([v, t]) => `<label class="op"><input type="checkbox" data-flashen="${v}" ${st.flashEn.has(v) ? 'checked' : ''}> ${t}</label>`).join('')}`;
      return h;
    }
    function cuerpoArma(){
      const a = st.arma;
      const fila = (k, t) => `<div class="fila"><span style="min-width:250px">${t}</span><input type="number" style="width:80px" data-arma="${k}" value="${esc(a[k] ?? 0)}"></div>`;
      let h = titulo('', 'Lo que la habilidad le suma a tu ataque', 'Se juega como un ataque normal con tu arma (PdG contra Evasión o Parry, crítico, daño y efectos del arma). Los No2 del ataque ya los cobra la habilidad. «Por X» se multiplica por la X que elegís al ejecutarla.');
      h += `${fila('pdg', '+ a la PdG (fijo)')}${fila('pdgPorX', '+ a la PdG por cada X')}${fila('dadosPorX', 'Dados de daño extra por cada X (del Tipo del arma)')}${fila('fijo', 'Daño fijo extra')}${fila('fijoPorX', 'Daño fijo extra por cada X')}
        <div class="fila"><span style="min-width:250px">La X de su costo es…</span><select data-x><option value="nitros"${st.x === 'nitros' ? ' selected' : ''}>los No2 (Nitros)</option><option value="sp"${st.x === 'sp' ? ' selected' : ''}>los SP</option></select></div>
        <label class="op"><input type="checkbox" data-sinparry ${a.sinParry ? 'checked' : ''}> No se puede parrear (solo esquivar)</label>
        <label class="op"><input type="checkbox" data-ignoraresistcrit-on ${a.ignoraResistCrit > 0 ? 'checked' : ''}> Ignora Resistencia a crítico</label>
        ${a.ignoraResistCrit > 0 ? `<div class="fila"><span style="min-width:250px">¿Cuántos puntos ignora?</span><input type="number" min="1" style="width:80px" data-arma="ignoraResistCrit" value="${esc(a.ignoraResistCrit)}"></div>` : ''}`;
      return h;
    }
    function cuerpoObjetivo(){
      let h = titulo('', '¿A quién apunta?', 'Elegí quién puede recibir esta habilidad.');
      h += `<select data-objetivo>${[['enemigo', 'A un enemigo (o a cualquier otro token)'], ['aliado', 'A un aliado'], ['uno mismo', 'A uno mismo (no hay que elegir)'], ['area', 'A un área (varios objetivos, en cascada — Orbe arcano, Tormenta arcana…)'], ['onda', 'Onda alrededor de quien la usa (sin marcar centro — Shockwave…)'], ['zona', 'Zona persistente (queda puesta varios turnos — Nube tóxica…)']].map(([v, t]) => `<option value="${v}"${st.objetivo === v ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
      if(st.objetivo === 'onda'){
        h += `<p class="nota" style="margin-top:10px">No hay que marcar nada: al ejecutarla, todo rival dentro de este radio <b>alrededor de tu token</b> entra en la cascada, uno detrás del otro. Vos tirás una sola vez y cada uno se resiste por separado. No hay dodge roll: no tienen a dónde salir. No te afecta a vos.</p>
          <div class="fila"><input type="number" min="1" style="width:70px" data-radio value="${esc(st.radio)}"><span>casilleros de radio (1 = los adyacentes)</span></div>`;
      }
      if(st.objetivo === 'area'){
        h += `<p class="nota" style="margin-top:10px">Marcás el centro en el mapa al ejecutarla; todo rival adentro de este radio entra en la cascada, uno detrás del otro (Paso 4 del casteo: primero tira Evasión contra tu tirada; si la gana, tiene derecho a un dodge roll).</p>
          <div class="fila"><input type="number" min="0" style="width:70px" data-radio value="${esc(st.radio)}"><span>casilleros de radio</span></div>`;
      }
      if(st.objetivo === 'zona'){
        h += `<p class="nota" style="margin-top:10px">Marcás el centro en el mapa al ejecutarla, como el área — pero <b>queda puesta varios turnos</b>: no se resuelve todo de una. Cualquier rival que entre, o que siga adentro en cada Mantenimiento, se chequea por separado; si esta habilidad tiene una tirada (paso «Tirada»), la tirás una sola vez al lanzarla y esa misma tirada se reusa contra la resistencia de cada uno (paso «Resistencia»). A quien pierde (o entra sin nada que resistir) se le puede aplicar un estado y/o el daño del paso «Daño».</p>
          <div class="fila"><input type="number" min="1" style="width:70px" data-radio value="${esc(st.radio)}"><span>casilleros de radio</span></div>
          <div class="fila"><input type="number" min="1" style="width:70px" data-zonaturnos value="${esc(st.zonaTurnos)}"><span>turnos que dura</span></div>
          <label class="op"><input type="checkbox" data-zonaamiga ${st.zonaAmiga ? 'checked' : ''}> También afecta a tus aliados (no solo a los rivales)</label>
          <div style="margin-top:12px"><h4 style="margin:0 0 6px">¿Deja un estado en quien corresponda?</h4>
            <select data-zonaestado><option value="">— ninguno (solo el daño del paso «Daño», si tiene) —</option>${nombresEstado().map(n => `<option value="${esc(n)}"${st.zonaEstadoNombre === n ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></div>`;
        if(st.zonaEstadoNombre){
          h += `<div class="fila"><span>Dura</span><input type="number" min="0" style="width:64px" data-zonaestadoturnos value="${esc(st.zonaEstadoTurnos)}"><span>turnos</span></div>`;
          if(['Veneno', 'Veneno severo'].includes(st.zonaEstadoNombre)){
            h += `<div class="fila"><span>Stacks</span><input type="number" min="1" style="width:64px" data-zonaestadostacks placeholder="por defecto" value="${esc(st.zonaEstadoStacks)}"></div>`;
          }
        }
      }
      return h;
    }
    function cuerpoTira(){
      let h = titulo('', '¿Qué tira quien la usa?', 'El stat que tira quien ejecuta la habilidad, o —si no encaja en ninguno— tu propia fórmula (ej. Drenar vida: «X + 1dX»). «Nada» es para buffs y curas: no hay nada que resistir.');
      h += `<select data-tira-modo><option value="stat"${st.tiraModo !== 'custom' ? ' selected' : ''}>Un stat de la ficha</option><option value="custom"${st.tiraModo === 'custom' ? ' selected' : ''}>Personalizada: mi propia fórmula, con mi texto</option></select>`;
      if(st.tiraModo === 'custom'){
        h += `<div class="fila" style="margin-top:8px"><input type="text" style="min-width:160px" data-tira-formula placeholder="ej. X+1dX (podés usar «X»)" value="${esc(st.tiraFormula)}"></div>
          <div class="fila"><input type="text" style="min-width:240px" data-tira-etiqueta placeholder="¿Qué representa? (ej. Drenaje)" value="${esc(st.tiraEtiqueta)}"></div>
          <p class="nota" style="margin-top:6px">Se tira con esa fórmula (podés usar «X» si la habilidad ya tiene costo variable) y se anuncia en la Mesa con tu texto, en vez del nombre de un stat.</p>`;
      }else{
        h += `<select data-tira style="margin-top:8px"><option value=""${sinOp() ? ' selected' : ''}>Nada: no hay nada que resistir, se aplica directo (buffs, curas)</option>${TIRA.map(([v, t]) => `<option value="${v}"${st.tira === v ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
        if(sinOp()) h += `<div class="aviso" style="margin-top:10px">Sin tirada: al ejecutarla se abre el cuadro del duelo con los efectos y su botón <b>Aplicar</b>. Así la acción tiene su momento en pantalla.</div>`;
      }
      return h;
    }
    function cuerpoContra(){
      let h = titulo('', '¿Con qué se resiste el objetivo?', 'Si marcás más de uno, el objetivo elige uno a ciegas, antes de ver tu tirada. Un proyectil suele esquivarse (Evasión); un efecto sobre el cuerpo se resiste con Res.Esp; un control mental con Res.Mt. Un hechizo no se parrea ni se bloquea.');
      h += CONTRA.map(([v, t]) => `<label class="op"><input type="checkbox" data-contra="${v}" ${st.contra.has(v) ? 'checked' : ''}> ${t}</label>`).join('');
      return h;
    }
    function cuerpoDano(){
      let h = titulo('', 'Daño y lo que no se pueda automatizar', 'Si la habilidad hace daño, usa la fórmula que ya tiene cargada (su «segunda tirada», por ejemplo 2d6+3) — se escribe en el editor de siempre de la habilidad, no acá. Si además (o en vez de eso) tiene un efecto que el sistema no calcula solo, escribilo como texto.');
      h += `<label class="op"><input type="checkbox" data-dano ${st.dano ? 'checked' : ''}> Esta habilidad hace daño${cfg.tieneFormula === false ? ' <span class="nota">(esta habilidad todavía no tiene fórmula: escribila en su editor)</span>' : ''}</label>`;
      if(st.dano){
        h += `<div class="fila"><span>Tipo:</span><select data-tipodano>${TIPOS.map(([v, t]) => `<option value="${v}"${st.tipoDano === v ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
          <label class="op"><input type="checkbox" data-ignoradano ${st.ignoraDano ? 'checked' : ''}> Ignora la Defensa (va derecho a la vida y no critica)</label>
          <p class="nota">Arranca marcado o no según el tipo (mágico = sí, físico = no), pero es independiente: lo que decide no es el elemento, es cómo se narra la habilidad — una "ráfaga de hielo" (energía) ignora la Defensa; una "aguja de hielo" (un objeto físico arrojado) no, aunque las dos sean "Hielo". Destildá acá para esa excepción.</p>`;
        if(cfg.costoVariable){
          h += `<div class="fila" style="margin-top:8px"><span>Además, por cada punto de X (tu costo en ${cfg.costoVariable === 'sp' ? 'SP' : 'Nitros'}):</span><span>+</span><input type="number" style="width:70px" data-danoporx value="${esc(st.danoFijoPorX)}"><span>de daño fijo</span></div>
            <p class="nota">Ej. "amplifica el daño en el doble de X" → poné 2: con X = 3 suma +6 al tirar. Vacío o 0 = la fórmula no cambia con X.</p>`;
        }
      }
      h += `<div class="fila" style="margin-top:14px"><label class="op" style="padding:0"><input type="checkbox" data-efectolibre-on ${st.efectoLibreOn ? 'checked' : ''}> Tiene un efecto que no se puede automatizar del todo</label></div>`;
      if(st.efectoLibreOn){
        h += `<textarea data-efectolibre rows="3" style="width:100%;box-sizing:border-box;background:#0e1220;color:#fff;border:1px solid #39435c;border-radius:8px;padding:8px;font-size:14px" placeholder="ej. Drenás una cantidad de HP igual a la diferencia entre tu tirada y su resistencia; sumátela a tu vida (Excedente de vida si pasa tu máximo).">${esc(st.efectoLibre)}</textarea>
          <p class="nota" style="margin-top:6px">Este texto se muestra en el cuadro del duelo junto al resultado (con la diferencia entre las dos tiradas, si la hubo), para que quien juega lo resuelva a mano.</p>`;
      }
      return h;
    }
    function cuerpoEfectos(){
      let h = titulo('', st.modo === 'arma' ? 'Efectos al pegar' : 'Efectos sobre el objetivo', 'Cada uno sale como un momento propio, con su botón «Aplicar» (los que no se puedan aplicar solos quedan «a mano»). Solo entran si la habilidad funciona.');
      h += st.efectos.map((e, i) => e.cura !== undefined
        ? `<div class="fila"><span>💚 Cura</span><input type="number" min="1" style="width:80px" data-ef-cura="${i}" value="${esc(e.cura)}"><span>HP</span><button type="button" class="rojo" data-ef-x="${i}">Quitar</button></div>`
        : `<div class="fila"><span>◎ Estado</span><input type="text" list="adh-estados" data-ef-nombre="${i}" value="${esc(e.nombre)}" placeholder="nombre (elegí uno o escribí el tuyo)" style="width:200px"><span>durante</span><input type="number" min="0" style="width:64px" data-ef-turnos="${i}" value="${esc(e.turnos ?? 2)}"><span>turnos</span><button type="button" class="rojo" data-ef-x="${i}">Quitar</button></div>
          <div class="fila" style="margin-left:22px"><span class="nota" style="margin:0">y da (opcional):</span><select data-ef-stat="${i}"><option value="">— ningún bono —</option>${BONOS.map(([v, t]) => `<option value="${v}"${e.stat === v ? ' selected' : ''}>${t}</option>`).join('')}</select><input type="number" style="width:64px" data-ef-val="${i}" value="${esc(e.val ?? 1)}"><span class="nota" style="margin:0">(negativo = resta)</span></div>`).join('');
      h += `<datalist id="adh-estados">${nombresEstado().map(n => `<option value="${esc(n)}">`).join('')}</datalist>
        <div class="fila"><button type="button" class="sec" data-ef-mas="estado">＋ Estado</button><button type="button" class="sec" data-ef-mas="cura">＋ Cura</button></div>`;
      h += `<div class="fila" style="margin-top:14px"><label class="op" style="padding:0"><input type="checkbox" data-efectosnota-on ${st.efectosNotaOn ? 'checked' : ''}> Personalizar: tiene otro efecto que no está en la lista</label></div>`;
      if(st.efectosNotaOn){
        h += `<textarea data-efectosnota rows="3" style="width:100%;box-sizing:border-box;background:#0e1220;color:#fff;border:1px solid #39435c;border-radius:8px;padding:8px;font-size:14px" placeholder="ej. Invertí el orden de turno de todos los presentes hasta tu próximo turno.">${esc(st.efectosNota)}</textarea>
          <p class="nota" style="margin-top:6px">Este texto se muestra junto a los demás efectos del duelo, sin botón «Aplicar» — para resolverlo a mano.</p>`;
      }
      return h;
    }
    function cuerpoActivo(){
      let h = titulo('', '¿Se juega en el duelo?', 'Si lo tildás, ejecutar esta habilidad abre el cuadro del duelo paso a paso — elegís el objetivo, se tira, se ve en vivo, con su resumen en la Mesa. Si no, se ejecuta como antes: se anuncia y tira su fórmula sola.');
      h += `<label class="op"><input type="checkbox" data-activo ${st.activo ? 'checked' : ''}> Ejecutar esta habilidad abre el duelo paso a paso</label>`;
      if(st.activo){
        h += `<div style="margin-top:10px"><h4>¿Qué tipo de habilidad es?</h4>
          <select data-modo><option value="hab"${st.modo === 'hab' ? ' selected' : ''}>Habilidad dirigida (hechizo, control, apoyo…)</option><option value="arma"${st.modo === 'arma' ? ' selected' : ''}>Ataque con mi arma, con arreglos (Golpe brutal, Carga, Takle…)</option><option value="flash"${st.modo === 'flash' ? ' selected' : ''}>⚡ Reacción Flash (suma a una tirada del duelo)</option></select></div>`;
      }
      return h;
    }
    function cuerpoListo(){
      if(!st.activo) return titulo('', 'Listo', 'Esta habilidad no usa el duelo: se ejecuta como antes (se anuncia en la Mesa y tira su fórmula sola, sin objetivo ni cuadro).') + `<div class="adh-resumen">Sin duelo.</div>`;
      let h = titulo('', 'Revisá cómo quedó', 'Si algo no está bien, tocá el paso arriba para volver.');
      const filas = [];
      const nitrosTxt = st.costoNitrosModo === 'ataque' ? 'como un ataque' : st.costoNitrosModo === 'x' ? 'X (se elige al usarla)' : `${st.costoNitrosNum}`;
      filas.push(`<b>Costo</b>: SP ${esc(st.costoSp) || '0'} · No2 ${nitrosTxt}${st.costoHp ? ` · HP ${st.costoHp}` : ''}`);
      if(st.modo === 'flash'){
        filas.push(`<b>Flash</b>: +${esc(st.flashBono)} a ${[...st.flashEn].map(v => (FLASH_EN.find(x => x[0] === v) || [v, v])[1].split(' (')[0]).join(', ') || 'ninguna tirada'}`);
      }else if(st.modo === 'arma'){
        const a = st.arma, partes = [];
        if(a.pdg) partes.push(`${a.pdg > 0 ? '+' : ''}${a.pdg} PdG`);
        if(a.pdgPorX) partes.push(`${a.pdgPorX > 0 ? '+' : ''}${a.pdgPorX} PdG por X`);
        if(a.dadosPorX) partes.push(`+${a.dadosPorX} dado(s) de daño por X`);
        if(a.fijo) partes.push(`${a.fijo > 0 ? '+' : ''}${a.fijo} de daño fijo`);
        if(a.fijoPorX) partes.push(`${a.fijoPorX > 0 ? '+' : ''}${a.fijoPorX} de daño fijo por X`);
        if(a.sinParry) partes.push('no se puede parrear');
        if(a.ignoraResistCrit) partes.push(`ignora ${a.ignoraResistCrit} de Resistencia a crítico`);
        filas.push(`<b>Ataque con arma</b>: ${partes.join(', ') || 'sin arreglos'} · X en ${st.x === 'sp' ? 'SP' : 'Nitros'}`);
        if(st.alcance !== 'auto') filas.push(`<b>Alcance</b>: ${(ALCANCES.find(x => x[0] === st.alcance) || [])[1] || st.alcance}${st.alcance === 'fijo' ? ` (${st.alcanceN})` : ''}`);
      }else{
        filas.push(`<b>Objetivo</b>: ${st.objetivo === 'onda' ? 'onda alrededor de quien la usa' : st.objetivo === 'zona' ? `zona persistente, ${st.zonaTurnos} turnos` : st.objetivo}${['area', 'onda', 'zona'].includes(st.objetivo) ? ` (radio ${st.radio})` : ''}`);
        if(st.objetivo === 'zona'){
          filas.push(`<b>Alcanza</b>: ${st.zonaAmiga ? 'rivales y aliados' : 'solo rivales'}`);
          if(st.zonaEstadoNombre) filas.push(`<b>Deja</b>: ${esc(st.zonaEstadoNombre)}${['Veneno', 'Veneno severo'].includes(st.zonaEstadoNombre) && st.zonaEstadoStacks ? ` ×${st.zonaEstadoStacks}` : ''} (${st.zonaEstadoTurnos}t)`);
        }
        if(st.alcance !== 'auto' && st.objetivo !== 'uno mismo' && st.objetivo !== 'area' && st.objetivo !== 'onda' && st.objetivo !== 'zona') filas.push(`<b>Alcance</b>: ${(ALCANCES.find(x => x[0] === st.alcance) || [])[1] || st.alcance}${st.alcance === 'fijo' ? ` (${st.alcanceN})` : ''}`);
        const contraTxt = [...st.contra].map(v => STAT_TXT[v] || v).join(' / ') || '(elegí con qué se resiste)';
        filas.push(sinOp() ? '<b>Sin tirada</b>: se aplica directo'
          : st.tiraModo === 'custom' ? `<b>Tirada personalizada</b>: ${esc(st.tiraFormula) || '(sin fórmula)'}${st.tiraEtiqueta ? ' · ' + esc(st.tiraEtiqueta) : ''} contra ${contraTxt}`
          : `<b>Tirada</b>: ${STAT_TXT[st.tira] || st.tira} contra ${contraTxt}`);
        if(st.dano) filas.push(`<b>Daño</b>: tipo ${st.tipoDano}${st.ignoraDano ? ', ignora la Defensa' : ''}${cfg.costoVariable && st.danoFijoPorX ? `, +${st.danoFijoPorX} por X` : ''}`);
        if(st.efectoLibreOn && st.efectoLibre.trim()){ const t = st.efectoLibre.trim(); filas.push(`<b>Efecto a mano</b>: ${esc(t.length > 90 ? t.slice(0, 90) + '…' : t)}`); }
      }
      if(st.modo !== 'flash' && st.objetivo !== 'zona'){
        const efTxt = st.efectos.filter(e => e.cura !== undefined ? e.cura > 0 : e.nombre).map(e => e.cura !== undefined ? `💚 ${e.cura} HP` : `◎ ${e.nombre} (${e.turnos ?? 2}t)`).join(', ');
        filas.push(`<b>Efectos</b>: ${efTxt || 'ninguno'}`);
        if(st.efectosNotaOn && st.efectosNota.trim()){ const t = st.efectosNota.trim(); filas.push(`<b>Efecto personalizado</b>: ${esc(t.length > 90 ? t.slice(0, 90) + '…' : t)}`); }
      }
      h += `<div class="adh-resumen">${filas.join('<br>')}</div>`;
      return h;
    }

    function dibujar(){
      const L = pasos();
      st.paso = Math.max(0, Math.min(L.length - 1, st.paso));
      const id = L[st.paso].id;
      const cuerpo = id === 'activo' ? cuerpoActivo() : id === 'costo' ? cuerpoCosto() : id === 'objetivo' ? cuerpoObjetivo() : id === 'alcance' ? cuerpoAlcance(st.modo === 'arma')
        : id === 'tira' ? cuerpoTira() : id === 'contra' ? cuerpoContra() : id === 'dano' ? cuerpoDano() : id === 'efectos' ? cuerpoEfectos()
        : id === 'arma' ? cuerpoArma() : id === 'flash' ? cuerpoFlash() : cuerpoListo();
      const chips = `<div class="adh-chips">${L.map((x, i) => `<button type="button" class="adh-chip${i === st.paso ? ' activo' : ''}${i < st.paso ? ' hecho' : ''}" data-paso="${i}">${i + 1}. ${x.corto}</button>`).join('')}</div>`;
      const nav = `<div class="adh-nav">${st.paso > 0 ? '<button type="button" class="sec" data-atras>← Atrás</button>' : '<span></span>'}${st.paso < L.length - 1 ? '<button type="button" data-siguiente>Siguiente →</button>' : '<span></span>'}</div>`;
      f.innerHTML = `<div class="adh"><header><span>⚔ Duelo · ${esc(cfg.nombre || 'Habilidad')}</span><button type="button" class="sec" data-x>✕</button></header>
        <div class="cuerpo">${chips}${cuerpo}${nav}</div>
        <div class="pie">${ini ? '<button type="button" class="rojo" data-quitar title="Vuelve a la ejecución de siempre (sin duelo)">Sacar el duelo de esta habilidad</button>' : ''}<button type="button" class="sec" data-x>Cancelar</button><button type="button" data-ok>Guardar</button></div></div>`;
      f.querySelectorAll('[data-x]').forEach(b => b.onclick = cerrar);
      f.querySelectorAll('[data-paso]').forEach(b => b.onclick = () => { st.paso = +b.dataset.paso; dibujar(); });
      const atras = f.querySelector('[data-atras]'); if(atras) atras.onclick = () => { st.paso--; dibujar(); };
      const sig = f.querySelector('[data-siguiente]'); if(sig) sig.onclick = () => { st.paso++; dibujar(); };
      const q = (sel, fn) => { const el = f.querySelector(sel); if(el) el.onchange = fn; };
      q('[data-activo]', e => { st.activo = e.target.checked; st.paso = 0; dibujar(); });
      q('[data-costo-sp]', e => { st.costoSp = e.target.value; });
      q('[data-costo-nitros-modo]', e => { st.costoNitrosModo = e.target.value; dibujar(); });
      q('[data-costo-nitros-num]', e => { st.costoNitrosNum = Math.max(0, Math.round(Number(e.target.value) || 0)); });
      q('[data-costo-hp]', e => { st.costoHp = Math.max(0, Math.round(Number(e.target.value) || 0)); });
      q('[data-objetivo]', e => { st.objetivo = e.target.value; if(st.objetivo === 'onda' && st.radio > 1 && !ini) st.radio = 1; dibujar(); });
      q('[data-modo]', e => { st.modo = e.target.value; dibujar(); });
      q('[data-flashbono]', e => { st.flashBono = Number(e.target.value) || 0; });
      f.querySelectorAll('[data-flashen]').forEach(c => c.onchange = () => { c.checked ? st.flashEn.add(c.dataset.flashen) : st.flashEn.delete(c.dataset.flashen); });
      q('[data-x]', e => { st.x = e.target.value; });
      q('[data-sinparry]', e => { st.arma.sinParry = e.target.checked; });
      q('[data-ignoraresistcrit-on]', e => { st.arma.ignoraResistCrit = e.target.checked ? 1 : 0; dibujar(); });
      f.querySelectorAll('[data-arma]').forEach(i => i.onchange = () => { st.arma[i.dataset.arma] = Number(i.value) || 0; });
      q('[data-tira]', e => { st.tira = e.target.value; dibujar(); });
      q('[data-tira-modo]', e => { st.tiraModo = e.target.value; dibujar(); });
      q('[data-tira-formula]', e => { st.tiraFormula = e.target.value; });
      q('[data-tira-etiqueta]', e => { st.tiraEtiqueta = e.target.value; });
      q('[data-alcance]', e => { st.alcance = e.target.value; dibujar(); });
      q('[data-alcanceN]', e => { st.alcanceN = Math.max(1, Math.round(Number(e.target.value) || 1)); });
      q('[data-radio]', e => { st.radio = Math.max(0, Math.round(Number(e.target.value) || 0)); });
      q('[data-zonaturnos]', e => { st.zonaTurnos = Math.max(1, Math.round(Number(e.target.value) || 1)); });
      q('[data-zonaamiga]', e => { st.zonaAmiga = e.target.checked; });
      q('[data-zonaestado]', e => { st.zonaEstadoNombre = e.target.value; dibujar(); });
      q('[data-zonaestadoturnos]', e => { st.zonaEstadoTurnos = Math.max(0, Math.round(Number(e.target.value) || 0)); });
      q('[data-zonaestadostacks]', e => { st.zonaEstadoStacks = Math.max(0, Math.round(Number(e.target.value) || 0)); });
      f.querySelectorAll('[data-contra]').forEach(c => c.onchange = () => { c.checked ? st.contra.add(c.dataset.contra) : st.contra.delete(c.dataset.contra); });
      q('[data-dano]', e => { st.dano = e.target.checked; dibujar(); });
      q('[data-tipodano]', e => { st.tipoDano = e.target.value; st.ignoraDano = st.tipoDano !== 'fisico'; dibujar(); });
      q('[data-ignoradano]', e => { st.ignoraDano = e.target.checked; });
      q('[data-danoporx]', e => { st.danoFijoPorX = Number(e.target.value) || 0; });
      q('[data-efectolibre-on]', e => { st.efectoLibreOn = e.target.checked; dibujar(); });
      q('[data-efectolibre]', e => { st.efectoLibre = e.target.value; });
      q('[data-efectosnota-on]', e => { st.efectosNotaOn = e.target.checked; dibujar(); });
      q('[data-efectosnota]', e => { st.efectosNota = e.target.value; });
      f.querySelectorAll('[data-ef-nombre]').forEach(i => i.onchange = () => { st.efectos[+i.dataset.efNombre].nombre = i.value.trim(); });
      f.querySelectorAll('[data-ef-stat]').forEach(i => i.onchange = () => { st.efectos[+i.dataset.efStat].stat = i.value; });
      f.querySelectorAll('[data-ef-val]').forEach(i => i.onchange = () => { st.efectos[+i.dataset.efVal].val = Number(i.value) || 0; });
      f.querySelectorAll('[data-ef-turnos]').forEach(i => i.onchange = () => { st.efectos[+i.dataset.efTurnos].turnos = Math.max(0, Math.round(Number(i.value) || 0)); });
      f.querySelectorAll('[data-ef-cura]').forEach(i => i.onchange = () => { st.efectos[+i.dataset.efCura].cura = Math.max(1, Math.round(Number(i.value) || 1)); });
      f.querySelectorAll('[data-ef-x]').forEach(b => b.onclick = () => { st.efectos.splice(+b.dataset.efX, 1); dibujar(); });
      f.querySelectorAll('[data-ef-mas]').forEach(b => b.onclick = () => { st.efectos.push(b.dataset.efMas === 'cura' ? {cura: 5} : {nombre: nombresEstado()[0] || 'Estado', turnos: 2}); dibujar(); });
      const bq = f.querySelector('[data-quitar]');
      if(bq) bq.onclick = () => { cerrar(); cfg.alGuardar(null); };
      // Costo (2026-09-27, pedido del dueño): se guarda junto con el duelo, en el mismo Guardar — es el mismo
      // dato de siempre (it.costo/nitrosCosto/hpCosto), no uno nuevo. cfg.alGuardar recibe {duelo, costo}
      // cuando se guarda algo (null sigue siendo "sin duelo", sin tocar el costo).
      const costoResultado = () => ({sp: st.costoSp.trim(), nitrosCosto: st.costoNitrosModo === 'ataque' ? 'ATAQUE' : st.costoNitrosModo === 'x' ? 'X' : st.costoNitrosNum, hpCosto: st.costoHp});
      f.querySelector('[data-ok]').onclick = () => {
        if(!st.activo){ cerrar(); cfg.alGuardar(null); return; }
        if(st.modo === 'flash'){
          if(!st.flashEn.size){ alert('Marcá al menos una tirada donde vale el Flash.'); return; }
          cerrar(); cfg.alGuardar({duelo: {modo: 'flash', flash: {en: [...st.flashEn], bono: st.flashBono}}, costo: costoResultado()}); return;
        }
        const efs = st.efectos.filter(e => e.cura !== undefined ? e.cura > 0 : e.nombre).map(e => e.cura !== undefined ? {cura: e.cura} : {nombre: e.nombre, turnos: e.turnos ?? 2, ...(e.stat ? {stat: e.stat, val: e.val ?? 1} : {})});
        if(st.modo === 'arma'){
          const o2 = {modo: 'arma', objetivo: 'enemigo', x: st.x, arma: {...st.arma}, efectos: efs};
          if(st.efectosNotaOn && st.efectosNota.trim()) o2.efectosNota = st.efectosNota.trim();
          if(st.alcance !== 'auto'){ o2.alcance = st.alcance; if(st.alcance === 'fijo') o2.alcanceN = st.alcanceN; }
          cerrar(); cfg.alGuardar({duelo: o2, costo: costoResultado()}); return;
        }
        const hayTira = st.tiraModo === 'custom' ? !!st.tiraFormula.trim() : !!st.tira;
        if(st.tiraModo === 'custom' && !st.tiraFormula.trim()){ alert('Escribí la fórmula de la tirada personalizada (podés usar «X»).'); return; }
        const out = {objetivo: st.objetivo, tira: st.tiraModo === 'stat' ? (st.tira || '') : '', contra: hayTira ? [...st.contra] : []};
        if(st.tiraModo === 'custom'){ out.tiraFormula = st.tiraFormula.trim(); out.tiraEtiqueta = st.tiraEtiqueta.trim() || 'Tirada'; }
        if((st.objetivo === 'area' || st.objetivo === 'onda') && !hayTira){ alert('Una habilidad de área u onda necesita una tirada (ej. PdG.Esp o Fuerza contra lo que resiste cada uno) — elegí qué tira quien la usa.'); return; }
        if(st.objetivo === 'zona' && !st.dano && !st.zonaEstadoNombre){ alert('Una zona persistente necesita hacer algo: marcá «Esta habilidad hace daño» en el paso Daño y/o elegí un estado en el paso Objetivo.'); return; }
        if(hayTira && !out.contra.length){ alert('Marcá con qué se resiste el objetivo (o elegí «Nada» en lo que tira quien la usa).'); return; }
        if(st.dano){ out.dano = true; out.tipoDano = st.tipoDano; out.ignoraDano = st.ignoraDano; if(cfg.costoVariable && st.danoFijoPorX) out.danoFijoPorX = st.danoFijoPorX; }
        if(st.efectoLibreOn && st.efectoLibre.trim()) out.efectoLibre = st.efectoLibre.trim();
        if(st.efectosNotaOn && st.efectosNota.trim()) out.efectosNota = st.efectosNota.trim();
        if(st.objetivo === 'area' || st.objetivo === 'onda' || st.objetivo === 'zona') out.radio = Math.max(st.objetivo === 'area' ? 0 : 1, st.radio);
        if(st.objetivo === 'zona'){
          out.zonaTurnos = st.zonaTurnos;
          if(st.zonaAmiga) out.zonaAmiga = true;
          if(st.zonaEstadoNombre){
            out.zonaEstado = {nombre: st.zonaEstadoNombre, turnos: st.zonaEstadoTurnos};
            if(['Veneno', 'Veneno severo'].includes(st.zonaEstadoNombre) && st.zonaEstadoStacks) out.zonaEstado.stacks = st.zonaEstadoStacks;
          }
        }
        if(st.alcance !== 'auto'){ out.alcance = st.alcance; if(st.alcance === 'fijo') out.alcanceN = st.alcanceN; }
        out.efectos = st.efectos.filter(e => e.cura !== undefined ? e.cura > 0 : e.nombre).map(e => e.cura !== undefined ? {cura: e.cura} : {nombre: e.nombre, turnos: e.turnos ?? 2, ...(e.stat ? {stat: e.stat, val: e.val ?? 1} : {})});
        cerrar();
        cfg.alGuardar({duelo: out, costo: costoResultado()});
      };
    }
    // Nombres de estados que conoce el juego (debuffs automáticos); se puede escribir otro a mano si no hay lista.
    function nombresEstado(){
      return (typeof EstadosAplicar !== 'undefined' && EstadosAplicar.DEBUFFS) ? EstadosAplicar.DEBUFFS.map(p => p.nombre) : [];
    }
    dibujar();
  }
  return {abrir};
})();
