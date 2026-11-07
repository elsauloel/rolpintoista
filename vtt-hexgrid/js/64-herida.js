/* ---------- 🩸 Sal en la herida / Morder la herida (2026-10-21, dueño; choque liviano, «abrir la herida») ----------
   Un ataque «con tu arma» con `abrirHerida` (Combatiente.ataqueConArreglos → `ataque.abrirHerida`). Dueño: «si no está sangrando, provoca
   sangrado; y si está sangrando, hace más daño y amplifica el sangrado». Al elegir el objetivo (dueloElegirObjetivoMapa, js/13, después de la
   puñalada): si el objetivo ya sangra, +2 dados del Tipo de su arma (Mesa y Crónica). Si pega, deja Sangrado (lo de la Ejecución): si no sangraba,
   empieza a sangrar; si ya sangraba, le sube 1 el daño por turno (así se acumula el Sangrado). */
const HERIDA_DADOS = 2;
// Los estados del objetivo: un creep (la ficha privada si es el GM; si no, lo público), una invocación o un personaje (su resumen).
async function heridaEstados(t){
  if(t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); if(sc) return sc.estados || []; const p = creepsPub.get(t.fichaId); return (p && p.resumen && p.resumen.estados) || []; }
  if(String(t.fichaId || '').includes(SEP_INVOCACION)){ const inv = await invDeToken(t); return (inv && inv.estados) || []; }
  const f = fichasPub.get(t.fichaId);
  return (f && f.resumen && f.resumen.estados) || [];
}
// El ataque con los dados de más si ya sangra; si no, el mismo (va a hacerlo sangrar).
async function heridaBonos(mio, t, ataque, yo){
  if(!ataque || !ataque.abrirHerida || !t) return ataque;
  const sangra = (await heridaEstados(t)).some(e => e && e.activo !== false && (e.esSangrado || e.nombre === 'Sangrado'));
  if(!sangra) return ataque;
  const nom = (yo && yo.nombre) || (mio ? nombreDe(mio) : 'Alguien'), hab = ataque.habNombre || 'Sal en la herida', quien = t.oculto ? 'alguien' : nombreDe(t);
  const a = structuredClone(ataque);
  a.mods = {...(a.mods || {}), dados: Math.max(0, Math.round(num(a.mods && a.mods.dados))) + HERIDA_DADOS};
  const txt = `${hab} de ${nom}: ${quien} ya sangra → +${HERIDA_DADOS} dados de su arma y, si pega, el sangrado sube`;
  try{ mesaLinea(`🩸 ${txt}`, 'recordatorio'); }catch(err){}
  try{ momentoAbrir({tipo: 'herida', icono: '🩸', titulo: txt, estado: 'listo', datos: {chico: true}}); }catch(err){}
  return a;
}
