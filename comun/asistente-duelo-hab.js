/* comun/asistente-duelo-hab.js — «⚔ Duelo» de una habilidad (2026-09-27, docs/duelo-de-habilidades.md).
   Desde 2026-10-02 (tanda 4 de docs/plan-paso-a-paso.md) se abre en la ventana común paso a paso (comun/paso-a-paso.js): título con
   el paso, pestañas que saltan, Guardar siempre visible y la paleta de todos (antes era azul, con pastillitas).
   Ventana PASO A PASO (2026-09-27, pedido del dueño — mismo criterio que el resto de los asistentes del
   juego: comun/asistente-item.js, comun/asistente-trampa.js, comun/asistente-estado.js) para decidir cómo
   se juega una habilidad dirigida en el duelo: a quién apunta, qué tira quien la usa, con qué se resiste
   el objetivo, si hace daño (y de qué tipo), y qué efectos deja (estados o cura). Cada paso tiene su propio
   título y explicación, como los demás asistentes — nada de scroll largo con todo junto. Sin tocar ningún
   dato a mano: devuelve el objeto `duelo` que guarda la habilidad (o null = sin duelo).

   Uso:  AsistenteDueloHab.abrir({nombre, inicial, tieneFormula, costoVariable: 'sp'|'nitros'|'',
   costoInicial: {sp, nitrosCosto, hpCosto}, elegirEstado, alGuardar: resultado => …});
   `elegirEstado` (2026-09-28, pedido del dueño — "el selector de estado no debería ser un desplegable... sino
   un botón de +ESTADO que despliegue el menú de estados alterados... siguiendo el mismo andamiaje"): función
   opcional, sin argumentos, que devuelve una Promise con el resultado del selector REAL de estados de la
   página (la grilla con Ver/Activar de siempre + el cartelito de EstadoPreguntas que pregunta las cantidades)
   en vez de reinventar uno adentro de este archivo compartido — cada página (ficha.html, gm-tools.html) la
   define con SU propio catálogo (EFECTOS_PRESET / ESTADOS_PRESET_GM). Devuelve `null` (canceló), `{modo:
   'manual'}` ("Empezar en blanco": el paso "Efectos" muestra sus campos de siempre —nombre a mano, turnos,
   un bono, un escudo— para algo que no está en ningún catálogo) o `{modo:'preset', nombre, turnos, permanente,
   hp, mods, stacks, escudoMagico, polaridad, detalle}` (un preset real ya con sus cantidades respondidas —
   mismo formato que devuelve `EstadoPreguntas.pedir`, con `hp` ya normalizado por la página que llama, que es
   `hpturno` en la ficha y `hpTurno` en gm-tools). Sin `elegirEstado` (compatibilidad), el botón ＋ Estado cae
   en el comportamiento viejo: un campo de texto con un `<datalist>` de sugerencias.
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
   Zona, daño «la diferencia» (2026-10-02, pedido del dueño, Pedos Tóxicos): `danoDiferencia: true` = cada uno que no resiste
   recibe tu tirada menos la suya (empate: nada); `danoExtra` ('1d20') = si el daño entra, se tira además esa fórmula y se
   publica con el texto de `efectoLibre` (qué significa cada resultado; aplicarlo sigue a mano).
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
   sin botón «Aplicar». Existe tanto en modo:'hab' como en modo:'arma' (ambos usan `cuerpoEfectos`).
   **"No lleva tirada" y "Nadie"/"Otro" en Resistencia** (2026-09-28, pedido del dueño — el menú sirve para
   automatizar CUALQUIER habilidad, no solo ataques: muchas son buffs sobre uno mismo o un aliado, sin nada que
   las resista). Paso "Tirada": un tilde propio arriba de todo (`tiraNinguna`) tapa el resto sea cual sea el modo
   (stat o fórmula personalizada) — antes «Nada» vivía escondido adentro del `<select>` de stats y no existía en
   modo personalizada. Paso "Resistencia" (solo si hay tirada y el objetivo no es área/onda, que sí necesitan un
   stat real para la cascada): además de la lista de siempre, «Nadie» (se aplica directo, aunque haya tirada —
   por ejemplo un buff con una tirada propia de sabor) y «Otro» (`contraOtro`, texto libre para algo que no está
   en la lista de stats: se muestra en el cuadro del duelo como recordatorio, la mesa lo resuelve a mano). Ninguna
   de las dos cambia `sinOposicion` en el sentido mecánico: con contra vacío el duelo se abre directo en los
   efectos, como ya hacía un buff sin tirada.
   **Costo distinto en turno ajeno** (2026-09-28, pedido del dueño — paso intermedio hasta tener al mapa avisando
   solo de quién es el turno, ver `docs/pendientes.md`): el paso "Costo" suma un tilde "El costo en SP es
   distinto si no es tu turno" + el SP que se cobra en ese caso (`turnoAjenoSp` en `costoInicial`/`costoResultado`,
   vacío = no aplica). Solo guarda el dato — quien ejecuta la habilidad (`ficha-personaje/ficha.html`,
   `comun/confirmar-turno.js`) es quien pregunta «¿es tu turno?» y cobra el SP que corresponda, antes de nada más. */
