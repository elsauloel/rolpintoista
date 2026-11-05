/* =========================================================
   ✚ REVIVIR (2026-11-04, dueño: «el botón de revivir desde el token también debe aparecer en la ficha propia de los jugadores»)
   La pregunta «¿con cuánta vida vuelve?» y el texto de la Mesa, iguales en todos lados: el ✚ del anillo del token en el mapa (el GM, o el
   jugador con su propio personaje / invocación: vtt-hexgrid/js/98), el ✚ de la pantalla de muerte del mapa (js/13) y el ✚ Revivir de la
   ficha (ficha-personaje/js/11). Lo que se escribe lo hace cada pantalla: un personaje con FichaAcciones.revivir (le saca lo de
   inconsciente y lo deja Titilando hasta su próximo turno), un creep con modificarCreep, una invocación en la ficha de su dueño.
   Necesita comun/confirmar.js (Confirmar.elegir / Confirmar.texto).
   ========================================================= */
const Revivir = (() => {
  const n = v => { const x = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(x) ? x : 0; };
  const f = v => String(Math.round(n(v)));
  // Vida con la que vuelve: un % del máximo (mínimo 1); sin máximo conocido, 1.
  const pct = (max, p) => Math.max(1, Math.floor((n(max) > 0 ? n(max) : 1) * n(p) / 100));

  // Pregunta con cuánta vida vuelve: 25 %, 50 %, toda, o un número escrito. → Promise<número> o null si se cancela.
  // `o.confirmar`: otro Confirmar (las pruebas, para no abrir ventanas de verdad).
  async function elegirVida(nombre, max, o = {}){
    const Cf = o.confirmar || Confirmar;
    const tope = n(max);
    const conPct = p => tope > 0 ? `${p} % (${f(pct(tope, p))} de ${f(tope)})` : `${p} %`;
    const titila = o.titila !== false ? ' Queda Titilando (invulnerable) hasta su próximo turno.' : '';
    const op = await Cf.elegir(`¿Con cuánta vida vuelve ${nombre}?${titila}`, {titulo: '✚ Revivir', icono: '✚', no: 'Cancelar', opciones: [
      {valor: '25', texto: conPct(25)}, {valor: '50', texto: conPct(50)}, {valor: '100', texto: tope > 0 ? `Toda (${f(tope)})` : 'Toda'},
      {valor: 'num', texto: '✍ Escribir cuánta'}]});
    if(!op) return null;
    let val;
    if(op === 'num'){
      const txt = await Cf.texto(`¿Con cuánta vida vuelve ${nombre}?`, {titulo: '✚ Revivir', icono: '✚',
        valor: String(tope > 0 ? Math.max(1, Math.floor(tope / 2)) : 1), si: 'Revivir', max: 4});
      val = Math.round(n(txt));
      if(!(val > 0)) return null;
    }else val = pct(tope, op);
    return tope > 0 ? Math.min(val, tope) : val;
  }

  // La línea de la Mesa. `quien`: 'gm' (lo revivió el GM) o 'dueno' (su jugador); `titila`: si queda Titilando (personaje y creep, no invocación).
  function texto(nombre, val, o = {}){
    const tit = o.titila !== false ? ', Titilando hasta su próximo turno' : '';
    const por = o.quien === 'gm' ? ' (lo revivió el GM)' : o.quien === 'dueno' ? ' (lo revivió su jugador)' : '';
    return `✚ ${nombre} vuelve con ${f(val)} de vida${tit}${por}`;
  }

  return {elegirVida, texto, pct};
})();
