/* 🪱 La Sanguijuela en el mapa (2026-11-14, dueño; docs/cola-de-pruebas.md, «Sanguijuela: muerde de nuevo al empezar el turno»).
   1. La mordida al empezar el turno: al empezar el turno de quien la tiene pegada, la pantalla que lo maneja (js/54, soltarAlEmpezarRevisar) avisa
      «tenés una sanguijuela» y abre el daño en el cuadro del duelo de siempre: 1d6 que tira QUIEN LA LANZÓ con su botón (el GM por un creep, o por
      quien no está), daño siniestro DIRECTO (no lo frena la Defensa especial; sí la Res. siniestro), sin Herida sombría, y quien la lanzó se cura la
      mitad de lo que entró, para arriba (`drena` del duelo). Recién después, el intento de arrancarla (el cartel de siempre de js/54).
      Si quien la lanzó ya no está en el mapa (o está caído), no muerde: queda una línea en la Mesa.
   2. La sanguijuela dibujada sobre el token mientras está pegada: un gusanito que late despacio (se hincha y se deshincha, con un poco de rojo que le
      pasa por el cuerpo); cuando chupa (la animación de la Transfusión sale de ese token, js/92), un latido fuerte; al arrancarla o vencerse, se
      suelta y cae.
   3. La cura que se lleva (Regeneración, una poción, la cura de un aliado): la animación de la Transfusión del que la tiene al que la lanzó, y a
      quien maneja al que la tiene, el aviso claro de que esa cura no fue para él (cuánto y a quién). */

const esSanguijuelaEst = e => !!e && e.activo !== false && (!!e.robaCura || /^sanguijuela$/i.test(String(e.nombre || '').trim()));
// El token de quien la lanzó: `chupaDe` = 'creep:<fichaId>' | 'pj:<fichaId>'.
function sanguijuelaLanzador(est){
  const ref = String((est && est.chupaDe) || ''), i = ref.indexOf(':');
  if(i < 0) return null;
  const tipo = ref.slice(0, i), fichaId = ref.slice(i + 1);
  for(const [id, t] of tokens) if(t && String(t.fichaId || '') === fichaId && (tipo === 'creep' ? t.tipo === 'creep' : t.tipo !== 'creep')) return {id, t};
  return null;
}
const sanguijuelaCaido = t => { const v = typeof vinculo === 'function' ? vinculo(t) : null; return !!(v && (v.muerto || (v.hp !== undefined && num(v.hp) <= 0) || (v.hpPct !== undefined && num(v.hpPct) <= 0))); };

