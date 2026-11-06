// js/106-escudo-elemental.js — 🛡🔥 El Escudo elemental (dueño, 2026-11-06: «Escudo de fuego… lo invoca sobre un aliado o sobre un rival… un
// círculo de fuego que hace daño a quien ocupe ese casillero»; «la idea es que lo siga»; el mismo día, en paralelo con el Arma elemental: al azar o
// eligiendo el elemento, 1d6 con lo de cada elemento).
//
// 1. Usarlo (js/13, la elección del objetivo): como el Arma elemental (js/97), sin cuadro de duelo: el estado del escudo («🔥 Escudo ígneo», con su
//    `escudoElemental`) entra directo a quien se elija — aliado, él mismo o un rival (sin tirada; P: ¿el rival resiste? sin respuesta todavía).
// 2. El anillo: las 6 casillas de al lado de quien lo lleva (sigue al token: sale de dónde está ahora, no se guarda nada). Lo ve quien ve al portador.
// 3. Quema: a quien quede en una casilla del anillo — al entrar, cuando el anillo le llega porque el portador se mueve (o recién se lo ponen), y al
//    empezar su turno ahí — 1d6 de ese elemento con lo suyo: el mismo golpe que el Arma elemental del mismo elemento (sus presets en
//    comun/estados-presets.js: ×1,5 del fuego, Escarcha / Armadura rota / Veneno por daño, el salto y la Parálisis del eléctrico, la Luz sanadora —la
//    cura se la lleva el PORTADOR— y Herida sombría + Punto débil de lo siniestro), con las mismas piezas del duelo (resistenciasDe, danio*,
//    dueloPorDano, dueloCadena, dueloIdentidadEstado, dueloDrenar). Una vez por ronda por víctima y por anillo; nunca a quien lo lleva.
//    El daño es directo; el EFECTO del elemento se resiste con la Res.Esp de la víctima contra el Ef.Esp de quien tiró el escudo (`escudoEsp`, guardado
//    en el estado al ponerlo), salvo los elementos con `resiste: false` (el ácido: la Armadura rota entra siempre) — dueño, 2026-11-06, caso por caso.
//    Lo resuelve la pantalla de la víctima (como las zonas: el GM sus creeps, cada jugador lo suyo — zonaEsMia).

// ¿El ataque es un Escudo elemental (sus efectos son el estado de un escudo y no tira nada)?
function escudoElementalEsHab(ataque){
  const h = ataque && ataque.hab;
  if(!h || h.tira || h.dano) return false;
  const efs = Array.isArray(h.efectos) ? h.efectos : [];
  return efs.length > 0 && efs.every(ef => { const sp = typeof Duelo !== 'undefined' && Duelo.specDeEfecto ? Duelo.specDeEfecto(ef) : ef; return !!Combatiente.escudoElementalDe(sp && sp.nombre ? sp : ef); });
}
// Lo pone directo (sin duelo). → true.
async function escudoElementalDirecto(yo, mio, t, ataque){
  const ef0 = (ataque.hab.efectos || [])[0] || {};
  const sp0 = (typeof Duelo !== 'undefined' && Duelo.specDeEfecto ? Duelo.specDeEfecto(ef0) : null) || {nombre: ef0.nombre};
  const def = Combatiente.escudoElementalDe(sp0) || Combatiente.escudoElementalDe(ef0);
  if(!def) return false;
  const nom = nombreDe(t), quien = (yo && yo.nombre) || (mio ? nombreDe(mio) : 'Alguien');
  const nombre = def.estado;
  const esp = mio && typeof trampaValorStat === 'function' ? Math.round(num(trampaValorStat(mio, 'dmgesp'))) : 0;   // su Ef.Esp, para la tirada de los efectos
  const spec = {...sp0, nombre, escudoDe: mio ? mio.id : '', escudoEsp: esp};
  const d = {id: 'escudo-elemental-' + Date.now(), hab: ataque.hab, ataque,
    atacante: {nombre: quien, tokenId: mio ? mio.id : '', tipo: mio ? mio.tipo : '', ref: mio ? String(mio.fichaId || '') : ''},
    defensor: {nombre: nom, tokenId: t.id, tipo: t.tipo, ref: String(t.fichaId || '')}};
  let r = null;
  try{ r = await dueloAplicarEfectoBase(d, {nombre, spec}); }catch(err){ console.error('Escudo elemental: no se pudo aplicar', err); r = {manual: true, nota: 'aplicalo a mano'}; }
  const turnos = Math.round(num((EstadosAplicar.presetPorNombre(def.estado) || {}).turnos)) || 2;
  const ok = r && !r.manual && !r.sinEfecto;
  const mismo = mio && mio.id === t.id;
  try{ if(yo && yo.ref && typeof Duelo !== 'undefined' && Duelo.pagoHab) Duelo.pagoHab(yo.ref, null); }catch(e){}   // ya se usó: no queda para devolver
  const nomVis = t.oculto ? 'alguien' : nom;
  try{ mesaLinea(`${def.icono} ${quien} ${mismo ? 'se rodea' : `rodea a ${nomVis}`} de un ${def.estado.toLowerCase()} ${turnos} turnos: ${def.que}${ok ? '' : ` (${(r && r.nota) || 'a mano'})`}`, 'recordatorio'); }catch(e){}
  if(ok){
    const para = t.tipo === 'creep' ? '' : t.duenoUid;
    try{
      momentoAbrir({tipo: 'buff', icono: def.icono, titulo: mismo ? `${quien} se rodea de un ${def.estado.toLowerCase()}` : `${quien} rodea a ${nomVis} de un ${def.estado.toLowerCase()}`,
        resultado: `${def.icono} Un anillo de ${def.nombre.toLowerCase()} lo sigue ${turnos} turnos: ${def.que}, una vez por ronda.`, estado: 'listo',
        datos: para ? {paraUid: para, aviso: true, boton: 'Entendido', veredicto: {tono: 'neutro', grande: nombre, chico: `Un anillo de ${def.nombre.toLowerCase()} te rodea ${turnos} turnos: quema a quien quede pegado (a vos no).`}} : {}});
    }catch(err){ console.error('Escudo elemental: el aviso', err); }
    escudoRevisar();   // a los que ya estaban pegados les llega ahora
  }
  return true;
}

