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