/* ---------- 1. La mordida ---------- */
const sanguijuelaMordidas = new Set();   // token@paso: una por turno
async function sanguijuelaMorder(victimaId, nombre, est, paso){
  const clave = `${victimaId}@${paso}`;
  if(sanguijuelaMordidas.has(clave)) return null;
  sanguijuelaMordidas.add(clave);
  const tv = tokens.get(victimaId), lz = sanguijuelaLanzador(est), quien = String(est.chupaNombre || (lz && nombreDe(lz.t)) || 'quien la lanzó');
  if(!tv) return null;
  if(!lz || sanguijuelaCaido(lz.t)){
    mesaLinea(`🪱 La Sanguijuela de ${quien} no muerde a ${nombre}: ${lz ? 'está caído' : 'ya no está en el mapa'}.`, 'recordatorio');
    return null;
  }
  // Primero el «▶ Empieza tu turno» de quien la tiene (ahí se ve la Regeneración que se lleva) y lo que quede al centro (el aviso de la cura
  // robada): la mordida espera a que se aplique y se cierre (como mucho 2 min; si nadie lo aplica, muerde igual).
  // (El cartel del inicio tarda unos segundos en aparecer: se espera 6 s y después, mientras esté pendiente o haya algo al centro, sigue esperando;
  // tiene que quedar libre 1,5 s seguidos.)
  await new Promise(r => setTimeout(r, 6000));
  const t0 = Date.now();
  let libre = 0;
  while(Date.now() - t0 < 120000 && libre < 1500){
    const ocupado = sanguijuelaInicioPendiente(victimaId) || (AvisoCombate.abierto && AvisoCombate.abierto());
    libre = ocupado ? 0 : libre + 500;
    await new Promise(r => setTimeout(r, 500));
  }
  // La Crónica para los demás (en esta pantalla no: la mordida se ve directo en el cuadro del duelo — 2026-11-14, dueño: «la mordida va directo al
  // cuadro del duelo, sin aviso chico antes»; antes salían un aviso al centro «tenés una sanguijuela» y la tarjeta).
  try{ momentoAbrir({tipo: 'sanguijuela', icono: '🪱', titulo: `La Sanguijuela de ${quien} muerde a ${nombre}`, estado: 'listo',
    resultado: `Empieza su turno con la sanguijuela pegada: ${quien} tira 1d6 de daño siniestro directo y se cura la mitad de lo que entre.`, datos: {centro: true}}); }catch(e){}
  sanguijuelaLatido(victimaId);
  const r = await danoDuelo({yo: {...yoDeToken(lz.id), nombre: quien}, deTokenId: lz.id, aTokenId: victimaId, nombre: `🪱 La sanguijuela muerde a ${nombre}`.slice(0, 60), formula: '1d6',
    tipo: 'siniestro', directo: true, esperar: true, danoExtra: {sinIdentidad: true, drena: true, drenaPct: 50}}).catch(err => { console.error('Sanguijuela: no se pudo abrir la mordida', err); return null; });
  // El «¿se suelta?» (js/54) recién cuando se cierra el cuadro de la mordida (2026-11-14, dueño: salía encima del cuadro todavía abierto).
  await sanguijuelaEsperarAviso(180000, true);
  return r;
}

// ¿Su «▶ Empieza tu turno» sigue esperando que lo apliquen? (js/04, el momento `inicio-turno`)
const sanguijuelaInicioPendiente = id => typeof momentosFeed !== 'undefined' && [...momentosFeed.values()].some(x => x && x.d && x.d.tipo === 'inicio-turno' && x.d.estado === 'esperando' && x.d.datos && x.d.datos.tokenId === id);
// Espera a que no haya un aviso al centro abierto en esta pantalla (AvisoCombate.mostrar reemplaza al que esté: no hay que pisar a otro).
// `sinDuelo`: además, que no esté abierto el cuadro del duelo (el aviso de la cura robada sale después de la mordida, no encima).
function sanguijuelaEsperarAviso(max, sinDuelo){
  const t0 = Date.now();
  const ocupado = () => (AvisoCombate.abierto && AvisoCombate.abierto()) || (sinDuelo && typeof Duelo !== 'undefined' && Duelo.abiertoId && Duelo.abiertoId());
  return new Promise(fin => { let libre = 0; const mirar = () => { libre = ocupado() ? 0 : libre + 500; if(libre >= 1000 || Date.now() - t0 > max) fin(); else setTimeout(mirar, 500); }; mirar(); });
}

