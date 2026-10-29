/* =========================================================
   🌀 TOWN PORTAL (2026-10-29, decisiones del dueño)
   «El item "town portal", que te permite viajar a la última aldea con tienda que visitaron, debe estar entre los objetos esenciales de la góndola
   de consumibles, de costo sugiero 50» · «sólo debe dejar un "portal" en un hexágono, con una animación de espiral azul galáctico que gira…
   cualquier token que lo tira desaparece. Después el moverse al mapa de la aldea será realizado a mano» · «no es una trampa, queda visible» ·
   «mayormente va a usarse fuera de combate pero dejarlo disponible en combate por si acaso».
   El consumible (`townPortal` en el ítem; FichaAcciones.consumir → ui.townPortal) pide una casilla al lado de tu token; si se cancela, no se
   gasta. El elemento lleva `townPortal: true`: lo ven todos, no es una trampa (no se dispara ni se gasta) y queda hasta que el GM lo borra.
   La pisada la revisa la pantalla que mueve el token (moverToken, js/07): el token se va del mapa (su ficha, su creep o su invocación quedan
   intactos; el GM lo pone en el mapa de la aldea con «Traer tokens de jugadores» o «+ Token»). Al entrar alguien, los pulsos en todas las
   pantallas (`usoEn`, como los portales del Mago).
   ========================================================= */
function townPortalColocar(msg){   // → Promise<bool>: true si quedó colocado
  return new Promise(resolve => {
    const e = [...tokens.entries()].find(([, x]) => x.fichaId === msg.fichaId && x.tipo === (msg.tipoToken === 'creep' ? 'creep' : 'pj'));
    if(!e){ toast(`${msg.nombre || 'Town portal'}: tu personaje no tiene token en este mapa`); resolve(false); return; }
    const t = e[1];
    if(!$('#botonera-capa').hidden) escapeABotonera();
    const pedir = () => elegirDestino(async h => {
      if(distanciaHex(h, t) !== 1){ toast('El portal se abre en una casilla al lado tuyo'); pedir(); return; }
      if(elementoSolidoEn(h.col, h.fila)){ toast('Ahí hay algo sólido: elegí otra casilla'); pedir(); return; }
      try{
        await coleccionElementos().add({
          tipo: 'flor', origen: {col: h.col, fila: h.fila}, celdas: [0, 0], rotacion: 0, color: '#3D7BFF', alfa: 0, solido: false, invisible: false,
          imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: true, townPortal: true,
          zonaCasteadorRef: String(msg.fichaId).slice(0, 64), zonaCasteadorTipo: msg.tipoToken === 'creep' ? 'creep' : 'pj',
          duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
        });
        const nom = nombreDe(t);
        await fbDb.collection(fbRutaCampana('tiradas')).add({uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: nom, origen: `🌀 ${nom} abrió un Town portal`,
          formula: 'quien entre desaparece del mapa; el GM lo lleva a la última aldea con tienda', rolls: [], mod: 0, total: 0, desde: 'recordatorio',
          cuando: firebase.firestore.FieldValue.serverTimestamp()});
        momentoAbrir({tipo: 'town-portal', icono: '🌀', titulo: `${nom} abrió un Town portal`, resultado: 'Quien lo pise desaparece del mapa. El GM lo lleva a la última aldea con tienda que visitaron.', estado: 'listo'});
        resolve(true);
      }catch(err){
        console.error('No se pudo abrir el Town portal:', err);
        toast(err && err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (el Town portal)' : 'No se pudo abrir el Town portal');
        resolve(false);
      }
    }, `<b>🌀 ${esc(msg.nombre || 'Town portal')}: elegí la casilla del portal</b> <span>clic en una casilla al lado de tu token · Esc o clic derecho cancelan (no se gasta)</span>`,
    false, () => resolve(false));
    pedir();
  });
}

// El dibujo: una espiral galáctica azul que gira, con su núcleo brillante y unas estrellitas. Lo llama js/05 en vez del relleno de la casilla.
const TOWN_PORTAL_ESTRELLAS = Array.from({length: 26}, (_, i) => ({brazo: i % 3, f: ((i * 37) % 26) / 26, off: ((i * 53) % 11) / 11 - 0.5, tit: (i * 0.71) % 6.28}));
function townPortalDibujar(el, z){
  const c = celdasDeElemento(el)[0];
  if(!c) return;
  const p = hexCentro(c.col, c.fila), R = HEX * 0.8, seg = performance.now() / 1000, giro = seg * 1.5;
  ctx.save();
  const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
  halo.addColorStop(0, 'rgba(225,240,255,.95)'); halo.addColorStop(0.15, 'rgba(110,165,255,.85)');
  halo.addColorStop(0.55, 'rgba(35,70,200,.5)'); halo.addColorStop(1, 'rgba(10,20,90,0)');
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2); ctx.fill();
  ctx.translate(p.x, p.y); ctx.rotate(-giro);
  // Tres brazos de espiral que se afinan y se apagan hacia afuera.
  const N = 36, vuelta = 3.6, punto = (b, f, off) => { const r = R * (0.07 + 0.88 * f), a = b * 2 * Math.PI / 3 + f * vuelta + (off || 0); return [Math.cos(a) * r, Math.sin(a) * r]; };
  ctx.lineCap = 'round';
  for(let b = 0; b < 3; b++){
    for(let i = 0; i < N; i++){
      const f = i / N, [x1, y1] = punto(b, f), [x2, y2] = punto(b, (i + 1) / N), a = 1 - f * 0.85;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(60,120,255,${(0.35 * a).toFixed(3)})`; ctx.lineWidth = (9 * (1 - f) + 3) / z; ctx.stroke();
      ctx.strokeStyle = `rgba(175,215,255,${(0.9 * a).toFixed(3)})`; ctx.lineWidth = (3.5 * (1 - f) + 1) / z; ctx.stroke();
    }
  }
  // Estrellitas sobre los brazos, que titilan.
  TOWN_PORTAL_ESTRELLAS.forEach(s => {
    const [x, y] = punto(s.brazo, 0.15 + 0.8 * s.f, s.off * 0.6), brillo = 0.45 + 0.55 * Math.abs(Math.sin(seg * 2.2 + s.tit));
    ctx.beginPath(); ctx.arc(x, y, (1.6 + 1.2 * brillo) / z, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(235,245,255,${brillo.toFixed(3)})`; ctx.fill();
  });
  ctx.rotate(giro);
  // El núcleo, que late, y el borde del portal.
  const late = 0.85 + 0.15 * Math.sin(seg * 3);
  const nucleo = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.24 * late);
  nucleo.addColorStop(0, 'rgba(255,255,255,1)'); nucleo.addColorStop(0.5, 'rgba(170,210,255,.9)'); nucleo.addColorStop(1, 'rgba(80,140,255,0)');
  ctx.fillStyle = nucleo; ctx.beginPath(); ctx.arc(0, 0, R * 0.24 * late, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, R * 0.92, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(120,175,255,.75)'; ctx.lineWidth = 2.5 / z; ctx.stroke();
  ctx.restore();
}
// Mientras haya uno a la vista, el mapa se redibuja para que la espiral gire.
setInterval(() => { try{ for(const el of elementos.values()) if(el && el.townPortal && puedeVerElemento(el)){ pedirDibujo(); return; } }catch(e){} }, 40);

