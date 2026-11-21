/* 🌀 REMOLINO (Warrior, 2026-10-13, dueño; docs/clases-borrador.md). Una onda con tu arma alrededor tuyo (como Daño en área del Tanque, pero
   sin dodge roll) con un paso de más: antes de pegar elegís si te movés 1 casilla, gratis, y el giro alcanza a los que estaban al lado de la
   casilla de salida y de la de llegada (a cada uno una vez). Clic en tu propia casilla = girás sin moverte. La casilla tiene que estar al lado,
   libre (sin un Sólido, una pared ni otro token); si no sirve, girás sin moverte (los costos ya se pagaron). El paso no cobra No2 ni pregunta
   la oportunidad (es parte del ataque); las trampas y zonas de la casilla de llegada no se disparan solas (a mano). */
function ondaConGiro(mio, hab, lanzar){
  const id = ([...tokens.entries()].find(([, t]) => t === mio) || [])[0];
  const salida = {col: mio.col, fila: mio.fila};
  elegirDestino(async c => {
    if(!c || (c.col === salida.col && c.fila === salida.fila)){ lanzar({col: salida.col, fila: salida.fila}); return; }
    const ocupada = [...tokens.values()].some(t => t !== mio && t.col === c.col && t.fila === c.fila);
    const pared = typeof paredCorta === 'function' && paredCorta(salida, c);
    if(distanciaHex(salida, c) !== 1 || solidosSet().has(nbPack(c.col, c.fila)) || ocupada || pared){
      toast(`${hab.nombre || 'Remolino'}: esa casilla no sirve (tiene que estar al lado y libre) — girás sin moverte`);
      lanzar({col: salida.col, fila: salida.fila});
      return;
    }
    try{
      mio.col = c.col; mio.fila = c.fila;
      if(id) estelas.delete(id);
      pedirDibujo();
      if(id) await coleccionTokens().doc(id).update({col: c.col, fila: c.fila, ruta: firebase.firestore.FieldValue.delete()});
      mesaLinea(`🌀 ${nombreDe(mio)} se mueve una casilla en el ${hab.nombre || 'Remolino'} y alcanza a los de las dos posiciones`, 'recordatorio');
    }catch(err){
      console.error('No se pudo mover en el Remolino:', err);
      mio.col = salida.col; mio.fila = salida.fila; pedirDibujo();
      toast('No se pudo mover el token: girás sin moverte');
      lanzar({col: salida.col, fila: salida.fila});
      return;
    }
    lanzar({col: c.col, fila: c.fila, otro: salida});
  }, `<b>🌀 ${esc(hab.nombre || 'Remolino')}: ¿te movés en el giro?</b> <span>clic en una casilla al lado (gratis: le pegás a los de las dos posiciones) · clic en tu casilla para girar sin moverte</span>`, true,
  () => lanzar({col: salida.col, fila: salida.fila}));   // Esc: gira sin moverse (ya pagó)
}
