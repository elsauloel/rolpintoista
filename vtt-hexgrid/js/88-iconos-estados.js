// js/88-iconos-estados.js — 🫧😱💤 Los íconos de los estados alrededor del token (2026-11-01, dueño: «empezaría a imaginar iconos para los estados…
// veneno, burbujitas verdes; el miedo, la carita de Scream; el sueño, ZZZ; y que vaya apareciendo alrededor del token»; y después: «tienen que ser
// circulitos alrededor del token; primero cada nuevo estado aparece en uno de los vértices del hexágono y luego se ocupan las partes planas (los lados);
// con un borde verde para los estados beneficiosos y un borde rojo para los malos»).
//
// - Un circulito por estado (fondo oscuro, borde verde = buff, rojo = debuff, gris = ninguno), con su emoji (por familia); uno inventado, su inicial.
// - Lugares: los 6 vértices del hexágono del token (empezando por los de arriba). Con más de 6 estados, se agrupan por familia (P350, 2026-11-26;
//   antes había 12 lugares y un «+N»); con el mapa alejado, solo los 3 más importantes y una pastilla con los demás contados (ver iconosArmar).
// - Orden de llegada: cada estado nuevo toma el siguiente lugar libre y lo conserva mientras dure (`iconosOrden`); los que ya estaban al cargar el
//   mapa, en el orden en que vienen.
// - Se dibuja en el recorrido de los tokens que se ven (js/05), así que un token oculto, en la niebla o en sigilo para el que mira no se delata.
//   No se muestran los estados derivados (pasivas) ni los apagados, salvo el Sobrepeso (⚖, 2026-11-23, dueño: «que el sobrepeso además aparezca como
//   un estado alrededor del token»), que lo arma la ficha y se va solo cuando se va el sobrepeso. El Sigilo, solo si el token está de verdad en sigilo (con Marcado no).
// - Algunos animan (burbujas del Veneno, la gotita del Sangrado, la llamita, el chispazo, las Z del Sueño, las estrellitas del Stun): mientras haya
//   uno en pantalla, el dibujo sigue animando (como el brillo del Marcado).
// La tabla vive acá abajo (ICONOS_ESTADO): para cambiar un ícono, se cambia ahí.

