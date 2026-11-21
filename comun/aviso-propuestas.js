/* =========================================================
   AVISO DE PROPUESTAS AL DUEÑO (2026-11-03, pedido del dueño: «cuando algún jugador publique algo nuevo, a mí, con mi cuenta de
   propietario, acá [la página de Partidas] me tiene que aparecer una notificación "fulano propuso un cambio" o "una incorporación",
   para que yo entre a chequearlo»).
   - Solo para la cuenta del dueño del proyecto (la misma que reconoce comun/biblioteca.js y las reglas: BIBLIOTECA_DUENO_EMAIL).
   - Lee lo que está 🔶 sin auditar en cada `biblioteca_<tipo>` (una consulta por colección: `auditado == false`, con tope), y arma una
     línea por entrada: «Fulano propuso un cambio a «X» (Creep)» (una corrección: `reemplaza`, o una edición: `editorUid`) o «Fulano
     propuso una incorporación: «X» (Creep)». Lo que subió el propio dueño no cuenta.
   - «Ya lo vi» guarda «visto hasta» (la fecha de la más nueva) en este navegador (localStorage `aviso-propuestas-visto`): las reglas no
     tienen un documento propio del dueño donde escribir, y para no pedir reglas nuevas queda por navegador.
   AvisoPropuestas.armar(entradas, {duenoUid, vistoHasta, max}) → {lineas, mas, ultima} (puro, lo prueban las pruebas automáticas).
   AvisoPropuestas.cargar() → Promise<entradas> · AvisoPropuestas.html(r, base) · AvisoPropuestas.montar(contenedor, {base}).
   ========================================================= */
const AvisoPropuestas = (() => {
  const TIPOS = {skills: 'Habilidad', habs_creep: 'Habilidad de creep', creeps: 'Creep', pasivas: 'Pasiva', trampas: 'Trampa', estados: 'Estado', items: 'Ítem'};
  const CLAVE = 'aviso-propuestas-visto';
  const TOPE = 50;   // por colección
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const ms = t => (t && typeof t.toMillis === 'function') ? t.toMillis() : (typeof t === 'number' ? t : 0);
  const fechaTxt = m => m ? new Date(m).toLocaleString('es-AR', {dateStyle: 'short', timeStyle: 'short'}) : '';

  // Puro: las entradas crudas {id, tipo, nombre, autorUid, autorNombre, editorUid, editorNombre, reemplaza, auditado, creado, actualizado}.
  function armar(entradas, o = {}){
    const visto = Number(o.vistoHasta) || 0, max = Number(o.max) || 10;
    const l = (entradas || []).filter(e => e && e.auditado === false).map(e => {
      const cambio = !!(e.reemplaza || e.editorUid || e.editorNombre);
      const uid = (cambio && e.editorUid) || e.autorUid || '';
      const quien = (cambio && e.editorNombre) || e.autorNombre || 'Alguien';
      const fecha = ms(e.actualizado) || ms(e.creado) || 0;
      const tipoTxt = TIPOS[e.tipo] || e.tipo || '';
      const nombre = e.nombre || 'sin nombre';
      return {id: e.id, tipo: e.tipo, uid, quien, fecha, cambio,
        texto: cambio ? `${quien} propuso un cambio a «${nombre}» (${tipoTxt})` : `${quien} propuso una incorporación: «${nombre}» (${tipoTxt})`};
    }).filter(x => !(o.duenoUid && x.uid === o.duenoUid) && x.fecha > visto)
      .sort((a, b) => b.fecha - a.fecha);
    return {lineas: l.slice(0, max), mas: Math.max(0, l.length - max), ultima: l.length ? l[0].fecha : 0};
  }

  const esDueno = () => typeof fbUsuario !== 'undefined' && !!fbUsuario && typeof BIBLIOTECA_DUENO_EMAIL_AVISO !== 'undefined'
    && fbUsuario.email === BIBLIOTECA_DUENO_EMAIL_AVISO && !!fbUsuario.emailVerified;

  async function cargar(){
    const todas = [];
    for(const tipo of Object.keys(TIPOS)){
      try{
        const snap = await fbDb.collection('biblioteca_' + tipo).where('auditado', '==', false).limit(TOPE).get();
        snap.forEach(d => { const x = d.data(); todas.push({id: d.id, tipo, nombre: x.nombre, autorUid: x.autorUid, autorNombre: x.autorNombre,
          editorUid: x.editorUid, editorNombre: x.editorNombre, reemplaza: x.reemplaza, auditado: x.auditado, creado: x.creado, actualizado: x.actualizado}); });
      }catch(err){ console.warn('Aviso de propuestas: no se pudo leer', tipo, err); }
    }
    return todas;
  }

  const vistoHasta = () => { try{ return Number(localStorage.getItem(CLAVE)) || 0; }catch(e){ return 0; } };
  const marcarVisto = m => { try{ localStorage.setItem(CLAVE, String(m)); }catch(e){} };

  function html(r, base = ''){
    if(!r || !r.lineas.length) return '';
    return `<div class="aviso-prop" style="border:1px solid #c9a227;border-left:4px solid #c9a227;background:rgba(201,162,39,.1);border-radius:8px;padding:10px 14px;margin:0 0 16px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px"><b style="flex:1">🔔 Propuestas nuevas para revisar</b>
        <a class="btn" href="${base}datos/auditoria.html" style="text-decoration:none">Revisar todo</a>
        <button type="button" class="btn" data-aviso-visto>✔ Ya lo vi</button></div>
      ${r.lineas.map(x => `<div style="display:flex;gap:10px;align-items:baseline;padding:4px 0;border-top:1px dashed rgba(201,162,39,.35)">
        <span style="flex:1">🔔 ${esc(x.texto)} <span style="opacity:.7;font-size:.9em">· ${esc(fechaTxt(x.fecha))}</span></span>
        <a href="${base}datos/auditoria.html?tipo=${encodeURIComponent(x.tipo)}&id=${encodeURIComponent(x.id)}" style="white-space:nowrap">Revisar →</a></div>`).join('')}
      ${r.mas ? `<div style="opacity:.8;margin-top:4px">y ${r.mas} más</div>` : ''}</div>`;
  }

  // Lo pone arriba de `contenedor` (solo para el dueño). `o.entradas` fuerza datos (para probar sin leer Firebase).
  async function montar(contenedor, o = {}){
    if(!contenedor) return;
    if(!o.entradas && !esDueno()) { contenedor.innerHTML = ''; return; }
    const entradas = o.entradas || await cargar();
    const r = armar(entradas, {duenoUid: o.duenoUid || (typeof fbUsuario !== 'undefined' && fbUsuario ? fbUsuario.uid : ''), vistoHasta: o.ignorarVisto ? 0 : vistoHasta(), max: 10});
    contenedor.innerHTML = html(r, o.base || '');
    const b = contenedor.querySelector('[data-aviso-visto]');
    if(b) b.onclick = () => { marcarVisto(r.ultima); contenedor.innerHTML = ''; };
  }

  return {TIPOS, armar, cargar, html, montar, esDueno};
})();
// El dueño del proyecto (el mismo de comun/biblioteca.js y de las reglas de Firestore); acá aparte porque index.html no carga biblioteca.js.
const BIBLIOTECA_DUENO_EMAIL_AVISO = 'rolpintoista@gmail.com';
