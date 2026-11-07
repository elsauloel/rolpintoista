/* =========================================================
   ⏩ ACELERADOR (Support, 2026-10-12, decisiones del dueño)
   «Marca una casilla con flechitas para adelante (>>). Cada aliado que la pisa obtiene +2 No2 (máximo una vez por turno). Duración: 10 turnos.»
   1 SP y 1 No2; una casilla dentro de tu Rango (se elige con un clic); los +2 No2 PUEDEN pasar el máximo; la ven todos, pero solo sirve a tu
   equipo. También es un consumible mágico del Bazar arcano (la Runa aceleradora, `aceleradorMapa` en el ítem: FichaAcciones.consumir → ui.acelerador).
   El elemento lleva `acelerador` = los No2 que da, con turnos (los de quien la puso, como los portales: zonasDelQueLaTiro, js/07). Se dibuja como un
   círculo (dueño: «el hexágono, que en realidad debería ser un círculo») con dos flechitas que avanzan hacia donde miraba quien la puso.
   La pisada la revisa la pantalla que mueve el token (moverToken, js/07): una vez por ronda por token (local).
   ========================================================= */
async function aceleradorDeHabilidad(msg){
  const e = [...tokens.entries()].find(([, x]) => x.fichaId === msg.fichaId && x.tipo === (msg.casteadorTipo === 'creep' ? 'creep' : 'pj'));
  if(!e){ toast(`${msg.nombre || 'Acelerador'}: tu personaje no tiene token en el mapa`); return; }
  const t = e[1], rg = rangoDeToken(t), alcance = rg ? Math.floor(num(rg.rng)) : 0;
  if(!$('#botonera-capa').hidden) escapeABotonera();
  const pedir = () => elegirDestino(async h => {
    if(distanciaHex(h, t) > Math.max(1, alcance)){ toast(`Esa casilla queda a más de ${Math.max(1, alcance)} (tu Rango)`); pedir(); return; }
    if(elementoSolidoEn(h.col, h.fila)){ toast('Ahí hay algo sólido: elegí otra casilla'); pedir(); return; }
    const n = Math.max(1, Math.round(num(msg.turnos)) || 10), de = {ref: msg.fichaId, tipo: msg.casteadorTipo === 'creep' ? 'creep' : 'pj'};
    const vence = Math.round(num(mantenimientoNumero)) + n + (colocadorEnOrden(de) ? 1 : 0);
    try{
      await coleccionElementos().add({
        tipo: 'flor', origen: {col: h.col, fila: h.fila}, celdas: [0, 0], rotacion: Math.round(num(t.rotacion)) % 360, color: '#4FE0A0', alfa: 0, solido: false, invisible: false,
        imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: true, turnos: n, venceMant: vence, acelerador: Math.max(1, Math.min(9, Math.round(num(msg.no2)) || 2)),
        zonaCasteadorRef: String(de.ref).slice(0, 64), zonaCasteadorTipo: de.tipo, duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
      });
      momentoAbrir({tipo: 'acelerador', icono: '⏩', titulo: `${nombreDe(t)} marcó un Acelerador`, resultado: `Cada aliado que la pise gana +${Math.round(num(msg.no2)) || 2} No2 (una vez por ronda), durante ${n} turnos.`, estado: 'listo'});
    }catch(err){
      console.error('No se pudo crear el Acelerador:', err);
      toast(err && err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (el Acelerador)' : 'No se pudo crear el Acelerador');
    }
  }, `<b>⏩ ${esc(msg.nombre || 'Acelerador')}: elegí la casilla</b> <span>clic en una casilla dentro de tu Rango (${Math.max(1, alcance)}) · Esc o clic derecho cancelan</span>`);
  pedir();
}

// El dibujo: un círculo verde con dos flechitas que avanzan (hacia donde miraba quien lo puso). Lo llama js/05 en vez del relleno de la casilla.
function aceleradorDibujar(el, z){
  const c = celdasDeElemento(el)[0];
  if(!c) return;
  const p = hexCentro(c.col, c.fila), R = HEX * 0.66, fase = (performance.now() / 900) % 1;
  ctx.save();
  ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(40,190,120,.18)'; ctx.fill();
  ctx.lineWidth = 3 / z; ctx.strokeStyle = 'rgba(90,240,160,.95)'; ctx.stroke();
  ctx.clip();
  ctx.translate(p.x, p.y); ctx.rotate((num(el.rotacion) || 0) * Math.PI / 180);   // 0 = hacia abajo, como el frente de un token
  const paso = R * 0.62, w = R * 0.42, h = R * 0.3;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for(let i = -2; i <= 1; i++){
    const y = (i + fase) * paso, a = Math.max(0, 1 - Math.abs(y) / (R * 0.95));
    if(a <= 0) continue;
    ctx.beginPath(); ctx.moveTo(-w, y - h); ctx.lineTo(0, y); ctx.lineTo(w, y - h);
    ctx.strokeStyle = `rgba(15,40,25,${(0.7 * a).toFixed(3)})`; ctx.lineWidth = 7 / z; ctx.stroke();
    ctx.strokeStyle = `rgba(150,255,195,${a.toFixed(3)})`; ctx.lineWidth = 4 / z; ctx.stroke();
  }
  ctx.restore();
}
// Mientras haya uno a la vista, el mapa se redibuja para que las flechitas avancen.
setInterval(() => { try{ for(const el of elementos.values()) if(el && el.acelerador && puedeVerElemento(el)){ pedirDibujo(); return; } }catch(e){} }, 60);

// La pisada (desde moverToken, js/07): un aliado de quien lo puso que pasa por la casilla gana los No2, una vez por ronda.
const aceleradorUsos = new Set();
async function aceleradorRevisar(tokenId, celdas){
  const t = tokens.get(tokenId);
  if(!t || !Array.isArray(celdas) || celdas.length < 2) return;
  const pisadas = new Set(celdas.slice(1).map(c => nbPack(c.col, c.fila)));
  for(const [id, el] of elementos){
    if(!el || !el.acelerador) continue;
    const c = celdasDeElemento(el)[0];
    if(!c || !pisadas.has(nbPack(c.col, c.fila))) continue;
    const bando = el.zonaCasteadorTipo === 'creep' ? 'creep' : 'pj';
    if((t.tipo === 'creep' ? 'creep' : 'pj') !== bando) continue;   // solo a su equipo
    const clave = `${id}|${tokenId}|${Math.round(num(mantenimientoNumero))}`;
    if(aceleradorUsos.has(clave)) continue;
    aceleradorUsos.add(clave);
    const n = Math.round(num(el.acelerador)) || 2, nom = nombreDe(t);
    try{
      if(t.tipo === 'creep') await modificarCreep(t.fichaId, sc => { sc.nitros = num(sc.nitros) + n; });
      else if(String(t.fichaId).includes(SEP_INVOCACION)){
        const [base, invId] = String(t.fichaId).split(SEP_INVOCACION);
        await editarPersonajeMapa(base, S => { const inv = (S.invocaciones || []).find(i => i && i.id === invId); if(!inv) return false; inv.nitros = num(inv.nitros) + n; return true; });
      }else await editarPersonajeMapa(t.fichaId, S => { S.nitros = num(S.nitros) + n; return true; });
      await fbDb.collection(fbRutaCampana('tiradas')).add({uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: nom, origen: `⏩ ${nom} pasó por un Acelerador`,
        formula: `+${n} No2 (puede pasar su máximo; una vez por ronda)`, rolls: [], mod: 0, total: 0, desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp()});
      momentoAbrir({tipo: 'acelerador', icono: '⏩', titulo: `${nom} pasó por un Acelerador`, resultado: `+${n} No2.`, estado: 'listo'});
    }catch(err){ console.error('Acelerador: no se pudieron dar los No2', err); toast(`Acelerador: sumale +${n} No2 a ${nom} a mano`); }
  }
}
