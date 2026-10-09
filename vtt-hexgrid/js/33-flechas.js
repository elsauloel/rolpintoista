/* =========================================================
   🏹 LA FLECHA ESPECIAL QUE ERRA (2026-10-09, dueño; docs/ideas-arcos-flechas.md)
   Regla (dueño, 2026-10-09, corregida el mismo día): «queda en el suelo siempre, salvo que choque contra otra cosa con colisión: ahí sí tira
   50 % de romperse». Lo avisa el duelo (`flechaErrada`, en la pantalla de quien disparó) cuando un disparo con flecha especial falla o lo
   bloquean: la flecha sigue la línea del disparo hasta la casilla más lejana de su alcance y cae ahí. Si en el camino hay un obstáculo Sólido (o
   la Colisión del mapa), choca: moneda (1d2), 1 se rompe y 2 cae justo antes del obstáculo. Queda en el mapa como un objeto para levantar,
   igual que un arma que vuela (js/27: elemento `arma`, 1 No2).
   ========================================================= */
// Las casillas de la línea de `a` hacia `b`, siguiendo de largo hasta `largo` pasos.
function flechaLinea(a, b, largo){
  const n = Math.max(1, distanciaHex(a, b)), A = hexACubo(a), B = hexACubo(b), res = [];
  for(let i = 1; i <= largo; i++){
    const t = i / n;
    const q = A.q + (B.q - A.q) * t + 1e-6, r = A.r + (B.r - A.r) * t + 1e-6, s = -q - r;
    let rq = Math.round(q), rr = Math.round(r);
    const rs = Math.round(s);
    const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s);
    if(dq > dr && dq > ds) rq = -rr - rs;
    else if(dr > ds) rr = -rq - rs;
    res.push({col: rq, fila: rr + (rq - (rq & 1)) / 2});
  }
  return res;
}
// El ítem de la flecha (el del catálogo, si está; si no, uno armado con lo que trae el duelo).
function flechaItem(fl){
  const cat = typeof CATALOGO_BASE !== 'undefined' ? CATALOGO_BASE.find(i => i.flecha && i.nombre === fl.nombre) : null;
  if(cat){ const c = structuredClone(cat); delete c.id; return {...c, unidades: 1}; }
  return {nombre: fl.nombre, tipoItem: 'consumibles', consumible: true, unidades: 1, peso: 0, ranuras: 1, precioCompra: 0, mods: [],
    flecha: {efectosGolpe: fl.efectos || [], ...(num(fl.perfora) ? {perfora: num(fl.perfora)} : {})}, detalle: 'Flecha especial (va en el carcaj).'};
}
async function flechaErrada(d){
  const fl = d && d.ataque && d.ataque.flecha;
  if(!fl) return;
  const quien = (d.atacante && d.atacante.nombre) || 'Alguien';
  const tA = tokens.get(d.atacante.tokenId), tD = tokens.get(d.defensor.tokenId);
  if(!tA || !tD){ mesaLinea(`🏹 La ${fl.nombre} de ${quien} erró y quedó entera en el piso, al final de su alcance (ponela a mano)`, 'recordatorio'); return; }
  const dist = distanciaHex(tA, tD);
  let alcance = dist;
  try{ alcance = Math.max(dist, Math.round(num(rangoDeToken(tA).rng)) || dist); }catch(e){}
  const solidos = solidosSet();
  let celda = {col: tD.col, fila: tD.fila}, choco = false;
  for(const c of flechaLinea(tA, tD, alcance)){
    if(solidos.has(nbPack(c.col, c.fila))){ choco = true; break; }   // choca contra un obstáculo: cae justo antes (si no se rompe)
    celda = c;
  }
  if(choco){
    const moneda = 1 + Math.floor(Math.random() * 2);
    if(moneda === 1){ mesaLinea(`🏹 La ${fl.nombre} de ${quien} erró, chocó contra un obstáculo y se rompió (moneda: 1)`, 'recordatorio'); return; }
  }
  const item = flechaItem(fl);
  try{
    await coleccionElementos().add({
      tipo: 'flor', origen: celda, celdas: [0, 0], rotacion: 0, color: '#C9C9C9', alfa: 0, solido: false, invisible: false,
      imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: true,
      arma: true, armaNombre: String(fl.nombre).slice(0, 60), armaDe: '', armaItem: JSON.stringify(item).slice(0, 6000),
      duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
    mesaLinea(`🏹 La ${fl.nombre} de ${quien} erró${choco ? ', chocó contra un obstáculo (moneda: 2)' : ''} y quedó entera en el piso, a ${distanciaHex(tA, celda)} casillas (se puede levantar)`, 'recordatorio');
  }catch(err){
    console.error('No se pudo dejar la flecha en el piso:', err);
    mesaLinea(`🏹 La ${fl.nombre} de ${quien} erró y quedó entera en el piso, al final de su alcance (ponela a mano)`, 'recordatorio');
  }
}

/* ⚡ LA FLECHA QUE SALTA (2026-10-09, dueño): la relámpago y la de tormenta. Cuando el disparo pega, salta al más cercano del mismo bando que el
   golpeado (a 3 casillas o menos, una vez por objetivo: la regla del Rayo en cadena, js/10). `salto = {saltos, dano, paralisis: [%…]}`: con
   `dano`, el daño eléctrico de la flecha salta a la mitad cada vez (redondeada para abajo; quien recibe 1 es el último) y va directo a la vida;
   sin `dano`, salta sin daño. Cada salto tira su % de Parálisis (1 turno): `paralisis[0]` el primero que alcanza, `paralisis[1]` el segundo.
   Lo aplica la pantalla que aplica el daño del duelo (el GM); se ve en todas (momento «rayo») y queda en la Mesa. */
async function flechaSalto(d, totalMag){
  const fl = d.ataque.flecha, s = fl.salto || {}, id = d.defensor && d.defensor.tokenId;
  if(!id || !tokens.get(id)) return;
  const n = Math.max(1, Math.round(num(s.saltos)) || 1);
  const conDano = !!s.dano && num(totalMag) > 1;
  const cadena = (conDano ? rayoCadena(id, num(totalMag)) : rayoCadena(id, Math.pow(2, n + 1)).map(c => ({...c, dano: 0}))).slice(0, 1 + n);
  if(cadena.length < 2){ mesaLinea(`⚡ La ${fl.nombre} de ${d.atacante.nombre} no tuvo a quién saltar (nadie a 3 casillas o menos)`, 'recordatorio'); return; }
  const partes = [];
  for(let i = 1; i < cadena.length; i++){
    const c = cadena[i], nom = c.t.oculto ? 'Alguien' : nombreDe(c.t);
    let txt = nom + (c.dano ? ` (${c.dano} de daño eléctrico)` : '');
    const pct = num((s.paralisis || [])[i - 1]);
    if(pct > 0){
      const dd = Combatiente.chanceDado(pct) || {caras: 1, exitos: 1};
      const sale = 1 + Math.floor(Math.random() * dd.caras), entra = sale > dd.caras - dd.exitos;
      txt += ` · Parálisis ${pct} % (1d${dd.caras}: ${sale}) → ${entra ? 'paralizado 1 turno' : 'no'}`;
      if(entra){
        try{
          const r = await dueloAplicarEfecto({...d, defensor: {...d.defensor, tokenId: c.id, nombre: nombreDe(c.t), tipo: c.t.tipo, ref: c.t.fichaId}},
            {nombre: 'Parálisis', caras: 1, exitos: 1, dado: '', detalle: 'Parálisis 1 turno (el salto de la flecha).', spec: {nombre: 'Parálisis', turnos: 1}});
          if(r && r.manual) txt += ' (aplicala a mano)';
          else if(r && /no entró/.test(String(r.nota || ''))) txt += ` (${r.nota})`;
        }catch(err){ console.error('No se pudo paralizar en el salto:', err); txt += ' (aplicala a mano)'; }
      }
    }
    partes.push(txt);
  }
  const saltos = cadena.slice(1).map((c, i) => ({desde: cadena[i].id, hacia: c.id}));
  const resultado = partes.join(' → ');
  momentoAbrir({tipo: 'rayo', icono: '⚡', titulo: `${fl.nombre}: salta`, estado: 'listo', datos: {saltos}, resultado});
  mesaLinea(`⚡ La ${fl.nombre} de ${d.atacante.nombre} saltó: ${resultado}`, 'recordatorio');
  if(conDano) await rayoCadenaAplicar(cadena);
}