// La pisada (desde moverToken, js/07): cualquier token que pasa por el portal se va del mapa.
const townPortalEntrados = new Set();
async function townPortalRevisar(tokenId, celdas){
  const t = tokens.get(tokenId);
  if(!t || !Array.isArray(celdas) || celdas.length < 2 || townPortalEntrados.has(tokenId)) return;
  const pisadas = new Set(celdas.slice(1).map(c => nbPack(c.col, c.fila)));
  const portal = [...elementos.entries()].find(([, el]) => { const c = el && el.townPortal && celdasDeElemento(el)[0]; return c && pisadas.has(nbPack(c.col, c.fila)); });
  if(!portal) return;
  townPortalEntrados.add(tokenId);
  const nom = nombreDe(t);
  try{ await coleccionElementos().doc(portal[0]).update({usoEn: Date.now()}); }catch(e){}   // los pulsos en todas las pantallas
  await new Promise(r => setTimeout(r, 700));   // que se lo vea llegar al portal antes de desaparecer
  try{
    await coleccionTokens().doc(tokenId).delete();
  }catch(err){
    console.error('Town portal: no se pudo sacar el token', err);
    townPortalEntrados.delete(tokenId);
    toast(`${nom} entró al Town portal: sacalo del mapa a mano`);
    return;
  }
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: nom, origen: `🌀 ${nom} entró al Town portal y desapareció del mapa`,
      formula: 'el GM lo pone en el mapa de la aldea', rolls: [], mod: 0, total: 0, desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp()});
  }catch(e){}
  momentoAbrir({tipo: 'town-portal', icono: '🌀', titulo: `${nom} entró al Town portal`, resultado: 'Desapareció del mapa. El GM lo pone en el mapa de la aldea.', estado: 'listo'});
}
