// js/72-sigilo-a-la-vista.js — entrar en sigilo a la vista se anuncia (2026-10-24, regla del dueño: «si un personaje entra en sigilo mientras
// está a la vista, se debe anunciar; si no está a la vista —escondido tras un objeto, bajo la niebla o lo que sea—, no se anuncia»).
// Vale para personajes, invocaciones y creeps: «a la vista» = algún rival en juego ve su casilla en ese momento (`rivalesDe` + `celdasVisionDe`:
// el radio, el punto ciego, los Sólidos, las paredes y la niebla de una varita). Un creep, con la niebla de guerra apagada, lo ven siempre.
// Si se esconde adentro del cono de un rival, no se anuncia: lo detectan en el acto y la Mesa ya dice que perdió el sigilo (js/03).
// Lo anuncia una sola pantalla, la que maneja al token (el GM a un creep; a un personaje, su dueño o el GM con 🎮 el control): Mesa y Crónica.
const sigiloAntes = new Map();                   // tokenId → estaba en sigilo la última vez que se miró
const sigiloAnuncioDesde = Date.now() + 8000;    // al cargar, solo se toma nota de cómo está (como los lentes automáticos, js/03)

function sigiloManejoEsta(t){
  if(t.tipo === 'creep') return soyGM;
  if(t.tipo !== 'pj' || !t.fichaId) return false;
  return typeof bnManejo === 'function' && bnManejo(String(t.fichaId).split(SEP_INVOCACION)[0]);
}
// ¿Algún rival lo ve en esa casilla? (sin contar el sigilo, que es justo lo que se acaba de poner)
function sigiloALaVista(t){
  if(t.oculto) return false;
  if(t.tipo === 'creep' && !nieblaActiva) return true;
  const k = nbPack(t.col, t.fila);
  return rivalesDe(t).some(r => !r.bajoTierra && !(typeof etereoDe === 'function' && etereoDe(r)) && celdasVisionDe(r).includes(k));
}
function sigiloEnConoRival(t){
  const k = nbPack(t.col, t.fila);
  return rivalesDe(t).some(r => zonasClaves(r).cono.has(k));
}
function sigiloAnunciar(t){
  const nom = nombreDe(t);
  mesaLinea(`🥷 ${nom} entra en sigilo a la vista: se sabe dónde se escondió`, 'recordatorio');
  momentoAbrir({tipo: 'sigilo-a-la-vista', icono: '🥷', titulo: `${nom} entra en sigilo a la vista`,
    resultado: 'Se escondió delante de sus rivales: saben dónde estaba. Desde ahí, ya no se lo ve.', estado: 'listo', datos: {centro: true}});
}
setInterval(() => {
  if(!fbUsuario || !fbDb) return;
  tokens.forEach((t, id) => {
    const ahora = enSigilo(t), antes = sigiloAntes.get(id);
    sigiloAntes.set(id, ahora);
    if(Date.now() < sigiloAnuncioDesde || antes !== false || !ahora) return;   // solo el paso de «no» a «sí» (antes undefined: recién llegó)
    if(!sigiloManejoEsta(t)) return;
    try{
      if(sigiloALaVista(t) && !sigiloEnConoRival(t)) sigiloAnunciar(t);
    }catch(err){ console.error('Sigilo a la vista:', err); }
  });
}, 700);
