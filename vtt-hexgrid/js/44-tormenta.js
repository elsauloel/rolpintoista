/* 🌩 TORMENTA ARCANA (Mago, 2026-10-13, dueño; docs/clases-borrador.md). Un área (flor de diámetro 5) sin tirada: al lanzarla se tiran los
   proyectiles (1d20) y cada uno cae al azar sobre uno de los que están adentro —rivales y aliados, menos quien la lanza y los caídos—. Cada
   sub-duelo de la cascada arranca en el dodge roll (`hab.soloDodge`, comun/duelo.js): quien logra salir no recibe nada; quien sigue adentro
   recibe sus proyectiles (k × 1d4), daño arcano directo a la vida (ni Defensa ni Defensa especial). A quien no le tocó ninguno no se le abre
   duelo. El reparto se cuenta en la Mesa al lanzarla. */
function tormentaRepartir(hab, objetivos){
  const t = hab.tormenta || {}, r = typeof tirarDados === 'function' ? tirarDados(t.proyectiles || '1d20') : null;
  const total = Math.max(0, Math.round(num(r && r.total)));
  const cuenta = {};
  for(let i = 0; i < total; i++){ const id = objetivos[Math.floor(Math.random() * objetivos.length)]; cuenta[id] = (cuenta[id] || 0) + 1; }
  const con = objetivos.filter(id => cuenta[id] > 0);
  const reparto = objetivos.map(id => `${nombreDe(tokens.get(id))} ${cuenta[id] || 0}`).join(' · ');
  mesaLinea(`🌩 ${hab.nombre}: caen ${total} proyectiles (${t.proyectiles || '1d20'}${r ? ` → ${(r.rolls || []).join('+')}` : ''}) — ${reparto}. Cada uno puede salir del área con un dodge roll.`, 'recordatorio');
  if(!con.length) toast(`${hab.nombre}: no cayó ningún proyectil`);
  return {hab: {...hab, tormenta: {...t, cuenta, total}}, objetivos: con};
}
// El daño de un objetivo: sus proyectiles (k × «cada»), directo a la vida.
function tormentaHabDe(hab, tokenId){
  if(!hab || !hab.tormenta || !hab.tormenta.cuenta) return hab;
  // (2026-10-26, la versión creep: «1d4+1» por proyectil → k d4 + k)
  const k = Math.max(0, Math.round(num(hab.tormenta.cuenta[tokenId]))), m = String(hab.tormenta.cada || '1d4').match(/(\d*)d(\d+)(?:\s*\+\s*(\d+))?/i);
  const fijo = m && m[3] ? k * num(m[3]) : 0;
  const formula = m ? `${k * (num(m[1]) || 1)}d${m[2]}${fijo > 0 ? '+' + fijo : ''}` : `${k}d4`;
  return {...hab, dano: {...(hab.dano || {}), formula, tipo: 'arcano', ignoraDef: true, directo: true}};
}
