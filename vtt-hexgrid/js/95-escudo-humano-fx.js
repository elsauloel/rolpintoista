/* 🛡 La animación del Escudo humano (2026-11-03, dueño: «tiene que haber alguna animación para que visualmente se entienda que el daño se está
   distribuyendo entre los dos tokens»; «en el token de la persona que está siendo protegida puede aparecer alguna especie de brillo… como si fuera un
   reflejo metálico de protección»). La geometría está en comun/fx-escudo-humano.js; acá se dibuja. Vale para el Escudo humano de los creeps y para el
   Miti-Miti de clase (el mismo reparto, js/10).
   · Mientras dura: un lazo dorado tenue entre el guardián y el protegido (respira despacio) y, sobre el protegido, un reflejo metálico que barre el
     token cada tanto. Lo saca cada pantalla de los estados públicos (`protege` en el resumen del guardián), así lo ven todos sin mandar nada.
   · Cuando le pegan al protegido (`escudoHumanoGolpePublicar`, lo llama mitiMitiCobrar de js/10): un momento `escudo-golpe` (js/16, sin tarjeta) →
     destello del golpe y el número entero en el protegido, que se parte: una mitad se queda y la otra viaja por el lazo como una esquirla dorada hasta
     el guardián (pulso dorado y su número); el lazo brilla fuerte un instante.
   · Al terminar el efecto, el lazo se corta y se desvanece.
   Si uno de los dos no se ve en esta pantalla (oculto, niebla), no se dibuja el lazo; el brillo, solo si el protegido se ve. «Reducir movimiento»: sin
   respiración ni viaje, solo el destello y los números. No toca clics. */
