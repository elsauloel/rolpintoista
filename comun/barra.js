/* =========================================================
   BARRA SUPERIOR — identidad compartida
   Cada herramienta (mapa, ficha, gm-tools, generador de tiendas) muestra
   en su cabecera, después del nombre de la herramienta: la partida
   abierta y quién la está mirando. Este archivo solo arma ese texto —
   dónde y cómo se pinta en la página es de cada herramienta (clases y
   layout distintos en cada una).

   barraTexto(personaje, usuario):
     - Sin personaje: "Partida · Usuario" (+" · GM" si sos el GM). Lo usan
       el mapa, gm-tools y el generador de tiendas, donde no hay un
       personaje puntual en pantalla.
     - Con personaje: "Partida · Personaje (Usuario)" (+" · GM" si SOS
       vos el que mira, no el dueño del personaje). Lo usa la ficha.
     - `usuario` es opcional: por default es fbMiembro.nombre (quien
       mira); la ficha lo pasa aparte cuando el personaje abierto es de
       otro jugador, para mostrar el nombre del dueño y no el propio.
   Depende de comun/sesion.js (fbPartida, fbMiembro).
   ========================================================= */
function barraTexto(personaje, usuario){
  if(!fbPartida || !fbMiembro) return '';
  const quien = usuario || fbMiembro.nombre;
  const gm = fbMiembro.gm ? ' · GM' : '';
  return personaje ? `${fbPartida.nombre} · ${personaje} (${quien})${gm}` : `${fbPartida.nombre} · ${quien}${gm}`;
}
