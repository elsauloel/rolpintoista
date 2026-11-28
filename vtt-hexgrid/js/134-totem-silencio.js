// js/134-totem-silencio.js — 🤐 El aura del Tótem de silencio pone el estado Silencio de verdad (2026-11-24, dueño: «técnicamente mientras estás en
// el efecto, sí te tiene que aparecer el estado de silencio. Y cuando te vas, se te va el estado de silencio. Entonces ahí también se resuelve lo de la
// inmunidad del control mental»).
/* Cómo anda:
   - A los rivales de quien clavó el tótem (js/73: un tótem de un creep silencia a los personajes y sus invocaciones) que están adentro del aura de un
     tótem en pie, el estado «Silencio» de siempre (el del glosario, comun/estados-presets.js), marcado `totemSilencio` y con `permanente` + `hasta`
     = TOTEM_HASTA: no vence por turnos y el globo del iconito dice «mientras esté en el aura del tótem» (Combatiente.hastaTxt).
   - Al salir del aura, o cuando el tótem se rompe, se borra o se va porque quien lo clavó clavó otro (ya no hay tótem en pie que lo cubra), se le
     saca. Solo ese: un Silencio que tenía por otra cosa (una Runa, un golpe) no se toca.
   - Si ya tenía un Silencio por otra cosa al entrar, no se le pone otro (ya está silenciado); si ese se vence estando adentro, entra el del tótem.
     (Los dos no pueden convivir: un Silencio nuevo renueva al que hay, Combatiente.agregarEstado. Si le cae una Runa estando adentro, queda la de la
     Runa —con sus turnos— y al salir no se toca.) Duda anotada: P319.
   - Lo que frena al estado lo frena igual (Combatiente.inmunidad: Inmunidad mental, Inmunidad a CC, Invulnerable): no le entra, sale el cartel
     «INMUNE A SILENCIO» (js/121) y una línea en la Mesa, una vez por entrada al aura.
   - Quién lo pone y lo saca: UNA sola pantalla por token (`totemSilManejo`): un creep, la del GM; un personaje o una invocación, la de quien lo
     maneja (🎮 el control, o su dueño: bnManejo). Con dos pantallas abiertas (GM y jugador) no se pone dos veces; además, quien escribe vuelve a
     mirar adentro de la ficha antes de ponerlo.
   - El aviso al usar una habilidad de SP es el del estado Silencio de siempre (Combatiente.preguntaSilencio: avisa y deja seguir si la mesa lo
     decide). `silencioDeLugar` (js/73) queda de respaldo mientras el estado no llegó, y no le avisa a quien es inmune. */

const TOTEM_HASTA = 'mientras esté en el aura del tótem';
const TOTEM_SIL_ESPERA_MS = 6000;   // un pedido en curso (o recién hecho) no se repite hasta que lo publicado se ponga al día
const totemSilPend = new Map();     // tokenId → hora del último pedido
const totemSilInmuneVisto = new Map();   // tokenId → true: ya se avisó que es inmune (hasta que salga del aura)
const totemSilDesde = Date.now();

const totemSilEsSilencio = e => !!e && e.activo !== false && (!!e.silencio || /^silencio$/i.test(String(e.nombre || '').trim()));
// ¿Es el Silencio que puso un tótem? (la ficha privada lleva la marca; lo público, el «mientras…»)
const totemSilEsDelTotem = e => totemSilEsSilencio(e) && (!!e.totemSilencio || String(e.hasta || '').trim() === TOTEM_HASTA);