const ESCUDO_HUMANO_GOLPES = [];   // {de (protegido), a (guardián), total, va, queda, t0}
const ESCUDO_HUMANO_CORTES = [];   // {A, B, t0}: el lazo que se corta
const escudoHumanoVistos = new Set();
let escudoHumanoPrevios = new Map();   // clave 'guardián>protegido' → {A, B} (para el corte)
const escudoHumanoPoco = () => { try{ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };
const escudoHumanoVe = t => !!t && (!t.oculto || soyGM) && (typeof tokenVisiblePorNiebla !== 'function' || tokenVisiblePorNiebla(t));
const ESCUDO_HUMANO_MARCAS = ['Escudo humano', 'Miti-Miti'];
// (idDeToken ya existe en js/04: declararlo de nuevo rompía la carga de todo este archivo — «Identifier 'idDeToken' has already been declared»)

// Los pares activos, de los estados públicos: el guardián lleva la marca con `protege` = la ficha del protegido.
function escudoHumanoPares(){
  const pares = [];
  for(const [gid, g] of tokens){
    if(!g || !g.fichaId) continue;
    const est = typeof estadoDe === 'function' ? estadoDe(g) : null;
    if(!est || est.muerto) continue;
    const marcas = (est.estados || []).filter(e => e && e.activo !== false && ESCUDO_HUMANO_MARCAS.includes(e.nombre) && e.protege);
    for(const m of marcas){
      for(const [pid, p] of tokens){
        if(pid === gid || !p || p.fichaId !== m.protege) continue;
        if(g.tipo === 'creep' && typeof distanciaHex === 'function' && distanciaHex(g, p) > (typeof ESCUDO_HUMANO_DIST !== 'undefined' ? ESCUDO_HUMANO_DIST : 3)) continue;   // más lejos, se corta (js/10)
        pares.push({gid, pid, g, p});
      }
    }
  }
  return pares;
}

// Lo publica la pantalla que cobra el reparto (js/10, mitiMitiCobrar). Si el momento no se puede publicar, lo ve al menos esta pantalla.
async function escudoHumanoGolpePublicar(protegido, guardian, total, va){
  const de = idDeToken(protegido), a = idDeToken(guardian);
  if(!de || !a || !(num(total) > 0)) return;
  const datos = {de, a, total: Math.round(num(total)), va: Math.round(num(va))};
  const id = typeof momentoAbrir === 'function' ? await momentoAbrir({tipo: 'escudo-golpe', icono: '', titulo: '', estado: 'listo', datos}) : null;
  if(!id) escudoHumanoGolpeEmpezar(datos);
}
// Llega a cada pantalla (js/16). Una sola vez, y solo si es de recién.
function escudoHumanoGolpeRecibido(id, d){
  if(!d || !d.datos || escudoHumanoVistos.has(id)) return;
  escudoHumanoVistos.add(id);
  const t = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(Date.now() - t > 20000) return;
  escudoHumanoGolpeEmpezar(d.datos);
}
function escudoHumanoGolpeEmpezar(dt){
  if(typeof FxEscudoHumano === 'undefined' || !tokens.get(dt.de) || !tokens.get(dt.a)) return;
  const total = Math.max(0, Math.round(num(dt.total))), va = Math.max(0, Math.round(num(dt.va)));
  ESCUDO_HUMANO_GOLPES.push({de: dt.de, a: dt.a, total, va, queda: Math.max(0, total - va), t0: performance.now()});
  pedirDibujo();
}

function escudoHumanoTexto(x, y, txt, color, alfa, z, tam){
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alfa));
  ctx.font = `900 ${Math.max(10 / z, HEX * (tam || 0.42))}px system-ui, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(2 / z, HEX * 0.08); ctx.strokeStyle = 'rgba(20,14,6,.9)'; ctx.strokeText(txt, x, y);
  ctx.fillStyle = color; ctx.fillText(txt, x, y);
  ctx.restore();
}

// El dibujo (js/05, con los otros efectos). true mientras haya que seguir animando.
function dibujarEfectosEscudoHumano(z){
  if(typeof FxEscudoHumano === 'undefined') return false;
  const F = FxEscudoHumano, ahora = performance.now(), poco = escudoHumanoPoco();
  const pares = escudoHumanoPares();
  // Los que se cortaron desde el cuadro anterior: su lazo se desvanece.
  const vivos = new Map();
  pares.forEach(q => vivos.set(q.gid + '>' + q.pid, q));
  for(const [k, prev] of escudoHumanoPrevios) if(!vivos.has(k) && !poco) ESCUDO_HUMANO_CORTES.push({A: prev.A, B: prev.B, t0: ahora});
  const nuevosPrev = new Map();
  let animando = false;
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // 1. Los lazos en reposo y el reflejo metálico.
  pares.forEach(q => {
    const A = hexCentro(q.g.col, q.g.fila), B = hexCentro(q.p.col, q.p.fila);
    nuevosPrev.set(q.gid + '>' + q.pid, {A, B});
    const golpe = ESCUDO_HUMANO_GOLPES.find(x => x.a === q.gid && x.de === q.pid);
    const fuerte = golpe ? F.fases(ahora - golpe.t0).brilloLazo : 0;
    if(escudoHumanoVe(q.g) && escudoHumanoVe(q.p)){
      const pts = F.lazo(A, B, poco ? 0 : ahora, HEX * 0.62, 24), alfa = (poco ? 0.4 : F.respiro(ahora)) + 0.5 * fuerte;
      [[6, `rgba(255,200,80,${0.18 * alfa})`], [2.2, `rgba(255,214,110,${0.85 * alfa})`], [0.9, `rgba(255,248,210,${0.7 * alfa})`]].forEach(([w, color]) => {
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = color; ctx.lineWidth = (w + 3 * fuerte) / z; ctx.stroke();
      });
      if(!poco) animando = true;
    }
    if(escudoHumanoVe(q.p)){
      // El reflejo: una franja clara que cruza el token en diagonal, recortada al hexágono.
      const k = poco ? null : F.reflejo(ahora, (q.pid.length * 397) % 1500);
      const r = HEX * 0.98;
      ctx.save();
      ctx.beginPath();
      for(let i = 0; i < 6; i++){ const a = Math.PI / 3 * i, x = B.x + r * Math.cos(a), y = B.y + r * Math.sin(a); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.closePath();
      ctx.strokeStyle = `rgba(255,214,110,${0.55 + 0.3 * fuerte})`; ctx.lineWidth = 2 / z; ctx.stroke();   // un borde dorado fino, siempre
      if(k !== null){
        ctx.clip();
        const x = B.x - r * 1.6 + r * 3.2 * k;
        const g = ctx.createLinearGradient(x - r * 0.45, B.y - r, x + r * 0.45, B.y + r);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,250,225,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(x - r * 0.3, B.y - r * 1.2); ctx.lineTo(x + r * 0.3, B.y - r * 1.2); ctx.lineTo(x - r * 0.1 + r * 0.45, B.y + r * 1.2); ctx.lineTo(x - r * 0.1 - r * 0.15, B.y + r * 1.2); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      if(!poco) animando = true;
    }
  });
  escudoHumanoPrevios = nuevosPrev;
  // 2. Los golpes repartidos.
  for(let i = ESCUDO_HUMANO_GOLPES.length - 1; i >= 0; i--){
    const fx = ESCUDO_HUMANO_GOLPES[i], ms = ahora - fx.t0, f = F.fases(ms);
    if(f.fin){ ESCUDO_HUMANO_GOLPES.splice(i, 1); continue; }
    animando = true;
    const tp = tokens.get(fx.de), tg = tokens.get(fx.a);
    if(!tp || !tg) continue;
    const B = hexCentro(tp.col, tp.fila), A = hexCentro(tg.col, tg.fila), veP = escudoHumanoVe(tp), veG = escudoHumanoVe(tg);
    if(veP && f.impacto > 0){   // el destello del golpe en el protegido
      const g = ctx.createRadialGradient(B.x, B.y, 0, B.x, B.y, HEX * 1.1);
      g.addColorStop(0, `rgba(255,240,200,${0.7 * f.impacto})`); g.addColorStop(1, 'rgba(255,200,80,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(B.x, B.y, HEX * 1.1, 0, 2 * Math.PI); ctx.fill();
    }
    const arriba = HEX * 1.15;
    if(veP){
      if(f.entero) escudoHumanoTexto(B.x, B.y - arriba, `−${fx.total}`, '#ff7a6a', 1, z, 0.5);
      if(f.partido && fx.queda > 0) escudoHumanoTexto(B.x - HEX * 0.25, B.y - arriba, `−${fx.queda}`, '#ff7a6a', f.numeros, z, 0.42);
    }
    if(f.partido && veP && veG && !poco && f.viaje < 1){   // la esquirla por el lazo, con su número
      const pts = F.lazo(A, B, ahora, HEX * 0.62, 24), p = F.puntoEn(pts, 1 - f.viaje);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, HEX * 0.35);
      g.addColorStop(0, 'rgba(255,250,220,0.95)'); g.addColorStop(0.5, 'rgba(255,200,80,0.7)'); g.addColorStop(1, 'rgba(255,180,60,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, HEX * 0.35, 0, 2 * Math.PI); ctx.fill();
      escudoHumanoTexto(p.x, p.y - HEX * 0.45, `−${fx.va}`, '#ffd25a', 1, z, 0.38);
    }
    if(veG && (f.pulso !== null || (poco && f.partido))){   // el pulso dorado en el guardián
      const k = f.pulso === null ? 0.5 : f.pulso;
      if(!poco){ ctx.beginPath(); ctx.arc(A.x, A.y, HEX * (0.6 + 0.6 * k), 0, 2 * Math.PI); ctx.strokeStyle = `rgba(255,200,80,${0.85 * (1 - k)})`; ctx.lineWidth = 4 / z; ctx.stroke(); }
      escudoHumanoTexto(A.x, A.y - arriba, `−${fx.va}`, '#ffd25a', f.numeros, z, 0.42);
    }
  }
  // 3. Los lazos que se cortan: dos mitades que se separan y se apagan.
  for(let i = ESCUDO_HUMANO_CORTES.length - 1; i >= 0; i--){
    const c = ESCUDO_HUMANO_CORTES[i], k = (ahora - c.t0) / F.CORTE;
    if(k >= 1){ ESCUDO_HUMANO_CORTES.splice(i, 1); continue; }
    animando = true;
    const pts = F.lazo(c.A, c.B, 0, HEX * 0.62, 24), m = pts.length >> 1, sep = HEX * 0.4 * k;
    ctx.strokeStyle = `rgba(255,214,110,${0.6 * (1 - k)})`; ctx.lineWidth = 2 / z;
    [[pts.slice(0, m - 1), -1], [pts.slice(m + 1), 1]].forEach(([tramo, s]) => {
      if(tramo.length < 2) return;
      const dx = (c.B.x - c.A.x), dy = (c.B.y - c.A.y), l = Math.hypot(dx, dy) || 1, ox = dx / l * sep * s, oy = dy / l * sep * s + sep * 0.6;
      ctx.beginPath(); ctx.moveTo(tramo[0].x + ox, tramo[0].y + oy); tramo.slice(1).forEach(p => ctx.lineTo(p.x + ox, p.y + oy)); ctx.stroke();
    });
  }
  ctx.restore();
  return animando;
}
