// js/132-sobrepeso.js — ⚖ El sobrepeso en el mapa (2026-11-23, dueño, P312 y P313).
// La cuenta (lo equipado + cada ranura de más de la mochila, que pesa 1, contra la Carga máxima) la hace la ficha (FichaCalculo) y la publica el
// resumen como `sobre`, `sobreCuenta` y `pantalla` (qué pantalla lo guardó; comun/ficha-resumen.js). Acá:
// 1) Los carteles para el jugador dueño: «⚖ Tenés sobrepeso / tu sobrepeso subió», «bajó» y «ya no tenés sobrepeso» (Combatiente.sobrepesoAviso).
//    P313: «sale solo en la pantalla donde se hizo el cambio»: la que guardó el cambio (este mapa, o su Botonera / ficha lite, que usan el id de este
//    mapa); lo que guardó OTRA persona (el GM, otro jugador) también lo muestra el mapa del dueño (la ficha suelta no: así sale una sola vez).
// 2) La Iniciativa (regla nueva: cada punto de sobrepeso resta 1): la tirada ya lo resta (js/04 iniciativaTirar; la fila recuerda `sobre`). Si en
//    medio del combate el sobrepeso cambia, la pantalla del GM ajusta el NÚMERO en el momento (siempre tirada − sobrepeso de ese momento: si baja,
//    recupera), con su línea en la Mesa, pero el ORDEN no se toca: se reacomoda al empezar la ronda siguiente (`iniciativa.reubicar`, js/04
//    iniciativaSiguiente con OrdenTurnos.reubicarAlEmpezar). Así nadie repite ni pierde turno por esto (P313, cambio de opinión del dueño).

/* ---------- 1) Los carteles del dueño ---------- */
try{ if(!window.FICHA_PANTALLA) window.FICHA_PANTALLA = 'm' + Math.random().toString(36).slice(2, 10); }catch(e){}
const sobrepesoCartelPend = new Map();   // fichaId -> {antes, timer}: se juntan los cambios seguidos (comprar varias cosas) en un solo cartel
function sobrepesoFichaCambio(fichaId, previo, d){
  try{
    if(!previo || !previo.resumen || !d || !d.resumen || !fbUsuario || d.duenoUid !== fbUsuario.uid) return;
    if(previo.resumen.sobre === undefined || d.resumen.sobre === undefined) return;   // un resumen viejo no lo dice
    if(num(previo.resumen.sobre) === num(d.resumen.sobre)) return;
    const p = sobrepesoCartelPend.get(fichaId) || {antes: previo.resumen};
    clearTimeout(p.timer);
    p.timer = setTimeout(() => sobrepesoCartelMostrar(fichaId, p.antes), 900);
    sobrepesoCartelPend.set(fichaId, p);
  }catch(err){ console.error('El cartel del sobrepeso:', err); }
}
function sobrepesoCartelMostrar(fichaId, antes){
  sobrepesoCartelPend.delete(fichaId);
  const f = fichasPub.get(fichaId), r = f && f.resumen;
  if(!r) return;
  const a = Combatiente.sobrepesoAviso(antes, r, {yo: window.FICHA_PANTALLA, dueno: f.duenoUid, deOtro: true, nombre: String(f.nombre || '')});
  if(!a) return;
  if(typeof Confirmar !== 'undefined') Confirmar.avisar(a.texto, {titulo: a.titulo, icono: '⚖', si: 'Aceptar'});
  else toast(`⚖ ${a.titulo}`);
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
      const r = OrdenTurnos.cambiarValor(ini, fila0.id, valor, {sobre: s});
      if(!r) continue;
      ini = {...ini, orden: r.orden};
      reubicar = reubicar.filter(x => x !== fila0.id);
      if(enCurso && r.cambiaLugar) reubicar.push(fila0.id);   // se acomoda al empezar la ronda siguiente (si no está en curso, lo hace Ordenar)
      notas.push({id: fila0.id, t, antes, s, tirada, valor, cambiaLugar: r.cambiaLugar, enCurso});
    }
    if(!notas.length) return;
    const ok = await guardarIniciativa({orden: ini.orden, reubicar});
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
  const lugar = !n.enCurso ? '' : n.cambiaLugar ? 'su lugar en el orden se reacomoda al pasar de ronda' : 'no cambia de lugar';
  return `⚖ ${nombre}: ${que}${lugar ? ` · ${lugar}` : ''}.`;
}
function sobrepesoIniContar(n){
  const nombre = n.t ? nombreDe(n.t) : 'Alguien';
  const txt = sobrepesoIniTexto(n, nombre);
  if(ocultoParaMesa(n.id)){ toast(txt + ' (no lo ven los jugadores)'); return; }
  try{ mesaLinea(txt, 'recordatorio'); }catch(err){ console.error(err); }
}