// ---------- el anillo ----------
// El escudo activo de un token → {def, estado} o null (de los estados que ve esta pantalla).
// Los estados de un token que ve esta pantalla: un creep, el GM de su ficha privada y los jugadores del resumen público (así ven el anillo de un creep).
function escudoEstadosDe(t){
  if(!t || !t.fichaId) return [];
  if(t.tipo === 'creep'){
    const sc = soyGM && typeof creepPrivadoDe === 'function' ? creepPrivadoDe(t.fichaId) : null;
    if(sc) return sc.estados || [];
    const v = typeof vinculo === 'function' ? vinculo(t) : null;
    return (v && v.resumen && Array.isArray(v.resumen.estados)) ? v.resumen.estados : [];
  }
  return typeof confusionEstadosDe === 'function' ? confusionEstadosDe(t) : [];
}
function escudoDe(t){
  if(!t) return null;
  const est = escudoEstadosDe(t);
  const e = (est || []).find(x => x && x.activo !== false && Combatiente.escudoElementalDe(x));
  return e ? {def: Combatiente.escudoElementalDe(e), estado: e} : null;
}
const escudoAnilloDe = t => typeof vecinosDeCelda === 'function' ? vecinosDeCelda({col: t.col, fila: t.fila}) : [];
function escudoPortadores(){
  const out = [];
  tokens.forEach((t, id) => {
    if(typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(id)) return;   // 💀 un caído no sostiene el escudo
    const e = escudoDe(t);
    if(e) out.push({id, t, def: e.def});
  });
  return out;
}
// 🌀 El elemento girando alrededor de quien lo lleva (2026-11-06, dueño: «el elemento girando alrededor del objetivo»). La geometría, en
// comun/fx-escudo-elemental.js (con la semilla del token: lo mismo en todas las pantallas). Debajo, la línea punteada de las 6 casillas que queman.
// 🧪 ácido y ☠ tóxico: un líquido que gira (como el chorro de la Transfusión, más ancho), irregular, que salpica gotitas hacia afuera.
// ❄ hielo: una ventisca (niebla blanca-celeste que gira) con copos y cristalitos. ⚡ eléctrico: rayos en zigzag que corren alrededor (el estilo del
// rayo del mapa) y chispas. 🔥 fuego: las llamas del Muro de fuego en el anillo y brasas que giran (se va a mejorar). ☀ luz y 🌑 siniestro (a
// confirmar por el dueño): motas doradas con un halo que gira; humo negro-violáceo en zarcillos.
const escudoPoco = () => { try{ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };
const ESCUDO_COLOR = {fuego: [255, 120, 30], hielo: [190, 230, 250], rayo: [255, 230, 90], acido: [160, 240, 40], toxico: [150, 70, 210], luz: [255, 220, 120], siniestro: [70, 30, 90]};
const ESCUDO_LIQUIDO = {
  acido: {halo: 'rgba(40,120,0,', cuerpo: ['rgba(140,230,20,', 'rgba(180,255,60,', 'rgba(100,200,10,'], brillo: 'rgba(235,255,150,', gota: 'rgba(150,240,30,', gotaBrillo: 'rgba(240,255,190,'},
  toxico: {halo: 'rgba(55,10,85,', cuerpo: ['rgba(130,50,190,', 'rgba(170,90,230,', 'rgba(95,25,150,'], brillo: 'rgba(220,170,255,', gota: 'rgba(145,60,205,', gotaBrillo: 'rgba(230,200,255,'},
};
/* ⚡ Rendimiento (2026-11-06, dueño: «con todas las animaciones cargadas al mismo tiempo se pone lento»). Lo caro era el `ctx.filter = blur()`
   puesto ANTES de decenas de trazos (el navegador desenfoca cada trazo por separado) y un degradado nuevo por partícula en cada cuadro. Ahora:
   - lo borroso (la nube de la ventisca, el humo de lo siniestro) se dibuja sin filtro en un lienzo chico fuera de pantalla, a baja resolución, se
     desenfoca UNA vez ese lienzo chico y se pega agrandado (`escudoCapaBorrosa`);
   - los brillos (brasas, motas de luz) son una imagen de degradado hecha una sola vez y pegada con su transparencia (`escudoBrillo`);
   - el líquido usa menos puntos por chorro; un escudo fuera de la vista no se dibuja; y con muchos escudos a la vez o con el zoom lejos, menos
     partículas (`escudoCant`). La animación del escudo va a ~30 cuadros por segundo si no hay otra cosa animándose (`animarLento`, js/05). */
const escudoSprites = new Map();
function escudoBrillo(centro, borde){   // una imagen de 64 px: un punto que brilla, del color `centro` al `borde` transparente
  const k = centro + '|' + borde;
  let im = escudoSprites.get(k);
  if(!im){
    im = document.createElement('canvas'); im.width = im.height = 64;
    const g = im.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, centro); gr.addColorStop(1, borde);
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    escudoSprites.set(k, im);
  }
  return im;
}
const escudoCapas = [];   // lienzos chicos reusados (dos por capa: el dibujo y el desenfocado)
function escudoCapaLienzo(i){ if(!escudoCapas[i]) escudoCapas[i] = document.createElement('canvas'); return escudoCapas[i]; }
// Dibuja `fn(g)` (en coordenadas del mapa) en un lienzo chico a 1/`baja` de la resolución de pantalla, lo desenfoca una vez (`blurPx`, en píxeles
// del lienzo chico) y lo pega agrandado en el mapa: una sola operación de desenfoque, sobre pocos píxeles.
function escudoCapaBorrosa(c, lado, z, baja, blurPx, fn){
  const esc = Math.max(0.05, z * (typeof dpr === 'number' ? dpr : 1) / baja), tam = Math.max(8, Math.ceil(lado * esc));
  const a = escudoCapaLienzo(0), b = escudoCapaLienzo(1);
  if(a.width !== tam){ a.width = a.height = tam; b.width = b.height = tam; }
  const ga = a.getContext('2d'), gb = b.getContext('2d');
  ga.setTransform(1, 0, 0, 1, 0, 0); ga.clearRect(0, 0, tam, tam);
  ga.setTransform(esc, 0, 0, esc, -(c.x - lado / 2) * esc, -(c.y - lado / 2) * esc);
  fn(ga);
  gb.setTransform(1, 0, 0, 1, 0, 0); gb.clearRect(0, 0, tam, tam);
  gb.filter = `blur(${Math.max(0.6, blurPx).toFixed(1)}px)`; gb.drawImage(a, 0, 0); gb.filter = 'none';
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(b, c.x - lado / 2, c.y - lado / 2, lado, lado); ctx.restore();
}
// Cuántas partículas: todas con pocos escudos y de cerca; menos con muchos o con el zoom lejos (de lejos no se distinguen).
let escudoFactor = 1;
const escudoCant = n => Math.max(4, Math.round(n * escudoFactor));
function escudoLiquido(c, R, ms, sem, z, k, poco){
  const F = FxEscudoElemental, pal = ESCUDO_LIQUIDO[k], base = HEX * 0.36;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  F.chorros(c, R, ms, sem, {cuantos: 2, largo: 0.36, puntos: escudoFactor < 1 ? 16 : 22, poco}).forEach((pts, ci) => {
    [[2.3, pal.halo + '0.22)', 0], [1, pal.cuerpo[ci % 3] + '0.92)', 0], [0.55, pal.cuerpo[(ci + 1) % 3] + '0.55)', 0.18], [0.3, pal.brillo + '0.6)', -0.35]].forEach(([mult, color, corr]) => {
      for(let j = 1; j < pts.length; j++){
        const q0 = pts[j - 1], q1 = pts[j], w = Math.max(0.3, base * F.grosor(q1.u, ms, sem + ci) * mult);
        const dx = q1.x - q0.x, dy = q1.y - q0.y, l = Math.hypot(dx, dy) || 1, ox = -dy / l * w * corr, oy = dx / l * w * corr;
        ctx.beginPath(); ctx.moveTo(q0.x + ox, q0.y + oy); ctx.lineTo(q1.x + ox, q1.y + oy);
        ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
      }
    });
  });
  F.gotas(sem, escudoCant(20)).forEach((g, i) => {
    const p = F.posGota(g, c, R, ms, poco);
    if(p.alfa <= 0.02) return;
    const r = HEX * p.r * (0.85 + 0.15 * Math.sin(ms / 90 + i));
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fillStyle = pal.gota + (0.9 * p.alfa).toFixed(2) + ')'; ctx.fill();
    ctx.beginPath(); ctx.arc(p.x - r * 0.3, p.y - r * 0.35, r * 0.32, 0, Math.PI * 2); ctx.fillStyle = pal.gotaBrillo + (0.65 * p.alfa).toFixed(2) + ')'; ctx.fill();
  });
  ctx.restore();
}
function escudoCopo(x, y, r, ang, a){
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.strokeStyle = `rgba(235,248,255,${a.toFixed(2)})`; ctx.lineWidth = Math.max(0.6, r * 0.28);
  for(let k = 0; k < 3; k++){ ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke(); }
  ctx.restore();
}
function escudoVentisca(c, R, ms, sem, z, poco){
  const F = FxEscudoElemental;
  escudoCapaBorrosa(c, R * 3.3, z, 3, HEX * 0.14 * z * (typeof dpr === 'number' ? dpr : 1) / 3, g => {
    g.lineCap = 'round';
    F.chorros(c, R, ms, sem, {cuantos: 3, largo: 0.3, puntos: 20, poco}).forEach(pts => {
      for(let j = 1; j < pts.length; j++){
        const q0 = pts[j - 1], q1 = pts[j];
        g.beginPath(); g.moveTo(q0.x, q0.y); g.lineTo(q1.x, q1.y);
        g.strokeStyle = `rgba(215,238,252,${(0.28 * F.grosor(q1.u, ms, sem)).toFixed(3)})`; g.lineWidth = HEX * 0.75 * F.grosor(q1.u, ms, sem + 3); g.stroke();
      }
    });
  });
  F.orbitas(sem, escudoCant(26)).forEach((o, i) => {
    const p = F.posOrbita(o, c, R, ms * 1.4, poco), r = HEX * p.r * 0.9, a = 0.45 + 0.5 * p.titila;
    if(i % 3 === 0){ ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.ang); ctx.fillStyle = `rgba(200,235,255,${a.toFixed(2)})`; ctx.beginPath(); ctx.moveTo(0, -r * 1.3); ctx.lineTo(r * 0.5, 0); ctx.lineTo(0, r * 1.3); ctx.lineTo(-r * 0.5, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }   // un cristalito
    else escudoCopo(p.x, p.y, r, p.ang + ms * 0.002, a);
  });
}
function escudoRayos(c, R, ms, sem, z, poco){
  const F = FxEscudoElemental, salto = Math.floor(ms / (poco ? 260 : 110));   // el zigzag cambia de a saltos (como el rayo del mapa)
  const rr = F.rand(sem + salto * 7919);
  F.chorros(c, R, ms, sem, {cuantos: 3, largo: 0.22, puntos: 9, poco}).forEach(pts => {
    [[9, 'rgba(255,230,90,0.35)'], [3.2, 'rgba(255,250,215,0.95)']].forEach(([ancho, color]) => {
      ctx.beginPath();
      pts.forEach((q, j) => { const d = (j && j < pts.length - 1) ? (rr() - 0.5) * HEX * 0.45 : 0, dx = q.x - c.x, dy = q.y - c.y, l = Math.hypot(dx, dy) || 1, x = q.x + dx / l * d, y = q.y + dy / l * d; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.strokeStyle = color; ctx.lineWidth = ancho / z; ctx.lineJoin = 'round'; ctx.stroke();
    });
  });
  F.orbitas(sem, escudoCant(14)).forEach(o => {
    const p = F.posOrbita(o, c, R, ms * 1.8, poco);
    if(p.titila < 0.45) return;
    ctx.fillStyle = `rgba(255,245,160,${(p.titila).toFixed(2)})`; ctx.beginPath(); ctx.arc(p.x, p.y, HEX * 0.035, 0, Math.PI * 2); ctx.fill();
  });
}
function escudoBrasas(c, R, ms, sem, z, poco, celdas){
  // (2026-11-06, dueño: «muestra la casilla donde está parado… también roja; que haya cierto espacio que connote que eso gira alrededor del token y
  // no lo afecta»): el fuego se recorta con un hueco redondo alrededor del portador (un poco más grande que su casilla), así su lugar queda limpio.
  if(typeof fuegoDibujar === 'function'){
    ctx.save();
    ctx.beginPath(); ctx.rect(c.x - HEX * 4, c.y - HEX * 4, HEX * 8, HEX * 8); ctx.arc(c.x, c.y, HEX * 1.12, 0, Math.PI * 2, true); ctx.clip('evenodd');
    fuegoDibujar(celdas, z);
    ctx.restore();
  }
  const F = FxEscudoElemental;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const im = escudoBrillo('rgba(255,220,120,1)', 'rgba(255,90,0,0)');
  F.orbitas(sem, escudoCant(18)).forEach(o => {
    const p = F.posOrbita(o, c, R, ms, poco), r = HEX * (0.05 + p.r * 0.6) * 2.2;
    ctx.globalAlpha = 0.6 + 0.4 * p.titila; ctx.drawImage(im, p.x - r, p.y - r, r * 2, r * 2);
  });
  ctx.globalAlpha = 1;
  ctx.restore();
}
function escudoLuz(c, R, ms, sem, z, poco){
  const F = FxEscudoElemental;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const pul = 0.5 + 0.5 * Math.sin(ms * 0.003);
  const g = ctx.createRadialGradient(c.x, c.y, R * 0.6, c.x, c.y, R * 1.35);
  g.addColorStop(0, 'rgba(255,230,150,0)'); g.addColorStop(0.5, `rgba(255,225,140,${(0.16 + 0.08 * pul).toFixed(3)})`); g.addColorStop(1, 'rgba(255,220,120,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x, c.y, R * 1.35, 0, Math.PI * 2); ctx.fill();
  const im = escudoBrillo('rgba(255,248,210,1)', 'rgba(255,210,90,0)');
  F.orbitas(sem, escudoCant(24)).forEach(o => {
    const p = F.posOrbita(o, c, R, ms, poco), r = HEX * (0.03 + p.r * 0.5) * 3;
    ctx.globalAlpha = 0.55 + 0.45 * p.titila; ctx.drawImage(im, p.x - r, p.y - r, r * 2, r * 2);
  });
  ctx.globalAlpha = 1;
  ctx.restore();
}
function escudoSombra(c, R, ms, sem, z, poco){
  const F = FxEscudoElemental;
  escudoCapaBorrosa(c, R * 3.3, z, 3, HEX * 0.1 * z * (typeof dpr === 'number' ? dpr : 1) / 3, g => {
    g.lineCap = 'round';
    F.chorros(c, R, ms, sem, {cuantos: 4, largo: 0.24, puntos: 20, poco}).forEach((pts, ci) => {
      for(let j = 1; j < pts.length; j++){
        const q0 = pts[j - 1], q1 = pts[j], w = HEX * 0.42 * F.grosor(q1.u, ms, sem + ci);
        g.beginPath(); g.moveTo(q0.x, q0.y); g.lineTo(q1.x, q1.y);
        g.strokeStyle = ci % 2 ? 'rgba(20,6,28,0.55)' : 'rgba(80,30,110,0.45)'; g.lineWidth = w; g.stroke();
      }
    });
  });
  F.orbitas(sem, escudoCant(12)).forEach(o => {
    const p = F.posOrbita(o, c, R, ms * 0.8, poco);
    ctx.fillStyle = `rgba(150,90,200,${(0.25 + 0.35 * p.titila).toFixed(2)})`; ctx.beginPath(); ctx.arc(p.x, p.y, HEX * 0.035, 0, Math.PI * 2); ctx.fill();
  });
}
function escudoElementalDibujar(z){
  const ps = escudoPortadores();
  if(!ps.length || typeof FxEscudoElemental === 'undefined') return false;
  const ms = performance.now(), poco = escudoPoco(), R = HEX * 1.42;
  // La parte del mapa que se ve (con un margen de 3 casillas): lo de afuera no se dibuja.
  const ancho = lienzo.clientWidth || 0, alto = lienzo.clientHeight || 0, x0 = -vista.x / z - HEX * 3, y0 = -vista.y / z - HEX * 3, x1 = (ancho - vista.x) / z + HEX * 3, y1 = (alto - vista.y) / z + HEX * 3;
  let visibles = 0;
  const lista = [];
  for(const p of ps){
    if((p.t.oculto && !soyGM) || (typeof tokenVisiblePorNiebla === 'function' && !tokenVisiblePorNiebla(p.t))) continue;
    const c = (typeof posicionesDibujo !== 'undefined' && posicionesDibujo && posicionesDibujo.get && posicionesDibujo.get(p.id)) || hexCentro(p.t.col, p.t.fila);
    if(ancho && (c.x < x0 || c.x > x1 || c.y < y0 || c.y > y1)) continue;
    visibles++; lista.push({p, c});
  }
  escudoFactor = Math.min(1, z < 0.6 ? 0.5 : z < 0.9 ? 0.75 : 1, visibles > 4 ? 0.6 : visibles > 2 ? 0.8 : 1);
  for(const {p, c} of lista){
    const celdas = escudoAnilloDe(p.t);
    const sem = FxEscudoElemental.semillaDe(p.id), k = p.def.clave;
    const [r, g, b] = ESCUDO_COLOR[k] || [200, 200, 200];
    if(k !== 'fuego' && typeof bordeHexPunteado === 'function') bordeHexPunteado(celdas, z, `rgba(${r},${g},${b},.5)`);   // dónde quema exactamente
    try{
      if(k === 'acido' || k === 'toxico') escudoLiquido(c, R, ms, sem, z, k, poco);
      else if(k === 'hielo') escudoVentisca(c, R, ms, sem, z, poco);
      else if(k === 'rayo') escudoRayos(c, R, ms, sem, z, poco);
      else if(k === 'fuego') escudoBrasas(c, R, ms, sem, z, poco, celdas);
      else if(k === 'luz') escudoLuz(c, R, ms, sem, z, poco);
      else escudoSombra(c, R, ms, sem, z, poco);
    }catch(err){ console.error('Escudo elemental: el dibujo', err); }
  }
  if(typeof pedirAnimacionLenta === 'function'){ pedirAnimacionLenta(); return false; }   // ~30 cuadros por segundo (js/05)
  return true;
}

// ---------- quién queda pegado, y cuándo quema ----------
const escudoQuemados = new Set();          // «portador|víctima|ronda»: una vez por ronda por víctima y por anillo (cada pantalla, lo suyo)
let escudoPares = null;                    // los pares «portador|víctima» pegados la última vez que se miró (null = todavía no se miró)
let escudoTurnoVisto = null;               // «ronda|turno» la última vez
const escudoDesde = Date.now();
const escudoRonda = () => Math.round(num(iniciativa && iniciativa.orden && iniciativa.orden.length ? iniciativa.ronda : mantenimientoNumero)) || 0;
function escudoParesAhora(){
  const pares = new Set();
  for(const p of escudoPortadores()){
    const anillo = escudoAnilloDe(p.t);
    tokens.forEach((v, vid) => {
      if(vid === p.id || !v.fichaId) return;
      if(anillo.some(c => c.col === v.col && c.fila === v.fila)) pares.add(`${p.id}|${vid}`);
    });
  }
  return pares;
}
// Lo mira cada tanto (y cuando se pone un escudo): los pares nuevos queman (entró, le llegó el anillo o se lo pusieron); el que empieza su turno
// pegado, también. Al cargar el mapa solo anota (no quema a los que ya estaban).
function escudoRevisar(){
  const ahora = escudoParesAhora();
  const recien = Date.now() - escudoDesde < 9000;
  if(escudoPares && !recien) for(const k of ahora) if(!escudoPares.has(k)){ const [pid, vid] = k.split('|'); escudoQuemar(pid, vid, 'entra'); }
  escudoPares = ahora;
  // El que empieza su turno pegado a un anillo.
  const tv = iniciativa && iniciativa.orden && iniciativa.orden.length ? `${iniciativa.ronda}|${iniciativa.turno}` : null;
  if(tv && tv !== escudoTurnoVisto){
    const primera = escudoTurnoVisto === null;
    escudoTurnoVisto = tv;
    const tid = (iniciativa.orden[iniciativa.turno] || {}).id;
    if(!primera && !recien && tid) for(const k of ahora){ const [pid, vid] = k.split('|'); if(vid === tid) escudoQuemar(pid, vid, 'turno'); }
  }
}
setInterval(() => { try{ if(typeof tokens !== 'undefined' && tokens.size) escudoRevisar(); }catch(err){ console.error('Escudo elemental:', err); } }, 700);

// ¿Esta pantalla resuelve lo que le pasa a `v`? Una sola (probado en el mapa, 2026-11-06: un personaje que el GM controla con 🎮 se quemaba dos
// veces, en la pantalla del GM y en la de su dueño): un creep, el GM; un personaje o una invocación, quien tiene el control, o si nadie, su dueño.
function escudoResuelvoYo(v){
  if(!v || !fbUsuario) return false;
  if(v.tipo === 'creep') return !!soyGM;
  if(typeof zonaEsMia === 'function' && !zonaEsMia(v)) return false;
  const r = ((fichasPub.get(String(v.fichaId || '').split(SEP_INVOCACION)[0]) || {}).resumen) || {};
  return fbUsuario.uid === (r.control || v.duenoUid || '');
}
// Quema a `vid` con el escudo de `pid` (si esta pantalla resuelve a la víctima y no la quemó en esta ronda).
async function escudoQuemar(pid, vid, motivo){
  const p = tokens.get(pid), v = tokens.get(vid);
  if(!p || !v || pid === vid) return;
  if(!escudoResuelvoYo(v)) return;   // lo resuelve UNA pantalla: la de quien maneja a la víctima (el GM sus creeps)
  if(typeof etereoDe === 'function' && etereoDe(v)) return;
  if(typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(vid)) return;
  const e = escudoDe(p);
  if(!e) return;
  const clave = `${pid}|${vid}|${escudoRonda()}`;
  if(escudoQuemados.has(clave)) return;
  escudoQuemados.add(clave);
  const def = e.def, el = def.clave;
  const arma = EstadosAplicar.presetPorNombre(def.arma) || {};
  const efs = (arma.golpe && Array.isArray(arma.golpe.efectos)) ? arma.golpe.efectos : [];
  const ef = efs.find(x => x && x.danoMagico) || {dado: '1d6'};
  const quienP = p.oculto ? 'Alguien' : nombreDe(p), quienV = v.oculto ? 'Alguien' : nombreDe(v);
  const d = {id: 'escudo-' + Date.now(), efectos: [],
    atacante: {nombre: nombreDe(p), tokenId: pid, tipo: p.tipo, ref: String(p.fichaId || ''), uid: p.duenoUid || ''},
    defensor: {nombre: nombreDe(v), tokenId: vid, tipo: v.tipo, ref: String(v.fichaId || ''), uid: v.duenoUid || ''}};
  const partes = [];
  try{
    const tir = tirarDados(ef.dado || '1d6');
    const dado = tir ? tir.total : 0;
    const esInv = v.tipo === 'pj' && String(v.fichaId || '').includes(SEP_INVOCACION);
    const resEl = (await resistenciasDe(v, el)).res;
    const id0 = Combatiente.identidadElemento(el, ((vinculo(v) || {}).tipoCriatura));
    const idE = id0 && id0.estado && num(ef.identidadTurnos) > 0 ? {...id0, estado: {...id0.estado, turnos: num(ef.identidadTurnos)}} : id0;
    const mult = (num(ef.mult) > 1 ? num(ef.mult) : 1) * (idE ? idE.mult : 1);
    let monto = Math.ceil(dado * mult);
    const ag = typeof aguaRayo === 'function' ? aguaRayo(v, el, monto) : null;
    if(ag && ag.txt){ monto = ag.monto; partes.push(ag.txt); }
    partes.push(`${ef.dado || '1d6'}: ${dado}${mult !== 1 ? ` × ${String(mult).replace('.', ',')} = ${monto}` : ''}`);
    try{ mesaPublicar(`${def.icono} ${def.estado} de ${quienP} → ${quienV}`, {formula: ef.dado || '1d6', rolls: tir ? tir.rolls : [], mod: 0, total: dado, quien: `${def.estado} de ${quienP}`}); }catch(err){}
    let recibido = 0, perdio = 0;
    if(monto > 0){
      const o = {magico: true};
      const rm = v.tipo === 'creep' ? await danioCreep(v, String(monto), true, 0, resEl, o) : await (esInv ? danioInv : danioPj)(v, String(monto), true, 0, resEl, o);
      recibido = rm && rm.r ? num(rm.r.recibido) : 0;
      perdio = rm ? Math.max(0, num(rm.previo) - num(rm.nuevo)) : 0;
      partes.push(`${recibido} de daño de ${def.nombre.toLowerCase()}${resEl ? ` (− ${Combatiente.resElementalTxt(el, resEl)})` : ''}`);
      if(v.tipo === 'creep' && typeof debilRevelar === 'function' && (resEl || (idE && idE.mult === 0))) debilRevelar(v, el, {res: resEl, mult: idE ? idE.mult : 1}).catch(() => {});
      // 🛡 El efecto del elemento (no el daño, ni el salto del rayo, ni la cura de la luz) se resiste: la Res.Esp de quien se quema contra el Ef.Esp
      // de quien tiró el escudo (guardado en el estado al ponerlo). Empate: gana el escudo. Los elementos con `resiste: false` (el ácido) no se tiran.
      let resistio = false;
      const hayEfecto = !!(idE && idE.estado) || !!ef.porDano || efs.some(x => x && !x.danoMagico && num(x.caras) > 0);   // (el fuego solo quema: no hay nada que resistir)
      if(recibido > 0 && def.resiste && hayEfecto){
        const tirar = v0 => { const fp = formulaParaValor(Math.max(0, Math.round(num(v0)))), f = typeof fp === 'string' ? fp : String((fp && fp.formula) || Math.max(0, Math.round(num(v0)))); const r = tirarDados(f); return {total: r ? num(r.total) : Math.max(0, Math.round(num(v0))), formula: f, r}; };
        const tE = tirar(num(e.estado.escudoEsp)), tV = tirar(typeof trampaValorStat === 'function' ? trampaValorStat(v, 'resmg') : 0);
        try{ mesaPublicar(`${def.estado} de ${quienP} · Ef.Esp`, {formula: tE.formula, rolls: tE.r ? tE.r.rolls : [], mod: tE.r ? tE.r.mod : 0, total: tE.total, quien: `${def.estado} de ${quienP}`}); }catch(err){}
        try{ mesaPublicar(`${quienV} · Res.Esp`, {formula: tV.formula, rolls: tV.r ? tV.r.rolls : [], mod: tV.r ? tV.r.mod : 0, total: tV.total}); }catch(err){}
        resistio = tV.total > tE.total;
        partes.push(`${resistio ? 'resistió' : 'no resistió'} el efecto (Res.Esp ${tV.total} contra Ef.Esp ${tE.total})`);
      }
      if(rm && rm.r && !rm.r.invulnerable && recibido > 0){
        if(ef.cadena) await dueloCadena(d, recibido).catch(err => console.error('Escudo: el salto del rayo', err));
        if(num(ef.luzSanadora) > 0 && perdio > 0){
          const cura = Math.max(1, Math.floor(perdio * Math.min(100, num(ef.luzSanadora)) / 100));
          const ls = await dueloDrenar(d, cura, {sinExtra: true}).catch(() => null);
          partes.push(ls && !ls.manual ? `☀ ${quienP} se cura ${cura}` : `☀ ${quienP} se cura ${cura} (a mano)`);
        }
      }
      // Aunque resista, lo mínimo de un elemento con `minimo` (hoy ninguno: el hielo, si resiste, no deja nada de Escarcha — dueño, 2026-11-06).
      if(rm && rm.r && !rm.r.invulnerable && recibido > 0 && resistio && def.minimo > 0 && ef.porDano){
        const r = await dueloAplicarEfecto(d, {nombre: ef.porDano.estado, spec: {nombre: ef.porDano.estado, stacks: def.minimo, ...(num(ef.porDano.turnos) > 0 ? {turnos: num(ef.porDano.turnos)} : {})}}).catch(() => null);
        partes.push(`igual ${ef.porDano.estado} ×${def.minimo} (el mínimo)${r && r.manual ? ' (a mano)' : ''}`);
      }
      if(rm && rm.r && !rm.r.invulnerable && recibido > 0 && !resistio){
        if(idE && idE.estado) await dueloIdentidadEstado(d, el, idE).catch(err => console.error('Escudo: la identidad del elemento', err));
        if(ef.porDano){ const pd = await dueloPorDano(d, recibido, ef.porDano).catch(err => { console.error('Escudo: el estado por daño', err); return null; }); if(pd) partes.push(`${pd.estado} ×${pd.stacks}`); }
        // ⚡ La Parálisis del eléctrico (la del Arma eléctrica: su chance, a la vista).
        for(const ch of efs.filter(x => x && !x.danoMagico && num(x.caras) > 0)){
          const caras = Math.round(num(ch.caras)), exitos = Math.round(num(ch.exitos)) || 1, sale = 1 + Math.floor(Math.random() * caras), entra = sale > caras - exitos;
          partes.push(`${ch.nombre} ${Math.round(exitos * 100 / caras)} % (1d${caras}: ${sale}) → ${entra ? 'entra' : 'no'}`);
          if(entra) await dueloAplicarEfecto(d, {nombre: ch.nombre, spec: {nombre: ch.nombre, ...(num(ch.turnos) > 0 ? {turnos: num(ch.turnos)} : {})}}).catch(err => console.error('Escudo: la Parálisis', err));
        }
      }
    }else partes.push('sin daño');
  }catch(err){ console.error('Escudo elemental: no se pudo aplicar', err); partes.push('aplicalo a mano: 1d6 del elemento'); }
  const cuando = motivo === 'turno' ? 'empieza su turno pegado al' : 'queda pegado al';
  const txt = `${def.icono} ${quienV} ${cuando} ${def.estado.toLowerCase()} de ${quienP}: ${partes.join(' · ')}`;
  try{ mesaLinea(txt, 'recordatorio'); }catch(e){}
  try{ momentoAbrir({tipo: 'zona', icono: def.icono, titulo: `${quienV} se quema con el ${def.estado.toLowerCase()} de ${quienP}`, resultado: partes.join(' · '), estado: 'listo', datos: {chico: true}}); }catch(e){}
}
