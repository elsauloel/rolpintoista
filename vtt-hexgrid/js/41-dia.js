/* =========================================================
   ⏳ PASAR DE DÍA (2026-10-12, dueño: «vamos a programar el paso del día»). Un pulso de renovación aparte del turno y del combate.
   El GM aprieta «⏳ Pasar de día» (la caja del Mantenimiento): `campanas/<id>/mapa/dia` = {dia, manual, actualizado} sube 1 y toda la mesa ve
   «☀ Día N» en la cabecera. Al llegar, cada pantalla renueva lo que maneja (`bnManejo`: sus personajes; el GM con 🎮 el control, esos):
   - **Descanso**: vida, SP y No2 al máximo (los caídos no se levantan solos), también sus invocaciones.
   - **Los estados con turnos terminan** (los permanentes, los de un ítem equipado y los derivados quedan).
   - **Los topes diarios**: el del talento de reparar (`S.reparadoTalento`; 3 puntos por nivel por día, comun/ficha-equipo.js).
   El GM además termina los estados con turnos de sus creeps (los que tienen token) y **repone la góndola** de la tienda publicada.
   Cada personaje guarda el día que ya aplicó (`S.diaAplicado`): no se aplica dos veces, y quien no estaba conectado lo recibe al entrar.
   Corregir el número a mano (✎) no renueva nada: solo cambia la cuenta (y todos lo anotan como aplicado).
   ========================================================= */
let diaActual = 0, diaManual = false, diaVisto = false;
const refDia = () => fbDb.doc(fbRutaCampana('mapa/dia'));
let diaEscuchando = false;
function escucharDia(){
  if(diaEscuchando || typeof fbDb === 'undefined' || !fbDb || typeof fbMiembro === 'undefined' || !fbMiembro) return;
  diaEscuchando = true;
  refDia().onSnapshot(doc => {
    const d = doc.exists ? doc.data() || {} : {};
    const antes = diaActual;
    diaActual = Math.max(0, Math.round(num(d.dia)));
    diaManual = !!d.manual;
    diaVisto = true;
    if(typeof actualizarCabecera === 'function') actualizarCabecera();
    renderDiaBoton();
    if(diaActual > 0) diaRevisar(antes);
  }, err => console.error('Error escuchando el día:', err));
}
function renderDiaBoton(){
  const b = $('#btn-dia-mapa');
  if(b) b.title = `Hoy es el Día ${diaActual || 0}. Pasa un día para toda la mesa: todos descansan (vida, SP y No2), terminan los estados con turnos, se renuevan los topes diarios y se repone la góndola de la tienda (solo GM)`;
}