/* ---------- 2. El dibujo ---------- */
const sanguijuelaVista = new Map(), sanguijuelaCaidas = new Map(), sanguijuelaLatidos = new Map();
const SANG_CAIDA_MS = 1500, SANG_LATIDO_MS = 1800;
const sanguijuelaTiene = est => !!(est && Array.isArray(est.estados) && est.estados.some(esSanguijuelaEst));
function sanguijuelaLatido(id){ if(id){ sanguijuelaLatidos.set(id, performance.now()); if(typeof pedirDibujo === 'function') pedirDibujo(); } }
function dibujarSanguijuela(x, y, rad, z, semilla, caida, latido){
  const s = performance.now() / 1000 + semilla;
  // Pegada abajo a la derecha del token, en diagonal; al caer, se suelta: baja girando y se apaga.
  let cx = x + rad * 0.42, cy = y + rad * 0.38, ang = -0.75, alfa = 1;
  if(caida !== undefined){ const k = Math.min(1, caida); cy += k * k * rad * 1.6; cx += k * rad * 0.25; ang += k * 2.4; alfa = 1 - k; }
  const largo = rad * 0.85, grueso = rad * 0.14;
  // El latido: lento siempre; fuerte un rato cuando chupa.
  const fuerte = latido !== undefined ? Math.max(0, 1 - latido) : 0;
  const lento = 0.5 + 0.5 * Math.sin(s * 2.4);
  const hincha = 1 + 0.12 * lento + 0.35 * fuerte * (0.5 + 0.5 * Math.sin(s * 14));
  ctx.save();
  ctx.globalAlpha = Math.max(0, alfa);
  ctx.translate(cx, cy); ctx.rotate(ang);
  ctx.shadowColor = 'rgba(160,10,30,.85)'; ctx.shadowBlur = (6 + 10 * fuerte) / z;
  // El cuerpo: segmentos que ondulan; la onda roja corre de la cola a la boca.
  const N = 9;
  for(let i = N - 1; i >= 0; i--){
    const u = i / (N - 1), px = (u - 0.5) * largo, py = Math.sin(s * 3 + u * 5) * grueso * 0.35;
    const ancho = grueso * (0.55 + 0.45 * Math.sin(Math.PI * u)) * hincha;
    const onda = Math.pow(Math.max(0, Math.sin(s * 2.6 - u * 6)), 3), rojo = Math.min(1, 0.1 + 0.75 * onda + 0.55 * fuerte);   // el cuerpo oscuro; la sangre que pasa, roja
    ctx.fillStyle = `rgb(${Math.round(34 + 170 * rojo)},${Math.round(26 + 4 * rojo)},${Math.round(24 + 16 * rojo)})`;
    ctx.beginPath(); ctx.ellipse(px, py, ancho * 0.75, ancho, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.shadowBlur = 0;
  // La ventosa (la boca, hacia el token) y los anillitos del lomo.
  const bx = -largo * 0.5, by = Math.sin(s * 3) * grueso * 0.35;
  ctx.fillStyle = '#2a0b10'; ctx.beginPath(); ctx.arc(bx, by, grueso * 0.42 * hincha, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,170,170,.35)'; ctx.lineWidth = Math.max(0.5 / z, grueso * 0.08);
  for(let i = 2; i < N - 1; i += 2){ const u = i / (N - 1), px = (u - 0.5) * largo, py = Math.sin(s * 3 + u * 5) * grueso * 0.35; ctx.beginPath(); ctx.arc(px, py, grueso * 0.6 * hincha, -1.2, 1.2); ctx.stroke(); }
  // Una gotita que se escurre al chupar fuerte.
  if(fuerte > 0.2){ ctx.fillStyle = `rgba(200,20,40,${fuerte})`; ctx.beginPath(); ctx.arc(bx - grueso * 0.2, by + grueso * (0.6 + 1.4 * (1 - fuerte)), grueso * 0.22, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
// Lo llama js/05 por cada token. → true si hay que seguir animando.
function sanguijuelaDibujarToken(id, est, x, y, rad, z){
  if(!est) return false;
  const tiene = sanguijuelaTiene(est), antes = sanguijuelaVista.get(id);
  if(antes && !tiene) sanguijuelaCaidas.set(id, {desde: performance.now(), t0: null});   // cae recién cuando no la tapa nada (el cuadro del duelo, un aviso)
  sanguijuelaVista.set(id, tiene);
  const l0 = sanguijuelaLatidos.get(id), lat = l0 !== undefined ? (performance.now() - l0) / SANG_LATIDO_MS : undefined;
  if(lat !== undefined && lat >= 1) sanguijuelaLatidos.delete(id);
  if(tiene){ sanguijuelaCaidas.delete(id); dibujarSanguijuela(x, y, rad, z, semillaDe(id), undefined, lat !== undefined && lat < 1 ? lat : undefined); return true; }
  const c = sanguijuelaCaidas.get(id);
  if(c === undefined) return false;
  if(c.t0 === null){
    const tapado = (typeof Duelo !== 'undefined' && Duelo.abiertoId && Duelo.abiertoId()) || (AvisoCombate.abierto && AvisoCombate.abierto());
    if(tapado && performance.now() - c.desde < 25000){ dibujarSanguijuela(x, y, rad, z, semillaDe(id)); return true; }   // sigue pegada mientras tanto
    c.t0 = performance.now();
  }
  const k = (performance.now() - c.t0) / SANG_CAIDA_MS;
  if(k >= 1){ sanguijuelaCaidas.delete(id); return false; }
  dibujarSanguijuela(x, y, rad, z, semillaDe(id), k);
  return true;
}

/* ---------- 3. La cura que se lleva ---------- */
// El que la tiene: el token con una Sanguijuela de ese lanzador (y, si hay varios, el del nombre).
function sanguijuelaPortador(est, quien){
  const de = String((est && est.chupaDe) || ''), cand = [];
  tokens.forEach((t, id) => {
    const v = typeof confusionEstadosDe === 'function' ? confusionEstadosDe(t) : [];
    if(v.some(e => esSanguijuelaEst(e) && String(e.chupaDe || '') === de)) cand.push({id, t});
  });
  return cand.find(c => quien && nombreDe(c.t) === quien) || cand[0] || null;
}
const manejoEsteToken = t => !!t && (t.tipo === 'creep' ? !!soyGM : (() => {
  const f = fichasPub.get(String(t.fichaId || '').split(SEP_INVOCACION)[0]), ctrl = f && f.resumen && f.resumen.control;
  return !!(fbUsuario && ((ctrl && ctrl === fbUsuario.uid) || (!ctrl && (t.duenoUid === fbUsuario.uid || (f && f.duenoUid === fbUsuario.uid)))));
})());
if(typeof EstadosAplicar !== 'undefined' && EstadosAplicar.curaRobadaEnviar && !EstadosAplicar.curaRobadaEnviar.__mapa){
  const curaRobadaOriginal = EstadosAplicar.curaRobadaEnviar;
  // `fuente` (opcional): de dónde venía la cura («tu Regeneración»), para el aviso.
  // `o.inicioTurno` (2026-11-14): viene del «Empieza tu turno», que ya lo dice en un renglón → en esta pantalla, sin aviso al centro ni tarjeta (solo la
  // animación); para los demás, la tarjeta de siempre.
  EstadosAplicar.curaRobadaEnviar = function(robo, quien, fuente, o){
    const txt = curaRobadaOriginal(robo, quien);
    const deInicio = !!(o && o.inicioTurno);
    try{
      if(robo && robo.estado && num(robo.monto) > 0 && !EstadosAplicar.lanzadorPerdido(robo.estado)){
        const p = sanguijuelaPortador(robo.estado, quien), lz = sanguijuelaLanzador(robo.estado);
        const de = String(robo.estado.chupaNombre || (lz && nombreDe(lz.t)) || 'quien te la puso');
        if(p && lz && typeof transfusionFxPublicar === 'function')
          transfusionFxPublicar(p.id, lz.id, `La Sanguijuela le lleva la cura de ${nombreDe(p.t)} a ${de}`, `${fuente ? fuente.charAt(0).toUpperCase() + fuente.slice(1) + ': ' : ''}+${fmt(num(robo.monto))} de vida para ${de}`, {sinTarjetaAca: deInicio});
        if(p && p.t.tipo !== 'creep' && manejoEsteToken(p.t) && !deInicio){
          const que = fuente || 'la cura';
          sanguijuelaEsperarAviso(60000, true).then(() => AvisoCombate.mostrar({clave: 'sang-robada-' + Date.now(), icono: '🪱', titulo: `${nombreDe(p.t)}: la cura no fue para vos`,
            texto: `${que.charAt(0).toUpperCase() + que.slice(1)} (+${fmt(num(robo.monto))}) no te curó a vos: se la llevó ${de} con su Sanguijuela. Mientras la tengas pegada, toda cura que recibas se la lleva ${de}.`,
            veredicto: {tono: 'malo', grande: `🪱 −${fmt(num(robo.monto))}`, chico: `se la lleva ${de}`}, botones: [{texto: 'Entendido', alClic: () => AvisoCombate.cerrar()}]}));
        }
      }
    }catch(err){ console.error('Sanguijuela: el aviso de la cura robada', err); }
    return txt;
  };
  EstadosAplicar.curaRobadaEnviar.__mapa = true;
}
