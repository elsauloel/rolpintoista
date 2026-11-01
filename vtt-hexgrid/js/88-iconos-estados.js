// js/88-iconos-estados.js — 🫧😱💤 Los íconos de los estados alrededor del token (2026-11-01, dueño: «empezaría a imaginar iconos para los estados…
// veneno, burbujitas verdes; el miedo, la carita de Scream; el sueño, ZZZ; y que vaya apareciendo alrededor del token»; y después: «tienen que ser
// circulitos alrededor del token; primero cada nuevo estado aparece en uno de los vértices del hexágono y luego se ocupan las partes planas (los lados);
// con un borde verde para los estados beneficiosos y un borde rojo para los malos»).
//
// - Un circulito por estado (fondo oscuro, borde verde = buff, rojo = debuff, gris = ninguno), con su emoji (por familia); uno inventado, su inicial.
// - Lugares: primero los 6 vértices del hexágono del token (empezando por los de arriba), después los 6 puntos medios de los lados: hasta 12; si hay
//   más, el último lugar es «+N».
// - Orden de llegada: cada estado nuevo toma el siguiente lugar libre y lo conserva mientras dure (`iconosOrden`); los que ya estaban al cargar el
//   mapa, en el orden en que vienen.
// - Se dibuja en el recorrido de los tokens que se ven (js/05), así que un token oculto, en la niebla o en sigilo para el que mira no se delata.
//   No se muestran los estados derivados (pasivas, sobrepeso) ni los apagados. El Sigilo, solo si el token está de verdad en sigilo (con Marcado no).
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
  'panico': {ic: '😱', fondo: '#7A1420'},   // el mismo grito, sobre fondo rojo
  'confusion': {ic: '🌀'},
  'provocado': {ic: '😤'},
  'silencio': {ic: '🤐'},
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
  'desarmado': {ic: '🫳'},
  // 😮‍💨 Cansancio y cuerpo
  'cansado': {ic: '😮‍💨'}, 'exhausto': {ic: '😮‍💨'}, 'extenuado': {ic: '😮‍💨'}, 'debilitado': {ic: '😮‍💨'},
  'lisiado': {ic: '🦵'}, 'rengo': {ic: '🦵'}, 'sentado': {ic: '🦵'},
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
  'cuero duro': {ic: '🪨', pol: 'buff'}, 'endurecido': {ic: '🪨'}, 'piel de hierro': {ic: '🪨'}, 'blindado': {ic: '🪨'}, 'estoicismo': {ic: '🪨'}, 'inamovible': {ic: '🪨'}, 'aguante': {ic: '🪨'},
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
  'arma ignea': {ic: '🔥'}, 'arma helada': {ic: '❄️'}, 'arma electrica': {ic: '⚡'},
  'arma acida': {ic: '🧪'}, 'arma venenosa': {ic: '🧪'}, 'arma envenenada': {ic: '🧪'}, 'oleo venenoso': {ic: '🧪'}, 'oleo venenoso concentrado': {ic: '🧪'},
  'arma luminosa': {ic: '☀️'}, 'arma siniestra': {ic: '🌑'}, 'arma bendecida': {ic: '✨'},
  'carga arcana': {ic: '🔮'},
};
const ICONOS_BORDE = {buff: '#4CB86A', debuff: '#E0434F', '': '#8A7D77'};
const ICONOS_ANGULOS = [240, 300, 180, 0, 120, 60, 270, 210, 330, 150, 30, 90];   // 6 vértices (los de arriba primero) y después los 6 medios de los lados
const iconosOrden = new Map();   // id del token → [nombres normalizados, en orden de llegada]

const iconosNorm = s => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Un estado que no está en la tabla (uno creado a mano en la mesa, una pasiva con nombre propio) toma el ícono de su familia si su nombre tiene una
// palabra conocida (dueño, 2026-11-01: «Cuero duro» → 🪨 de las defensas; «veneno» → 🤢…), con la polaridad de la familia si el estado no trae la suya.
// Solo cae en la inicial si no matchea nada. Orden: lo más específico primero.
const ICONOS_FAMILIAS = [
  [/cuero|piel|coraza|armadura|escudo|blindad|endurec/, {ic: '🪨', pol: 'buff'}],
  [/venen|toxic/, {ic: '🤢', pol: 'debuff', anim: 'burbujas', n: 3}],
  [/sangr/, {ic: '🩸', pol: 'debuff', anim: 'gota'}],
  [/quema|fuego|ardien|llama/, {ic: '🔥', pol: 'debuff', anim: 'llama'}],
  [/hielo|escarcha|congel|helad/, {ic: '❄️', pol: 'debuff'}],
  [/(^|\s)rayo|electric/, {ic: '⚡', pol: 'debuff'}],
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
  const def = ICONOS_ESTADO[clave] || ICONOS_ESTADO[clave.replace(/\s*\(.*\)\s*$/, '')];   // «Regeneración (túnica)» → el de Regeneración
  if(def) return def;
  const fam = ICONOS_FAMILIAS.find(([re]) => re.test(clave));
  return fam ? fam[1] : null;
}

