/* 🪤👁 Una trampa no se coloca a la vista de un enemigo (regla del dueño, 2026-10-27: «al momento de colocar una trampa, cuando aparece el mapa,
   deben aparecer los conos de visión, los mismos que se usan para el sigilo, porque una trampa no se puede poner en el campo de visión directa de
   un enemigo»). Mientras se elige la casilla de una trampa (de una habilidad, un consumible o el glifo), el mapa muestra el cono azul y la zona de
   alerta naranja de los rivales que quien la pone ve (como el 👓 de los lentes); una casilla dentro del cono de alguno no sirve: avisa y la vuelve a
   pedir. Los rivales que no se ven (ocultos, en sigilo, en la niebla) no cuentan: no se delatan. Sin el token de quien la pone (el GM a mano), no
   se mira nada. Los pilares no son trampas: no cuentan. */
let trampaConosRivales = null;   // los ids de los tokens cuyos conos se ven mientras se elige la casilla de una trampa (null: ninguno)
// Los rivales de quien coloca que esta pantalla ve, vivos y despiertos.
function trampaRivalesALaVista(mio){
  if(!mio || typeof rivalesDe !== 'function') return [];
  return rivalesDe(mio).filter(r => {
    if(!tokenVisiblePorNiebla(r) || !estelaVisibleDe(r)) return false;
    const e = estadoDe(r);
    return !(e && (e.muerto || e.dormida));
  });
}
function trampaTokenDe(msg){
  return msg && msg.fichaId ? [...tokens.values()].find(x => x.fichaId === msg.fichaId && x.tipo === (msg.tipoToken || 'pj')) : null;
}
// → el nombre del rival que mira esa casilla (su cono), o ''.
function trampaALaVista(msg, h){
  const r = trampaRivalesALaVista(trampaTokenDe(msg)).find(x => zonasClaves(x).cono.has(nbPack(h.col, h.fila)));
  return r ? nombreDe(r) : '';
}
// Pedir la casilla de una trampa con los conos a la vista; los apaga al elegir o al cancelar (si se vuelve a pedir, se prenden de nuevo).
function elegirCasillaTrampa(msg, cb, texto, libre, alCancelar){
  const rivales = trampaRivalesALaVista(trampaTokenDe(msg));
  trampaConosRivales = rivales.length ? [...tokens.entries()].filter(([, x]) => rivales.includes(x)).map(([id]) => id) : null;
  const apagar = () => { trampaConosRivales = null; pedirDibujo(); };
  elegirDestino(h => { apagar(); cb(h); }, texto + (rivales.length ? ' <span>· 👁 no a la vista de un rival (su cono azul)</span>' : ''), libre,
    () => { apagar(); if(alCancelar) alCancelar(); });
}
// Lo dibuja `dibujar` (js/05), con los mismos colores que el 👓 de los lentes.
function trampaConosDibujar(z){
  if(!trampaConosRivales) return;
  const pintar = (lista, relleno, borde) => {
    if(!lista.length) return;
    ctx.beginPath();
    lista.forEach(c => { const p = hexCentro(c.col, c.fila); trazarHex(p.x, p.y); });
    ctx.fillStyle = relleno; ctx.fill();
    ctx.strokeStyle = borde; ctx.lineWidth = 2 / z; ctx.stroke();
  };
  trampaConosRivales.forEach(id => {
    const t = tokens.get(id);
    if(!t) return;
    const zn = zonasSigilo(t);
    pintar(zn.alerta, 'rgba(232,140,50,.38)', 'rgba(255,170,80,.9)');
    pintar(zn.cono, 'rgba(60,120,210,.45)', 'rgba(110,170,255,.95)');
  });
}
