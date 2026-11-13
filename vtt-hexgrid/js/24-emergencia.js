// js/24-emergencia.js — Bolsillo de emergencia (cinturón de Buena calidad, 2026-10-06, dueño). Va después del arranque: solo define funciones y un reloj.
/* Quien lleva un cinturón con Bolsillo de emergencia (`emergencia`), al bajar del 25 % de su vida (sin llegar a 0), se toma sola la poción de curación
   que más cura de su cinturón, sin No2 — como el Ankh —, una vez por combate. Cada pantalla mira lo que maneja (sus personajes; el GM, los creeps),
   solo en modo combate: guarda la última vida vista y, cuando cruza el 25 %, la toma (`editarPersonajeMapa` / `modificarCreep`) y lo cuenta en la
   Crónica y en la Mesa (de un creep, sin números de vida). Queda marcado (`emergenciaUsada` en la ficha o el creep) y se libera cuando el mapa
   vuelve a modo narrativo (el combate terminó). La regla (cuándo cruza, qué poción) es del motor: Combatiente.emergenciaCruza / pocionEmergencia. */
const emergenciaVida = new Map();   // tokenId → la última vida vista
const emergenciaTomando = new Set();

async function emergenciaTomar(id, t){
  if(emergenciaTomando.has(id)) return;
  emergenciaTomando.add(id);
  let hecho = null;
  try{
    if(t.tipo === 'creep'){
      await modificarCreep(t.fichaId, sc => {
        if(sc.emergenciaUsada) return;
        const p = Combatiente.pocionEmergencia(sc.cinturon);
        if(!p) return;
        const cura = num(p.curahp) + Math.max(0, num(CreepCalculo.modTotal(sc, 'boticario')));
        sc.hp = Math.min(num(sc.hpMax) > 0 ? num(sc.hpMax) : Infinity, num(sc.hp) + cura);
        p.unidades = num(p.unidades) - 1;
        if(num(p.unidades) <= 0) sc.cinturon = sc.cinturon.filter(x => x !== p);
        sc.emergenciaUsada = true;
        hecho = {pocion: p.nombre, cura};
      });
    }else{
      await editarPersonajeMapa(t.fichaId, S => {
        if(S.emergenciaUsada) return false;
        const p = Combatiente.pocionEmergencia(S.cinturon);
        if(!p) return false;
        const c = FichaCalculo.calcular(S);
        const cura = num(p.curahp) + Math.max(0, num(c.final.boticario));
        FichaAcciones.fijarHp(S, num(S.hp) + cura);
        p.unidades = num(p.unidades) - 1;
        FichaAcciones.purgarSiAgotado(S, 'cinturon', p.id);
        S.emergenciaUsada = true;
        hecho = {pocion: p.nombre, cura};
        return true;
      });
    }
  }catch(err){ console.error('Bolsillo de emergencia:', err); }
  emergenciaTomando.delete(id);
  if(!hecho) return;
  const quien = t.oculto ? 'Alguien' : nombreDe(t), creep = t.tipo === 'creep';
  const texto = creep ? `se tomó ${hecho.pocion} sola (Bolsillo de emergencia)` : `se tomó ${hecho.pocion} sola: +${fmt(hecho.cura)} HP (Bolsillo de emergencia)`;
  try{ mesaLinea(`🩹 ${quien} ${texto}`); }catch(err){}
  momentoAbrir({tipo: 'emergencia', icono: '🩹', titulo: `${quien}: Bolsillo de emergencia`, estado: 'listo', resultado: texto.charAt(0).toUpperCase() + texto.slice(1)});
}
// Se libera fuera de combate (modo narrativo): lo que la pantalla maneja y tiene la marca puesta.
const emergenciaLiberando = new Set();
async function emergenciaLiberar(t){
  const k = String(t.fichaId);
  if(emergenciaLiberando.has(k)) return;
  emergenciaLiberando.add(k);
  setTimeout(() => emergenciaLiberando.delete(k), 5000);
  try{
    if(t.tipo === 'creep') await modificarCreep(t.fichaId, sc => { sc.emergenciaUsada = false; });
    else await editarPersonajeMapa(t.fichaId, S => { if(!S.emergenciaUsada) return false; S.emergenciaUsada = false; return true; });
  }catch(err){ console.error('Bolsillo de emergencia (liberar):', err); }
}
// La vida, si tiene Bolsillo de emergencia y la marca, de lo que maneja esta pantalla (null: no corresponde).
function emergenciaDatos(t){
  if(!t || !t.fichaId || String(t.fichaId).includes(SEP_INVOCACION)) return null;   // las invocaciones no llevan cinturón
  if(t.tipo === 'creep'){
    if(!soyGM) return null;
    const sc = creepPrivadoDe(t.fichaId);
    if(!sc || !(num(CreepCalculo.modTotal(sc, 'emergencia')) > 0)) return null;
    return {hp: num(sc.hp), max: num(sc.hpMax), usada: !!sc.emergenciaUsada};
  }
  if(typeof bnManejo !== 'function' || !bnManejo(t.fichaId)) return null;
  const r = (fichasPub.get(t.fichaId) || {}).resumen || {};
  if(!(num(r.emergencia) > 0)) return null;
  return {hp: num(r.hp), max: num(r.hpMax), usada: !!r.emergenciaUsada};
}
setInterval(() => {
  if(!fbMiembro) return;
  tokens.forEach((t, id) => {
    const e = emergenciaDatos(t);
    if(!e){ emergenciaVida.delete(id); return; }
    const antes = emergenciaVida.get(id);
    emergenciaVida.set(id, e.hp);
    if(modoMapa !== 'combate'){ if(e.usada) emergenciaLiberar(t); return; }
    if(!e.usada && antes !== undefined && Combatiente.emergenciaCruza(antes, e.hp, e.max)) emergenciaTomar(id, t);
  });
}, 1000);