// Agrupados por familia (dueño, 2026-11-01: «no es necesario que cada estado tenga su ícono exclusivo; podemos agruparlos cuando son similares…
// mejor emojis»). El borde (verde / rojo) dice si es bueno o malo, así que un mismo emoji puede ir en un buff y en un debuff de la misma familia.
// La clave es el nombre en minúsculas y sin tildes. Un estado que no está acá (uno inventado en la mesa) busca su familia por palabra (ICONOS_FAMILIAS) y,
// si no matchea nada, lleva su inicial.
const ICONOS_ESTADO = {
  // ☠ Daño en el tiempo
  'veneno': {ic: '🤢', anim: 'burbujas', n: 3},   // (dueño, 2026-11-01: 🤢 y 🤮 el severo)
  'veneno severo': {ic: '🤮', anim: 'burbujas', n: 5},
  'sangrado': {ic: '🩸', anim: 'gota'},
  'quemadura': {ic: '🔥', anim: 'llama'},
  // 💫 Controles
  'stun': {ic: '💫', anim: 'estrellas'}, 'pajaritos': {ic: '💫', anim: 'estrellas'},
  'sueno': {ic: '💤', anim: 'zetas'},
  'paralisis': {ic: '⚡', anim: 'chispa'},
  'miedo': {ic: '😱'},
  'panico': {ic: '😱', fondo: '#7A1420'},
  'malviaje de floripondio': {ic: '🌺', fondo: '#5B2A86'},   // (2026-11-01) el Pánico contra todos: flor sobre violeta   // el mismo grito, sobre fondo rojo
  'confusion': {ic: '🌀'},
  'escalofrio': {ic: '🥶'},   // (2026-11-03) la rápida siniestra del Debuffer: −2 PdG (salía con la inicial «E»)
  'mente abierta': {ic: '🧠'},   // (2026-11-03) la Punzada mental del Debuffer: −2 Res.Mt
  'provocado': {ic: '😤'},
  'silencio': {ic: '🤐'}, 'silenciado': {ic: '🤐'},
  // 🚩 Los estados de las áreas (js/103, 2026-11-05): se ven mientras el token está adentro.
  'bajo el estandarte': {ic: '🚩'}, 'en el aura sanadora': {ic: '✚'},
  'muro de escudos': {ic: '🛡️'}, 'en la zona': {ic: '⬡'},   // (2026-11-05, cola 17: «Muro de escudos (+2 Def)», «En la zona: Nube tóxica»)
  'ceguera': {ic: '🙈'}, 'cegado': {ic: '🙈'}, 'cegada': {ic: '🙈'},
  'deslumbrado': {ic: '😵‍💫'},
  'inmovilizado': {ic: '⛓️'}, 'agarrado': {ic: '⛓️'},
  'lento': {ic: '🐌'},
  'escarcha': {ic: '❄️'},
  // 🎯 Marcas y debilidades
  'marcado': {ic: '🎯'}, 'presa senalada': {ic: '🎯'},
  'presa': {ic: '🐾'},
  'punto debil': {ic: '💢'}, 'expuesto': {ic: '💢'},
  'herida sombria': {ic: '🌑'},
  'armadura rota': {ic: '🛡️', tachado: true},
  'sobrepeso': {ic: '⚖️'},   // (2026-11-23) derivado: lo publica la ficha mientras dure (FichaResumen.estadoSobrepeso)
  'desarmado': {ic: '🫳'},
  // 😮‍💨 Cansancio y cuerpo
  'cansado': {ic: '😮‍💨'}, 'exhausto': {ic: '😮‍💨'}, 'extenuado': {ic: '😮‍💨'}, 'debilitado': {ic: '😮‍💨'},
  'lisiado': {ic: '🦵'}, 'rengo': {ic: '🦵'}, 'sentado': {ic: '🦵'}, 'tropezado': {ic: '🪢'}, 'desequilibrado': {ic: '🫨'}, 'mufa': {ic: '🌑'}, 'mala sombra': {ic: '🌑'}, 'toques de carga': {ic: '🎺'},
  'mordido': {ic: '🦷'}, 'mordiendo': {ic: '🦷'}, 'agarrando': {ic: '✊'},
  'mareo de invocacion': {ic: '😵'},
  // 💀 Maldiciones
  'maldito': {ic: '💀'}, 'coraza maldita': {ic: '💀'}, 'atormentado': {ic: '💀'},
  'sanguijuela': {ic: '🪱'},
  'sequia': {ic: '🏜️'},
  // ✚ Curas y vida
  'regeneracion': {ic: '✚', color: '#5FDC8C'},
  'coagulacion': {ic: '🩹'}, 'sangre pura': {ic: '🩹'},
  'vida extra': {ic: '💗'},
  'llama de fenix': {ic: '🌅'},
  // 🫧 Escudos y defensas
  'shield': {ic: '🫧', fondo: '#1C4A66'}, 'escudo especial': {ic: '🫧', fondo: '#1C4A66'},
  'barrera': {ic: '🔷'}, 'armadura arcana': {ic: '🔷'},
  '__mano': {ic: '✋'}, 'cuero duro': {ic: '🪨', pol: 'buff'}, 'endurecido': {ic: '🪨'}, 'piel de hierro': {ic: '🪨'}, 'blindado': {ic: '🪨'}, 'estoicismo': {ic: '🪨'}, 'inamovible': {ic: '🪨'}, 'aguante': {ic: '🪨'},
  'al frente': {ic: '🧱'}, 'interpuesto': {ic: '🧱'},
  'invulnerable': {ic: '⭐'}, 'titilando': {ic: '⭐'},
  'inmunidad a cc': {ic: '🧿'}, 'inmunidad mental': {ic: '🧿'}, 'inmune a lo toxico': {ic: '🧿'},
  'espinas': {ic: '🌵'},
  'espejo': {ic: '🪞'},
  'etereo': {ic: '👻'},
  // 💪 Empujones y ánimo
  'empower': {ic: '💪'},
  'hypeado': {ic: '😡'}, 'frenetico': {ic: '😡'}, 'enfurecido': {ic: '😡'},
  'arrojo': {ic: '🦁'}, 'desafiante': {ic: '🦁'},
  'bendecido': {ic: '✨'},
  'afortunado': {ic: '🍀'},
  'vigilancia': {ic: '👀'},
  'redoble': {ic: '🥁'}, 'adrenalina': {ic: '💉'}, 'pila pila': {ic: '🔋'},
  'repitiendo': {ic: '🔁'},
  // ⏩ Movimiento
  'acelerado': {ic: '⏩'}, 'sprint': {ic: '⏩'},
  'vuela': {ic: '🪶'}, 'levitando': {ic: '🪶'},
  'sigilo': {ic: '🕶'},
  // 💥 Puntería y críticos (distintos del 🎯 del Marcado)
  'critico frecuente': {ic: '💥'}, 'critico potente': {ic: '💥'},
  'ojo certero': {ic: '👁️'}, 'enfocado': {ic: '👁️'}, 'apuntando a la cabeza': {ic: '👁️'}, 'golpe anunciado': {ic: '👁️'},
  'armas perforantes': {ic: '🗡️'}, 'perforante': {ic: '🗡️'},
  // ⚔ Armas con algo (el elemento)
  'escudo igneo': {ic: '🛡'}, 'escudo helado': {ic: '🛡'}, 'escudo electrico': {ic: '🛡'}, 'escudo acido': {ic: '🛡'}, 'escudo venenoso': {ic: '🛡'}, 'escudo luminoso': {ic: '🛡'}, 'escudo siniestro': {ic: '🛡'},   // 🛡 Escudo elemental (js/106)
  'arma ignea': {ic: '🔥'}, 'arma helada': {ic: '❄️'}, 'arma electrica': {ic: '⚡'},
  'arma acida': {ic: '🧪'}, 'arma venenosa': {ic: '🧪'}, 'arma envenenada': {ic: '🧪'}, 'oleo venenoso': {ic: '🧪'}, 'oleo venenoso concentrado': {ic: '🧪'},
  'arma luminosa': {ic: '☀️'}, 'arma siniestra': {ic: '🌑'}, 'arma bendecida': {ic: '✨'},
  'carga arcana': {ic: '🔮'},
};
const ICONOS_BORDE = {buff: '#4CB86A', debuff: '#E0434F', '': '#8A7D77'};
const ICONOS_ANGULOS = [240, 300, 180, 0, 120, 60, 270, 210, 330, 150, 30, 90];   // 6 vértices (los de arriba primero); desde P350 (2026-11-26) solo se usan estos 6 (los otros 6, los medios de los lados, quedaron sin uso)
const iconosOrden = new Map();   // id del token → [nombres normalizados, en orden de llegada]
// 🔘 Dónde quedó dibujado cada iconito (2026-11-23, dueño: «al poner el hover en el icono, que solamente diga… el efecto»): id del token →
// [{px, py, r, e}] (en coordenadas del mapa), un grupo (`grupo`) y la pastilla de lejos con los que no se ven (`resto`, con w y h). Lo lee el globo al pasar el mouse (js/30, `iconoEn`).
const iconosHit = new Map();