// El descanso de un personaje y qué estados terminan: comun/ficha-mantenimiento.js (FichaMantenimiento.descansar / terminaAlPasarDia).
const diaTermina = e => FichaMantenimiento.terminaAlPasarDia(e);
const diaDescansarPj = S => FichaMantenimiento.descansar(S);
let diaTrabajando = false;
async function diaRevisar(antes){
  if(diaTrabajando || !fbUsuario) return;
  diaTrabajando = true;
  try{
    if(typeof bnCargarPiezas === 'function') await bnCargarPiezas();
    const dia = diaActual, manual = diaManual;
    // Mis personajes.
    for(const [fichaId] of fichasPub){
      if(typeof bnManejo !== 'function' || !bnManejo(fichaId)) continue;
      let lineas = null, nombre = '';
      try{
        await editarPersonajeMapa(fichaId, S => {
          lineas = null;
          // Corregido a mano: solo se anota el número (aunque sea más chico, así el próximo día se aplica bien).
          if(manual ? num(S.diaAplicado) === dia : num(S.diaAplicado) >= dia) return false;
          nombre = ((S.meta && S.meta.nombre) || '').trim();
          if(!manual) lineas = diaDescansarPj(S);
          S.diaAplicado = dia;
          return true;
        });
      }catch(err){ console.error('Pasar de día: no se pudo renovar a un personaje', err); }
      if(lineas){
        const txt = lineas.length ? lineas.join(' · ') : 'ya estaba entero';
        mesaLinea(`☀ Día ${dia}: ${nombre || 'un personaje'} descansó — ${txt}`, 'recordatorio', nombre);
      }
    }
    // El GM: los estados con turnos de sus creeps terminan, y la góndola de la tienda se repone (una sola vez, desde la pantalla que pasó el día).
    if(soyGM){
      const yaEsta = s => manual ? num(s.diaAplicado) === dia : num(s.diaAplicado) >= dia;
      for(const [creepId, p] of creepsPriv){
        const sc = p && p.sc;
        if(!sc || yaEsta(sc)) continue;
        try{
          await modificarCreep(creepId, s => {
            if(yaEsta(s)) return false;
            if(!manual) s.estados = (s.estados || []).filter(e => !diaTermina(e));
            s.diaAplicado = dia;
            return true;
          });
        }catch(err){ console.error('Pasar de día: no se pudo renovar a un creep', err); }
      }
    }
  }finally{ diaTrabajando = false; }
}
// La góndola llena otra vez (P181): la tienda publicada dice qué ítems van en la góndola; el stock vuelve a sus unidades.
async function diaReponerGondola(){
  try{
    const pub = await fbDb.doc(fbRutaCampana('tienda/publicada')).get();
    if(!pub.exists) return '';
    let t = {};
    try{ t = JSON.parse(pub.data().json || '{}'); }catch(e){}
    const ids = (t.gondola || []).filter(id => (t.items || []).includes(id));
    if(!ids.length) return '';
    const n = typeof GeneradorTiendas !== 'undefined' && GeneradorTiendas.UNIDADES_GONDOLA ? GeneradorTiendas.UNIDADES_GONDOLA : 3;
    const ref = fbDb.doc(fbRutaCampana('tienda/stock'));
    const st = await ref.get();
    if(!st.exists) return '';
    await ref.update({gondola: Object.fromEntries(ids.map(id => [id, n])), actualizado: firebase.firestore.FieldValue.serverTimestamp()});
    return `la góndola de la tienda se repuso (${ids.length} gastable${ids.length === 1 ? '' : 's'}, ${n} de cada uno)`;
  }catch(err){ console.error('Pasar de día: no se pudo reponer la góndola', err); return ''; }
}
async function pasarDeDia(){
  if(!soyGM) return;
  const sig = diaActual + 1;
  if(!(await Confirmar.preguntar(`Pasa al Día ${sig}. Todos descansan (vida, SP y No2 al máximo; los caídos no se levantan), terminan los estados con turnos, se renuevan los topes diarios (el talento de reparar) y se repone la góndola de la tienda. ¿Seguir?`, {titulo: '⏳ Pasar de día', icono: '☀', si: `Pasar al Día ${sig}`}))) return;
  try{
    await refDia().set({dia: sig, manual: false, actualizado: firebase.firestore.FieldValue.serverTimestamp()});
  }catch(err){ console.error(err); toast('No se pudo pasar de día'); return; }
  const gond = await diaReponerGondola();
  const texto = `☀ Pasó un día: es el Día ${sig}. Todos descansaron (vida, SP y No2 al máximo; los caídos siguen caídos), terminaron los estados con turnos y se renovaron los topes diarios${gond ? '; ' + gond : ''}.`;
  mesaLinea(texto, 'recordatorio', 'GM');
  if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'dia', icono: '☀', titulo: `Día ${sig}`, resultado: texto, estado: 'listo', datos: {chico: true}});
}
async function corregirDia(){
  if(!soyGM) return;
  const t = prompt(`¿Qué día es? (hoy: Día ${diaActual}). Corregir el número no renueva nada.`, String(diaActual || 1));
  if(t === null) return;
  const n = Math.max(0, Math.round(num(t)));
  try{ await refDia().set({dia: n, manual: true, actualizado: firebase.firestore.FieldValue.serverTimestamp()}); toast(`Ahora es el Día ${n}`); }
  catch(err){ console.error(err); toast('No se pudo cambiar el día'); }
}
$('#btn-dia-mapa').onclick = () => pasarDeDia();
// El arranque (js/14, arrancarEnVivo) lo llama; si ya arrancó antes de que cargara este archivo, se empieza acá (2026-10-12: pasaba).
escucharDia();
$('#btn-dia-corregir').onclick = () => corregirDia();