// ¿Lo cubre el aura de un tótem rival en pie? → el nombre del tótem, o ''.
function totemSilQueCubre(t){
  if(!t || !t.fichaId || t.bajoTierra || (typeof esInerte === 'function' && esInerte(t))) return '';
  let nom = '';
  tokens.forEach((x, id) => {
    if(nom || x === t) return;
    const e = typeof estandarteInfo === 'function' ? estandarteInfo(x) : null;
    if(!e || !e.silencio || x.tipo === t.tipo || !estandarteEnPie(id, x)) return;
    if(distanciaHex({col: x.col, fila: x.fila}, {col: t.col, fila: t.fila}) <= e.radio) nom = (vinculo(x) || {}).nombre || x.nombre || 'el tótem de silencio';
  });
  return nom;
}
// Los estados con sus marcas (lo público trae solo el nombre: las marcas salen del preset con ese nombre).
function totemSilConMarcas(lista){
  return (lista || []).filter(Boolean).map(e => ({...((typeof EstadosAplicar !== 'undefined' && EstadosAplicar.presetPorNombre(e.nombre)) || {}), ...e}));
}
function totemSilNuevo(){
  const p = typeof EstadosAplicar !== 'undefined' ? EstadosAplicar.presetPorNombre('Silencio') : null;
  return {...(p || {silencio: true, esCC: true}), nombre: 'Silencio', polaridad: 'debuff'};
}
// ¿Le puede entrar el Silencio? (no, si lo frena una inmunidad). `lista`: sus estados; sin lista, los que ve esta pantalla.
function totemSilInmunidad(t, lista){
  const est = totemSilConMarcas(lista || (typeof confusionEstadosDe === 'function' ? confusionEstadosDe(t) : []));
  return Combatiente.inmunidad(est, totemSilNuevo()) || '';
}
function totemSilPuedeEntrar(t){ try{ return !totemSilInmunidad(t); }catch(err){ return true; } }
// Una sola pantalla por token: un creep, el GM; un personaje o una invocación, quien lo maneja (el control o su dueño).
function totemSilManejo(t){
  if(!t || !t.fichaId || !fbUsuario) return false;
  if(t.tipo === 'creep') return !!soyGM;
  return typeof bnManejo === 'function' && bnManejo(String(t.fichaId).split(SEP_INVOCACION)[0]);
}
function totemSilHayTotem(t){
  let hay = false;
  tokens.forEach((x, id) => { const e = !hay && typeof estandarteInfo === 'function' ? estandarteInfo(x) : null; if(e && e.silencio && x.tipo !== t.tipo && estandarteEnPie(id, x)) hay = true; });
  return hay;
}
function totemSilContar(t, txt){
  if(t.oculto){ toast(txt); return; }
  try{ mesaLinea(txt, 'recordatorio'); }catch(err){}
}

// Ponérselo (adentro vuelve a mirar: si ya tiene un Silencio o es inmune, no). → 'puesto' | 'ya' | 'inmune:<motivo>' | ''
async function totemSilPoner(id, t, nom){
  const spec = {nombre: 'Silencio', permanente: true, hasta: TOTEM_HASTA, turnos: 0};
  const quien = nombreDe(t);
  let res = '';
  if(t.tipo === 'creep'){
    await modificarCreep(t.fichaId, sc => {
      sc.estados = Array.isArray(sc.estados) ? sc.estados : [];
      if(sc.estados.some(totemSilEsSilencio)){ res = 'ya'; return; }
      const inm = Combatiente.inmunidad(sc.estados, totemSilNuevo());
      if(inm){ res = 'inmune:' + inm; return; }
      EstadosAplicar.aplicarACreep(sc, spec);
      const e = sc.estados.find(x => x && x.nombre === 'Silencio' && String(x.hasta || '') === TOTEM_HASTA);
      if(e){ e.totemSilencio = true; e.turnos = 0; res = 'puesto'; }
    });
  }else{
    const [base, invId] = String(t.fichaId).split(SEP_INVOCACION);
    await editarPersonajeMapa(base, S => {
      let lista;
      if(invId){
        const inv = (S.invocaciones || []).find(x => x && x.id === invId);
        if(!inv) return false;
        inv.estados = Array.isArray(inv.estados) ? inv.estados : [];
        lista = inv.estados;
      }else{ S.efectos = Array.isArray(S.efectos) ? S.efectos : []; lista = S.efectos; }
      if(lista.some(totemSilEsSilencio)){ res = 'ya'; return false; }
      const todos = !invId && typeof FichaResumen !== 'undefined' ? FichaResumen.estadosTodos(S) : lista;   // (también lo que dan las pasivas y el equipo)
      const inm = Combatiente.inmunidad(totemSilConMarcas(todos), totemSilNuevo());
      if(inm){ res = 'inmune:' + inm; return false; }
      const nuevo = FichaAcciones.estadoDeSpec(spec, typeof estadosPresetFicha === 'function' ? estadosPresetFicha() : []);
      nuevo.totemSilencio = true; nuevo.turnos = 0;
      const r = Combatiente.agregarEstado(lista, nuevo, {nombre: quien, ref: t.fichaId});
      if(r && r.ok){ res = 'puesto'; return true; }
      res = r && r.motivo ? 'inmune:' + r.motivo : '';
      return false;
    });
  }
  if(res === 'puesto') totemSilContar(t, `🤐 ${quien} entró al aura de ${nom}: queda en Silencio mientras esté adentro (no puede usar habilidades que cuestan SP)`);
  return res;
}
// Sacárselo (solo el del tótem). → true si lo tenía.
async function totemSilSacar(id, t, motivo){
  let hubo = false;
  const filtrar = lista => { const q = (lista || []).filter(e => !totemSilEsDelTotem(e)); hubo = q.length !== (lista || []).length; return q; };
  if(t.tipo === 'creep') await modificarCreep(t.fichaId, sc => { sc.estados = filtrar(sc.estados); });
  else{
    const [base, invId] = String(t.fichaId).split(SEP_INVOCACION);
    await editarPersonajeMapa(base, S => {
      if(invId){ const inv = (S.invocaciones || []).find(x => x && x.id === invId); if(!inv) return false; inv.estados = filtrar(inv.estados); }
      else S.efectos = filtrar(S.efectos);
      return hubo;
    });
  }
  if(hubo) totemSilContar(t, motivo === 'sinTotem' ? `🤐 ${nombreDe(t)}: el tótem de silencio ya no está, se le va el Silencio`
    : `🤐 ${nombreDe(t)} salió del aura del tótem: se le va el Silencio`);
  return hubo;
}