const iconosNorm = s => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Un estado que no está en la tabla (uno creado a mano en la mesa, una pasiva con nombre propio) toma el ícono de su familia si su nombre tiene una
// palabra conocida (dueño, 2026-11-01: «Cuero duro» → 🪨 de las defensas; «veneno» → 🤢…), con la polaridad de la familia si el estado no trae la suya.
// Solo cae en la inicial si no matchea nada. Orden: lo más específico primero.
const ICONOS_FAMILIAS = [
  [/vaquita/, {ic: '🐞', pol: 'buff'}],   // 🐞 la Vaquita de San Antonio (consumible o anillo, 2026-11-10)
  [/^🚩|estandarte/, {ic: '🚩', pol: 'buff'}],   // (2026-11-10, dueño: «¿estos estados se muestran en los iconos?») «🚩 Estandarte de la vanguardia», «🚩 Estandarte del muro»… salían con la inicial
  [/cuero|piel|coraza|armadura|escudo|blindad|endurec/, {ic: '🪨', pol: 'buff'}],
  [/venen|toxic/, {ic: '🤢', pol: 'debuff', anim: 'burbujas', n: 3}],
  [/sangr/, {ic: '🩸', pol: 'debuff', anim: 'gota'}],
  [/quema|fuego|ardien|llama/, {ic: '🔥', pol: 'debuff', anim: 'llama'}],
  [/hielo|escarcha|congel|helad/, {ic: '❄️', pol: 'debuff'}],
  [/(^|\s)rayo|electric/, {ic: '⚡', pol: 'debuff'}],
  [/floripondio/, {ic: '🌺', pol: 'debuff'}],
  [/miedo|terror|panico/, {ic: '😱', pol: 'debuff'}],
  [/sueno|dormid/, {ic: '💤', pol: 'debuff'}],
  [/(^|\s)(cura|regenera)/, {ic: '✚', pol: 'buff', color: '#5BD17A'}],
  [/(^|\s)marca/, {ic: '🎯', pol: 'debuff'}],
  [/maldi/, {ic: '💀', pol: 'debuff'}],
  [/(^|\s)lent/, {ic: '🐌', pol: 'debuff'}],
  [/veloz|rapid|acelerad/, {ic: '⏩', pol: 'buff'}],
  [/fuerza|fuerte/, {ic: '💪', pol: 'buff'}],
  [/suerte/, {ic: '🍀', pol: 'buff'}],
  [/bendi|sagrad/, {ic: '✨', pol: 'buff'}],
];
function iconoDeEstado(clave){
  const def = ICONOS_ESTADO[clave] || ICONOS_ESTADO[clave.replace(/\s*\(.*\)\s*$/, '')]   // «Regeneración (túnica)» → el de Regeneración
    || ICONOS_ESTADO[clave.replace(/^[^a-zñ]+/, '').replace(/:.*$/, '').trim()];   // «🔥 arma ignea: lanza corta» → el de Arma ígnea
  if(def) return def;
  const fam = ICONOS_FAMILIAS.find(([re]) => re.test(clave));
  return fam ? fam[1] : null;
}

