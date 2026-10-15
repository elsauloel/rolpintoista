/* comun/asistente-duelo-hab.js — «⚔ Duelo» de una habilidad (2026-09-27, docs/duelo-de-habilidades.md).
   **Desde el 2026-10-15 los pasos de una habilidad son los recuadros del duelo** (docs/plan-editor-ejecucion.md, dueño: «la edición tiene
   que ser una emulación del mismo menú del duelo»): Costo · 1 Declaración (a quién —también «cualquier personaje»—, dónde tiene que estar, el
   área y si es del momento o permanece) · La zona (si permanece: cuánto dura, cuándo afecta, qué deja) · 2 Contacto (qué tira contra con qué
   se resiste: la lista, «Otro stat…» o «Fórmula propia», dados o stat + N) · 3 Daño (de dónde sale, la fórmula acá mismo —`danoFormula`—,
   lo que se le suma —`danoMas`— y qué lo frena) · 4 Efectos (con «✋ Manual»). Un ataque con el arma y un Flash siguen con sus pasos.
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
.adh-paso textarea{width:100%;box-sizing:border-box}
.adh-paso .adh-card{border:1px solid var(--pap-linea,#3B2E34);border-radius:8px;padding:10px 12px;background:#120D10;display:flex;flex-direction:column;gap:10px}
.adh-paso .adh-card-h{display:flex;align-items:center;gap:8px;font-family:"Space Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--pap-laton,#E0A458)}
.adh-paso .adh-num{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:#2d6cdf;color:#fff;font-size:11px}
.adh-paso .adh-vs{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:10px;align-items:start}
.adh-paso .adh-vs-t{align-self:center;font-weight:700;color:var(--pap-laton,#E0A458);font-size:18px}
.adh-paso .adh-lado{border:1px dashed var(--pap-linea,#3B2E34);border-radius:6px;padding:8px 10px;min-width:0;display:flex;flex-direction:column;gap:6px}
.adh-paso .adh-lbl{font-family:"Space Mono",ui-monospace,monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--pap-tenue,#9A867E);margin-bottom:2px}
.adh-paso .adh-grid{margin-top:4px;border:1px solid var(--pap-cobre,#C98545);border-radius:6px;padding:8px;display:flex;flex-direction:column;gap:6px}
.adh-paso .adh-grid-h{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--pap-laton,#E0A458)}
.adh-paso .adh-grid-g{display:flex;flex-wrap:wrap;gap:4px;align-items:center}
.adh-paso .adh-grid-t{min-width:96px;font-size:12px;color:var(--pap-tenue,#9A867E)}
.adh-paso button.adh-stat{border-style:solid;padding:4px 8px;text-transform:none;letter-spacing:0;font-size:12px}
.adh-paso .adh-chip{display:inline-flex;align-items:center;gap:2px;border:1px solid var(--pap-cobre,#C98545);border-radius:12px;padding:1px 2px 1px 10px;font-size:12.5px}
.adh-paso button.adh-chip-x{border:none;background:none;padding:2px 6px}
.adh-paso .adh-freno{border:1px solid var(--pap-linea,#3B2E34);border-radius:6px;padding:8px 10px;display:flex;flex-direction:column;gap:2px}
#ejd-fondo{position:fixed;inset:0;z-index:99500;background:rgba(6,8,14,.78);display:flex;align-items:center;justify-content:center;padding:12px;font-family:inherit}
#ejd-fondo.con-texto .duelo-caja{margin-left:calc(min(270px, 22vw) + 24px)}
#ejd-fondo .duelo-caja{display:flex;flex-direction:column}
#ejd-fondo .ejd-cuerpo{flex:1;overflow:auto}
#ejd-fondo .ejd-ed{cursor:pointer;position:relative;outline:2px dashed transparent;outline-offset:3px;transition:outline-color .15s}
#ejd-fondo .ejd-ed:hover{outline-color:#ffd25a}
#ejd-fondo .ejd-ed::after{content:'✎';position:absolute;top:3px;right:7px;font-size:13px;color:#ffd25a;opacity:.55;pointer-events:none}
#ejd-fondo .ejd-ed:hover::after{opacity:1}
#ejd-fondo .duelo-tiro button,#ejd-fondo .duelo-ef button{animation:none}
#ejd-fondo .ejd-barra{display:flex;gap:8px;flex-wrap:wrap}
#ejd-fondo .ejd-chip{background:#1d2335;border:1px solid #39435c;color:#e9ecf4;border-radius:99px;padding:7px 26px 7px 14px;font-size:13px;font-weight:700;cursor:pointer}
#ejd-fondo .ejd-dano{display:block;margin:4px auto;background:#2d6cdf;color:#fff;border:2px solid #8db3ff;border-radius:12px;padding:14px 34px;font-size:18px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(45,108,223,.5)}
#ejd-fondo .ejd-mas{display:block;width:100%;margin-top:8px;background:#1d2335;color:#d5dbec;border:1px dashed #4a5578;border-radius:10px;padding:10px 14px;font-size:14px;font-weight:700;cursor:pointer;text-align:center}
#ejd-fondo .ejd-vacio{min-height:0}
#ejd-fondo .ejd-pop{margin-top:12px;background:#0f1424;border:2px solid #ffd25a;border-radius:12px;padding:12px 14px;color:#e9ecf4;text-align:left}
#ejd-fondo .ejd-pop-ayuda{font-size:13px;color:#aab3ca;margin-bottom:8px;line-height:1.45}
#ejd-fondo .ejd-pop-ayuda b{color:#ffd25a}
#ejd-fondo .ejd-pop-pie{display:flex;justify-content:flex-end;margin-top:10px}
#ejd-fondo .ejd-pop-pie button,#ejd-fondo .ejd-pie button{background:#2d6cdf;color:#fff;border:0;border-radius:10px;padding:10px 18px;font-size:15px;font-weight:700;cursor:pointer}
#ejd-fondo .ejd-pie{display:flex;gap:8px;justify-content:flex-end;align-items:center;padding:12px 18px;border-top:1px solid #2b3347}
#ejd-fondo .ejd-pie button.sec{background:#2b3347;color:#d5dbec}
#ejd-fondo .ejd-ayuda{margin-right:auto;font-size:12.5px;color:#9aa4bd}
#ejd-fondo .ejd-pop .adh-paso{--pap-tenue:#9aa4bd;--pap-laton:#ffd25a;--pap-cobre:#8db3ff;--pap-linea:#39435c;--pap-peligro:#f1a1ad;color:#e9ecf4}
#ejd-fondo .ejd-pop input,#ejd-fondo .ejd-pop select,#ejd-fondo .ejd-pop textarea{background:#0e1220;color:#fff;border:1px solid #39435c;border-radius:6px;padding:6px 8px;font:inherit;font-size:14px}
#ejd-fondo .ejd-pop .adh-modo,#ejd-fondo .ejd-pop .adh-ef-card,#ejd-fondo .ejd-pop .adh-resumen{background:#12172a}`;
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
      contra: new Set(ini && Array.isArray(ini.contra) && ini.contra.length ? ini.contra.filter(x => typeof x === 'string') : ['resmg']),
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
      danoSumaEsp: ini && ini.danoSumaEsp === true ? 'si' : ini && Number(ini.danoSumaEsp) === 0.5 ? 'mitad' : '',   // + el Ef.Esp de quien la usa (2026-10-10)
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
      terminaTurno: !!(ini && ini.terminaTurno),   // Degollar (2026-10-10): al resolverse, termina el turno y pasa al final del orden
      flashEn: new Set(ini && ini.flash && Array.isArray(ini.flash.en) ? ini.flash.en : ['pdg', 'parry', 'bloqueo', 'dano']), flashBono: (ini && ini.flash && ini.flash.bono) || 2, flashDodge: !!(ini && ini.flash && ini.flash.dodge),
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
      // El editor como el cuadro del duelo (2026-10-15, docs/plan-editor-ejecucion.md): stat + N, resistirse con otro stat o con una fórmula
      // propia, el área que permanece (y cuándo afecta su zona), dónde cae el centro, la fórmula del daño acá mismo y lo que se le suma.
      tiraBono: ini && Number(ini.tiraBono) ? Number(ini.tiraBono) : 0,
      contraExtra: ini && Array.isArray(ini.contra) ? ini.contra.filter(x => x && typeof x === 'object').map(x => ({...x})) : [],
      grid: '', contraFormula: '', contraFormulaEtq: '',
      permanencia: ini && ini.objetivo === 'zona' ? 'solo' : ini && ini.zonaQueda ? 'queda' : 'momento',
      zq: (() => { const z = (ini && ini.zonaQueda) || {}; return {turnos: Number(z.turnos) || 2, enMant: z.enMantenimiento !== false, cadaPaso: !!z.cadaPaso, soloRivales: !!z.soloRivales,
        dano: z.dano || '', tipoDano: z.tipoDano || '', estadoNombre: (z.estado && z.estado.nombre) || '', estadoTurnos: (z.estado && z.estado.turnos) || 2, altura: z.altura || 'aire',
        contra: z.contra || '', tira: z.tira || '', nombre: z.nombre || '', color: z.color || ''}; })(),
      zonaEnMant: !(ini && ini.zonaEnMantenimiento === false), zonaCadaPaso: !!(ini && ini.zonaCadaPaso),
      centroModo: ini && ini.centroAlcance === 'rango' ? 'rango' : ini && Number(ini.centroAlcance) === 1 ? 'adyacente' : ini && Number(ini.centroAlcance) > 1 ? 'fijo' : '',
      centroN: ini && Number(ini.centroAlcance) > 1 ? Number(ini.centroAlcance) : 3,
      danoFormula: (ini && ini.danoFormula) || cfg.formulaDano || '', danoMas: (ini && ini.danoMas) || '',
      frenoAbierto: false,
    };
    let fondo = null, f = null;   // la ventana (el cuadro del duelo para editar) y su cuerpo (f: donde se buscan los controles)
    st.pop = '';
    const alTecla = e => { if(e.key !== 'Escape' || !fondo || document.querySelector('.pap-fondo, .cfj-fondo')) return; e.stopImmediatePropagation(); e.preventDefault(); if(st.pop){ st.pop = ''; dibujar(); } else cancelar(); };
    const cerrar = () => { if(fondo){ fondo.remove(); fondo = null; document.removeEventListener('keydown', alTecla, true); } };
    const cancelar = () => { cerrar(); if(cfg.alCancelar) cfg.alCancelar(); };
    const sinOp = () => st.tiraNinguna;
    let ayudaPaso = '';   // la ayuda del paso que se está armando (la pone titulo())

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
        ${FLASH_EN.map(([v, t]) => `<label class="op"><input type="checkbox" data-flashen="${v}" ${st.flashEn.has(v) ? 'checked' : ''}> ${t}</label>`).join('')}
        <label class="op" style="margin-top:8px"><input type="checkbox" data-flashdodge ${st.flashDodge ? 'checked' : ''}> Si gana la Evasión, tiene dodge roll: puede moverse hasta 2 casilleros, sin ataque de oportunidad (Tronco de huída)</label>`;
      return h;
    }
    // Lo que la habilidad le suma a tu ataque, por momento del duelo (2026-10-15: cada botón edita lo suyo): 'pdg' (el PdG), 'def' (la defensa),
    // 'crit' (el crítico), 'dano' (el daño).
    function cuerpoArma(parte){
      const a = st.arma;
      const fila = (k, t) => `<div class="fila"><span style="min-width:250px">${t}</span><input type="number" style="width:80px" data-arma="${k}" value="${esc(a[k] ?? 0)}"></div>`;
      const xSel = `<div class="fila"><span style="min-width:250px">La X de su costo es…</span><select data-x><option value="nitros"${st.x === 'nitros' ? ' selected' : ''}>los No2 (Nitros)</option><option value="sp"${st.x === 'sp' ? ' selected' : ''}>los SP</option></select></div>`;
      const espalda = '<p class="nota" style="margin-top:8px"><b>🗡 Por la espalda, en sigilo</b> (opcional): se suma solo si quien ataca está en sigilo y pegado al defensor por atrás. El mapa lo detecta solo.</p>';
      if(parte === 'def') return titulo('', 'La defensa de quien recibe el ataque', 'Como en cualquier ataque, elige Evasión o Parry antes de ver tu tirada.')
        + `<label class="op"><input type="checkbox" data-sinparry ${a.sinParry ? 'checked' : ''}> No se puede parrear (solo esquivar)</label>`;
      if(parte === 'crit') return titulo('', 'El crítico de este ataque', 'Suman solo para el crítico de este ataque puntual; no dejan ningún estado.')
        + `<label class="op"><input type="checkbox" data-ignoraresistcrit-on ${a.ignoraResistCrit > 0 ? 'checked' : ''}> Ignora Resistencia a crítico</label>
        ${a.ignoraResistCrit > 0 ? `<div class="fila"><span style="min-width:250px">¿Cuántos puntos ignora?</span><input type="number" min="1" style="width:80px" data-arma="ignoraResistCrit" value="${esc(a.ignoraResistCrit)}"></div>` : ''}
        ${fila('critBono', '+ Crítico frecuente')}${fila('critpotBono', '+ Crítico potente')}${espalda}${fila('espaldaCritpot', '+ Crítico potente por la espalda')}`;
      if(parte === 'dano') return titulo('', 'El daño de este ataque', 'El daño de tu arma, más lo que le suma la habilidad. «Por X» se multiplica por la X que elegís al usarla.')
        + `${fila('fijo', 'Daño fijo extra')}<div class="fila"><span style="min-width:250px">Dados de daño extra (ej. 1d6)</span><input type="text" style="width:80px" placeholder="1d6" data-arma-dados value="${esc(a.dadoExtra || '')}"></div>
        ${fila('dadosPorX', 'Dados extra por cada X (del Tipo del arma)')}${fila('fijoPorX', 'Daño fijo extra por cada X')}${xSel}
        ${fila('perfora', 'Perfora (ignora N de la Defensa; se suma a la del arma)')}${espalda}${fila('espaldaFijo', '+ Daño por la espalda')}`;
      return titulo('', 'El PdG de este ataque', 'Se juega como un ataque normal con tu arma. Los No2 del ataque ya los cobra la habilidad.')
        + `${fila('pdg', '+ a la PdG (fijo)')}${fila('pdgPorX', '+ a la PdG por cada X')}${xSel}
        <label class="op"><input type="checkbox" data-terminaturno ${st.terminaTurno ? 'checked' : ''}> Al resolverse, termina tu turno y pasás al final del orden de turnos (Degollar)</label>
        ${espalda}${fila('espaldaPdg', '+ PdG por la espalda')}`;
    }
    /* ---------- Lo que se edita al tocar cada botón del cuadro (2026-10-15, docs/plan-editor-ejecucion.md) ----------
       Declaración (a quién, dónde tiene que estar, el área y si permanece) · La zona (si permanece) · lo que tira quien la usa (la lista,
       «Otro stat…» o «Fórmula propia») · con qué se resiste el objetivo · el daño (de dónde sale, qué se le suma y qué lo frena). */
    const OBJETIVOS = [['enemigo', 'Un enemigo'], ['aliado', 'Un aliado'], ['cualquiera', 'Cualquier personaje (aliado o enemigo)'], ['uno mismo', 'Uno mismo'],
      ['area', 'Un área (marcás el centro)'], ['onda', 'Onda alrededor tuyo'], ['cono', 'Cono al frente tuyo'], ['linea', 'Línea recta desde vos']];
    const ESPACIAL = [['auto', 'Automático (lo especial: tu Rango; lo demás, sin límite)'], ['adyacente', 'Pegado (adyacente)'], ['rango', 'Dentro de tu Rango'], ['fijo', 'A un número de casilleros o menos'], ['ilimitado', 'Sin límite']];
    const norm = x => String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.\s]/g, '');
    const corto = t => String(t).split(' (')[0];
    // Todos los stats, agrupados por atributo (la grilla de «Otro stat…»).
    function gruposStats(){
      if(typeof FichaCalculo !== 'undefined' && FichaCalculo.GRUPOS) return FichaCalculo.GRUPOS.map(g => ({nombre: g.full || g.label, stats: [{id: g.id, label: g.full || g.label}, ...(g.derived || []).map(d => ({id: d.id, label: d.label, full: d.full}))]}));
      const vistos = new Set();
      return [{nombre: 'Stats', stats: [...TIRA, ...CONTRA].filter(([id]) => !vistos.has(id) && vistos.add(id)).map(([id, t]) => ({id, label: corto(t)}))}];
    }
    function statNombre(id){
      const x = [...TIRA, ...CONTRA].find(y => y[0] === id);
      if(x) return corto(x[1]);
      for(const g of gruposStats()) for(const s2 of g.stats) if(s2.id === id) return s2.full || s2.label;
      return id;
    }
    function statDeTexto(txt){
      const n = norm(txt);
      if(!n) return '';
      for(const [id, t] of [...TIRA, ...CONTRA]) if(norm(id) === n || norm(corto(t)) === n) return id;
      for(const g of gruposStats()) for(const s2 of g.stats) if(norm(s2.id) === n || norm(s2.label) === n || norm(s2.full) === n) return s2.id;
      return '';
    }
    // «Fórmula propia» (dueño, 2026-10-15): dados («1d4+3», «X+1dX») o un stat más un número («pdg + 5», «Destreza − 1»). → {stat, bono} | {formula} | null
    function leerFormula(txt){
      const t = String(txt || '').trim().replace(/−/g, '-');
      const m = t.match(/^([^\d+\-][^+\-]*?)\s*(?:([+-])\s*(\d+))?$/);
      if(m){ const id = statDeTexto(m[1]); if(id) return {stat: id, bono: m[2] ? (m[2] === '-' ? -1 : 1) * Number(m[3]) : 0}; }
      if(/^[\dxXdD+\-\s]+$/.test(t) && /[\dxX]/.test(t)) return {formula: t.replace(/\s+/g, '')};
      return null;
    }
    function gridHtml(){
      return `<div class="adh-grid"><div class="adh-grid-h">Elegí el stat <button type="button" class="sec" data-grid-cerrar>Cerrar</button></div>
        ${gruposStats().map(g => `<div class="adh-grid-g"><span class="adh-grid-t">${esc(g.nombre)}</span>${g.stats.map(x => `<button type="button" class="adh-stat" data-grid-stat="${esc(x.id)}" title="${esc(x.full || x.label)}">${esc(x.label)}</button>`).join('')}</div>`).join('')}</div>`;
    }
    const esAreaObj = o => ['area', 'onda', 'cono', 'linea'].includes(o);
    const objetivoVisto = () => st.objetivo === 'zona' ? 'area' : st.objetivo;

    // A quién, dónde tiene que estar, el área y si permanece (el lado «Se resiste / Objetivo» de la Declaración).
    function cuerpoDeclaracion(){
      const vis = objetivoVisto();
      let h = titulo('', 'Sobre quién', 'A quién se le puede apuntar y dónde tiene que estar.');
      h += `<div><div class="adh-lbl">Objetivo</div><select data-objetivo>${OBJETIVOS.map(([v, t]) => `<option value="${v}"${vis === v ? ' selected' : ''}>${t}</option>`).join('')}</select></div>`;
      if(['enemigo', 'aliado', 'cualquiera'].includes(vis)){
        h += `<div><div class="adh-lbl">¿Dónde tiene que estar?</div><div class="fila"><select data-alcance>${ESPACIAL.map(([v, t]) => `<option value="${v}"${st.alcance === v ? ' selected' : ''}>${t}</option>`).join('')}</select>${st.alcance === 'fijo' ? `<input type="number" min="1" style="width:70px" data-alcanceN value="${esc(st.alcanceN)}"><span>casilleros</span>` : ''}</div>
          <p class="nota">No limita a quién podés apuntar: al elegir el objetivo, brillan los que están ahí.</p></div>`;
      }
      if(vis === 'area' || vis === 'onda'){
        h += `<div><div class="adh-lbl">Tamaño</div><div class="fila"><select data-radio>${Combatiente.diametroOpciones(st.radio, {min: vis === 'area' && st.objetivo !== 'zona' ? 0 : 1})}</select>${vis === 'onda' ? '<span>alrededor tuyo (diámetro 3 = los de al lado)</span>' : ''}</div></div>`;
        if(vis === 'area') h += `<div><div class="adh-lbl">¿Dónde cae el centro?</div><div class="fila"><select data-centro>${[['', 'Donde quieras (sin límite)'], ['adyacente', 'En una casilla pegada a vos'], ['rango', 'Dentro de tu Rango'], ['fijo', 'A un número de casilleros o menos']].map(([v, t]) => `<option value="${v}"${st.centroModo === v ? ' selected' : ''}>${t}</option>`).join('')}</select>${st.centroModo === 'fijo' ? `<input type="number" min="1" style="width:70px" data-centroN value="${esc(st.centroN)}"><span>casilleros</span>` : ''}</div></div>`;
        const perm = [['momento', 'Del momento: se resuelve al ejecutar y no deja nada'], ['queda', 'Golpea y queda: se resuelve al ejecutar y además deja una zona'], ...(vis === 'area' ? [['solo', 'Solo queda: no golpea al ejecutar; queda una zona que afecta a quien esté o entre']] : [])];
        h += `<div><div class="adh-lbl">¿Es del momento o permanece?</div>${perm.map(([v, t]) => `<label class="op"><input type="radio" name="permanencia" value="${v}" ${st.permanencia === v ? 'checked' : ''}> ${t}</label>`).join('')}
          ${st.permanencia !== 'momento' ? '<p class="nota">Aparece el recuadro «La zona que queda»: tocalo para decir cuánto dura, cuándo afecta y qué deja.</p>' : ''}</div>`;
      }
      if(vis === 'onda' || vis === 'cono') h += `<label class="op"><input type="checkbox" data-ondadodge ${st.ondaDodge ? 'checked' : ''}> Quien gana su tirada tiene dodge roll (puede salir moviéndose; si sale, la esquiva)</label>`;
      if(vis === 'cono') h += `<p class="nota">El cono al frente tuyo, hacia donde mirás. No hay que marcar nada.</p>`;
      if(vis === 'linea') h += `<div><div class="adh-lbl">Largo</div><div class="fila"><input type="number" min="1" style="width:70px" data-radio value="${esc(st.radio)}"><span>casilleros, desde vos hacia donde marques</span></div></div>`;
      if(vis === 'uno mismo') h += `<p class="nota">No hay que elegir a nadie: se aplica sobre quien la usa.</p>`;
      return h;
    }

    function cuerpoZona(){
      const solo = st.objetivo === 'zona';
      let h = titulo('', 'La zona que queda', solo ? 'No golpea al ejecutar: queda la zona. Su tirada y su daño son los del Contacto y el Daño de abajo; acá, cuánto dura, cuándo afecta y qué deja.'
        : 'Lo que queda después del golpe (la bola de fuego que deja fuego, la ventisca que deja escarcha). Al ejecutar ya les pegó a los de adentro: esto es para después.');
      const v = (a, b) => solo ? a : b;
      const estado = v(st.zonaEstadoNombre, st.zq.estadoNombre);
      h += `<div class="fila"><input type="number" min="1" style="width:70px" data-z-turnos value="${esc(v(st.zonaTurnos, st.zq.turnos))}"><span>turnos que dura</span></div>
        <div><div class="adh-lbl">¿Cuándo afecta?</div>
          <label class="op"><input type="checkbox" checked disabled> Al entrar (siempre)</label>
          <label class="op"><input type="checkbox" data-z-mant ${v(st.zonaEnMant, st.zq.enMant) ? 'checked' : ''}> En cada turno, a quien sigue adentro</label>
          <label class="op"><input type="checkbox" data-z-paso ${v(st.zonaCadaPaso, st.zq.cadaPaso) ? 'checked' : ''}> A cada paso que da adentro (un piso de púas)</label></div>
        <div><div class="adh-lbl">¿A quién?</div><select data-z-quien><option value="todos"${v(st.zonaAmiga, !st.zq.soloRivales) ? ' selected' : ''}>A todos (también a tus aliados)</option><option value="rivales"${v(!st.zonaAmiga, st.zq.soloRivales) ? ' selected' : ''}>Solo a los rivales</option></select></div>
        <div><div class="adh-lbl">¿Dónde está?</div><select data-z-altura>${[['aire', '☁️ Del aire (gas, nube, humo): alcanza aunque levites'], ['piso', '🟫 Del piso (púas, brea, brasas): levitando se cruza sin tocarla'], ['ambos', '🔥 Ambos (fuego, escarcha)']].map(([x, t]) => `<option value="${x}"${v(st.zonaAltura, st.zq.altura) === x ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
        <div><div class="adh-lbl">¿Deja un estado?</div><div class="fila"><select data-z-estado><option value="">— ninguno —</option>${nombresEstado().map(n => `<option value="${esc(n)}"${estado === n ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select>${estado ? `<span>dura</span><input type="number" min="0" style="width:64px" data-z-estadoturnos value="${esc(v(st.zonaEstadoTurnos, st.zq.estadoTurnos))}"><span>turnos</span>` : ''}${solo && ['Veneno', 'Veneno severo'].includes(st.zonaEstadoNombre) ? `<span>stacks</span><input type="number" min="1" style="width:64px" data-zonaestadostacks placeholder="por defecto" value="${esc(st.zonaEstadoStacks)}">` : ''}</div></div>`;
      if(!solo){
        h += `<div><div class="adh-lbl">¿Hace daño la zona?</div><div class="fila"><input type="text" style="width:110px" data-z-dano placeholder="ej. 1d4 (vacío: no)" value="${esc(st.zq.dano)}"><select data-z-tipo>${[['', 'sin elemento'], ...TIPOS.filter(t => t[0] !== 'fisico')].map(([x, t]) => `<option value="${x}"${st.zq.tipoDano === x ? ' selected' : ''}>${corto(t)}</option>`).join('')}</select></div>
          <p class="nota">Va directo a la vida: la frena la Defensa especial y la resistencia a su elemento.</p></div>
          <div><div class="adh-lbl">¿Se resiste?</div><div class="fila"><select data-z-contra><option value="">No: le entra a quien esté</option>${CONTRA.filter(c => c[0] !== 'parry').map(([x, t]) => `<option value="${x}"${st.zq.contra === x ? ' selected' : ''}>Sí, con ${corto(t)}</option>`).join('')}</select>${st.zq.contra ? `<span>contra tu</span><select data-z-tira>${TIRA.map(([x, t]) => `<option value="${x}"${(st.zq.tira || 'dmgesp') === x ? ' selected' : ''}>${corto(t)}</option>`).join('')}</select>` : ''}</div></div>`;
      }
      return h;
    }

    // Lo que tira quien la usa (el botón azul de la izquierda del Contacto).
    function cuerpoTira(){
      const esZona = st.objetivo === 'zona';
      let h = titulo('', 'Lo que tira quien la usa', esZona ? 'La tirada de la zona: cada vez que afecta a alguien, se tira con el valor de quien la creó.' : '«Fórmula propia»: dados (1d4+3) o un stat más un número (pdg + 5).');
      const opsT = [['', '— Nada: se aplica directo —'], ...TIRA.map(([x, t]) => [x, corto(t)])];
      if(st.tira && !opsT.some(o => o[0] === st.tira)) opsT.push([st.tira, statNombre(st.tira)]);
      const valT = st.tiraNinguna ? '' : st.tiraModo === 'custom' ? '__f' : st.tira;
      h += `<select data-tirasel>${opsT.map(([x, t]) => `<option value="${esc(x)}"${valT === x ? ' selected' : ''}>${esc(t)}</option>`).join('')}<option value="__otro">Otro stat…</option>${esZona ? '' : `<option value="__f"${valT === '__f' ? ' selected' : ''}>Fórmula propia…</option>`}</select>`;
      if(!st.tiraNinguna && st.tiraModo !== 'custom' && !esZona) h += `<div class="fila"><span>+</span><input type="number" style="width:64px" data-tirabono value="${esc(st.tiraBono)}"><span class="nota" style="margin:0">un número de más (0 = nada)</span></div>`;
      if(!st.tiraNinguna && st.tiraModo === 'custom') h += `<div class="fila"><input type="text" style="width:200px" data-tira-formula placeholder="1d4+3, X+1dX o pdg + 5" value="${esc(st.tiraFormula)}"><input type="text" style="width:200px" data-tira-etiqueta placeholder="¿Qué representa? (ej. Drenaje)" value="${esc(st.tiraEtiqueta)}"></div>`;
      if(st.grid === 'tira') h += gridHtml();
      return h;
    }
    // Con qué se resiste el objetivo (las cajas de «Elegí cómo te defendés»).
    function cuerpoContra(){
      const esZona = st.objetivo === 'zona', esArea = esAreaObj(st.objetivo);
      let h = titulo('', 'Con qué se resiste', esZona ? 'Lo que tira quien entra en la zona. Si gana, no le pasa nada.' : 'Si hay más de una, el objetivo elige una a ciegas, antes de ver tu tirada. «Fórmula propia»: dados (1d6+2) o un stat más un número (des + 2).');
      if(!esArea && !esZona) h += `<select data-contramodo><option value="stats"${st.contraModo === 'stats' ? ' selected' : ''}>Con…</option><option value="ninguna"${st.contraModo === 'ninguna' ? ' selected' : ''}>Nadie: se aplica directo</option><option value="otro"${st.contraModo === 'otro' ? ' selected' : ''}>Otra cosa (a mano)</option></select>`;
      if(esArea || esZona || st.contraModo === 'stats'){
        h += `<div class="adh-check-list">${CONTRA.map(([x, t]) => `<label class="op"><input type="checkbox" data-contra="${x}" ${st.contra.has(x) ? 'checked' : ''}> ${corto(t)}</label>`).join('')}</div>`;
        const chips = [...[...st.contra].filter(x => !CONTRA.some(c => c[0] === x)).map(x => ({txt: statNombre(x), k: 's:' + x})),
          ...st.contraExtra.map((x, i) => ({txt: x.formula ? `${x.etq || 'Fórmula'}: ${x.formula}` : `${statNombre(x.stat)} ${Number(x.bono) >= 0 ? '+' : '−'} ${Math.abs(Number(x.bono) || 0)}`, k: 'e:' + i}))];
        if(chips.length) h += `<div class="fila">${chips.map(c => `<span class="adh-chip">${esc(c.txt)}<button type="button" class="adh-chip-x" data-contra-quitar="${esc(c.k)}" title="Sacar">✕</button></span>`).join('')}</div>`;
        h += `<div class="fila"><button type="button" class="sec" data-grid="contra">＋ Otro stat…</button></div>`;
        if(!esZona) h += `<div class="fila"><input type="text" style="width:140px" data-contra-formula placeholder="1d6+2 o des + 2" value="${esc(st.contraFormula)}"><input type="text" style="width:140px" data-contra-formula-etq placeholder="Nombre (opcional)" value="${esc(st.contraFormulaEtq)}"><button type="button" class="sec" data-contra-formula-mas>＋ Fórmula propia</button></div>`;
        if(st.contra.has('parry')) h += `<p class="nota">Parry solo se ofrece si el objetivo tiene un arma o un escudo.</p>`;
        if(st.grid === 'contra') h += gridHtml();
      }else if(st.contraModo === 'otro'){
        h += `<input type="text" style="width:100%" data-contraotro placeholder="ej. Resistencia a X (a mano)" value="${esc(st.contraOtro)}"><p class="nota">Nadie lo tira solo: el cuadro lo muestra para resolverlo a mano.</p>`;
      }
      return h;
    }

    const FRENOS = [['fisico', 'Físico', 'Lo frena la Defensa (la armadura).'], ['especial', 'Especial', 'Ignora la Defensa; lo frena la Defensa especial (y la resistencia a su elemento).'],
      ['directo', 'Especial directo', 'Ignora la Defensa y la Defensa especial; solo lo frenan las resistencias elementales, si las tiene.'], ['true', 'Verdadero', 'No lo frena nada, ni la resistencia a su elemento. Muy controlado.']];
    const frenoDe = () => !st.ignoraDano || st.tipoDano === 'fisico' ? 'fisico' : st.frenoEsp === 'directo' ? 'directo' : st.frenoEsp === 'true' ? 'true' : 'especial';
    const fuenteDano = () => !st.dano ? 'no' : st.danoDif && st.objetivo !== 'uno mismo' ? 'dif' : st.danoArma && st.objetivo !== 'zona' && st.objetivo !== 'uno mismo' ? 'arma' : 'formula';
    function cuerpoDano(){
      const esZona = st.objetivo === 'zona', uno = st.objetivo === 'uno mismo', fuente = fuenteDano();
      let h = titulo('', 'El daño', 'De dónde sale, qué se le suma y qué lo frena.');
      const ops = [['no', 'No hace daño'], ['formula', 'Una fórmula'], ...(!esZona && !uno ? [['arma', 'El daño de un ataque (tu arma + Fuerza)']] : []), ...(!uno ? [['dif', 'La diferencia entre las tiradas']] : [])];
      h += `<div><div class="adh-lbl">¿De dónde sale?</div>${ops.map(([x, t]) => `<label class="op"><input type="radio" name="fuentedano" value="${x}" ${fuente === x ? 'checked' : ''}> ${t}</label>`).join('')}</div>`;
      if(fuente === 'formula') h += `<div class="fila"><span>Fórmula</span><input type="text" style="width:140px" data-dano-formula placeholder="ej. 2d6+3" value="${esc(st.danoFormula)}"><span class="nota" style="margin:0">(podés usar «X»)</span></div>${!st.danoFormula.trim() && cfg.tieneFormula === false ? '<p class="aviso">Falta la fórmula del daño: sin ella, el duelo no tira daño.</p>' : ''}`;
      if(fuente === 'arma') h += `<p class="nota">El daño de tu arma (la que elegís si cuesta como un ataque; si no, la principal), con su Fuerza, como el botón «Daño».</p>`;
      if(fuente === 'dif') h += `<p class="nota">${esZona ? 'Cada uno que no resiste recibe' : 'Si no la resiste, recibe'} tu tirada menos la suya (empate: nada).</p>`;
      if(fuente !== 'no'){
        if(fuente !== 'dif') h += `<div class="fila"><span>Además suma</span><input type="text" style="width:100px" data-dano-mas placeholder="+2 o +1d6" value="${esc(st.danoMas)}"><span class="nota" style="margin:0">un fijo y/o un dado (vacío = nada)</span></div>`;
        const fr = FRENOS.find(x => x[0] === frenoDe());
        const elem = st.tipoDano !== 'fisico' ? ' · ' + corto((TIPOS.find(t => t[0] === st.tipoDano) || ['', st.tipoDano])[1]) : '';
        h += `<div class="fila"><button type="button" data-freno-abrir>🛡 Qué lo frena: ${esc(fr[1])}${esc(elem)} ${st.frenoAbierto ? '▴' : '▾'}</button></div>`;
        if(st.frenoAbierto){
          const elementos = frenoDe() === 'fisico' ? [['fisico', 'Ninguno'], ...TIPOS.filter(t => t[0] !== 'fisico')] : TIPOS.filter(t => t[0] !== 'fisico').map(([x, t]) => [x, x === 'arcano' ? 'Arcano (energía, sin elemento)' : t]);
          h += `<div class="adh-freno">${FRENOS.map(([x, t, d]) => `<label class="op"><input type="radio" name="freno" value="${x}" ${frenoDe() === x ? 'checked' : ''}><span><b>${t}</b> <span class="nota">${d}</span></span></label>`).join('')}
            <div class="fila"><span>Elemento:</span><select data-tipodano>${elementos.map(([x, t]) => `<option value="${x}"${st.tipoDano === x ? ' selected' : ''}>${corto(t)}</option>`).join('')}</select><span class="nota" style="margin:0">lo frena la resistencia a ese elemento</span></div></div>`;
        }
        if(fuente === 'formula') h += `<div class="fila"><span>Suma tu Efecto especial (Ef.Esp):</span><select data-danosumaesp>${[['', 'no'], ['mitad', 'la mitad'], ['si', 'entero']].map(([x, t]) => `<option value="${x}"${st.danoSumaEsp === x ? ' selected' : ''}>${t}</option>`).join('')}</select></div>`;
        if(cfg.costoVariable && fuente !== 'dif') h += `<div class="fila"><span>Por cada punto de X (${cfg.costoVariable === 'sp' ? 'SP' : 'No2'}): +</span><input type="number" style="width:70px" data-danoporx value="${esc(st.danoFijoPorX)}"><span>de daño</span></div>`;
        if(!esZona){
          h += `<label class="op"><input type="checkbox" data-drena ${st.drena ? 'checked' : ''}> Drena: quien la usa se cura lo que hizo de daño</label>`;
          if(st.drena) h += `<div class="fila"><span>Se cura el</span><input type="number" min="1" max="100" style="width:70px" data-drenapct value="${esc(st.drenaPct)}"><span>% · puede pasar su máximo hasta</span><input type="number" min="0" style="width:70px" data-drenatope value="${esc(st.drenaTope)}"><span>% (como Vida extra)</span></div>`;
        }
        if(esZona) h += `<div class="fila"><span>Si el daño entra, tirar además:</span><input type="text" style="width:90px" data-danoextra placeholder="ej. 1d20" value="${esc(st.danoExtra)}"></div>`;
      }
      h += `<label class="op"><input type="checkbox" data-efectolibre-on ${st.efectoLibreOn ? 'checked' : ''}> ✋ Algo del daño se resuelve a mano</label>`;
      if(st.efectoLibreOn) h += `<textarea data-efectolibre rows="3" placeholder="ej. Drenás la diferencia: sumátela a tu vida.">${esc(st.efectoLibre)}</textarea><p class="nota">El cuadro lo muestra junto al resultado (con la diferencia entre las tiradas), aclarando que es a mano.</p>`;
      return h;
    }

    /* ---------- El cuadro, como el del duelo (2026-10-15, dueño: «quiero que visualmente se vea igual el editor de un duelo como cuando uno lo
       está ejecutando… uno puede editar qué hace ese botón específicamente en esa instancia») ----------
       Los mismos recuadros, colores y botones que `comun/duelo.js` (usa sus estilos: Duelo.estilos). Cada botón o caja con ✎ abre, debajo,
       lo que hace (`st.pop`: costo, tipo, decl, zona, tira, contra, dano, efectos, arma, alcance, flash). */
    const efTxtDe = e => e.no2 !== undefined ? `⚡ Pierde ${e.no2}${e.no2Dif ? ' + la diferencia' : ''} en No2${e.no2Sentado ? ' (en 0, Sentado)' : ''}`
      : e.cura !== undefined ? `💚 Cura ${e.cura} HP` : `◎ ${e.nombre || 'Estado'} (${e.permanente ? 'no vence' : (e.turnos ?? 2) + ' turnos'})${e.escudo ? ` · 🛡${e.escudo}` : ''}`;
    const pctTxt = e => Number(e.caras) > 1 ? `${Math.round(100 * Math.max(1, Number(e.exitos) || 1) / Number(e.caras))} %` : '';
    const tiraTxt = () => st.tiraModo === 'custom' ? `${st.tiraEtiqueta || 'Tirada'} · ${st.tiraFormula || '¿fórmula?'}` : `${statNombre(st.tira)}${st.tiraBono ? ` ${st.tiraBono > 0 ? '+' : '−'} ${Math.abs(st.tiraBono)}` : ''}`;
    const contraLista = () => [...[...st.contra].map(x => statNombre(x)), ...(st.objetivo === 'zona' ? [] : st.contraExtra.map(x => x.formula ? `${x.etq || 'Fórmula'} · ${x.formula}` : `${statNombre(x.stat)} ${Number(x.bono) >= 0 ? '+' : '−'} ${Math.abs(Number(x.bono) || 0)}`))];
    function dondeTxt(){
      const vis = objetivoVisto();
      if(['enemigo', 'aliado', 'cualquiera'].includes(vis)) return st.alcance === 'fijo' ? `a ${st.alcanceN} casilleros o menos` : corto((ESPACIAL.find(x => x[0] === st.alcance) || ['', ''])[1]).toLowerCase();
      if(vis === 'area') return `${Combatiente.areaTxt(st.radio)}${st.centroModo === 'adyacente' ? ' · el centro pegado a vos' : st.centroModo === 'rango' ? ' · el centro dentro de tu Rango' : st.centroModo === 'fijo' ? ` · el centro a ${st.centroN} o menos` : ''}${st.permanencia === 'queda' ? ' · golpea y queda' : st.permanencia === 'solo' ? ' · solo queda' : ''}`;
      if(vis === 'onda') return `${Combatiente.areaTxt(st.radio)} alrededor tuyo${st.permanencia === 'queda' ? ' · golpea y queda' : ''}`;
      if(vis === 'cono') return 'el cono al frente tuyo';
      if(vis === 'linea') return `${st.radio} casilleros desde vos`;
      return 'sobre quien la usa';
    }
    function zonaTxt(){
      const solo = st.objetivo === 'zona', v = (a, b) => solo ? a : b;
      const cuando = ['al entrar', v(st.zonaEnMant, st.zq.enMant) ? 'en cada turno' : '', v(st.zonaCadaPaso, st.zq.cadaPaso) ? 'a cada paso' : ''].filter(Boolean).join(', ');
      const estado = v(st.zonaEstadoNombre, st.zq.estadoNombre);
      const dano = solo ? (st.dano ? 'el daño de abajo' : '') : st.zq.dano;
      return `${v(st.zonaTurnos, st.zq.turnos)} turnos · afecta ${cuando}${dano ? ' · daño ' + dano : ''}${estado ? ' · deja ' + estado : ''}`;
    }
    function danoTxt(){
      const f = fuenteDano();
      const base = f === 'arma' ? 'tu arma + Fuerza' : f === 'dif' ? 'la diferencia entre las tiradas' : (st.danoFormula || cfg.formulaDano || '¿fórmula?');
      return `${base}${st.danoMas && f !== 'dif' ? ' ' + (/^[+-]/.test(st.danoMas) ? st.danoMas : '+' + st.danoMas) : ''}`;
    }
    function frenoTxt(){
      const fr = frenoDe();
      const el = st.tipoDano !== 'fisico' ? ` · ${corto((TIPOS.find(t => t[0] === st.tipoDano) || ['', st.tipoDano])[1])}` : '';
      return (fr === 'fisico' ? 'Se le resta la Defensa del defensor' : fr === 'especial' ? 'Ignora la Defensa; lo frena la Defensa especial' : fr === 'directo' ? 'Especial directo: solo lo frenan las resistencias elementales' : 'Verdadero: no lo frena nada') + el;
    }
    const sinContacto = () => st.tiraNinguna;
    const paso = (n, tit, cuerpo) => `<div class="duelo-paso"><h4><span class="n">${n}</span>${tit}</h4>${cuerpo}</div>`;
    // Lo que se abre debajo al tocar un botón (los controles de siempre, con los colores del duelo).
    function popHtml(id){
      if(st.pop !== id) return '';
      ayudaPaso = '';
      const C = {tipo: cuerpoActivo, costo: cuerpoCosto, decl: cuerpoDeclaracion, zona: cuerpoZona, tira: cuerpoTira, contra: cuerpoContra, dano: cuerpoDano, efectos: cuerpoEfectos,
        arma: () => cuerpoArma('pdg'), armadef: () => cuerpoArma('def'), armacrit: () => cuerpoArma('crit'), armadano: () => cuerpoArma('dano'), alcance: () => cuerpoAlcance(true), flash: cuerpoFlash};
      const cuerpo = C[id]();
      return `<div class="ejd-pop"><div class="ejd-pop-ayuda">${ayudaPaso}</div><div class="adh-paso">${cuerpo}</div><div class="ejd-pop-pie"><button type="button" data-ejd-listo>✔ Listo</button></div></div>`;
    }
    function efectosHtmlEd(titulo2){
      const efs = st.efectos;
      let c = efs.map(e => `<div class="duelo-ef ejd-ed" data-ejd-pop="efectos"><div class="duelo-ef-top"><b>${esc(efTxtDe(e))}</b>${pctTxt(e) ? `<span class="duelo-ef-prob">${pctTxt(e)}</span>` : ''}</div><button type="button" tabindex="-1">✔ Aplicar${e.nombre ? ' ' + esc(e.nombre) : ''}</button></div>`).join('');
      if(st.efectosNotaOn && st.efectosNota.trim()) c += `<div class="duelo-ef ejd-ed" data-ejd-pop="efectos"><div class="duelo-nota">✋ <b>A mano:</b> ${esc(st.efectosNota.trim())}</div></div>`;
      if(st.modo === 'arma' && st.critMatters) c += `<div class="duelo-ef ejd-ed" data-ejd-pop="efectos"><div class="duelo-ef-top"><b>⚡ Si es crítico, además: ${esc(st.efectosCritico.map(efTxtDe).join(', ') || st.efectosNotaCritico || '—')}</b></div></div>`;
      if(!c) c = `<div class="duelo-tiro ejd-vacio"><div class="espera">Sin efectos</div></div>`;
      c += `<button type="button" class="sec ejd-ed ejd-mas" data-ejd-pop="efectos">＋ Efecto (un estado, una cura, perder No2 o ✋ a mano)</button>`;
      return paso(st.modo === 'arma' ? 6 : sinContacto() ? 3 : 4, titulo2, c + popHtml('efectos'));
    }
    function cuerpoCuadro(){
      const nitrosTxt = st.costoNitrosModo === 'ataque' ? 'como un ataque' : st.costoNitrosModo === 'x' ? 'X' : `${st.costoNitrosNum}`;
      const MODOS = {hab: 'Habilidad dirigida', arma: 'Ataque con tu arma, con arreglos', flash: '⚡ Reacción Flash'};
      let h = `<div class="ejd-barra"><button type="button" class="ejd-chip ejd-ed" data-ejd-pop="costo">💰 SP ${esc(st.costoSp || '0')} · No2 ${esc(nitrosTxt)}${st.costoHp ? ` · HP ${st.costoHp}` : ''}${st.costoTurnoOn && st.costoTurnoSp ? ` · ${esc(st.costoTurnoSp)} SP en turno ajeno` : ''}</button>
        <button type="button" class="ejd-chip ejd-ed" data-ejd-pop="tipo">Tipo: ${MODOS[st.modo] || st.modo}</button></div>${popHtml('costo')}${popHtml('tipo')}`;
      if(st.modo === 'flash'){
        h += paso(1, 'Reacción Flash', `<div class="duelo-tiros"><div class="duelo-tiro"><div class="que">antes de una tirada de otro cuadro</div><button type="button" class="ejd-ed" data-ejd-pop="flash">⚡ +${esc(st.flashBono)} a ${esc([...st.flashEn].map(v => corto((FLASH_EN.find(x => x[0] === v) || [v, v])[1])).join(', ') || '¿qué tirada?')}</button>${st.flashDodge ? '<div class="det">si gana la Evasión, dodge roll</div>' : ''}</div></div>${popHtml('flash')}`);
        return h;
      }
      const arma = st.modo === 'arma';
      const vis = objetivoVisto();
      // 1 · Declaración
      const atqSub = arma ? 'con su arma' : `${esc(cfg.nombre || '')}${!st.tiraNinguna ? ' · tira ' + esc(tiraTxt()) : ''}`;
      const defRol = arma ? 'Defiende' : (sinContacto() || (!esAreaObj(st.objetivo) && st.objetivo !== 'zona' && st.contraModo !== 'stats')) ? 'Objetivo' : 'Se resiste';
      const defNom = arma ? 'Un enemigo' : st.objetivo === 'zona' ? 'Un área que queda' : corto((OBJETIVOS.find(o => o[0] === vis) || ['', vis])[1]);
      const defSub = arma ? (st.alcance === 'auto' ? 'al alcance de tu arma' : st.alcance === 'fijo' ? `a ${st.alcanceN} casilleros o menos` : corto((ESPACIAL.find(x => x[0] === st.alcance) || ['', ''])[1]).toLowerCase()) : dondeTxt();
      h += paso(1, 'Declaración', `<div class="duelo-vs"><div class="duelo-lado atq ejd-ed" data-ejd-pop="tipo"><div class="rol">${arma ? 'Ataca' : 'Usa la habilidad'}</div><div class="nom">${esc(cfg.portador || 'Quien la tenga')}</div><div class="sub">${atqSub}</div></div>
        <div class="vs">VS</div><div class="duelo-lado def ejd-ed" data-ejd-pop="${arma ? 'alcance' : 'decl'}"><div class="rol">${defRol}</div><div class="nom">${esc(defNom)}</div><div class="sub">${esc(defSub)}</div></div></div>${popHtml(arma ? 'alcance' : 'decl')}`);
      if(!arma && (st.objetivo === 'zona' || ((vis === 'area' || vis === 'onda') && st.permanencia === 'queda'))){
        h += paso('🌫', 'La zona que queda', `<div class="duelo-ef ejd-ed" data-ejd-pop="zona"><div class="duelo-ef-top"><b>${esc(zonaTxt())}</b></div></div>${popHtml('zona')}`);
      }
      if(arma){
        const a = st.arma;
        const masPdg = [a.pdg ? `${a.pdg > 0 ? '+' : ''}${a.pdg}` : '', a.pdgPorX ? `+${a.pdgPorX} por X` : ''].filter(Boolean).join(' ');
        h += paso(2, 'Contacto: PdG contra la defensa que elija', `<div class="duelo-tiros"><div class="duelo-tiro"><div class="que">PdG · quien ataca</div><button type="button" class="ejd-ed" data-ejd-pop="arma">🎲 Pagar y tirar PdG · tu arma${masPdg ? ' ' + esc(masPdg) : ''}</button></div>
          <div class="duelo-tiro"><div class="que">Defensa · quien defiende</div><div class="espera">Elegí cómo te defendés:</div><div class="duelo-opc"><button type="button" class="ejd-ed" data-ejd-pop="armadef">🛡 Evasión</button><button type="button" class="ejd-ed${a.sinParry ? ' sec' : ''}" data-ejd-pop="armadef">🛡 Parry${a.sinParry ? ' (no se puede)' : ''}</button></div></div></div>${popHtml('arma')}${popHtml('armadef')}`);
        h += paso(3, 'Bloqueo: Fuerza del golpe contra Bloqueo', `<div class="duelo-mini">Como cualquier ataque: si lo para con Parry, sigue el Bloqueo.</div>`);
        const crit = [a.critBono ? `+${a.critBono} Crítico frecuente` : '', a.critpotBono ? `+${a.critpotBono} Crítico potente` : '', a.ignoraResistCrit ? `ignora ${a.ignoraResistCrit} de Resistencia a crítico` : ''].filter(Boolean).join(' · ');
        h += paso(4, 'Crítico', `<div class="duelo-ef ejd-ed" data-ejd-pop="armacrit"><div class="duelo-ef-top"><b>${esc(crit || 'El de tu arma, sin cambios')}</b></div></div>${popHtml('armacrit')}`);
        const masDano = [a.dadosPorX ? `+${a.dadosPorX} dado(s) por X` : '', a.dadoExtra ? `+${a.dadoExtra}` : '', a.fijo ? `${a.fijo > 0 ? '+' : ''}${a.fijo}` : '', a.fijoPorX ? `+${a.fijoPorX} por X` : '', a.perfora ? `perfora ${a.perfora}` : ''].filter(Boolean).join(' ');
        h += paso(5, 'Daño', `<button type="button" class="ejd-dano ejd-ed" data-ejd-pop="armadano">🎲 Tirar el daño · tu arma${masDano ? ' ' + esc(masDano) : ''}</button><div class="duelo-mini">Se le resta la Defensa del defensor.</div>${popHtml('armadano')}`);
        h += efectosHtmlEd('Efectos del golpe');
        return h;
      }
      // 2 · Contacto
      if(sinContacto()){
        h += paso(2, 'Contacto', `<div class="duelo-tiros"><div class="duelo-tiro"><div class="que">quien la usa</div><button type="button" class="sec ejd-ed" data-ejd-pop="tira">Sin tirada: se aplica directo</button></div><div class="duelo-tiro"><div class="que">el objetivo</div><div class="espera">No tiene que resistir nada</div></div></div>${popHtml('tira')}`);
      }else{
        const lista = contraLista();
        const abierta = esAreaObj(st.objetivo) || st.objetivo === 'zona' || st.contraModo === 'stats';
        const der = abierta
          ? `<div class="espera">Elegí cómo te defendés:</div><div class="duelo-opc">${lista.map(t => `<button type="button" class="ejd-ed" data-ejd-pop="contra">🛡 ${esc(t)}</button>`).join('') || '<div class="espera">¿con qué?</div>'}</div><button type="button" class="sec ejd-ed ejd-mas" data-ejd-pop="contra">＋ Otra forma de resistirse</button>`
          : st.contraModo === 'otro' ? `<button type="button" class="sec ejd-ed" data-ejd-pop="contra">✋ A mano: ${esc(st.contraOtro || '¿con qué?')}</button>` : `<button type="button" class="sec ejd-ed" data-ejd-pop="contra">Nadie: se aplica directo</button>`;
        const tit = `${tiraTxt()} contra ${abierta ? (lista.length === 1 ? lista[0] : 'la defensa que elija') : st.contraModo === 'otro' ? 'algo a mano' : 'nadie'}`;
        h += paso(2, esc(tit), `<div class="duelo-tiros"><div class="duelo-tiro"><div class="que">${esc(st.tiraModo === 'custom' ? (st.tiraEtiqueta || 'Tirada') : statNombre(st.tira))} · quien la usa</div><button type="button" class="ejd-ed" data-ejd-pop="tira">🎲 Tirar ${esc(tiraTxt())}</button></div>
          <div class="duelo-tiro"><div class="que">${st.objetivo === 'zona' ? 'quien entra en la zona' : 'Defensa · el objetivo'}</div>${der}</div></div>${popHtml('tira')}${popHtml('contra')}`);
      }
      // 3 · Daño
      const nD = sinContacto() ? 2 : 3;
      h += paso(nD === 2 ? '·' : 3, 'Daño', !st.dano ? `<button type="button" class="sec ejd-ed ejd-mas" data-ejd-pop="dano">Sin daño · tocá para agregarlo</button>${popHtml('dano')}`
        : `<button type="button" class="ejd-dano ejd-ed" data-ejd-pop="dano">🎲 Tirar el daño · ${esc(danoTxt())}</button><div class="duelo-mini">${esc(frenoTxt())}${st.drena ? ' · 🩸 drena' : ''}</div>${st.efectoLibreOn && st.efectoLibre.trim() ? `<div class="duelo-ef ejd-ed" data-ejd-pop="dano"><div class="duelo-nota">✋ <b>A mano:</b> ${esc(st.efectoLibre.trim())}</div></div>` : ''}${popHtml('dano')}`);
      // 4 · Efectos (una zona que solo queda deja lo suyo: está en «La zona que queda»)
      if(st.objetivo !== 'zona') h += efectosHtmlEd('Efectos de la habilidad');
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
      let h = titulo('', st.modo === 'arma' ? 'Efectos al pegar' : '4 · Efectos', 'Lo más frecuente (un estado, una cura, perder No2) se aplica con su botón «Aplicar». Lo que no, va en «✋ Manual», con tus palabras. Solo entran si la habilidad funciona.');
      h += filaEfectosLista(st.efectos, i => i);
      h += `<datalist id="adh-estados">${nombresEstado().map(n => `<option value="${esc(n)}">`).join('')}</datalist>
        <div class="fila"><button type="button" class="sec" data-ef-mas="estado">＋ Estado</button><button type="button" class="sec" data-ef-mas="cura">＋ Cura</button><button type="button" class="sec" data-ef-mas="no2">＋ Pierde No2</button></div>`;
      h += `<div class="fila" style="margin-top:14px"><label class="op" style="padding:0"><input type="checkbox" data-efectosnota-on ${st.efectosNotaOn ? 'checked' : ''}> ✋ Manual: un efecto que se aplica a mano, con tus palabras</label></div>`;
      if(st.efectosNotaOn){
        h += `<textarea data-efectosnota rows="3" style="width:100%;box-sizing:border-box;padding:8px;font-size:14px" placeholder="ej. Invertí el orden de turno de todos los presentes hasta tu próximo turno.">${esc(st.efectosNota)}</textarea>
          <p class="nota" style="margin-top:6px">Al llegar a los efectos, el duelo muestra este texto aclarando que se aplica a mano.</p>`;
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
    function dibujar(){
      if(!fondo) return;
      const caja = fondo.querySelector('.duelo-caja'), y = caja ? caja.scrollTop : 0;
      f.innerHTML = cuerpoCuadro();
      conectar();
      if(caja) caja.scrollTop = y;
    }
    // Los controles del paso que se acaba de dibujar (la ventana común lo llama en cada dibujo).
    function conectar(){
      const q = (sel, fn) => { const el = f.querySelector(sel); if(el) el.onchange = fn; };
      q('[data-activo]', e => { st.activo = e.target.checked; dibujar(); });
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
      q('[data-objetivo]', e => {
        const v = e.target.value;
        if(v !== 'area' && v !== 'onda') st.permanencia = 'momento';
        else if(v === 'onda' && st.permanencia === 'solo') st.permanencia = 'momento';
        st.objetivo = v === 'area' && st.permanencia === 'solo' ? 'zona' : v;
        if(st.objetivo === 'onda' && st.radio > 1 && !ini) st.radio = 1;
        if(['area', 'onda', 'cono', 'linea', 'zona'].includes(st.objetivo) && st.contraModo !== 'stats') st.contraModo = 'stats';
        dibujar();
      });
      f.querySelectorAll('[name=permanencia]').forEach(r => r.onchange = () => {
        st.permanencia = r.value;
        if(r.value === 'solo') st.objetivo = 'zona'; else if(st.objetivo === 'zona') st.objetivo = 'area';
        dibujar();
      });
      q('[data-centro]', e => { st.centroModo = e.target.value; dibujar(); });
      q('[data-centroN]', e => { st.centroN = Math.max(1, Math.round(Number(e.target.value) || 1)); });
      // La zona que queda (la del área «solo queda» o la que deja un golpe)
      const zSolo = () => st.objetivo === 'zona';
      const nN = (v, min) => Math.max(min, Math.round(Number(v) || min));
      q('[data-z-turnos]', e => { if(zSolo()) st.zonaTurnos = nN(e.target.value, 1); else st.zq.turnos = nN(e.target.value, 1); });
      q('[data-z-mant]', e => { if(zSolo()) st.zonaEnMant = e.target.checked; else st.zq.enMant = e.target.checked; });
      q('[data-z-paso]', e => { if(zSolo()) st.zonaCadaPaso = e.target.checked; else st.zq.cadaPaso = e.target.checked; });
      q('[data-z-quien]', e => { const todos = e.target.value === 'todos'; if(zSolo()) st.zonaAmiga = todos; else st.zq.soloRivales = !todos; });
      q('[data-z-altura]', e => { if(zSolo()) st.zonaAltura = e.target.value; else st.zq.altura = e.target.value; });
      q('[data-z-estado]', e => { if(zSolo()) st.zonaEstadoNombre = e.target.value; else st.zq.estadoNombre = e.target.value; dibujar(); });
      q('[data-z-estadoturnos]', e => { if(zSolo()) st.zonaEstadoTurnos = nN(e.target.value, 0); else st.zq.estadoTurnos = nN(e.target.value, 0); });
      q('[data-z-dano]', e => { st.zq.dano = e.target.value.trim(); });
      q('[data-z-tipo]', e => { st.zq.tipoDano = e.target.value; });
      q('[data-z-contra]', e => { st.zq.contra = e.target.value; if(st.zq.contra && !st.zq.tira) st.zq.tira = 'dmgesp'; dibujar(); });
      q('[data-z-tira]', e => { st.zq.tira = e.target.value; });
      q('[data-modo]', e => { st.modo = e.target.value; dibujar(); });
      q('[data-flashbono]', e => { st.flashBono = Number(e.target.value) || 0; });
      q('[data-flashdodge]', e => { st.flashDodge = e.target.checked; });
      f.querySelectorAll('[data-flashen]').forEach(c => c.onchange = () => { c.checked ? st.flashEn.add(c.dataset.flashen) : st.flashEn.delete(c.dataset.flashen); });
      q('[data-x]', e => { st.x = e.target.value; });
      q('[data-sinparry]', e => { st.arma.sinParry = e.target.checked; });
      q('[data-terminaturno]', e => { st.terminaTurno = e.target.checked; });
      q('[data-ignoraresistcrit-on]', e => { st.arma.ignoraResistCrit = e.target.checked ? 1 : 0; dibujar(); });
      f.querySelectorAll('[data-arma]').forEach(i => i.onchange = () => { st.arma[i.dataset.arma] = Number(i.value) || 0; });
      // Dados extra de otro tamaño que los del arma (2026-10-13, Picada del Kobold Rabioso: +1d6): «NdM», o vacío.
      f.querySelectorAll('[data-arma-dados]').forEach(i => i.onchange = () => { const v = String(i.value || '').trim().toLowerCase().replace(/\s+/g, ''); st.arma.dadoExtra = /^\d{1,2}d\d{1,3}$/.test(v) ? v : ''; if(v && !st.arma.dadoExtra) i.value = ''; });
      const clic = (sel, fn) => f.querySelectorAll(sel).forEach(b => b.onclick = () => fn(b));
      q('[data-tirasel]', e => {
        const v = e.target.value;
        st.grid = '';
        if(v === '') st.tiraNinguna = true;
        else if(v === '__otro') st.grid = 'tira';
        else if(v === '__f'){ st.tiraNinguna = false; st.tiraModo = 'custom'; }
        else { st.tiraNinguna = false; st.tiraModo = 'stat'; st.tira = v; }
        dibujar();
      });
      q('[data-tirabono]', e => { st.tiraBono = Math.round(Number(e.target.value) || 0); });
      // «pdg + 5» en la fórmula propia: pasa a ser ese stat más el número
      q('[data-tira-formula]', e => { const r = leerFormula(e.target.value); if(r && r.stat){ st.tiraModo = 'stat'; st.tira = r.stat; st.tiraBono = r.bono; st.tiraFormula = ''; dibujar(); } else st.tiraFormula = e.target.value.trim(); });
      q('[data-contramodo]', e => { st.contraModo = e.target.value; dibujar(); });
      clic('[data-grid]', b => { st.grid = st.grid === b.dataset.grid ? '' : b.dataset.grid; dibujar(); });
      clic('[data-grid-cerrar]', () => { st.grid = ''; dibujar(); });
      clic('[data-grid-stat]', b => {
        const id = b.dataset.gridStat;
        if(st.grid === 'tira'){ st.tiraNinguna = false; st.tiraModo = 'stat'; st.tira = id; } else st.contra.add(id);
        st.grid = '';
        dibujar();
      });
      clic('[data-contra-quitar]', b => { const k = b.dataset.contraQuitar; if(k.startsWith('s:')) st.contra.delete(k.slice(2)); else st.contraExtra.splice(+k.slice(2), 1); dibujar(); });
      q('[data-contra-formula]', e => { st.contraFormula = e.target.value; });
      q('[data-contra-formula-etq]', e => { st.contraFormulaEtq = e.target.value; });
      clic('[data-contra-formula-mas]', () => {
        const inp = f.querySelector('[data-contra-formula]'), et = f.querySelector('[data-contra-formula-etq]');
        if(inp) st.contraFormula = inp.value;
        if(et) st.contraFormulaEtq = et.value;
        const r = leerFormula(st.contraFormula);
        if(!r){ alert('Escribí dados (1d6+2) o un stat más un número (des + 2).'); return; }
        if(r.stat && !r.bono) st.contra.add(r.stat);
        else st.contraExtra.push(r.formula ? {formula: r.formula, etq: st.contraFormulaEtq.trim() || 'Resistencia'} : {stat: r.stat, bono: r.bono});
        st.contraFormula = ''; st.contraFormulaEtq = '';
        dibujar();
      });
      q('[data-tira-etiqueta]', e => { st.tiraEtiqueta = e.target.value; });
      q('[data-alcance]', e => { st.alcance = e.target.value; dibujar(); });
      q('[data-alcanceN]', e => { st.alcanceN = Math.max(1, Math.round(Number(e.target.value) || 1)); });
      q('[data-radio]', e => { st.radio = Math.max(0, Math.round(Number(e.target.value) || 0)); });
      q('[data-zonaestadostacks]', e => { st.zonaEstadoStacks = Math.max(0, Math.round(Number(e.target.value) || 0)); });
      f.querySelectorAll('[data-contra]').forEach(c => c.onchange = () => {
        c.checked ? st.contra.add(c.dataset.contra) : st.contra.delete(c.dataset.contra);
        if(c.dataset.contra === 'parry') dibujar();   // el aviso de abajo depende de si Parry está marcado
      });
      q('[data-contraotro]', e => { st.contraOtro = e.target.value; });
      f.querySelectorAll('[name=fuentedano]').forEach(r => r.onchange = () => {
        const antesArma = st.danoArma;
        st.dano = r.value !== 'no'; st.danoDif = r.value === 'dif'; st.danoArma = r.value === 'arma';
        if(st.danoArma && !antesArma){ st.tipoDano = 'fisico'; st.ignoraDano = false; }   // un arma: físico, contra la Defensa
        dibujar();
      });
      q('[data-dano-formula]', e => { st.danoFormula = e.target.value.trim(); });
      q('[data-dano-mas]', e => { const v = e.target.value.replace(/\s+/g, '').replace(/−/g, '-'); st.danoMas = v && /^[+-]?(\d+|\d*d\d+)([+-](\d+|\d*d\d+))*$/i.test(v) ? v : ''; if(v && !st.danoMas){ alert('Escribí un fijo y/o un dado: +2, +1d6 o +1d6+2.'); e.target.value = ''; } });
      clic('[data-freno-abrir]', () => { st.frenoAbierto = !st.frenoAbierto; dibujar(); });
      f.querySelectorAll('[name=freno]').forEach(r => r.onchange = () => {
        if(r.value === 'fisico') st.ignoraDano = false;
        else { st.ignoraDano = true; st.frenoEsp = r.value === 'especial' ? '' : r.value; if(st.tipoDano === 'fisico') st.tipoDano = 'arcano'; }
        dibujar();
      });
      q('[data-drena]', e => { st.drena = e.target.checked; dibujar(); });
      q('[data-ondadodge]', e => { st.ondaDodge = e.target.checked; dibujar(); });
      q('[data-drenatope]', e => { st.drenaTope = Math.max(0, Number(e.target.value) || 0); });
      q('[data-drenapct]', e => { st.drenaPct = Math.max(1, Math.min(100, Math.round(Number(e.target.value) || 100))); });
      q('[data-danoextra]', e => { st.danoExtra = e.target.value.trim(); });
      q('[data-tipodano]', e => { st.tipoDano = e.target.value; if(st.tipoDano === 'fisico') st.ignoraDano = false; dibujar(); });
      q('[data-ignoradano]', e => { st.ignoraDano = e.target.checked; dibujar(); });
      q('[data-frenoesp]', e => { st.frenoEsp = e.target.value; });
      q('[data-danoporx]', e => { st.danoFijoPorX = Number(e.target.value) || 0; });
      q('[data-danosumaesp]', e => { st.danoSumaEsp = e.target.value; });
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
          cerrar(); cfg.alGuardar({duelo: {modo: 'flash', flash: {en: [...st.flashEn], bono: st.flashBono, ...(st.flashDodge ? {dodge: true} : {})}}, costo: costoResultado()}); return;
        }
        const efs = st.efectos.filter(e => e.cura !== undefined ? curaValida(e.cura) : e.nombre).map(mapEfectoOut);
        if(st.modo === 'arma'){
          const o2 = {modo: 'arma', objetivo: 'enemigo', x: st.x, arma: {...st.arma}, efectos: efs, ...(st.terminaTurno ? {terminaTurno: true} : {})};
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
        const out = {objetivo: st.objetivo, tira: (!st.tiraNinguna && st.tiraModo === 'stat') ? (st.tira || '') : '',
          contra: (hayTira && (esArea || st.objetivo === 'zona' || st.contraModo === 'stats')) ? [...st.contra, ...(st.objetivo === 'zona' ? [] : st.contraExtra)] : []};
        if(!st.tiraNinguna && st.tiraModo === 'stat' && st.tiraBono && st.objetivo !== 'zona') out.tiraBono = st.tiraBono;
        if(st.objetivo === 'area' && st.centroModo) out.centroAlcance = st.centroModo === 'rango' ? 'rango' : st.centroModo === 'adyacente' ? 1 : Math.max(1, st.centroN);
        if((st.objetivo === 'area' || st.objetivo === 'onda') && st.permanencia === 'queda'){
          const z = st.zq;
          if(!z.dano && !z.estadoNombre){ alert('La zona que queda tiene que hacer algo: un daño o un estado (paso «La zona»).'); return false; }
          if(z.dano && !/^\d*d\d+([+-]\d+)?$|^\d+$/i.test(z.dano.replace(/\s+/g, ''))){ alert('El daño de la zona tiene que ser un número o dados (1d4, 2d6+1).'); return false; }
          out.zonaQueda = {turnos: z.turnos, ...(z.dano ? {dano: z.dano.replace(/\s+/g, ''), ...(z.tipoDano ? {tipoDano: z.tipoDano} : {})} : {}),
            ...(z.estadoNombre ? {estado: {nombre: z.estadoNombre, turnos: z.estadoTurnos}} : {}), ...(z.altura !== 'aire' ? {altura: z.altura} : {}),
            ...(z.contra ? {contra: z.contra, tira: z.tira || 'dmgesp'} : {}), ...(z.nombre ? {nombre: z.nombre} : {}), ...(z.color ? {color: z.color} : {}),
            ...(!z.enMant ? {enMantenimiento: false} : {}), ...(z.cadaPaso ? {cadaPaso: true} : {}), ...(z.soloRivales ? {soloRivales: true} : {})};
        }
        if(!st.tiraNinguna && st.tiraModo === 'custom'){ out.tiraFormula = st.tiraFormula.trim(); out.tiraEtiqueta = st.tiraEtiqueta.trim() || 'Tirada'; }
        if(esArea && !hayTira){ alert('Una habilidad de área u onda necesita una tirada (ej. PdG.Esp o Fuerza contra lo que resiste cada uno) — elegí qué tira quien la usa.'); return false; }
        if(st.objetivo === 'zona' && !st.dano && !st.zonaEstadoNombre){ alert('Una zona persistente necesita hacer algo: marcá «Esta habilidad hace daño» en el paso Daño y/o elegí un estado en el paso Objetivo.'); return false; }
        if(hayTira && (esArea || st.contraModo === 'stats') && st.objetivo !== 'zona' && !out.contra.length){ alert('Marcá con qué se resiste el objetivo (o elegí «Nadie» / «Otra cosa»).'); return false; }
        if(hayTira && !esArea && st.contraModo === 'otro'){
          if(!st.contraOtro.trim()){ alert('Escribí con qué se resiste (o elegí «Nadie» si no hay nada que resista).'); return false; }
          out.contraOtro = st.contraOtro.trim();
        }
        if(st.dano){ out.dano = true; out.tipoDano = st.tipoDano; out.ignoraDano = st.ignoraDano;
          if(st.tipoDano !== 'fisico' && st.ignoraDano && st.frenoEsp === 'directo') out.danoDirecto = true;
          if(st.tipoDano !== 'fisico' && st.ignoraDano && st.frenoEsp === 'true') out.trueDamage = true; if(cfg.costoVariable && st.danoFijoPorX && !st.danoDif) out.danoFijoPorX = st.danoFijoPorX;
          if(st.danoSumaEsp && !st.danoDif && !st.danoArma) out.danoSumaEsp = st.danoSumaEsp === 'si' ? true : 0.5;
          // La fórmula se escribe acá (2026-10-15): si es otra que la «segunda tirada» de la habilidad, la Ejecución manda.
          if(!st.danoDif && !st.danoArma){
            const fd = st.danoFormula.trim();
            if(fd && fd !== String(cfg.formulaDano || '').trim()) out.danoFormula = fd;
          }
          if(st.danoMas && !st.danoDif) out.danoMas = st.danoMas; }
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
          if(!st.zonaEnMant) out.zonaEnMantenimiento = false;   // cuándo afecta (2026-10-15)
          if(st.zonaCadaPaso) out.zonaCadaPaso = true;
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
    const CONSERVA = ['cadena', 'conVista', 'conmigo', 'niebla', 'aliados', 'menosDistancia', 'atrae', 'reparte', 'critTipo', 'soloSigilo', 'fuegoAmigo', 'soloCritico', 'perforante', 'giro', 'tormenta', 'sagrado'];
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
    // La ventana: el cuadro del duelo, para editar (2026-10-15). Cada botón o caja con ✎ abre debajo lo que hace (st.pop).
    if(typeof Duelo !== 'undefined' && Duelo.estilos) Duelo.estilos();
    fondo = document.createElement('div');
    fondo.id = 'ejd-fondo';
    fondo.innerHTML = `<div class="duelo-caja"><div class="duelo-cab"><span>✨ ${esc(cfg.nombre || 'Habilidad')} · editar la Ejecución</span><div class="bt"><button type="button" data-ejd-cancelar title="Cerrar sin guardar">✕</button></div></div>
      <div class="duelo-cuerpo ejd-cuerpo"></div>
      <div class="ejd-pie"><span class="ejd-ayuda">Tocá un botón o una caja (✎) para cambiar lo que hace en ese momento del duelo.</span>${ini ? '<button type="button" class="sec" data-ejd-quitar>Sacar esta configuración</button>' : ''}<button type="button" class="sec" data-ejd-cancelar>Cancelar</button><button type="button" data-ejd-guardar>Guardar</button></div></div>`;
    document.body.appendChild(fondo);
    f = fondo.querySelector('.ejd-cuerpo');
    fondo.addEventListener('click', e => {
      const t = e.target.closest('[data-ejd-pop]');
      if(t && f.contains(t)){ st.pop = st.pop === t.dataset.ejdPop ? '' : t.dataset.ejdPop; st.grid = ''; dibujar(); return; }
      if(e.target.closest('[data-ejd-listo]')){ st.pop = ''; st.grid = ''; dibujar(); return; }
      if(e.target.closest('[data-ejd-guardar]')){ okGuardar(); return; }
      if(e.target.closest('[data-ejd-quitar]')){ cerrar(); cfg.alGuardar(null); return; }
      if(e.target.closest('[data-ejd-cancelar]')) cancelar();
    });
    document.addEventListener('keydown', alTecla, true);
    dibujar();
    // 📜 Lo que se escribió en «Qué es», a la izquierda (2026-10-15, dueño: «que uno, a medida que lo va editando, tenga el texto a mano»), como en el
    // duelo. `cfg.detalle` (lo pasan los editores de habilidades de personaje, creep e invocación y el de armas especiales).
    if(String(cfg.detalle || '').trim()){
      const tx = document.createElement('div');
      tx.className = 'duelo-texto';
      const pt = typeof ItemCorto !== 'undefined' && ItemCorto.partes ? ItemCorto.partes(String(cfg.detalle).trim()) : {hace: String(cfg.detalle).trim(), tecnico: ''};
      tx.innerHTML = `<b class="t">📜 ${esc(cfg.nombre || 'Habilidad')}</b>${typeof Glosario !== 'undefined' && Glosario.marcar ? Glosario.marcar(pt.hace) : esc(pt.hace)}${pt.tecnico ? `<details class="tec"><summary>Detalles técnicos</summary>${esc(pt.tecnico)}</details>` : ''}`;
      fondo.appendChild(tx);
      fondo.classList.add('con-texto');
    }
  }
  return {abrir};
})();
