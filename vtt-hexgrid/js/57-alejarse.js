/* ---------- 💨 Hit and run («picar y alejarse», 2026-10-21, dueño; el choque liviano) ----------
   Un ataque con `alejarse` (la Ejecución «con tu arma»: `duelo.alejarse` → `ataque.alejarse`, lo guarda Duelo.crear): al resolverse el duelo, pegue o no,
   en la pantalla de quien atacó (el hook `disparoResuelto` de js/14) sale el cartel del movimiento libre (el del dodge roll, `dodgeBanner`): se arrastra
   el token hasta N casilleros, gratis y sin ataque de oportunidad (js/06 no cobra los primeros N; js/02 y js/17 no frenan con `dodgeLibreDe`). */
const alejarseAvisados = new Set();
function alejarseResuelto(d){
  const n = Math.round(num(d && d.ataque && d.ataque.alejarse));
  if(!(n > 0) || alejarseAvisados.has(d.id)) return;
  alejarseAvisados.add(d.id);
  const tid = d.atacante && d.atacante.tokenId, t = tid && tokens.get(tid);
  if(!t) return;
  const nombre = d.atacante.nombre || nombreDe(t);
  seleccionar(tid);
  dodgeBanner = {id: 'alejarse-' + d.id, tokenId: tid, nombre, libre: true, alejarse: n};
  renderDodgeBanner();
  mesaLinea(`💨 ${nombre} se aleja: puede moverse hasta ${n} casillero${n === 1 ? '' : 's'}, gratis y sin ataque de oportunidad.`, 'recordatorio');
}

/* ---------- 💨 Bomba de humo (2026-10-26, dueño; choque liviano y el Asalto: «me gusta mucho al punto de que la pondría en la clase también») ----------
   Revienta una bomba a sus pies: la niebla de una varita (crearNiebla, js/13: tapa la vista desde afuera) de `radio` (1 = diámetro 3) por `turnos`; entra
   en Sigilo aunque lo estén mirando (adentro de la niebla solo lo ve el que está pegado: ese lo detecta, como siempre); y el cartel del movimiento libre
   (el del Hit and run): hasta `mover` casilleros, gratis y sin ataques de oportunidad. msg = {fichaId, casteadorTipo, nombre, radio, turnos, mover}. */
async function bombaDeHumo(msg){
  const creep = msg.casteadorTipo === 'creep';
  const e = [...tokens.entries()].find(([, x]) => x.fichaId === msg.fichaId && (x.tipo === 'creep') === creep);
  const nom = msg.nombre || 'Bomba de humo';
  if(!e){ toast(`${nom}: ${creep ? 'el creep' : 'tu personaje'} no tiene token en el mapa`); if(typeof msg.alTerminar === 'function') msg.alTerminar(); return; }
  const [tid, t] = e, quien = nombreDe(t);
  const radio = Math.max(1, Math.round(num(msg.radio)) || 1), turnos = Math.max(1, Math.round(num(msg.turnos)) || 1), mover = Math.max(0, Math.round(num(msg.mover)) || 3);
  await crearNiebla({col: t.col, fila: t.fila}, radio, {nombre: nom, zonaTurnos: turnos});
  let sigilo = '';
  try{
    if(creep){
      if(soyGM){ const r = await modificarCreep(t.fichaId, sc => EstadosAplicar.aplicarACreep(sc, {nombre: 'Sigilo'})); sigilo = r && r.ok === false ? (r.motivo || 'no') : 'ok'; }
    }else{ await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec: {nombre: 'Sigilo'}, origen: nom}); sigilo = 'ok'; }
  }catch(err){ console.error('Bomba de humo: no se pudo poner el Sigilo', err); }
  const sig = sigilo === 'ok' ? 'entra en Sigilo' : sigilo ? `no pudo entrar en Sigilo (${sigilo})` : 'el Sigilo, a mano';
  const txt = `${quien} revienta una bomba de humo (${Combatiente.areaTxt(radio)}, ${turnos} turno${turnos === 1 ? '' : 's'}): ${sig} y puede moverse hasta ${mover} casillero${mover === 1 ? '' : 's'}, gratis y sin ataques de oportunidad.`;
  try{ mesaLinea(`💨 ${txt}`, 'recordatorio'); }catch(err){}
  try{ momentoAbrir({tipo: 'humo', icono: '💨', titulo: `${nom}: ${quien} se esfuma`, resultado: txt, estado: 'listo'}); }catch(err){}
  if(mover > 0){
    seleccionar(tid);
    dodgeBanner = {id: 'humo-' + Date.now(), tokenId: tid, nombre: quien, libre: true, alejarse: mover};
    renderDodgeBanner();
  }
  if(typeof msg.alTerminar === 'function') msg.alTerminar();
}