// Los estados a mostrar de un token, en su orden estable. → [{clave, e}]
function iconosLista(id, t, est){
  const vistos = new Map();
  (est.estados || []).forEach(e => {
    if(!e || !e.nombre || (e.derivado && !e.area && e.nombre !== 'Sobrepeso') || e.activo === false) return;   // (los de un área sí: js/103; ⚖ el Sobrepeso también)
    const k = iconosNorm(e.nombre);
    if(k === 'sigilo' && !(typeof enSigilo === 'function' && enSigilo(t))) return;
    if(!vistos.has(k)) vistos.set(k, e);
  });
  const previo = iconosOrden.get(id) || [];
  const orden = previo.filter(k => vistos.has(k));
  vistos.forEach((_, k) => { if(!orden.includes(k)) orden.push(k); });
  iconosOrden.set(id, orden);
  return orden.map(k => ({clave: k, e: vistos.get(k)}));
}

const iconosFuente = px => `${px}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;

// 🔘 Más estados que lugares (P350, dueño, 2026-11-26: «me gusta que la B, cuando se acerca, agruparlos por familia, pero la A, cuando está alejado,
// que te muestre los 3 principales, pero que abajo haya un cosito con el número en rojo de los debuff y en verde de los buffs»).
// - De cerca (zoom ≥ ICONOS_LEJOS): hasta 6 estados, uno por vértice, en orden de llegada (como antes). Con más de 6, los de la misma familia se juntan
//   en un circulito con un numerito, con el ícono del más importante de la familia; nunca más de 6 circulitos (hay 6 familias).
// - De lejos (zoom < ICONOS_LEJOS): solo los 3 más importantes y, abajo del token, una pastilla con los que no se ven: debuffs en rojo, buffs en verde
//   (y los que no son ni una cosa ni la otra, en gris; P351). Sin escondidos, sin pastilla.
// Las familias, de lo más importante a lo menos (dueño: lo que no deja actuar o controla, el daño por turno, las marcas / ✋ / 🕶, las defensas y los
// buffs). Adentro de cada familia, el orden de la lista dice cuál es el más importante (su ícono es el del grupo).
const ICONOS_LEJOS = 0.7;   // con el «−» del mapa: 1 → 0,8 sigue de cerca; 0,64 ya es de lejos
const ICONOS_GRUPOS = [
  {k: 'control', ic: '💫', nombre: 'Lo que no deja actuar o controla', claves: ['stun', 'pajaritos', 'sueno', 'paralisis', 'mareo de invocacion', 'panico',
    'malviaje de floripondio', 'miedo', 'confusion', 'provocado', 'silencio', 'silenciado', 'ceguera', 'cegado', 'cegada', 'inmovilizado', 'agarrado', 'mordido',
    'tropezado', 'sentado', 'exhausto', 'desarmado', 'lisiado', 'rengo', 'lento', 'agarrando', 'mordiendo']},
  {k: 'dano', ic: '🩸', nombre: 'Daño por turno', claves: ['veneno severo', 'veneno', 'quemadura', 'sangrado', 'sanguijuela', 'atormentado', 'maldito', 'en la zona']},
  {k: 'marcas', ic: '🎯', nombre: 'Marcas y debilidades', claves: ['marcado', 'presa senalada', 'presa', 'punto debil', 'expuesto', 'herida sombria', '__mano', 'sigilo',
    'armadura rota', 'sobrepeso', 'escarcha', 'debilitado', 'cansado', 'extenuado', 'tendon cortado', 'desequilibrado', 'deslumbrado', 'escalofrio', 'mente abierta',
    'coraza maldita', 'sequia', 'mufa', 'mala sombra']},
  {k: 'defensa', ic: '🪨', nombre: 'Defensas', claves: ['invulnerable', 'titilando', 'etereo', 'inmunidad a cc', 'inmunidad mental', 'inmune a lo toxico', 'shield',
    'escudo especial', 'barrera', 'armadura arcana', 'vida extra', 'llama de fenix', 'piel de hierro', 'blindado', 'endurecido', 'cuero duro', 'muro de escudos',
    'al frente', 'interpuesto', 'estoicismo', 'inamovible', 'aguante', 'paso atras', 'espinas', 'espejo', 'sangre pura', 'coagulacion', 'escudo igneo',
    'escudo helado', 'escudo electrico', 'escudo acido', 'escudo venenoso', 'escudo luminoso', 'escudo siniestro']},
  {k: 'buff', ic: '💪', nombre: 'Buffs', claves: ['empower', 'hypeado', 'frenetico', 'enfurecido', 'bendecido', 'arrojo', 'desafiante', 'afortunado', 'vigilancia',
    'enfocado', 'apuntando a la cabeza', 'golpe anunciado', 'carga arcana', 'ojo certero', 'critico frecuente', 'critico potente', 'armas perforantes', 'perforante',
    'arma ignea', 'arma helada', 'arma electrica', 'arma acida', 'arma venenosa', 'arma luminosa', 'arma siniestra', 'arma bendecida', 'arma envenenada',
    'oleo venenoso', 'oleo venenoso concentrado', 'acelerado', 'sprint', 'redoble', 'adrenalina', 'pila pila', 'repitiendo', 'regeneracion', 'vuela', 'levitando',
    'bajo el estandarte', 'en el aura sanadora', 'vaquita de san antonio', 'toques de carga']},
  {k: 'otro', ic: '◇', nombre: 'Otros', claves: []},
];
const iconosRango = new Map();   // clave → [familia, lugar adentro de la familia]
ICONOS_GRUPOS.forEach((g, f) => g.claves.forEach((c, i) => { if(!iconosRango.has(c)) iconosRango.set(c, [f, i]); }));
const iconosFam = k => ICONOS_GRUPOS.findIndex(g => g.k === k);
// La polaridad de lo que se ve: la del estado; si no trae, la de su ícono (un inventado con palabra conocida); ✋ y los «otro», ninguna.
function iconosPolaridad(clave, e){
  if(e && (e.polaridad === 'buff' || e.polaridad === 'debuff')) return e.polaridad;
  const def = clave === '__mano' ? null : iconoDeEstado(clave);
  return (def && def.pol) || '';
}
// → [familia, lugar]. Se busca el nombre tal cual, sin lo de entre paréntesis («Regeneración (túnica)»), sin el emoji de adelante ni lo que va
// después de «:» («En la zona: Nube tóxica»). Uno que no está: un control (esCC) va a los controles; uno que saca vida por turno, al daño; un debuff
// cualquiera, a las debilidades; un buff, a los buffs; si no, a «Otros». Las zonas que ayudan van a los buffs.
function iconosFamiliaDe(clave, e){
  const base = clave.replace(/\s*\(.*\)\s*$/, '');
  const sinEmoji = base.replace(/^[^a-zñ_]+/, '').replace(/:.*$/, '').trim();
  const pol = iconosPolaridad(clave, e);
  for(const c of [clave, base, sinEmoji]){
    const r = iconosRango.get(c);
    if(r && !(c === 'en la zona' && pol === 'buff')) return r;
  }
  if(sinEmoji === 'en la zona') return [iconosFam('buff'), 999];
  if(e && e.esCC) return [iconosFam('control'), 999];
  if(e && [e.hpTurno, e.vidaTurno, e.hpturno].some(v => (Number(v) || 0) < 0)) return [iconosFam('dano'), 999];
  if(pol === 'debuff') return [iconosFam('marcas'), 999];
  if(pol === 'buff') return [iconosFam(/escud|armadur|cuero|piel|coraza|blind|endurec|barrera|inmun/.test(clave) ? 'defensa' : 'buff'), 999];
  return [iconosFam('otro'), 999];
}
// Qué circulitos van y qué queda en la pastilla. lista = [{clave, e}] en orden de llegada. →
// {circulos: [{clave, e, pol, items: [{clave, e}], grupo: índice de la familia | null}], pastilla: null | {debuff, buff, otro, resto: [e]}}
function iconosArmar(lista, lejos){
  const conRango = lista.map((x, i) => ({...x, i, fam: iconosFamiliaDe(x.clave, x.e), pol: iconosPolaridad(x.clave, x.e)}));
  const orden = [...conRango].sort((a, b) => a.fam[0] - b.fam[0] || a.fam[1] - b.fam[1] || a.i - b.i);
  const solo = x => ({clave: x.clave, e: x.e, pol: x.pol, items: [{clave: x.clave, e: x.e}], grupo: null});
  if(lejos){
    const ver = orden.slice(0, 3), resto = orden.slice(3);
    const cuenta = p => resto.filter(x => x.pol === p).length;
    return {circulos: ver.map(solo), pastilla: resto.length ? {debuff: cuenta('debuff'), buff: cuenta('buff'), otro: cuenta(''), resto: resto.map(x => x.e)} : null};
  }
  if(conRango.length <= 6) return {circulos: conRango.map(solo), pastilla: null};
  const grupos = new Map();
  orden.forEach(x => { if(!grupos.has(x.fam[0])) grupos.set(x.fam[0], []); grupos.get(x.fam[0]).push(x); });
  const circulos = [...grupos.entries()].map(([f, xs]) => {
    if(xs.length === 1) return solo(xs[0]);
    const pols = new Set(xs.map(x => x.pol));
    return {clave: xs[0].clave, e: xs[0].e, pol: pols.size === 1 ? xs[0].pol : '', items: xs.map(x => ({clave: x.clave, e: x.e})), grupo: f};
  });
  return {circulos: circulos.slice(0, 6), pastilla: null};
}

// Los iconitos se dibujan después de todos los tokens (2026-11-26): así la barra de vida de un token de arriba no tapa los iconitos del de abajo.
// iconosEstadosDibujar arma y anota; iconosPintarPendientes (js/05, al final del recorrido de los tokens) los pinta.
let iconosPend = [];
function iconosPintarPendientes(){
  const lista = iconosPend; iconosPend = [];
  lista.forEach(f => { try{ f(); }catch(err){ console.error('Íconos de estados:', err); } });
}

// En el recorrido de los tokens que se ven (js/05). → {animando, abajo}: si hay que seguir animando y cuánto ocupan por debajo del token (para
// correr las barras).
function iconosEstadosDibujar(id, t, est, x, y, rad, z){
  const res = {animando: false, abajo: 0};
  // ✋ Nada en la mano (dueño, 2026-11-01: «que la mano se ubique como el resto de los estados»): un circulito más, borde gris, solo en modo combate
  // (como la marca de antes, js/05); ahora con su familia (las marcas).
  const mano = modoMapa === 'combate' && typeof tokenSinArma === 'function' && tokenSinArma(t);
  const deArea = typeof estadosDeArea === 'function' ? estadosDeArea(t) : [];
  if(deArea.length) est = {...(est || {}), estados: [...((est && est.estados) || []), ...deArea]};
  iconosHit.delete(id);
  if((!est || !est.estados || !est.estados.length) && !mano) return res;
  const lista = iconosLista(id, t, est || {estados: []});
  if(mano) lista.push({clave: '__mano', e: {nombre: 'Nada en la mano', mano: true}});
  if(!lista.length) return res;
  const lejos = z < ICONOS_LEJOS;
  const {circulos, pastilla} = iconosArmar(lista, lejos);
  const hit = [];
  iconosHit.set(id, hit);
  const r = lejos ? Math.max(5.5 / z, rad * 0.32) : Math.max(6 / z, rad * 0.29);
  const lugar = i => {
    const a = ICONOS_ANGULOS[i] * Math.PI / 180;
    return {px: x + rad * Math.cos(a), py: y + rad * Math.sin(a)};
  };
  const bordeV = rad * Math.sqrt(3) / 2;
  const pos = circulos.map((c, i) => {
    const {px, py} = lugar(i);
    if(py + r > y + rad * 0.8) res.abajo = Math.max(res.abajo, py + r - (y + bordeV));
    hit.push(c.grupo !== null ? {px, py, r, grupo: {fam: c.grupo, items: c.items.map(q => q.e)}} : {px, py, r, e: c.e});
    const def = c.clave === '__mano' ? ICONOS_ESTADO.__mano : iconoDeEstado(c.clave);
    if(def && def.anim) res.animando = true;
    return {px, py, def};
  });
  // La pastilla de lejos: abajo del token, antes de las barras.
  let pst = null;
  if(pastilla){
    const fs = Math.max(8 / z, rad * 0.3), h = fs * 1.35;
    const partes = [];
    if(pastilla.debuff) partes.push(['+' + pastilla.debuff, '#FF6B74']);
    if(pastilla.buff) partes.push(['+' + pastilla.buff, '#6FDC8C']);
    if(pastilla.otro) partes.push(['+' + pastilla.otro, '#C9B9A6']);
    ctx.save(); ctx.font = `800 ${fs}px "Space Grotesk", system-ui, sans-serif`;
    partes.forEach(q => { q[2] = ctx.measureText(q[0]).width; });
    ctx.restore();
    const hueco = fs * 0.3, w = partes.reduce((n, q) => n + q[2], 0) + (partes.length - 1) * hueco + fs * 0.8;
    const py = y + bordeV + 2 / z + h / 2;
    pst = {fs, h, w, py, partes, hueco};
    hit.push({px: x, py, r: h / 2, w, h, resto: pastilla.resto, pastilla: true});
    res.abajo = Math.max(res.abajo, h + 3 / z);
  }
  const tf = ctx.getTransform(), alfaPrevio = ctx.globalAlpha;
  iconosPend.push(() => {
    const ahora = performance.now();
    ctx.save();
    ctx.setTransform(tf);
    const alfa = Math.max(alfaPrevio, 0.85);
    ctx.globalAlpha = alfa;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const circulo = (px, py, borde, fondo) => {
      ctx.beginPath(); ctx.arc(px, py, r, 0, 2 * Math.PI);
      ctx.fillStyle = fondo || 'rgba(15,12,14,.92)'; ctx.fill();
      ctx.lineWidth = Math.max(1.6 / z, r * 0.2); ctx.strokeStyle = borde; ctx.stroke();
    };
    circulos.forEach((c, i) => {
      const {px, py, def} = pos[i], e = c.e;
      circulo(px, py, ICONOS_BORDE[c.pol], def && def.fondo);
      const semilla = (i * 97 + id.length * 13) % 1000;
      if(def){
        ctx.font = iconosFuente(r * 1.15);
        ctx.fillStyle = def.color || '#fff';
        if(def.anim === 'llama'){   // la llamita late
          const s = 1 + 0.12 * Math.sin((ahora + semilla) / 140);
          ctx.font = iconosFuente(r * 1.15 * s);
        }
        if(def.anim === 'chispa' && Math.floor((ahora + semilla) / 180) % 4 === 0) ctx.globalAlpha *= 0.45;   // el chispazo parpadea
        ctx.fillText(def.ic, px, py + r * 0.08);
        ctx.globalAlpha = alfa;
        if(def.tachado){   // la armadura rota: una raya que la parte
          ctx.beginPath(); ctx.moveTo(px - r * 0.6, py + r * 0.6); ctx.lineTo(px + r * 0.6, py - r * 0.6);
          ctx.lineWidth = Math.max(1.5 / z, r * 0.18); ctx.strokeStyle = '#E0434F'; ctx.stroke();
        }
        if(def.anim) iconosAnimar(def, px, py, r, z, ahora + semilla);
      }else{
        ctx.font = `700 ${r * 1.05}px "Space Grotesk", system-ui, sans-serif`;
        ctx.fillStyle = '#fff';
        ctx.fillText((String(e.nombre).trim()[0] || '·').toUpperCase(), px, py + r * 0.06);
      }
      if(c.items.length > 1){   // el numerito del grupo, arriba a la derecha
        const bx = px + r * 0.82, by = py - r * 0.82, br = Math.max(4.5 / z, r * 0.56);
        ctx.beginPath(); ctx.arc(bx, by, br, 0, 2 * Math.PI);
        ctx.fillStyle = '#F0D27A'; ctx.fill();
        ctx.lineWidth = Math.max(1 / z, br * 0.18); ctx.strokeStyle = '#0F0C0E'; ctx.stroke();
        ctx.font = `800 ${br * 1.35}px "Space Grotesk", system-ui, sans-serif`;
        ctx.fillStyle = '#1A1418';
        ctx.fillText(String(c.items.length), bx, by + br * 0.08);
      }
    });
    if(pst){
      const x0 = x - pst.w / 2, y0 = pst.py - pst.h / 2, rr = pst.h / 2;
      ctx.beginPath();
      ctx.moveTo(x0 + rr, y0); ctx.lineTo(x0 + pst.w - rr, y0); ctx.arc(x0 + pst.w - rr, pst.py, rr, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(x0 + rr, y0 + pst.h); ctx.arc(x0 + rr, pst.py, rr, Math.PI / 2, Math.PI * 1.5); ctx.closePath();
      ctx.fillStyle = 'rgba(15,12,14,.92)'; ctx.fill();
      ctx.lineWidth = Math.max(1.2 / z, pst.h * 0.08); ctx.strokeStyle = '#C9B9A6'; ctx.stroke();
      ctx.font = `800 ${pst.fs}px "Space Grotesk", system-ui, sans-serif`;
      ctx.textAlign = 'left';
      let cx = x0 + pst.fs * 0.4;
      pst.partes.forEach(([tx, col, ancho]) => {
        ctx.fillStyle = col; ctx.fillText(tx, cx, pst.py + pst.fs * 0.05);
        cx += ancho + pst.hueco;
      });
    }
    ctx.restore();
  });
  return res;
}

// Las animaciones chiquitas, alrededor de su circulito. → true (siguen animando).
function iconosAnimar(def, px, py, r, z, ms){
  ctx.save();
  if(def.anim === 'burbujas'){   // burbujas verdes que suben desde el circulito y se apagan
    const n = def.n || 3;
    for(let k = 0; k < n; k++){
      const f = ((ms / 1400) + k / n) % 1;
      const bx = px + Math.sin(k * 2.3 + ms / 400) * r * 0.55, by = py - r * 0.6 - f * r * 1.6;
      ctx.globalAlpha = (1 - f) * 0.9;
      ctx.beginPath(); ctx.arc(bx, by, r * (0.16 + 0.1 * (k % 2)), 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(110,220,90,.55)'; ctx.fill();
      ctx.lineWidth = Math.max(0.8 / z, r * 0.06); ctx.strokeStyle = '#7CEB64'; ctx.stroke();
    }
  }else if(def.anim === 'gota'){   // una gotita que cae y se apaga
    const f = (ms / 1100) % 1;
    const gy = py + r * 0.7 + f * r * 1.1;
    ctx.globalAlpha = (1 - f) * 0.95;
    ctx.beginPath(); ctx.arc(px, gy, r * 0.17, 0, 2 * Math.PI);
    ctx.moveTo(px - r * 0.17, gy); ctx.lineTo(px, gy - r * 0.38); ctx.lineTo(px + r * 0.17, gy);
    ctx.fillStyle = '#D21F2E'; ctx.fill();
  }else if(def.anim === 'zetas'){   // las Z que flotan para arriba y a la derecha
    for(let k = 0; k < 2; k++){
      const f = ((ms / 1800) + k / 2) % 1;
      ctx.globalAlpha = Math.sin(f * Math.PI) * 0.95;
      ctx.font = `700 ${r * (0.55 + 0.35 * f)}px "Space Grotesk", system-ui, sans-serif`;
      ctx.fillStyle = '#BFD7FF';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Z', px + r * (0.5 + 0.8 * f), py - r * (0.6 + 1.1 * f));
    }
  }else if(def.anim === 'estrellas'){   // estrellitas que giran alrededor del circulito
    for(let k = 0; k < 3; k++){
      const a = ms / 450 + k * 2 * Math.PI / 3;
      const sx = px + Math.cos(a) * r * 1.35, sy = py + Math.sin(a) * r * 0.55 - r * 0.2;
      ctx.globalAlpha = 0.9;
      ctx.font = iconosFuente(r * 0.55);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('⭐', sx, sy);
    }
  }else if(def.anim === 'chispa'){   // un rayito que salta de costado
    const f = (ms / 600) % 1;
    if(f < 0.35){
      ctx.globalAlpha = 1 - f / 0.35;
      ctx.beginPath(); ctx.moveTo(px + r * 0.9, py - r * 0.7); ctx.lineTo(px + r * 1.25, py - r * 0.2); ctx.lineTo(px + r * 1.0, py - r * 0.15); ctx.lineTo(px + r * 1.4, py + r * 0.5);
      ctx.lineWidth = Math.max(1.2 / z, r * 0.12); ctx.strokeStyle = '#FFE15A'; ctx.stroke();
    }
  }
  ctx.restore();
  return true;
}

// Los tokens que ya no están: fuera de la memoria del orden.
function iconosLimpiar(){ iconosPend = []; iconosOrden.forEach((_, id) => { if(!tokens.has(id)) iconosOrden.delete(id); }); iconosHit.forEach((_, id) => { if(!tokens.has(id)) iconosHit.delete(id); }); }

// 🔘 El iconito bajo el mouse (x, y del mapa) → {id, e}, {id, grupo: {fam, items}} (un grupo de cerca) o {id, resto} (la pastilla de lejos), o null. Solo de los tokens que esta pantalla ve ahora (`disposicion`, js/05):
// un token oculto, en la niebla o en sigilo para el que mira no tiene iconitos a los que pasarles el mouse.
function iconoEn(x, y){
  const vistos = new Set((typeof disposicion !== 'undefined' ? disposicion : []).map(d => d.id));
  let mejor = null;
  iconosHit.forEach((lista, id) => {
    if(!vistos.has(id)) return;
    lista.forEach(h => {
      const dist = Math.hypot(h.px - x, h.py - y);
      const dentro = h.w ? Math.abs(h.px - x) <= h.w / 2 + 1 && Math.abs(h.py - y) <= h.h / 2 + 1 : dist <= h.r * 1.1;   // (la pastilla es un rectángulo)
      if(dentro && (!mejor || dist < mejor.dist)) mejor = {dist, id, e: h.e, resto: h.resto, grupo: h.grupo};
    });
  });
  return mejor;
}