const AsistenteDueloHab = (() => {
  // La cura: un número (5) o dados (1d10, 2d8+1), que se tiran al usarla (2026-10-07, Combatiente.curaTirada).
  const curaValida = v => typeof v === 'string' ? /^\s*\d*d\d+(\s*[+-]\s*\d+)?\s*$/i.test(v) || Number(v) > 0 : Number(v) > 0;
  const TIRA = [['pdgmg', 'PdG.Esp (magia u otros efectos del Especial)'], ['dmgesp', 'Ef.Esp (efecto especial: la potencia de un efecto del Especial, no si pega)'],['pdg', 'PdG (probabilidad de golpe)'], ['fue', 'Fuerza'], ['con', 'Constitución'], ['agl', 'Agilidad'], ['des', 'Destreza'], ['esp', 'Especial']];
  const CONTRA = [['eva', 'Evasión (esquivar un proyectil)'], ['parry', 'Parry (bloquear con un arma o escudo — solo si el objetivo tiene uno equipado)'], ['resmg', 'Res.Esp (resistir magia u otros efectos del Especial)'], ['resm', 'Res.Mt (resistir la mente)'], ['con', 'Constitución'], ['fue', 'Fuerza'], ['esp', 'Especial'], ['des', 'Destreza'], ['agl', 'Agilidad']];
  const ALCANCES = [['auto', 'Automático (lo especial usa tu Rango, el de la Destreza)'], ['rango', 'Rango (el de la Destreza: armas a distancia y lo especial)'], ['adyacente', 'Cuerpo a cuerpo (casilleros de al lado)'], ['fijo', 'Un número de casilleros'], ['ilimitado', 'Sin límite (no resalta nada)']];
  const BONOS = [['pdg', 'PdG'], ['dmg', 'Daño'], ['eva', 'Evasión'], ['def', 'Defensa'], ['nitros', 'No2'], ['resmg', 'Res.Esp'], ['resm', 'Res.Mt'], ['parry', 'Parry'], ['bloqueo', 'Bloqueo']];
  const BONOS_LABEL = Object.fromEntries(BONOS);
  const TIPOS = [['arcano', 'Arcano (mágico)'], ['fuego', 'Fuego (mágico)'], ['hielo', 'Hielo (mágico)'], ['rayo', 'Eléctrico (mágico)'], ['toxico', 'Tóxico (veneno, gas)'], ['fisico', 'Físico (respeta la Defensa)']];
  const STAT_TXT = Object.fromEntries([...TIRA, ...CONTRA]);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  function css(){
    if(document.getElementById('adh-css')) return;
    const s = document.createElement('style');
    s.id = 'adh-css';
    s.textContent = `.adh-paso{display:flex;flex-direction:column;gap:14px}
.adh-paso h4{margin:0 0 6px;font-family:"Space Mono",ui-monospace,monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--pap-tenue,#9A867E)}
.adh-paso .nota{font-size:12.5px;color:var(--pap-tenue,#9A867E);margin:0 0 6px;line-height:1.45}
.adh-paso .nota b{color:var(--pap-laton,#E0A458)}
.adh-paso select,.adh-paso input[type=number],.adh-paso input[type=text]{max-width:100%;width:auto}
.adh-paso label.op{display:flex;align-items:flex-start;gap:8px;padding:5px 0;font-size:14px;cursor:pointer;width:100%;box-sizing:border-box}
.adh-paso label.op input[type=checkbox],.adh-paso label.op input[type=radio]{flex-shrink:0;flex-grow:0;width:16px;min-width:16px;max-width:16px;height:16px;margin:3px 0 0}
.adh-paso .adh-check-list{display:flex;flex-direction:column;gap:0;margin-top:8px}
.adh-paso .adh-modo,.adh-paso .adh-ef-card{display:flex;gap:10px;padding:8px 10px;margin:4px 0;background:#120D10;border:1px solid var(--pap-linea,#3B2E34);border-radius:3px}
.adh-paso .adh-modo{flex-direction:column;gap:2px;margin:8px 0 4px}
.adh-paso .adh-ef-card{justify-content:space-between;align-items:flex-start}
.adh-paso .fila{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:4px 0}
.adh-paso button{font-family:"Space Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:7px 12px;cursor:pointer;
  border:1px dashed var(--pap-cobre,#C98545);border-radius:3px;background:rgba(201,133,69,.08);color:var(--pap-laton,#E0A458)}
.adh-paso button:hover{background:rgba(201,133,69,.2)}
.adh-paso button.sec{border-style:solid;border-color:var(--pap-linea,#3B2E34);background:none;color:var(--pap-tenue,#9A867E)}
.adh-paso button.rojo{border-style:solid;border-color:rgba(212,87,78,.5);background:none;color:var(--pap-peligro,#D4574E)}
.adh-paso .aviso{background:rgba(201,133,69,.12);border:1px solid var(--pap-cobre,#C98545);border-radius:3px;padding:8px 10px;font-size:12.5px;color:var(--pap-laton,#E0A458)}
.adh-paso .adh-resumen{border:1px solid var(--pap-linea,#3B2E34);background:#120D10;padding:10px 12px;border-radius:3px;font-size:13px;line-height:1.6}
.adh-paso .adh-resumen b{color:var(--pap-laton,#E0A458)}
.adh-paso textarea{width:100%;box-sizing:border-box}`;
    document.head.appendChild(s);
  }

  function abrir(cfg){
    css();
    const ini = cfg.inicial || null;
    const st = {
      paso: 0,
      activo: !!ini || !!cfg.siempreActivo, objetivo: (ini && ini.objetivo) || 'enemigo',
      // No lleva tirada (2026-09-28, pedido del dueño): antes «Nada» era una opción escondida adentro del
      // desplegable de stats, y no existía en modo Personalizada — un buff sobre uno mismo o un aliado con
      // tirada personalizada no tenía forma de decir «no hay nada que resistir». Ahora es un tilde propio,
      // arriba de todo del paso, que tapa el resto (stat o fórmula) sea cual sea el modo.
      tiraNinguna: !!(ini && ini.tira === '' && !ini.tiraFormula),
      tira: ini ? (ini.tira || 'pdgmg') : 'pdgmg',
      // Tirada personalizada (2026-09-27, pedido del dueño): para habilidades que no tiran ningún stat de la
      // ficha (ej. Drenar vida: «X + 1dX») — reemplaza a `tira` cuando tiraModo === 'custom'. Se anuncia en la
      // Mesa con `tiraEtiqueta` en vez del nombre de un stat; `tiraFormula` puede llevar «X» (costo variable).
      tiraModo: (ini && ini.tiraFormula) ? 'custom' : 'stat',
      tiraFormula: (ini && ini.tiraFormula) || '', tiraEtiqueta: (ini && ini.tiraEtiqueta) || '',
      contra: new Set(ini && Array.isArray(ini.contra) && ini.contra.length ? ini.contra : ['resmg']),
      // Resistencia: además del stat de siempre, «Nadie» (se aplica directo, aunque haya tirada — ej. un buff
      // con una tirada propia de sabor) y «Otro» (texto libre para lo que no está en la lista: la mesa lo
      // resuelve a mano, ver `contraOtro`) — 2026-09-28, pedido del dueño.
      contraModo: (ini && ini.contraOtro) ? 'otro' : (ini && Array.isArray(ini.contra) && ini.contra.length) ? 'stats' : (ini && ini.tira !== undefined) ? 'ninguna' : 'stats',
      contraOtro: (ini && ini.contraOtro) || '',
      dano: !!(ini && ini.dano), tipoDano: (ini && ini.tipoDano) || 'arcano',
      danoDif: !!(ini && ini.danoDiferencia), danoExtra: (ini && ini.danoExtra) || '',
      danoArma: !!(ini && ini.danoArma),   // el daño del arma de quien la usa (2026-10-02, Daño en área): dirigida, área u onda   // la diferencia: zona y dirigida; la tirada extra: solo zona (2026-10-02)
      drena: !!(ini && ini.drena), drenaTope: ini && ini.drenaTope !== undefined ? Number(ini.drenaTope) || 0 : 50, drenaPct: ini && Number(ini.drenaPct) > 0 ? Number(ini.drenaPct) : 100,   // drena (2026-10-02, Drenar Vida): no en una zona
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
      // Cómo lo frena la Defensa especial (dueño, 2026-10-07, P169): '' = la resta (lo normal) · 'directo' = la ignora (proyectiles chicos) ·
      // 'true' = True Damage: ignora toda defensa y la Res. elemental (muy controlado).
      frenoEsp: ini && ini.trueDamage ? 'true' : ini && ini.danoDirecto ? 'directo' : '',
      efectos: ini && Array.isArray(ini.efectos) ? ini.efectos.map(e => ({...e})) : [],
      // (una habilidad vieja con alcance 'casteo' pasa a 'rango': el Rango de casteo se fue, 2026-10-07)
      alcance: (ini && ini.alcance === 'casteo' ? 'rango' : ini && ini.alcance) || 'auto', alcanceN: (ini && ini.alcanceN) || 3,
      radio: (ini && (ini.radio || ini.largo)) || 2,   // también el largo de la línea recta
      ondaDodge: !!(ini && ini.ondaDodge),   // la onda deja dodge roll a quien gana (2026-10-02, Daño en área)   // hechizo de área (Paso 4/7 del casteo): radio del área, en casilleros
      modo: (ini && ini.modo) || 'hab', x: (ini && ini.x) || 'nitros',
      flashEn: new Set(ini && ini.flash && Array.isArray(ini.flash.en) ? ini.flash.en : ['pdg', 'parry', 'bloqueo', 'dano']), flashBono: (ini && ini.flash && ini.flash.bono) || 2,
      arma: {pdg: 0, pdgPorX: 0, dadosPorX: 0, fijo: 0, fijoPorX: 0, sinParry: false, ignoraResistCrit: 0, critBono: 0, critpotBono: 0, perfora: 0, ...((ini && ini.arma) || {})},
      // Critical Matters (2026-09-29, pedido del dueño — Lisiar: "Crítico frecuente ×1... si es crítico, el
      // efecto pasa a -2 fijo"): SOLO tiene sentido en modo 'arma' (es el único que puede critear). Mismo
      // andamiaje que los Efectos de siempre (◎ Estado/💚 Cura + Personalizar), pero una lista APARTE
      // (`efectosCritico`) que solo se suma a los de siempre si el golpe termina siendo crítico — se guarda en
      // `duelo.critico` (top-level, al lado de `duelo.efectos`/`efectosNota`, no adentro de `duelo.arma`: son
      // "qué pasa si pega" igual que los de siempre, no un arreglo del ataque en sí).
      critMatters: !!(ini && ini.critico),
      efectosCritico: ini && ini.critico && Array.isArray(ini.critico.efectos) ? ini.critico.efectos.map(e => ({...e})) : [],
      efectosNotaCriticoOn: !!(ini && ini.critico && ini.critico.efectosNota),
      efectosNotaCritico: (ini && ini.critico && ini.critico.efectosNota) || '',
      // ¿Cuánto cuesta ejecutarla? (2026-09-27, pedido del dueño: "al principio te tiene que preguntar qué se
      // cobra al ejecutar" — antes solo vivía en el paso "Costo" del editor de la habilidad, aparte del 🎯).
      // Mismo dato de siempre (it.costo/nitrosCosto/hpCosto): este paso lo lee y lo escribe también, así el 🎯
      // queda autosuficiente. cfg.costoInicial = {sp, nitrosCosto, hpCosto} (ver ficha.html).
      costoSp: String((cfg.costoInicial && cfg.costoInicial.sp) ?? '').trim(),
      costoNitrosModo: (cfg.costoInicial && cfg.costoInicial.nitrosCosto) === 'ATAQUE' ? 'ataque'
        : String((cfg.costoInicial && cfg.costoInicial.nitrosCosto) ?? '').trim().toUpperCase() === 'X' ? 'x' : 'num',
      costoNitrosNum: (() => { const n = cfg.costoInicial && cfg.costoInicial.nitrosCosto; return (n === 'ATAQUE' || String(n ?? '').trim().toUpperCase() === 'X') ? 1 : Math.max(0, Math.round(Number(n) || 0)); })(),
      costoHp: Math.max(0, Math.round(Number(cfg.costoInicial && cfg.costoInicial.hpCosto) || 0)),
      // Costo distinto en turno ajeno (2026-09-28, pedido del dueño — paso intermedio hasta que el mapa avise
      // solo de quién es el turno, ver comun/confirmar-turno.js): `it.turnoAjenoSp` es el SP que se cobra si NO
      // es tu turno; al ejecutar, un cartelito pregunta antes de cobrar nada. Sin llenar = no aplica.
      costoTurnoOn: !!(cfg.costoInicial && cfg.costoInicial.turnoAjenoSp),
      costoTurnoSp: String((cfg.costoInicial && cfg.costoInicial.turnoAjenoSp) ?? '').trim(),
      // Zona persistente (2026-09-28, pedido del dueño — Nube tóxica): dura varios turnos, no un solo momento.
      // El radio ya lo comparte con área/onda (st.radio). `tira`/`contra` (los mismos pasos de siempre) son la
      // resistencia: quien la crea tira una sola vez al lanzarla, y esa tirada se reusa contra cada uno que entra
      // o sigue adentro en el Mantenimiento — igual que ya hacen los hechizos de área entre sí.
      zonaTurnos: (ini && ini.zonaTurnos) || 3,
      zonaAmiga: !!(ini && ini.zonaAmiga),
      zonaAltura: (ini && ['piso', 'aire', 'ambos'].includes(ini.zonaAltura)) ? ini.zonaAltura : 'aire',   // dónde está la zona (2026-10-07)
      zonaEstadoNombre: (ini && ini.zonaEstado && ini.zonaEstado.nombre) || '',
      zonaEstadoTurnos: (ini && ini.zonaEstado && ini.zonaEstado.turnos) ?? 2,
      zonaEstadoStacks: (ini && ini.zonaEstado && ini.zonaEstado.stacks) || '',
    };
    let api = null, f = null;   // la ventana común abierta y su caja (f: donde se buscan los controles de cada paso)
    const cerrar = () => { if(api) api.cerrar(); };
    const ir = i => { if(api) api.irA(i); };
    const sinOp = () => st.tiraNinguna;
    let ayudaPaso = '';   // la ayuda del paso que se está armando (la pone titulo())

    // Lista de pasos: cambia según activo/modo/objetivo/tira, igual que en asistente-item.js (pasos()).
    function pasos(){
      const L = [{id: 'activo', corto: cfg.siempreActivo ? 'Tipo' : '¿Se juega?'}];
      if(!st.activo){ L.push({id: 'listo', corto: 'Listo'}); return L; }
      L.push({id: 'costo', corto: 'Costo'});
      if(st.modo === 'flash'){
        L.push({id: 'flash', corto: 'Flash'});
      }else if(st.modo === 'arma'){
        L.push({id: 'arma', corto: 'Tu ataque'}, {id: 'alcance', corto: 'Alcance'}, {id: 'efectos', corto: 'Al pegar'});
      }else{
        L.push({id: 'objetivo', corto: 'Objetivo'});
        if(st.objetivo !== 'uno mismo' && st.objetivo !== 'area' && st.objetivo !== 'onda' && st.objetivo !== 'cono' && st.objetivo !== 'linea' && st.objetivo !== 'zona') L.push({id: 'alcance', corto: 'Alcance'});
        L.push({id: 'tira', corto: st.objetivo === 'zona' ? 'Tirada de la zona' : 'Tirada'});
        if(!sinOp()) L.push({id: 'contra', corto: 'Resistencia'});
        L.push({id: 'dano', corto: 'Daño'});
        if(st.objetivo !== 'zona') L.push({id: 'efectos', corto: 'Efectos'});
      }
      L.push({id: 'listo', corto: 'Listo'});
      return L;
    }

    const titulo = (h, t, ayuda) => { ayudaPaso = `<b>${t}</b> ${ayuda}`; return h; };

    function cuerpoCosto(){
      let h = titulo('', '¿Cuánto cuesta ejecutarla?', 'Se cobra apenas tocás Ejecutar, antes de que se abra el cuadro. Es el mismo costo de siempre de la habilidad (podés cambiarlo desde acá o desde su editor, es un solo dato). «X» en SP o Nitros significa que elegís cuánto pagar cada vez que la uses — esa misma X es la que podés usar en la Tirada o el Daño escribiendo «X» en la fórmula.');
      h += `<div class="fila"><span style="min-width:90px">SP</span><input type="text" style="width:100px" data-costo-sp value="${esc(st.costoSp)}" placeholder="ej. 3 o X"></div>`;
      h += `<div class="fila"><span style="min-width:90px">No2</span>
        <select data-costo-nitros-modo><option value="num"${st.costoNitrosModo === 'num' ? ' selected' : ''}>Un número</option><option value="x"${st.costoNitrosModo === 'x' ? ' selected' : ''}>X (se elige al usarla)</option><option value="ataque"${st.costoNitrosModo === 'ataque' ? ' selected' : ''}>Lo mismo que un ataque</option></select>
        ${st.costoNitrosModo === 'num' ? `<input type="number" min="0" style="width:70px" data-costo-nitros-num value="${esc(st.costoNitrosNum)}">` : ''}</div>`;
      h += `<div class="fila"><span style="min-width:90px">HP</span><input type="number" min="0" style="width:100px" data-costo-hp value="${esc(st.costoHp)}"><span class="nota" style="margin:0">0 = no gasta vida</span></div>`;
      h += `<div class="fila" style="margin-top:14px"><label class="op" style="padding:0"><input type="checkbox" data-costoturno-on ${st.costoTurnoOn ? 'checked' : ''}> El costo en SP es distinto si no es tu turno</label></div>`;
      if(st.costoTurnoOn){
        h += `<div class="fila"><span>En turno ajeno cuesta</span><input type="number" min="0" style="width:80px" data-costoturno-sp value="${esc(st.costoTurnoSp)}"><span>SP</span></div>
          <p class="nota">Al tocar Ejecutar, antes de cobrar nada, un cartelito pregunta «¿es tu turno?» — como Shockwave (SP ×2 en turno ajeno). Solo se aplica si el SP de arriba es un número fijo, no «X».</p>`;
      }
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
      let h = titulo('', 'Reacción Flash', 'Una habilidad Flash se usa <b>antes de una tirada</b> de otro cuadro de ejecución (nunca después de verla) y <b>no cuesta No2</b>, solo sus SP. En ese cuadro aparece un botón «⚡» en las tiradas donde vale; al marcarlo y tirar, se cobran los SP y el bono se suma a esa tirada. Una vez por tirada.');
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
        ${a.ignoraResistCrit > 0 ? `<div class="fila"><span style="min-width:250px">¿Cuántos puntos ignora?</span><input type="number" min="1" style="width:80px" data-arma="ignoraResistCrit" value="${esc(a.ignoraResistCrit)}"></div>` : ''}
        ${fila('critBono', '+ Crítico frecuente (solo en esta tirada)')}${fila('critpotBono', '+ Crítico potente (solo en esta tirada)')}${fila('perfora', 'Perfora (ignora N de la Defensa del golpe; se suma a la del arma)')}
        <p class="nota" style="margin-top:2px">A diferencia de un «Efecto sobre uno mismo» (que dura al menos 1 turno y podría alcanzar a otro ataque), estos dos suman solo para EL crítico de este ataque puntual — no dejan ningún estado activo.</p>
        <p class="nota" style="margin-top:10px"><b>🗡 Por la espalda</b> (opcional): se suma a lo que ya dé el arma, solo si quien ataca está <b>en sigilo</b> y pegado al defensor por atrás (su punto ciego). El mapa lo detecta solo.</p>
        ${fila('espaldaPdg', '+ PdG por la espalda')}${fila('espaldaFijo', '+ Daño por la espalda')}${fila('espaldaCritpot', '+ Crítico potente por la espalda')}`;
      return h;
    }
    function cuerpoObjetivo(){
      let h = titulo('', '¿A quién apunta?', 'Elegí quién puede recibir esta habilidad.');
      h += `<select data-objetivo>${[['enemigo', 'A un enemigo (o a cualquier otro token)'], ['aliado', 'A un aliado'], ['uno mismo', 'A uno mismo (no hay que elegir)'], ['area', 'A un área (varios objetivos, en cascada — Orbe arcano, Tormenta arcana…)'], ['onda', 'Onda alrededor de quien la usa (sin marcar centro — Shockwave…)'], ['cono', 'Cono al frente de quien la usa (sin marcar nada — Sonic Boom…)'], ['linea', 'Línea recta desde quien la usa (atraviesa — Varita láser…)'], ['zona', 'Zona persistente (queda puesta varios turnos — Nube tóxica…)']].map(([v, t]) => `<option value="${v}"${st.objetivo === v ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
      if(st.objetivo === 'linea'){
        h += `<p class="nota" style="margin-top:10px">Al ejecutarla marcás hacia dónde: sale una <b>línea recta desde tu token</b> de este largo y todo rival que esté en ella entra en la cascada, uno detrás del otro (vos tirás una sola vez; cada uno se resiste por separado y, si gana, tiene derecho a un dodge roll).</p>
          <div class="fila"><input type="number" min="1" style="width:70px" data-radio value="${esc(st.radio)}"><span>casilleros de largo</span></div>`;
      }
      if(st.objetivo === 'cono'){
        h += `<p class="nota" style="margin-top:10px">No hay que marcar nada: al ejecutarla, todo rival dentro del <b>cono al frente de tu token</b> (el mismo de 16 casillas de la detección, hacia donde mirás; lo que tapa un Sólido no entra) entra en la cascada, uno detrás del otro. Vos tirás una sola vez y cada uno se resiste por separado. No te afecta a vos.</p>
          <label class="op" style="margin-top:8px"><input type="checkbox" data-ondadodge ${st.ondaDodge ? 'checked' : ''}> Quien gana su tirada tiene derecho a un dodge roll (salir del cono moviéndose, como en un área)</label>
          <p class="nota">${st.ondaDodge ? 'Si gana, puede moverse para salir del cono: si sale, la esquiva; si se queda adentro, le pega igual.' : 'Sin tildar: quien gana su tirada no recibe nada (como Sonic Boom).'}</p>`;
      }
      if(st.objetivo === 'onda'){
        h += `<p class="nota" style="margin-top:10px">No hay que marcar nada: al ejecutarla, todo rival dentro de esta área <b>alrededor de tu token</b> entra en la cascada, uno detrás del otro. Vos tirás una sola vez y cada uno se resiste por separado. No te afecta a vos.</p>
          <div class="fila"><select data-radio>${Combatiente.diametroOpciones(st.radio, {min: 1})}</select><span>alrededor de tu token (diámetro 3 = los de al lado)</span></div>
          <label class="op" style="margin-top:8px"><input type="checkbox" data-ondadodge ${st.ondaDodge ? 'checked' : ''}> Quien gana su tirada tiene derecho a un dodge roll (salir de la onda moviéndose, como en un área)</label>
          <p class="nota">${st.ondaDodge ? 'Si gana, puede moverse para salir del área: si sale, la esquiva; si se queda adentro, le pega igual.' : 'Sin tildar: quien gana su tirada no recibe nada (como Shockwave).'}</p>`;
      }
      if(st.objetivo === 'area'){
        h += `<p class="nota" style="margin-top:10px">Marcás el centro en el mapa al ejecutarla; todo rival adentro de esta área entra en la cascada, uno detrás del otro (Paso 4 del casteo: primero tira Evasión contra tu tirada; si la gana, tiene derecho a un dodge roll).</p>
          <div class="fila"><select data-radio>${Combatiente.diametroOpciones(st.radio, {min: 0})}</select><span>tamaño del área</span></div>`;
      }
      if(st.objetivo === 'zona'){
        h += `<p class="nota" style="margin-top:10px">Marcás el centro en el mapa al ejecutarla, como el área — pero <b>queda puesta varios turnos</b>: no se resuelve todo de una. Cualquier rival que entre, o que siga adentro en cada Mantenimiento, se chequea por separado; si esta habilidad tiene una tirada (paso «Tirada»), la tirás una sola vez al lanzarla y esa misma tirada se reusa contra la resistencia de cada uno (paso «Resistencia»). A quien pierde (o entra sin nada que resistir) se le puede aplicar un estado y/o el daño del paso «Daño».</p>
          <div class="fila"><select data-radio>${Combatiente.diametroOpciones(st.radio, {min: 1})}</select><span>tamaño de la zona</span></div>
          <div class="fila"><input type="number" min="1" style="width:70px" data-zonaturnos value="${esc(st.zonaTurnos)}"><span>turnos que dura</span></div>
          <label class="op"><input type="checkbox" data-zonaamiga ${st.zonaAmiga ? 'checked' : ''}> También afecta a tus aliados (no solo a los rivales)</label>
          <div style="margin-top:12px"><h4 style="margin:0 0 6px">¿Dónde está?</h4><select data-zonaaltura style="max-width:100%">
            <option value="aire"${st.zonaAltura === 'aire' ? ' selected' : ''}>☁️ Del aire: ocupa el espacio (gas, nube, humo, explosión) — alcanza aunque levites</option>
            <option value="piso"${st.zonaAltura === 'piso' ? ' selected' : ''}>🟫 Del piso: está en el suelo (púas, brea, aceite, brasas) — levitando se cruza sin tocarla</option>
            <option value="ambos"${st.zonaAltura === 'ambos' ? ' selected' : ''}>🔥 Ambos (fuego, escarcha): alcanza aunque levites; las Suelas le restan</option></select></div>
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
      // Zona persistente (2026-10-02, dueño): la habilidad no falla — la zona aparece siempre; la tirada es del EFECTO de la zona,
      // y se hace cada vez que afecta a alguien (P143, abierta: por ahora así).
      if(st.objetivo === 'zona'){
        st.tiraModo = 'stat';   // una zona tira un stat de quien la creó (la fórmula propia no va acá)
        let h = titulo('', '¿La zona pide una tirada a quien afecta?', 'La habilidad no falla: al ejecutarla, la zona aparece. La tirada es del efecto de la zona: cada vez que afecta a alguien (al entrar, o en cada Mantenimiento si sigue adentro) se tira este stat de quien la creó —con el valor que tenía al crearla— contra la resistencia de esa persona (paso siguiente).');
        h += `<label class="op"><input type="checkbox" data-tira-ninguna ${st.tiraNinguna ? 'checked' : ''}> No: el daño y el estado le entran directo a quien esté adentro</label>`;
        if(!st.tiraNinguna) h += `<select data-tira style="margin-top:10px">${TIRA.map(([v, t]) => `<option value="${v}"${st.tira === v ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
        return h;
      }
      let h = titulo('', '¿Qué tira quien la usa?', 'El stat que tira quien ejecuta la habilidad, o —si no encaja en ninguno— tu propia fórmula (ej. Drenar vida: «X + 1dX»).');
      h += `<label class="op"><input type="checkbox" data-tira-ninguna ${st.tiraNinguna ? 'checked' : ''}> No lleva tirada: se aplica directo (buffs, curas sobre uno mismo o un aliado)</label>`;
      if(st.tiraNinguna){
        h += `<div class="aviso" style="margin-top:10px">Sin tirada: al ejecutarla se abre el cuadro con los efectos y su botón <b>Aplicar</b>. Así la acción tiene su momento en pantalla igual.</div>`;
        return h;
      }
      // Las dos maneras a la vista (2026-10-02, pedido del dueño: antes «Personalizada» quedaba escondida adentro de un desplegable).
      h += `<div class="adh-modo">
          <label class="op"><input type="radio" name="tiramodo" value="stat" ${st.tiraModo !== 'custom' ? 'checked' : ''}> Un stat de la ficha</label>
          <label class="op"><input type="radio" name="tiramodo" value="custom" ${st.tiraModo === 'custom' ? 'checked' : ''}> Tirada custom: mi propia fórmula de dados, con mi texto (ej. «X + 1dX», «2d6 + 3»)</label>
        </div>`;
      if(st.tiraModo === 'custom'){
        h += `<div class="fila" style="margin-top:8px"><input type="text" style="min-width:160px" data-tira-formula placeholder="ej. X+1dX (podés usar «X»)" value="${esc(st.tiraFormula)}"></div>
          <div class="fila"><input type="text" style="min-width:240px" data-tira-etiqueta placeholder="¿Qué representa? (ej. Drenaje)" value="${esc(st.tiraEtiqueta)}"></div>
          <p class="nota" style="margin-top:6px">Se tira con esa fórmula (podés usar «X» si la habilidad ya tiene costo variable) y se anuncia en la Mesa con tu texto, en vez del nombre de un stat.</p>`;
      }else{
        h += `<select data-tira style="margin-top:8px">${TIRA.map(([v, t]) => `<option value="${v}"${st.tira === v ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
      }
      return h;
    }
    function cuerpoContra(){
      const esArea = st.objetivo === 'area' || st.objetivo === 'onda' || st.objetivo === 'cono' || st.objetivo === 'linea';
      let h = titulo('', st.objetivo === 'zona' ? '¿Con qué se resiste quien la zona afecta?' : '¿Con qué se resiste el objetivo?', st.objetivo === 'zona'
        ? 'Cada vez que la zona afecta a alguien, esa persona tira esto contra la tirada de la zona. Si gana, no le pasa nada (ni daño ni estado).'
        : esArea
        ? 'Un hechizo de área u onda necesita un stat real: cada objetivo lo tira contra vos por separado, en la cascada.'
        : 'Para un ataque o control sobre un rival, elegí uno o más stats (si marcás más de uno, el objetivo elige uno a ciegas, antes de ver tu tirada). Un proyectil suele esquivarse (Evasión); un efecto sobre el cuerpo se resiste con Res.Esp; un control mental con Res.Mt. Para un buff sobre uno mismo o un aliado, casi siempre no hay nada que resistir.');
      if(!esArea){
        h += `<div class="adh-modo">
          <label class="op"><input type="radio" name="contramodo" value="stats" ${st.contraModo === 'stats' ? 'checked' : ''}> Con un stat de la lista</label>
          <label class="op"><input type="radio" name="contramodo" value="ninguna" ${st.contraModo === 'ninguna' ? 'checked' : ''}> Nadie: no hay nada que resista, se aplica directo</label>
          <label class="op"><input type="radio" name="contramodo" value="otro" ${st.contraModo === 'otro' ? 'checked' : ''}> Otro (no está en la lista): lo resuelve la mesa a mano</label>
        </div>`;
      }
      if(esArea || st.contraModo === 'stats'){
        h += `<div class="adh-check-list">${CONTRA.map(([v, t]) => `<label class="op"><input type="checkbox" data-contra="${v}" ${st.contra.has(v) ? 'checked' : ''}> ${t}</label>`).join('')}</div>`;
        if(!esArea && st.contra.has('parry')) h += `<p class="nota" style="margin-top:6px">Parry sale como una caja más para elegir, junto a lo demás que hayas marcado — pero solo se ofrece si el objetivo tiene un arma o escudo equipado (misma regla que un ataque normal): sin eso, esa caja no aparece, aunque la hayas marcado acá.</p>`;
      }else if(st.contraModo === 'otro'){
        h += `<input type="text" style="margin-top:8px;width:100%;box-sizing:border-box" data-contraotro placeholder="ej. Resistencia a X (a mano)" value="${esc(st.contraOtro)}">
          <p class="nota" style="margin-top:6px">La habilidad tira igual (paso anterior), pero nadie automatiza lo que la resiste: el cuadro se abre directo en los efectos, con este texto como recordatorio.</p>`;
      }else{
        h += `<p class="nota" style="margin-top:10px">El cuadro se abre directo en los efectos: nadie tiene que tirar nada para resistirla.</p>`;
      }
      return h;
    }
    function cuerpoDano(){
      let h = titulo('', 'Daño y lo que no se pueda automatizar', 'Si la habilidad hace daño, usa la fórmula que ya tiene cargada (su «segunda tirada», por ejemplo 2d6+3) — se escribe en el editor de siempre de la habilidad, no acá. Si además (o en vez de eso) tiene un efecto que el sistema no calcula solo, escribilo como texto.');
      const esZona = st.objetivo === 'zona';
      const puedeDif = st.objetivo !== 'uno mismo';
      const dif = puedeDif && st.dano && st.danoDif;
      const puedeArma = !esZona && st.objetivo !== 'uno mismo';
      const conArma = puedeArma && st.dano && st.danoArma && !dif;
      h += `<div class="adh-modo">
        <label class="op"><input type="radio" name="hacedano" value="no" ${!st.dano ? 'checked' : ''}> No hace daño</label>
        <label class="op"><input type="radio" name="hacedano" value="si" ${st.dano && !dif && !conArma ? 'checked' : ''}> Sí, con su fórmula${cfg.tieneFormula === false ? ' <span class="nota">(esta habilidad todavía no tiene fórmula: escribila en su editor)</span>' : ''}</label>
        ${puedeDif ? `<label class="op"><input type="radio" name="hacedano" value="dif" ${dif ? 'checked' : ''}> Sí: la diferencia entre las tiradas</label>` : ''}
        ${puedeArma ? `<label class="op"><input type="radio" name="hacedano" value="arma" ${conArma ? 'checked' : ''}> Sí: el daño de tu arma</label>` : ''}
      </div>`;
      if(conArma) h += `<p class="nota">Se tira el daño del arma con la que la usás (la que elegís si cuesta lo mismo que un ataque; si no, la principal), con su Fuerza, como el botón «Daño». A cada uno se le resta su Defensa, salvo que marques «Ignora la Defensa».</p>`;
      if(dif) h += `<p class="nota">${esZona ? 'Cada uno que no resiste recibe' : 'Si no la resiste, recibe'} tu tirada menos la suya (si empatan, nada). Si resiste, no le pasa nada. Necesita una tirada (paso «Tirada») y una resistencia (paso «Resistencia»).</p>`;
      if(st.dano){
        h += `<div class="fila"><span>Tipo:</span><select data-tipodano>${TIPOS.map(([v, t]) => `<option value="${v}"${st.tipoDano === v ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
          <label class="op"><input type="checkbox" data-ignoradano ${st.ignoraDano ? 'checked' : ''}> Ignora la Defensa (va derecho a la vida y no critica)</label>
          ${st.tipoDano !== 'fisico' && st.ignoraDano ? `<div class="fila"><span>La Defensa especial:</span><select data-frenoesp>${[['', 'la frena (lo normal; siempre, si suma el Ef.Esp)'], ['directo', 'daño directo: no la frena (proyectiles chicos)'], ['true', 'True Damage: no lo frena nada, ni la Res. elemental']].map(([v, t]) => `<option value="${v}"${st.frenoEsp === v ? ' selected' : ''}>${t}</option>`).join('')}</select></div>` : ''}
          <p class="nota">Arranca marcado o no según el tipo (mágico = sí, físico = no), pero es independiente: lo que decide no es el elemento, es cómo se narra la habilidad — una "ráfaga de hielo" (energía) ignora la Defensa; una "aguja de hielo" (un objeto físico arrojado) no, aunque las dos sean "Hielo". Destildá acá para esa excepción.</p>`;
        if(cfg.costoVariable && !dif){
          h += `<div class="fila" style="margin-top:8px"><span>Además, por cada punto de X (tu costo en ${cfg.costoVariable === 'sp' ? 'SP' : 'Nitros'}):</span><span>+</span><input type="number" style="width:70px" data-danoporx value="${esc(st.danoFijoPorX)}"><span>de daño fijo</span></div>
            <p class="nota">Ej. "amplifica el daño en el doble de X" → poné 2: con X = 3 suma +6 al tirar. Vacío o 0 = la fórmula no cambia con X.</p>`;
        }
        if(!esZona){
          h += `<label class="op" style="margin-top:10px"><input type="checkbox" data-drena ${st.drena ? 'checked' : ''}> Drena: quien la usa se cura lo que hizo de daño</label>`;
          if(st.drena) h += `<div class="fila"><span>Se cura el</span><input type="number" min="1" max="100" style="width:70px" data-drenapct value="${esc(st.drenaPct)}"><span>% de lo que hizo (para arriba)</span></div>`;
          if(st.drena) h += `<div class="fila"><span>Puede pasar su vida máxima hasta</span><input type="number" min="0" style="width:70px" data-drenatope value="${esc(st.drenaTope)}"><span>% (lo de más queda como Vida extra; 0 = no pasa el máximo)</span></div>
            <p class="nota">Se cura lo que el objetivo perdió de verdad (si un escudo lo absorbió o era Invulnerable, drena menos o nada).</p>`;
        }
        if(esZona){
          h += `<div class="fila" style="margin-top:10px"><span>Si el daño entra, tirar además:</span><input type="text" style="width:90px" data-danoextra placeholder="ej. 1d20" value="${esc(st.danoExtra)}"></div>
            <p class="nota">Opcional. Se tira solo, a quien recibió daño, y sale en la Mesa con el texto de abajo («Tiene un efecto que no se puede automatizar»): ahí escribí qué significa cada resultado (ej. «7+ Pajaritos · 17+ Stun · 20 desmayo»).</p>`;
        }
      }
      h += `<div class="fila" style="margin-top:14px"><label class="op" style="padding:0"><input type="checkbox" data-efectolibre-on ${st.efectoLibreOn ? 'checked' : ''}> Tiene un efecto que no se puede automatizar del todo</label></div>`;
      if(st.efectoLibreOn){
        h += `<textarea data-efectolibre rows="3" style="width:100%;box-sizing:border-box;padding:8px;font-size:14px" placeholder="ej. Drenás una cantidad de HP igual a la diferencia entre tu tirada y su resistencia; sumátela a tu vida (Vida extra si pasa tu máximo).">${esc(st.efectoLibre)}</textarea>
          <p class="nota" style="margin-top:6px">${st.objetivo === 'zona'
            ? 'En una zona, este texto sale en la Mesa y en el cartelito cuando el daño entra (junto a la tirada de arriba, si hay), para que se resuelva a mano.'
            : 'Este texto se muestra en el cuadro junto al resultado (con la diferencia entre las dos tiradas, si la hubo), para que quien juega lo resuelva a mano.'}</p>`;
      }
      return h;
    }
    /* ¿Con qué probabilidad entra? (2026-10-05, armas especiales: «Parálisis 1 en d10»). Las mismas opciones que los efectos al golpear de un arma
       (EfectosGolpe.PROBABILIDADES); al usarse, el duelo tira el dado. Vacío = siempre. */
    function probHtml(e, i){
      const P = (typeof EfectosGolpe !== 'undefined' && EfectosGolpe.PROBABILIDADES) || [{caras: 1, exitos: 1, texto: 'Siempre'}, {caras: 2, exitos: 1, texto: '50%'}, {caras: 6, exitos: 2, texto: '33%'}, {caras: 4, exitos: 1, texto: '25%'}, {caras: 10, exitos: 1, texto: '10%'}];
      const caras = Math.max(1, Number(e.caras) || 1), exitos = Math.max(1, Number(e.exitos) || 1), sel = `${caras}/${exitos}`;
      const dado = x => x.caras > 1 ? ` (${x.exitos === 1 ? x.caras : `${x.caras - x.exitos + 1}–${x.caras}`} en d${x.caras})` : '';
      const conocida = P.some(x => `${x.caras}/${x.exitos}` === sel);
      return `<div class="fila" style="margin-left:22px"><span class="nota" style="margin:0">entra:</span><select data-ef-prob="${i}">${P.map(x => `<option value="${x.caras}/${x.exitos}"${`${x.caras}/${x.exitos}` === sel ? ' selected' : ''}>${esc(x.texto + dado(x))}</option>`).join('')}${conocida ? '' : `<option value="${sel}" selected>${exitos} en d${caras}</option>`}</select><span class="nota" style="margin:0">(con probabilidad, el duelo tira el dado)</span></div>`;
    }
    // Una fila «◎ Estado» elegida del catálogo real (cfg.elegirEstado): de solo lectura, con ✎ Cambiar.
    function filaEstadoPresetHtml(e, i){
      const partes = [e.permanente ? 'no vence' : `${e.turnos ?? 0} turno${(e.turnos ?? 0) === 1 ? '' : 's'}`];
      if(e.escudo) partes.push(`🛡${e.escudo}`);
      if(e.hp) partes.push(`${e.hp > 0 ? '+' : ''}${e.hp} HP/turno`);
      (e.mods || []).forEach(m => { if(m && m.stat) partes.push(`${m.val > 0 ? '+' : ''}${m.val} ${BONOS_LABEL[m.stat] || m.stat}`); });
      if(e.stacks > 1) partes.push(`×${e.stacks}`);
      const det = (e.detalle || '').trim();
      return `<div class="adh-ef-card">
        <div><b>◎ ${esc(e.nombre)}</b><div class="nota" style="margin:2px 0 0">${esc(partes.join(' · '))}</div>${det ? `<div class="nota" style="margin:2px 0 0">${esc(det.length > 90 ? det.slice(0, 88) + '…' : det)}</div>` : ''}</div>
        <div class="fila" style="gap:6px;flex-wrap:nowrap"><button type="button" class="sec" data-ef-recambiar="${i}">✎ Cambiar</button><button type="button" class="rojo" data-ef-x="${i}">Quitar</button></div>
      </div>${probHtml(e, i)}`;
    }
    // Sin cfg.elegirEstado (o «Empezar en blanco»): los campos de siempre, a mano.
    function filaEstadoManualHtml(e, i){
      return `<div class="fila"><span>◎ Estado</span><input type="text" list="adh-estados" data-ef-nombre="${i}" value="${esc(e.nombre)}" placeholder="nombre (elegí uno o escribí el tuyo)" style="width:200px"><span>durante</span><input type="number" min="0" style="width:64px" data-ef-turnos="${i}" value="${esc(e.turnos ?? '')}" placeholder="—" title="Vacío: lo que dure el estado"><span>turnos</span><button type="button" class="rojo" data-ef-x="${i}">Quitar</button></div>
          <div class="fila" style="margin-left:22px"><span class="nota" style="margin:0">y da (opcional):</span><select data-ef-stat="${i}"><option value="">— ningún bono —</option>${BONOS.map(([v, t]) => `<option value="${v}"${e.stat === v ? ' selected' : ''}>${t}</option>`).join('')}</select><input type="number" style="width:64px" data-ef-val="${i}" value="${esc(e.val ?? 1)}"><span class="nota" style="margin:0">(negativo = resta)</span></div>
          <div class="fila" style="margin-left:22px"><span class="nota" style="margin:0">o un escudo de (opcional):</span><input type="number" min="0" style="width:64px" data-ef-escudo="${i}" placeholder="0" value="${esc(e.escudo || '')}"><span class="nota" style="margin:0">HP (absorbe daño antes que la vida — Vida extra/Barrera)</span></div>` + probHtml(e, i);
    }
    // Filas de una lista de efectos (◎ Estado / 💚 Cura). `clave(i)` arma la clave que llevan los data-attribute
    // (ver efRef) — así la misma función sirve para `st.efectos` (clave = i) y `st.efectosCritico` (clave = 'c'+i).
    function filaEfectosLista(lista, clave){
      return lista.map((e, i) => e.no2 !== undefined
        ? `<div class="fila" style="flex-wrap:wrap"><span>⚡ Pierde</span><input type="number" min="0" style="width:70px" data-ef-no2="${clave(i)}" value="${esc(e.no2)}"><span>No2</span>
            <label class="op" style="padding:0"><input type="checkbox" data-ef-no2dif="${clave(i)}" ${e.no2Dif ? 'checked' : ''}> + la diferencia entre las tiradas</label>
            <label class="op" style="padding:0"><input type="checkbox" data-ef-no2sent="${clave(i)}" ${e.no2Sentado ? 'checked' : ''}> si llega a 0, queda Sentado</label>
            <button type="button" class="rojo" data-ef-x="${clave(i)}">Quitar</button></div>`
        : e.cura !== undefined
        ? `<div class="fila"><span>💚 Cura</span><input type="text" style="width:80px" placeholder="5 o 1d10" title="Un número o dados (1d10, 2d8+1): los dados se tiran al usarla" data-ef-cura="${clave(i)}" value="${esc(e.cura)}"><span>HP</span><button type="button" class="rojo" data-ef-x="${clave(i)}">Quitar</button></div>`
        : e.origen === 'preset' ? filaEstadoPresetHtml(e, clave(i)) : filaEstadoManualHtml(e, clave(i))).join('');
    }
    function cuerpoEfectos(){
      let h = titulo('', st.modo === 'arma' ? 'Efectos al pegar' : 'Efectos sobre el objetivo', 'Cada uno sale como un momento propio, con su botón «Aplicar» (los que no se puedan aplicar solos quedan «a mano»). Solo entran si la habilidad funciona.');
      h += filaEfectosLista(st.efectos, i => i);
      h += `<datalist id="adh-estados">${nombresEstado().map(n => `<option value="${esc(n)}">`).join('')}</datalist>
        <div class="fila"><button type="button" class="sec" data-ef-mas="estado">＋ Estado</button><button type="button" class="sec" data-ef-mas="cura">＋ Cura</button><button type="button" class="sec" data-ef-mas="no2">＋ Pierde No2</button></div>`;
      h += `<div class="fila" style="margin-top:14px"><label class="op" style="padding:0"><input type="checkbox" data-efectosnota-on ${st.efectosNotaOn ? 'checked' : ''}> Personalizar: tiene otro efecto que no está en la lista</label></div>`;
      if(st.efectosNotaOn){
        h += `<textarea data-efectosnota rows="3" style="width:100%;box-sizing:border-box;padding:8px;font-size:14px" placeholder="ej. Invertí el orden de turno de todos los presentes hasta tu próximo turno.">${esc(st.efectosNota)}</textarea>
          <p class="nota" style="margin-top:6px">Este texto se muestra junto a los demás efectos, sin botón «Aplicar» — para resolverlo a mano.</p>`;
      }
      // ⚡ Critical Matters (2026-09-29, pedido del dueño — Lisiar: bono al crítico + un efecto que es más
      // intenso si el golpe termina siendo crítico). Solo tiene sentido en modo 'arma' (el único que puede
      // critear); mismo andamiaje de arriba, en una lista aparte que se SUMA a la de siempre solo si pega crítico.
      if(st.modo === 'arma'){
        h += `<div class="fila" style="margin-top:18px;padding-top:14px;border-top:1px solid var(--pap-linea,#3B2E34)"><label class="op" style="padding:0"><input type="checkbox" data-critmatters ${st.critMatters ? 'checked' : ''}> ⚡ Critical Matters: si el golpe es crítico, pasa algo más (además de lo de arriba)</label></div>`;
        if(st.critMatters){
          h += `<p class="nota" style="margin:4px 0 8px">Esto se suma a los efectos de arriba SOLO si el golpe resulta crítico — no reemplaza nada, se agrega. Si no es crítico, esta parte no pasa nada.</p>`;
          h += filaEfectosLista(st.efectosCritico, i => 'c' + i);
          h += `<div class="fila"><button type="button" class="sec" data-ef-mas="c:estado">＋ Estado (si es crítico)</button><button type="button" class="sec" data-ef-mas="c:cura">＋ Cura (si es crítico)</button></div>`;
          h += `<div class="fila" style="margin-top:14px"><label class="op" style="padding:0"><input type="checkbox" data-efectosnotacritico-on ${st.efectosNotaCriticoOn ? 'checked' : ''}> Personalizar: un efecto libre que solo pasa si es crítico</label></div>`;
          if(st.efectosNotaCriticoOn){
            h += `<textarea data-efectosnotacritico rows="3" style="width:100%;box-sizing:border-box;padding:8px;font-size:14px" placeholder="ej. La lesión pasa a -2 fijo a la PdG por 2 turnos.">${esc(st.efectosNotaCritico)}</textarea>
              <p class="nota" style="margin-top:6px">Se muestra en el cuadro del duelo, junto a los demás efectos, SOLO cuando el golpe sale crítico — sin botón «Aplicar», para resolverlo a mano.</p>`;
          }
        }
      }
      return h;
    }
    function cuerpoActivo(){
      // Abierto desde una habilidad ✨ Automática (2026-09-30): siempre se juega con el cuadro; acá solo se elige el tipo.
      if(cfg.siempreActivo){
        return titulo('', '¿Qué tipo de habilidad es?', 'Define qué pasos siguen. Para dejar de usar la ejecución paso a paso, cambiá el modo de la habilidad a Manual o Semiautomático.')
          + `<select data-modo><option value="hab"${st.modo === 'hab' ? ' selected' : ''}>Habilidad dirigida (hechizo, control, apoyo, buff sobre vos…)</option><option value="arma"${st.modo === 'arma' ? ' selected' : ''}>Ataque con mi arma, con arreglos (Golpe brutal, Carga, Takle…)</option><option value="flash"${st.modo === 'flash' ? ' selected' : ''}>⚡ Reacción Flash (suma a una tirada de otro cuadro)</option></select>`;
      }
      let h = titulo('', '¿Se juega con este cuadro?', 'Si lo tildás, ejecutar esta habilidad abre un cuadro de ejecución paso a paso, visible para toda la mesa — elegís el objetivo (si tiene), se tira, se ve en vivo, con su resumen en la Mesa. Sirve tanto para un ataque como para un buff sobre uno mismo o un aliado. Si no, se ejecuta como antes: se anuncia y tira su fórmula sola.');
      h += `<label class="op"><input type="checkbox" data-activo ${st.activo ? 'checked' : ''}> Ejecutar esta habilidad abre el cuadro de ejecución paso a paso</label>`;
      if(st.activo){
        h += `<div style="margin-top:10px"><h4>¿Qué tipo de habilidad es?</h4>
          <select data-modo><option value="hab"${st.modo === 'hab' ? ' selected' : ''}>Habilidad dirigida (hechizo, control, apoyo…)</option><option value="arma"${st.modo === 'arma' ? ' selected' : ''}>Ataque con mi arma, con arreglos (Golpe brutal, Carga, Takle…)</option><option value="flash"${st.modo === 'flash' ? ' selected' : ''}>⚡ Reacción Flash (suma a una tirada de otro cuadro)</option></select></div>`;
      }
      return h;
    }
    function cuerpoListo(){
      if(!st.activo) return titulo('', 'Listo', 'Esta habilidad no usa este cuadro: se ejecuta como antes (se anuncia en la Mesa y tira su fórmula sola, sin objetivo ni cuadro).') + `<div class="adh-resumen">Ejecución simple, sin este cuadro.</div>`;
      let h = titulo('', 'Revisá cómo quedó', 'Si algo no está bien, tocá el paso arriba para volver.');
      const filas = [];
      const nitrosTxt = st.costoNitrosModo === 'ataque' ? 'como un ataque' : st.costoNitrosModo === 'x' ? 'X (se elige al usarla)' : `${st.costoNitrosNum}`;
      filas.push(`<b>Costo</b>: SP ${esc(st.costoSp) || '0'} · No2 ${nitrosTxt}${st.costoHp ? ` · HP ${st.costoHp}` : ''}${st.costoTurnoOn && st.costoTurnoSp ? ` · ${esc(st.costoTurnoSp)} SP en turno ajeno` : ''}`);
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
        if(a.critBono) partes.push(`+${a.critBono} Crítico frecuente (solo esta tirada)`);
        if(a.perfora) partes.push(`perfora ${a.perfora}`);
        if(a.critpotBono) partes.push(`+${a.critpotBono} Crítico potente (solo esta tirada)`);
        const esp = [a.espaldaPdg ? `+${a.espaldaPdg} PdG` : '', a.espaldaFijo ? `+${a.espaldaFijo} de daño` : '', a.espaldaCritpot ? `+${a.espaldaCritpot} Crítico potente` : ''].filter(Boolean);
        if(esp.length) partes.push(`por la espalda (en sigilo): ${esp.join(', ')}`);
        filas.push(`<b>Ataque con arma</b>: ${partes.join(', ') || 'sin arreglos'} · X en ${st.x === 'sp' ? 'SP' : 'Nitros'}`);
        if(st.alcance !== 'auto') filas.push(`<b>Alcance</b>: ${(ALCANCES.find(x => x[0] === st.alcance) || [])[1] || st.alcance}${st.alcance === 'fijo' ? ` (${st.alcanceN})` : ''}`);
      }else{
        filas.push(`<b>Objetivo</b>: ${st.objetivo === 'linea' ? `línea recta de ${st.radio} casilleros` : st.objetivo === 'cono' ? 'cono al frente de quien la usa' : st.objetivo === 'onda' ? 'onda alrededor de quien la usa' : st.objetivo === 'zona' ? `zona persistente, ${st.zonaTurnos} turnos` : st.objetivo}${['area', 'onda', 'zona'].includes(st.objetivo) ? ` (${Combatiente.areaTxt(st.radio)})` : ''}`);
        if(st.objetivo === 'zona'){
          filas.push(`<b>Alcanza</b>: ${st.zonaAmiga ? 'rivales y aliados' : 'solo rivales'}`);
          if(st.zonaEstadoNombre) filas.push(`<b>Deja</b>: ${esc(st.zonaEstadoNombre)}${['Veneno', 'Veneno severo'].includes(st.zonaEstadoNombre) && st.zonaEstadoStacks ? ` ×${st.zonaEstadoStacks}` : ''} (${st.zonaEstadoTurnos}t)`);
        }
        if(st.alcance !== 'auto' && st.objetivo !== 'uno mismo' && st.objetivo !== 'area' && st.objetivo !== 'onda' && st.objetivo !== 'cono' && st.objetivo !== 'linea' && st.objetivo !== 'zona') filas.push(`<b>Alcance</b>: ${(ALCANCES.find(x => x[0] === st.alcance) || [])[1] || st.alcance}${st.alcance === 'fijo' ? ` (${st.alcanceN})` : ''}`);
        const esArea2 = st.objetivo === 'area' || st.objetivo === 'onda' || st.objetivo === 'cono' || st.objetivo === 'linea';
        const contraTxt = (esArea2 || st.contraModo === 'stats') ? ([...st.contra].map(v => STAT_TXT[v] || v).join(' / ') || '(elegí con qué se resiste)')
          : st.contraModo === 'otro' ? `${esc(st.contraOtro) || '(sin especificar)'} (a mano)`
          : 'nadie: se aplica directo';
        filas.push(sinOp() ? '<b>Sin tirada</b>: se aplica directo'
          : st.tiraModo === 'custom' ? `<b>Tirada custom</b>: ${esc(st.tiraFormula) || '(sin fórmula)'}${st.tiraEtiqueta ? ' · ' + esc(st.tiraEtiqueta) : ''} contra ${contraTxt}`
          : `<b>Tirada</b>: ${STAT_TXT[st.tira] || st.tira} contra ${contraTxt}`);
        if(st.dano) filas.push(`<b>Daño</b>: ${st.danoDif && st.objetivo !== 'uno mismo' ? 'la diferencia entre las tiradas, ' : st.danoArma && st.objetivo !== 'zona' && st.objetivo !== 'uno mismo' ? 'el de tu arma, ' : ''}${st.drena && st.objetivo !== 'zona' ? `drena (se cura lo que hace${st.drenaTope ? `, hasta +${st.drenaTope} % de su máximo` : ''}), ` : ''}tipo ${st.tipoDano}${st.ignoraDano ? ', ignora la Defensa' : ''}${st.tipoDano !== 'fisico' && st.ignoraDano ? (st.frenoEsp === 'true' ? ', True Damage (no lo frena nada)' : st.frenoEsp === 'directo' ? ', daño directo (no lo frena la Defensa especial)' : ', lo frena la Defensa especial') : ''}${cfg.costoVariable && st.danoFijoPorX ? `, +${st.danoFijoPorX} por X` : ''}${st.objetivo === 'zona' && st.danoExtra ? `; si entra, tira ${esc(st.danoExtra)}` : ''}`);
        if(st.efectoLibreOn && st.efectoLibre.trim()){ const t = st.efectoLibre.trim(); filas.push(`<b>Efecto a mano</b>: ${esc(t.length > 90 ? t.slice(0, 90) + '…' : t)}`); }
      }
      if(st.modo !== 'flash' && st.objetivo !== 'zona'){
        const efTxtDe = lista => lista.filter(e => e.cura !== undefined ? curaValida(e.cura) : e.nombre).map(e => e.no2 !== undefined ? `⚡ pierde ${e.no2}${e.no2Dif ? ' + la diferencia' : ''} No2${e.no2Sentado ? ' (en 0, Sentado)' : ''}` : e.cura !== undefined ? `💚 ${e.cura} HP` : `◎ ${e.nombre} (${e.permanente ? 'no vence' : (e.turnos ?? 2) + 't'})${e.escudo ? ` · 🛡${e.escudo}` : ''}`).join(', ');
        filas.push(`<b>Efectos</b>: ${efTxtDe(st.efectos) || 'ninguno'}`);
        if(st.efectosNotaOn && st.efectosNota.trim()){ const t = st.efectosNota.trim(); filas.push(`<b>Efecto personalizado</b>: ${esc(t.length > 90 ? t.slice(0, 90) + '…' : t)}`); }
        if(st.modo === 'arma' && st.critMatters){
          const partesCrit = [];
          const efTxtCrit = efTxtDe(st.efectosCritico);
          if(efTxtCrit) partesCrit.push(efTxtCrit);
          if(st.efectosNotaCriticoOn && st.efectosNotaCritico.trim()){ const t = st.efectosNotaCritico.trim(); partesCrit.push(esc(t.length > 90 ? t.slice(0, 90) + '…' : t)); }
          filas.push(`<b>⚡ Si es crítico, además</b>: ${partesCrit.join(' · ') || '(nada cargado todavía)'}`);
        }
      }
      h += `<div class="adh-resumen">${filas.join('<br>')}</div>`;
      return h;
    }

    // El contenido de un paso y su ayuda (titulo() la deja en ayudaPaso).
    function contenidoPaso(id){
      ayudaPaso = '';
      const cuerpo = id === 'activo' ? cuerpoActivo() : id === 'costo' ? cuerpoCosto() : id === 'objetivo' ? cuerpoObjetivo() : id === 'alcance' ? cuerpoAlcance(st.modo === 'arma')
        : id === 'tira' ? cuerpoTira() : id === 'contra' ? cuerpoContra() : id === 'dano' ? cuerpoDano() : id === 'efectos' ? cuerpoEfectos()
        : id === 'arma' ? cuerpoArma() : id === 'flash' ? cuerpoFlash() : cuerpoListo();
      return {h: `<div class="adh-paso">${cuerpo}</div>`, ayuda: ayudaPaso};
    }
    function dibujar(){ if(api) api.redibujar(); }
    // Los controles del paso que se acaba de dibujar (la ventana común lo llama en cada dibujo).
    function conectar(){
      const q = (sel, fn) => { const el = f.querySelector(sel); if(el) el.onchange = fn; };
      q('[data-activo]', e => { st.activo = e.target.checked; dibujar(); ir(0); });
      q('[data-costo-sp]', e => { st.costoSp = e.target.value; });
      q('[data-costo-nitros-modo]', e => { st.costoNitrosModo = e.target.value; dibujar(); });
      q('[data-costo-nitros-num]', e => { st.costoNitrosNum = Math.max(0, Math.round(Number(e.target.value) || 0)); });
      q('[data-costo-hp]', e => { st.costoHp = Math.max(0, Math.round(Number(e.target.value) || 0)); });
      q('[data-costoturno-on]', e => {
        st.costoTurnoOn = e.target.checked;
        if(st.costoTurnoOn && !st.costoTurnoSp.trim()) st.costoTurnoSp = String((Number(st.costoSp) || 0) * 2 || '');
        dibujar();
      });
      q('[data-costoturno-sp]', e => { st.costoTurnoSp = e.target.value; });
      q('[data-objetivo]', e => { st.objetivo = e.target.value; if(st.objetivo === 'onda' && st.radio > 1 && !ini) st.radio = 1; if((st.objetivo === 'area' || st.objetivo === 'onda' || st.objetivo === 'cono' || st.objetivo === 'linea') && st.contraModo !== 'stats') st.contraModo = 'stats'; dibujar(); });
      q('[data-modo]', e => { st.modo = e.target.value; dibujar(); });
      q('[data-flashbono]', e => { st.flashBono = Number(e.target.value) || 0; });
      f.querySelectorAll('[data-flashen]').forEach(c => c.onchange = () => { c.checked ? st.flashEn.add(c.dataset.flashen) : st.flashEn.delete(c.dataset.flashen); });
      q('[data-x]', e => { st.x = e.target.value; });
      q('[data-sinparry]', e => { st.arma.sinParry = e.target.checked; });
      q('[data-ignoraresistcrit-on]', e => { st.arma.ignoraResistCrit = e.target.checked ? 1 : 0; dibujar(); });
      f.querySelectorAll('[data-arma]').forEach(i => i.onchange = () => { st.arma[i.dataset.arma] = Number(i.value) || 0; });
      q('[data-tira]', e => { st.tira = e.target.value; dibujar(); });
      q('[data-tira-ninguna]', e => { st.tiraNinguna = e.target.checked; dibujar(); });
      f.querySelectorAll('[name=tiramodo]').forEach(x => x.onchange = () => { st.tiraModo = x.value; dibujar(); });
      q('[data-tira-formula]', e => { st.tiraFormula = e.target.value; });
      q('[data-tira-etiqueta]', e => { st.tiraEtiqueta = e.target.value; });
      q('[data-alcance]', e => { st.alcance = e.target.value; dibujar(); });
      q('[data-alcanceN]', e => { st.alcanceN = Math.max(1, Math.round(Number(e.target.value) || 1)); });
      q('[data-radio]', e => { st.radio = Math.max(0, Math.round(Number(e.target.value) || 0)); });
      q('[data-zonaturnos]', e => { st.zonaTurnos = Math.max(1, Math.round(Number(e.target.value) || 1)); });
      q('[data-zonaamiga]', e => { st.zonaAmiga = e.target.checked; });
      q('[data-zonaaltura]', e => { st.zonaAltura = e.target.value; });
      q('[data-zonaestado]', e => { st.zonaEstadoNombre = e.target.value; dibujar(); });
      q('[data-zonaestadoturnos]', e => { st.zonaEstadoTurnos = Math.max(0, Math.round(Number(e.target.value) || 0)); });
      q('[data-zonaestadostacks]', e => { st.zonaEstadoStacks = Math.max(0, Math.round(Number(e.target.value) || 0)); });
      f.querySelectorAll('[data-contra]').forEach(c => c.onchange = () => {
        c.checked ? st.contra.add(c.dataset.contra) : st.contra.delete(c.dataset.contra);
        if(c.dataset.contra === 'parry') dibujar();   // el aviso de abajo depende de si Parry está marcado
      });
      f.querySelectorAll('[name=contramodo]').forEach(r => r.onchange = () => { st.contraModo = r.value; dibujar(); });
      q('[data-contraotro]', e => { st.contraOtro = e.target.value; });
      f.querySelectorAll('[name=hacedano]').forEach(r => r.onchange = () => {
        const antesArma = st.danoArma;
        st.dano = r.value !== 'no'; st.danoDif = r.value === 'dif'; st.danoArma = r.value === 'arma';
        if(st.danoArma && !antesArma){ st.tipoDano = 'fisico'; st.ignoraDano = false; }   // un arma: físico, contra la Defensa
        dibujar();
      });
      q('[data-drena]', e => { st.drena = e.target.checked; dibujar(); });
      q('[data-ondadodge]', e => { st.ondaDodge = e.target.checked; dibujar(); });
      q('[data-drenatope]', e => { st.drenaTope = Math.max(0, Number(e.target.value) || 0); });
      q('[data-drenapct]', e => { st.drenaPct = Math.max(1, Math.min(100, Math.round(Number(e.target.value) || 100))); });
      q('[data-danoextra]', e => { st.danoExtra = e.target.value.trim(); });
      q('[data-tipodano]', e => { st.tipoDano = e.target.value; st.ignoraDano = st.tipoDano !== 'fisico'; dibujar(); });
      q('[data-ignoradano]', e => { st.ignoraDano = e.target.checked; dibujar(); });
      q('[data-frenoesp]', e => { st.frenoEsp = e.target.value; });
      q('[data-danoporx]', e => { st.danoFijoPorX = Number(e.target.value) || 0; });
      q('[data-efectolibre-on]', e => { st.efectoLibreOn = e.target.checked; dibujar(); });
      q('[data-efectolibre]', e => { st.efectoLibre = e.target.value; });
      q('[data-efectosnota-on]', e => { st.efectosNotaOn = e.target.checked; dibujar(); });
      q('[data-efectosnota]', e => { st.efectosNota = e.target.value; });
      q('[data-critmatters]', e => { st.critMatters = e.target.checked; dibujar(); });
      q('[data-efectosnotacritico-on]', e => { st.efectosNotaCriticoOn = e.target.checked; dibujar(); });
      q('[data-efectosnotacritico]', e => { st.efectosNotaCritico = e.target.value; });
      // Una clave de fila es 'c'+i (lista de Critical Matters) o directamente i (lista de siempre) — efRef la
      // resuelve al array real y al índice adentro. Mismas filas/handlers para las dos listas, sin duplicar código.
      const efRef = clave => { const s = String(clave); return s.startsWith('c') ? {arr: st.efectosCritico, i: +s.slice(1)} : {arr: st.efectos, i: +s}; };
      f.querySelectorAll('[data-ef-nombre]').forEach(i => i.onchange = () => {
        const {arr, i: idx} = efRef(i.dataset.efNombre);
        const ef = arr[idx];
        ef.nombre = i.value.trim();
        // Al elegir un preset con escudo (Vida extra/Barrera) y no haber tocado nada todavía, precarga sus
        // valores de siempre — se pueden cambiar igual, es solo para no arrancar de cero (2026-09-28).
        const preset = BUFF_PRESETS.find(p => p.nombre === ef.nombre);
        if(preset && preset.escudoMagico && !ef.escudo && !ef.stat){ ef.escudo = preset.escudoMagico; ef.turnos = preset.turnos; dibujar(); }
      });
      f.querySelectorAll('[data-ef-stat]').forEach(i => i.onchange = () => { const {arr, i: idx} = efRef(i.dataset.efStat); arr[idx].stat = i.value; });
      f.querySelectorAll('[data-ef-val]').forEach(i => i.onchange = () => { const {arr, i: idx} = efRef(i.dataset.efVal); arr[idx].val = Number(i.value) || 0; });
      f.querySelectorAll('[data-ef-turnos]').forEach(i => i.onchange = () => { const {arr, i: idx} = efRef(i.dataset.efTurnos); if(String(i.value).trim() === '') delete arr[idx].turnos; else arr[idx].turnos = Math.max(0, Math.round(Number(i.value) || 0)); });
      f.querySelectorAll('[data-ef-prob]').forEach(i => i.onchange = () => { const {arr, i: idx} = efRef(i.dataset.efProb); const [c, x] = i.value.split('/').map(Number); if(c > 1){ arr[idx].caras = c; arr[idx].exitos = x; } else { delete arr[idx].caras; delete arr[idx].exitos; } });
      f.querySelectorAll('[data-ef-escudo]').forEach(i => i.onchange = () => { const {arr, i: idx} = efRef(i.dataset.efEscudo); arr[idx].escudo = Math.max(0, Math.round(Number(i.value) || 0)); });
      f.querySelectorAll('[data-ef-cura]').forEach(i => i.onchange = () => { const {arr, i: idx} = efRef(i.dataset.efCura); const v = String(i.value || '').trim().toLowerCase(); arr[idx].cura = /d/.test(v) && curaValida(v) ? v.replace(/\s+/g, '') : Math.max(1, Math.round(Number(v) || 1)); });
      f.querySelectorAll('[data-ef-no2]').forEach(i => i.onchange = () => { const {arr, i: idx} = efRef(i.dataset.efNo2); arr[idx].no2 = Math.max(0, Math.round(Number(i.value) || 0)); });
      f.querySelectorAll('[data-ef-no2dif]').forEach(c => c.onchange = () => { const {arr, i: idx} = efRef(c.dataset.efNo2dif); arr[idx].no2Dif = c.checked; });
      f.querySelectorAll('[data-ef-no2sent]').forEach(c => c.onchange = () => { const {arr, i: idx} = efRef(c.dataset.efNo2sent); arr[idx].no2Sentado = c.checked; });
      f.querySelectorAll('[data-ef-x]').forEach(b => b.onclick = () => { const {arr, i: idx} = efRef(b.dataset.efX); arr.splice(idx, 1); dibujar(); });
      // «◎ Estado»: con cfg.elegirEstado (el selector real de la página, ver docblock), abre ese menú en vez de
      // reinventar uno acá — «Empezar en blanco» cae en los campos de siempre (filaEstadoManualHtml).
      const efectoDePreset = r => ({origen: 'preset', nombre: r.nombre, turnos: r.turnos, permanente: !!r.permanente, hp: r.hp || 0, mods: r.mods || [], stacks: r.stacks || 1, escudo: r.escudoMagico || 0, detalle: r.detalle || '', polaridad: r.polaridad});
      f.querySelectorAll('[data-ef-mas]').forEach(b => b.onclick = async () => {
        // data-ef-mas es "estado"/"cura" (lista de siempre) o "c:estado"/"c:cura" (Critical Matters).
        const esCritico = b.dataset.efMas.startsWith('c:');
        const tipo = esCritico ? b.dataset.efMas.slice(2) : b.dataset.efMas;
        const arr = esCritico ? st.efectosCritico : st.efectos;
        if(tipo === 'cura'){ arr.push({cura: 5}); dibujar(); return; }
        if(tipo === 'no2'){ arr.push({nombre: 'Pierde No2', no2: 1, no2Dif: true, no2Sentado: true}); dibujar(); return; }   // Sonic Boom (2026-10-02)
        if(cfg.elegirEstado){
          const r = await cfg.elegirEstado();
          if(!r) return;
          arr.push(r.modo === 'preset' ? efectoDePreset(r) : {nombre: '', turnos: 2, origen: 'manual'});
        }else{
          arr.push({nombre: nombresEstado()[0] || 'Estado', turnos: 2, origen: 'manual'});
        }
        dibujar();
      });
      f.querySelectorAll('[data-ef-recambiar]').forEach(b => b.onclick = async () => {
        if(!cfg.elegirEstado) return;
        const r = await cfg.elegirEstado();
        if(!r) return;
        const {arr, i} = efRef(b.dataset.efRecambiar);
        arr[i] = r.modo === 'preset' ? efectoDePreset(r) : {nombre: '', turnos: 2, origen: 'manual'};
        dibujar();
      });
      // Costo (2026-09-27, pedido del dueño): se guarda junto con el duelo, en el mismo Guardar — es el mismo
      // dato de siempre (it.costo/nitrosCosto/hpCosto), no uno nuevo. cfg.alGuardar recibe {duelo, costo}
      // cuando se guarda algo (null sigue siendo "sin duelo", sin tocar el costo).
    }
    // Guardar (antes el botón «Guardar» del pie): false = falta algo (avisa y la ventana sigue abierta).
    function okGuardar(){
        const costoResultado = () => ({sp: st.costoSp.trim(), nitrosCosto: st.costoNitrosModo === 'ataque' ? 'ATAQUE' : st.costoNitrosModo === 'x' ? 'X' : st.costoNitrosNum, hpCosto: st.costoHp, turnoAjenoSp: st.costoTurnoOn ? st.costoTurnoSp.trim() : ''});
        if(!st.activo){ cerrar(); cfg.alGuardar(null); return; }
        if(st.modo === 'flash'){
          if(!st.flashEn.size){ alert('Marcá al menos una tirada donde vale el Flash.'); return false; }
          cerrar(); cfg.alGuardar({duelo: {modo: 'flash', flash: {en: [...st.flashEn], bono: st.flashBono}}, costo: costoResultado()}); return;
        }
        const efs = st.efectos.filter(e => e.cura !== undefined ? curaValida(e.cura) : e.nombre).map(mapEfectoOut);
        if(st.modo === 'arma'){
          const o2 = {modo: 'arma', objetivo: 'enemigo', x: st.x, arma: {...st.arma}, efectos: efs};
          if(st.efectosNotaOn && st.efectosNota.trim()) o2.efectosNota = st.efectosNota.trim();
          if(st.alcance !== 'auto'){ o2.alcance = st.alcance; if(st.alcance === 'fijo') o2.alcanceN = st.alcanceN; }
          // ⚡ Critical Matters: solo se manda si está tildado Y tiene algo cargado (si se destilda, o se deja
          // vacío, `critico` no viaja — mismo criterio que efectosNota).
          if(st.critMatters){
            const efsCrit = st.efectosCritico.filter(e => e.cura !== undefined ? curaValida(e.cura) : e.nombre).map(mapEfectoOut);
            const critico = {};
            if(efsCrit.length) critico.efectos = efsCrit;
            if(st.efectosNotaCriticoOn && st.efectosNotaCritico.trim()) critico.efectosNota = st.efectosNotaCritico.trim();
            if(Object.keys(critico).length) o2.critico = critico;
          }
          cerrar(); cfg.alGuardar({duelo: o2, costo: costoResultado()}); return;
        }
        const hayTira = !st.tiraNinguna && (st.tiraModo === 'custom' ? !!st.tiraFormula.trim() : !!st.tira);
        if(!st.tiraNinguna && st.tiraModo === 'custom' && !st.tiraFormula.trim()){ alert('Escribí la fórmula de la tirada custom (podés usar «X»), o tildá «No lleva tirada».'); return false; }
        const esArea = st.objetivo === 'area' || st.objetivo === 'onda' || st.objetivo === 'cono' || st.objetivo === 'linea';
        const out = {objetivo: st.objetivo, tira: (!st.tiraNinguna && st.tiraModo === 'stat') ? (st.tira || '') : '', contra: (hayTira && (esArea || st.contraModo === 'stats')) ? [...st.contra] : []};
        if(!st.tiraNinguna && st.tiraModo === 'custom'){ out.tiraFormula = st.tiraFormula.trim(); out.tiraEtiqueta = st.tiraEtiqueta.trim() || 'Tirada'; }
        if(esArea && !hayTira){ alert('Una habilidad de área u onda necesita una tirada (ej. PdG.Esp o Fuerza contra lo que resiste cada uno) — elegí qué tira quien la usa.'); return false; }
        if(st.objetivo === 'zona' && !st.dano && !st.zonaEstadoNombre){ alert('Una zona persistente necesita hacer algo: marcá «Esta habilidad hace daño» en el paso Daño y/o elegí un estado en el paso Objetivo.'); return false; }
        if(hayTira && (esArea || st.contraModo === 'stats') && !out.contra.length){ alert('Marcá con qué se resiste el objetivo (o elegí «Nadie» / «Otro»).'); return false; }
        if(hayTira && !esArea && st.contraModo === 'otro'){
          if(!st.contraOtro.trim()){ alert('Escribí con qué se resiste (o elegí «Nadie» si no hay nada que resista).'); return false; }
          out.contraOtro = st.contraOtro.trim();
        }
        if(st.dano){ out.dano = true; out.tipoDano = st.tipoDano; out.ignoraDano = st.ignoraDano;
          if(st.tipoDano !== 'fisico' && st.ignoraDano && st.frenoEsp === 'directo') out.danoDirecto = true;
          if(st.tipoDano !== 'fisico' && st.ignoraDano && st.frenoEsp === 'true') out.trueDamage = true; if(cfg.costoVariable && st.danoFijoPorX && !st.danoDif) out.danoFijoPorX = st.danoFijoPorX; }
        if(st.dano && st.objetivo !== 'zona' && st.objetivo !== 'uno mismo' && st.danoDif){
          if(!hayTira || !out.contra.length){ alert('El daño «la diferencia» necesita una tirada (paso Tirada) y algo con qué resistirla (paso Resistencia).'); return false; }
          out.danoDiferencia = true;
        }
        if(st.dano && st.danoArma && !st.danoDif && st.objetivo !== 'zona' && st.objetivo !== 'uno mismo') out.danoArma = true;
        if(st.dano && st.objetivo !== 'zona' && st.drena){ out.drena = true; out.drenaTope = Math.max(0, Math.round(Number(st.drenaTope) || 0)); if(st.drenaPct < 100) out.drenaPct = st.drenaPct; }
        if(st.objetivo === 'zona' && st.dano){
          if(st.danoDif){
            if(!hayTira || st.tiraModo === 'custom' || !out.contra.length){ alert('El daño «la diferencia» necesita que quien la usa tire un stat (paso Tirada) y algo con qué resistirla (paso Resistencia).'); return false; }
            out.danoDiferencia = true;
          }
          if(st.danoExtra){
            if(!/^\d*d\d+\s*([+-]\s*\d+)?$/i.test(st.danoExtra)){ alert('La tirada de «si el daño entra» tiene que ser una fórmula de dados, por ejemplo 1d20.'); return false; }
            out.danoExtra = st.danoExtra.replace(/\s+/g, '');
          }
        }
        if(st.efectoLibreOn && st.efectoLibre.trim()) out.efectoLibre = st.efectoLibre.trim();
        if(st.efectosNotaOn && st.efectosNota.trim()) out.efectosNota = st.efectosNota.trim();
        if(st.objetivo === 'area' || st.objetivo === 'onda' || st.objetivo === 'zona') out.radio = Math.max(st.objetivo === 'area' ? 0 : 1, st.radio);
        if(st.objetivo === 'linea') out.largo = Math.max(1, st.radio);
        if((st.objetivo === 'onda' || st.objetivo === 'cono') && st.ondaDodge) out.ondaDodge = true;
        if(st.objetivo === 'zona'){
          out.zonaTurnos = st.zonaTurnos;
          if(st.zonaAmiga) out.zonaAmiga = true;
          if(st.zonaAltura && st.zonaAltura !== 'aire') out.zonaAltura = st.zonaAltura;
          if(st.zonaEstadoNombre){
            const esVenenoZona = ['Veneno', 'Veneno severo'].includes(st.zonaEstadoNombre);
            // Veneno sin stacks a mano: no se manda `turnos` — si no, EstadosAplicar.componer lo toma igual y el
            // Veneno queda con los stacks de siempre (4) pero vencido en menos turnos de los que dura ese daño.
            out.zonaEstado = esVenenoZona ? {nombre: st.zonaEstadoNombre} : {nombre: st.zonaEstadoNombre, turnos: st.zonaEstadoTurnos};
            if(esVenenoZona && st.zonaEstadoStacks) out.zonaEstado.stacks = st.zonaEstadoStacks;
          }
        }
        if(st.alcance !== 'auto'){ out.alcance = st.alcance; if(st.alcance === 'fijo') out.alcanceN = st.alcanceN; }
        out.efectos = st.efectos.filter(e => e.cura !== undefined ? curaValida(e.cura) : e.nombre).map(mapEfectoOut);
        // Lo que este asistente todavía no edita (2026-10-05, armas especiales: salta en cadena, misiles, deja una zona, atrae, niebla, luz…)
        // se conserva tal cual: ajustar otra cosa no lo borra.
        if(ini) CONSERVA.forEach(k => { if(ini[k] !== undefined && out[k] === undefined) out[k] = structuredClone(ini[k]); });
        cerrar();
        cfg.alGuardar({duelo: out, costo: costoResultado()});
    }
    // Nombres de estados que conoce el juego (debuffs y buffs de `comun/estados-presets.js`, vía EstadosAplicar);
    // se puede escribir otro a mano si no hay lista.
    const BUFF_PRESETS = (typeof EstadosAplicar !== 'undefined' && EstadosAplicar.BUFFS) || [];
    function nombresEstado(){
      const debuffs = (typeof EstadosAplicar !== 'undefined' && EstadosAplicar.DEBUFFS) ? EstadosAplicar.DEBUFFS.filter(p => !p.soloSistema).map(p => p.nombre) : [];
      return [...debuffs, ...BUFF_PRESETS.map(p => p.nombre)];
    }
    // Un efecto de la lista `st.efectos`, listo para guardar en `duelo.efectos` — mismo shape tanto si vino del
    // selector real (origen:'preset', con mods/hp/stacks/permanente/detalle) como si se escribió a mano.
    const CONSERVA = ['cadena', 'conVista', 'niebla', 'zonaQueda', 'menosDistancia', 'atrae', 'reparte', 'critTipo', 'soloSigilo', 'fuegoAmigo'];
    function mapEfectoOut(e){
      if(e.no2 !== undefined) return {nombre: 'Pierde No2', no2: e.no2, ...(e.no2Dif ? {no2Dif: true} : {}), ...(e.no2Sentado ? {no2Sentado: true} : {})};
      if(e.cura !== undefined) return {cura: e.cura};
      return {
        nombre: e.nombre, ...(e.turnos !== undefined && e.turnos !== '' ? {turnos: e.turnos} : {}),   // sin turnos: los del estado
        ...(e.permanente ? {permanente: true} : {}),
        ...(e.stat ? {stat: e.stat, val: e.val ?? 1} : {}),
        ...(e.mods && e.mods.length ? {mods: e.mods} : {}),
        ...(e.escudo ? {escudo: e.escudo} : {}),
        ...(e.hp ? {hp: e.hp} : {}),
        ...(e.stacks && e.stacks > 1 ? {stacks: e.stacks} : {}),
        ...(e.detalle ? {detalle: e.detalle} : {}),
        ...(e.polaridad ? {polaridad: e.polaridad} : {}),
        ...(Number(e.caras) > 1 ? {caras: Number(e.caras), exitos: Math.max(1, Number(e.exitos) || 1)} : {}),   // con probabilidad (ej. Parálisis 1 en d10): se conserva
      };
    }
    api = PasoAPaso.abrir({
      titulo: `Ejecución ✨ · ${cfg.nombre || 'Habilidad'}`, crear: false, z: 99500,
      pasos: () => pasos().map(x => {
        let c = null;
        const cont = () => c || (c = contenidoPaso(x.id));
        return {id: x.id, nombre: x.corto, get ayuda(){ return cont().ayuda; }, html: () => cont().h, alMontar: (cuerpo, a) => { f = a.raiz; conectar(); }};
      }),
      alGuardar: () => okGuardar(),
      extras: ini ? [{id: 'quitar', texto: 'Sacar esta configuración', alClic: () => { cerrar(); cfg.alGuardar(null); }}] : [],
    });
    f = api.raiz;
  }
  return {abrir};
})();