// Los estados a mostrar de un token, en su orden estable. → [{clave, e}]
function iconosLista(id, t, est){
  const vistos = new Map();
  (est.estados || []).forEach(e => {
    if(!e || !e.nombre || e.derivado || e.activo === false) return;
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

// En el recorrido de los tokens que se ven (js/05). → {animando, abajo}: si hay que seguir animando y cuánto ocupan por debajo del token (para
// correr las barras).
function iconosEstadosDibujar(id, t, est, x, y, rad, z){
  const res = {animando: false, abajo: 0};
  if(!est || !est.estados || !est.estados.length) return res;
  const lista = iconosLista(id, t, est);
  if(!lista.length) return res;
  const r = Math.max(6 / z, rad * 0.235);
  const max = ICONOS_ANGULOS.length;
  const ver = lista.length > max ? lista.slice(0, max - 1) : lista;
  const ahora = performance.now();
  const alfaPrevio = ctx.globalAlpha;
  ctx.save();
  ctx.globalAlpha = Math.max(alfaPrevio, 0.85);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lugar = i => {
    const a = ICONOS_ANGULOS[i] * Math.PI / 180, esVertice = i < 6;
    const d = esVertice ? rad : rad * Math.sqrt(3) / 2;
    return {px: x + d * Math.cos(a), py: y + d * Math.sin(a)};
  };
  const circulo = (px, py, borde, fondo) => {
    ctx.beginPath(); ctx.arc(px, py, r, 0, 2 * Math.PI);
    ctx.fillStyle = fondo || 'rgba(15,12,14,.92)'; ctx.fill();
    ctx.lineWidth = Math.max(1.6 / z, r * 0.2); ctx.strokeStyle = borde; ctx.stroke();
  };
  ver.forEach(({clave, e}, i) => {
    const {px, py} = lugar(i);
    if(py + r > y + rad * 0.8) res.abajo = Math.max(res.abajo, py + r - (y + rad * Math.sqrt(3) / 2));
    const def = iconoDeEstado(clave);
    const pol = e.polaridad === 'buff' || e.polaridad === 'debuff' ? e.polaridad : (def && def.pol) || '';
    circulo(px, py, ICONOS_BORDE[pol], def && def.fondo);
    const semilla = (i * 97 + id.length * 13) % 1000;
    if(def){
      ctx.font = iconosFuente(r * 1.15);
      ctx.fillStyle = def.color || '#fff';
      if(def.anim === 'llama'){   // la llamita late
        const s = 1 + 0.12 * Math.sin((ahora + semilla) / 140);
        ctx.font = iconosFuente(r * 1.15 * s);
        res.animando = true;
      }
      if(def.anim === 'chispa' && Math.floor((ahora + semilla) / 180) % 4 === 0) ctx.globalAlpha *= 0.45;   // el chispazo parpadea
      ctx.fillText(def.ic, px, py + r * 0.08);
      ctx.globalAlpha = Math.max(alfaPrevio, 0.85);
      if(def.tachado){   // la armadura rota: una raya que la parte
        ctx.beginPath(); ctx.moveTo(px - r * 0.6, py + r * 0.6); ctx.lineTo(px + r * 0.6, py - r * 0.6);
        ctx.lineWidth = Math.max(1.5 / z, r * 0.18); ctx.strokeStyle = '#E0434F'; ctx.stroke();
      }
      if(def.anim && iconosAnimar(def, px, py, r, z, ahora + semilla)) res.animando = true;
    }else{
      ctx.font = `700 ${r * 1.05}px "Space Grotesk", system-ui, sans-serif`;
      ctx.fillStyle = '#fff';
      ctx.fillText((String(e.nombre).trim()[0] || '·').toUpperCase(), px, py + r * 0.06);
    }
  });
  if(lista.length > max){
    const {px, py} = lugar(max - 1);
    circulo(px, py, '#C9B9A6');
    ctx.font = `700 ${r * 0.95}px "Space Grotesk", system-ui, sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.fillText('+' + (lista.length - (max - 1)), px, py + r * 0.06);
    if(py + r > y + rad * 0.8) res.abajo = Math.max(res.abajo, py + r - (y + rad * Math.sqrt(3) / 2));
  }
  ctx.restore();
  ctx.globalAlpha = alfaPrevio;
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
function iconosLimpiar(){ iconosOrden.forEach((_, id) => { if(!tokens.has(id)) iconosOrden.delete(id); }); }
