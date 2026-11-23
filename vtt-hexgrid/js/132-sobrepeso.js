// js/132-sobrepeso.js — ⚖ El sobrepeso en el mapa (2026-11-23, dueño, P312).
// La cuenta (lo equipado + cada ranura de más de la mochila, que pesa 1, contra la Carga máxima) la hace la ficha (FichaCalculo) y la publica el
// resumen como `sobre` y `sobreCuenta` (comun/ficha-resumen.js). Acá:
// 1) El cartel «⚖ Tenés sobrepeso» para el jugador dueño del personaje (dueño: «con todo el detalle de lo que implica y Aceptar, donde sea que pase…
//    al equiparse algo y al recibir cosas en la mochila (GM, botín, otro jugador, baúl, tienda) que lo hagan pasar a tener sobrepeso o se lo suban»).
//    Sale cuando el `sobre` publicado de un personaje suyo SUBE, venga de donde venga (la Botonera es la ficha en un marco: el marco no lo muestra).
// 2) La Iniciativa (regla nueva: cada punto de sobrepeso resta 1): la tirada ya lo resta (js/04 iniciativaTirar; la fila recuerda `sobre`). Si en
//    medio del combate el sobrepeso cambia, la pantalla del GM ajusta el número (siempre tirada − sobrepeso de ese momento: si baja, recupera) y lo
//    acomoda en el orden con OrdenTurnos.reubicarPorValor (nadie repite ni pierde turno; si su lugar nuevo ya pasó y no jugó, esta ronda juega en
//    el de siempre y se acomoda al empezar la próxima: `iniciativa.reubicar`, js/04 iniciativaSiguiente). Queda la línea en la Mesa con la cuenta.

/* ---------- 1) El cartel del dueño ---------- */
const sobrepesoCartelPend = new Map();   // fichaId -> {antes, timer}: se juntan los cambios seguidos (comprar varias cosas) en un solo cartel
function sobrepesoFichaCambio(fichaId, previo, d){
  try{
    if(!previo || !previo.resumen || !d || !d.resumen || !fbUsuario || d.duenoUid !== fbUsuario.uid) return;
    if(previo.resumen.sobre === undefined || d.resumen.sobre === undefined) return;   // un resumen viejo no lo dice
    const antes = Math.max(0, num(previo.resumen.sobre)), s = Math.max(0, num(d.resumen.sobre));
    if(s === antes) return;
    const p = sobrepesoCartelPend.get(fichaId) || {antes};
    clearTimeout(p.timer);
    p.timer = setTimeout(() => sobrepesoCartelMostrar(fichaId, p.antes), 900);
    sobrepesoCartelPend.set(fichaId, p);
  }catch(err){ console.error('El cartel del sobrepeso:', err); }
}
function sobrepesoCartelMostrar(fichaId, antes){
  sobrepesoCartelPend.delete(fichaId);
  const f = fichasPub.get(fichaId), r = f && f.resumen;
  if(!r) return;
  const s = Math.max(0, num(r.sobre));
  if(!(s > antes)) return;
  const nombre = String(f.nombre || 'Tu personaje');
  const titulo = antes > 0 ? `${nombre}: tu sobrepeso subió (${fmt(antes)} → ${fmt(s)})` : `${nombre}: tenés sobrepeso`;
  if(typeof Confirmar !== 'undefined') Confirmar.avisar(Combatiente.sobrepesoCartel(s, r.sobreCuenta), {titulo, icono: '⚖', si: 'Aceptar'});
  else toast(`⚖ ${titulo}`);
}

/* ---------- 2) La Iniciativa, en la pantalla del GM ---------- */
let sobrepesoIniOcupado = false, sobrepesoIniOtraVez = false;
async function sobrepesoIniRevisar(){
  if(!soyGM || !iniciativaCargada || !iniciativa.orden.length) return;
  if(sobrepesoIniOcupado){ sobrepesoIniOtraVez = true; return; }
  sobrepesoIniOcupado = true;
  try{
    const enCurso = OrdenTurnos.enCurso(iniciativa, modoMapa);
    let ini = {...iniciativa, orden: iniciativa.orden.slice()};
    let reubicar = [...(iniciativa.reubicar || [])];
    const notas = [];
    for(const fila0 of iniciativa.orden){
      const t = tokens.get(fila0.id), s = sobrepesoValorDeToken(t);
      if(s === null) continue;
      const tiene = typeof fila0.sobre === 'number';
      if(!tiene && !enCurso) continue;   // todavía no tiró: la tirada ya lo va a restar
      const antes = tiene ? fila0.sobre : 0;
      if(s === antes) continue;
      const fila = ini.orden.find(x => x.id === fila0.id);
      const tirada = num(fila.valor) + antes, valor = tirada - s;
      const r = OrdenTurnos.reubicarPorValor(ini, fila0.id, valor, {enCurso, fila: {sobre: s}});
      if(!r) continue;
      ini = {...ini, orden: r.orden, turno: r.turno, actuaron: r.actuaron};
      reubicar = reubicar.filter(x => x !== fila0.id);
      if(r.pendiente) reubicar.push(fila0.id);
      notas.push({id: fila0.id, t, antes, s, tirada, valor, r, enCurso});
    }
    if(!notas.length) return;
    const ok = await guardarIniciativa({orden: ini.orden, turno: ini.turno, actuaron: ini.actuaron, reubicar});
    if(!ok) return;
    notas.forEach(sobrepesoIniContar);
  }catch(err){ console.error('El sobrepeso en el orden de turnos:', err); }
  finally{
    sobrepesoIniOcupado = false;
    if(sobrepesoIniOtraVez){ sobrepesoIniOtraVez = false; setTimeout(sobrepesoIniRevisar, 300); }
  }
}
// La línea de la Mesa (con la cuenta). Si los jugadores no lo ven (oculto, en sigilo, fila escondida), solo un toast para el GM.
function sobrepesoIniTexto(n, nombre){
  const que = n.s > 0 ? `${n.s > n.antes ? 'su sobrepeso subió' : 'su sobrepeso bajó'} (${fmt(n.antes)} → ${fmt(n.s)}): iniciativa ${fmt(n.tirada)} − ${fmt(n.s)} = ${fmt(n.valor)}`
    : `ya no tiene sobrepeso: recupera su iniciativa, ${fmt(n.tirada)}`;
  const r = n.r;
  const lugar = !n.enCurso ? ''
    : r.movido ? `${r.lugar < r.desde ? 'sube' : 'baja'} en el orden de turnos (${r.desde + 1}.º → ${r.lugar + 1}.º)${r.yaJugo ? '; ya jugó esta ronda: no vuelve a jugar' : '; juega ahí esta ronda'}`
    : r.pendiente ? 'esta ronda juega en su lugar de siempre; desde la próxima, en el que le toca por este número'
    : 'no cambia de lugar';
  return `⚖ ${nombre}: ${que}${lugar ? ` · ${lugar}` : ''}.`;
}
function sobrepesoIniContar(n){
  const nombre = n.t ? nombreDe(n.t) : 'Alguien';
  const txt = sobrepesoIniTexto(n, nombre);
  if(ocultoParaMesa(n.id)){ toast(txt + ' (no lo ven los jugadores)'); return; }
  try{ mesaLinea(txt, 'recordatorio'); }catch(err){ console.error(err); }
}