async function totemSilUno(id, t){
  const est = typeof confusionEstadosDe === 'function' ? confusionEstadosDe(t) : [];
  const delTotem = est.some(totemSilEsDelTotem);
  const otro = est.some(e => totemSilEsSilencio(e) && !totemSilEsDelTotem(e));
  const nom = totemSilQueCubre(t);
  if(!nom) totemSilInmuneVisto.delete(id);
  const quiere = !!nom && !otro;
  if(quiere === delTotem) return;
  const ahora = Date.now();
  if(ahora - num(totemSilPend.get(id)) < TOTEM_SIL_ESPERA_MS) return;
  if(quiere){
    const inm = totemSilInmunidad(t, est);
    if(inm){
      if(totemSilInmuneVisto.get(id)) return;
      totemSilInmuneVisto.set(id, true);
      try{ Combatiente.avisoInmune({motivo: inm, estado: 'Silencio', quien: nombreDe(t), id: t.tipo === 'creep' ? t.fichaId : '', ref: t.tipo === 'creep' ? '' : t.fichaId}); }catch(err){}
      totemSilContar(t, `🛡 ${nombreDe(t)} entró al aura de ${nom}, pero el Silencio no le entra (${inm})`);
      return;
    }
    totemSilPend.set(id, ahora);
    const r = await totemSilPoner(id, t, nom);
    if(r.startsWith('inmune:') && !totemSilInmuneVisto.get(id)){   // (lo que da el equipo o una pasiva y lo público no dice)
      totemSilInmuneVisto.set(id, true);
      totemSilContar(t, `🛡 ${nombreDe(t)} entró al aura de ${nom}, pero el Silencio no le entra (${r.slice(7)})`);
    }
  }else if(delTotem){
    totemSilPend.set(id, ahora);
    await totemSilSacar(id, t, totemSilHayTotem(t) ? 'salio' : 'sinTotem');
  }
}
let totemSilCorriendo = false;
async function totemSilRevisar(){
  if(totemSilCorriendo || !fbUsuario || typeof tokens === 'undefined' || !tokens.size) return;
  if(Date.now() - totemSilDesde < 5000) return;   // que lleguen primero los tokens, las fichas y los creeps
  totemSilCorriendo = true;
  try{
    for(const [id, t] of [...tokens.entries()]){
      if(!totemSilManejo(t)) continue;
      try{ await totemSilUno(id, t); }catch(err){ console.error('El Silencio del tótem:', err); }
    }
  }finally{ totemSilCorriendo = false; }
}
setInterval(() => { totemSilRevisar().catch(err => console.error('El Silencio del tótem:', err)); }, 1000);
