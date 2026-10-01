/* =========================================================
   FICHA-SESION — tener abierto un personaje en vivo, para cualquier pantalla (paso 4, etapa 3a de
   docs/plan-paso4-etapa3.md, 2026-10-01)
   Lo que antes vivía en ficha-personaje/js/12 y no es pantalla: escuchar el personaje en Firebase, armarlo la primera vez,
   aplicar lo que cambia desde otra ventana, guardar SOLO las partes que cambiaron (cuando dejan de cambiar 1,2 s, o cada
   5 s como mucho si no paran) y reintentar si falla. Así la ficha y el mapa abren un personaje con el MISMO código: dos
   pantallas con el mismo personaje se comportan como hoy dos ventanas de la ficha (en cada parte gana la última que
   guarda; la otra se actualiza sola).
   Cada pantalla le dice qué hacer en cada momento (las opciones de `escuchar` y `guardar`): la ficha muestra sus carteles
   y dibuja; otra pantalla puede no mostrar nada. El objeto de la sesión (`nueva`) es el mismo de siempre (`fichaVivo` en
   la ficha): id, duenoUid, cargada, soloLectura, editaGM, control, ultimo, sucias, enviando, escribiendo, reintentarDesde…
   Necesita comun/ficha-guardado.js (armarDatos, leerParte). Firebase (db, la ruta y la marca de tiempo) lo pasa quien llama.
   ========================================================= */
const FichaSesion = (() => {
  const QUIETO_MS = 1200;    // se escribe cuando una parte deja de cambiar este rato…
  const MAX_MS = 5000;       // …o, si no para de cambiar (tipeando), como mucho cada tanto
  const REINTENTO_MS = 8000;

  // El estado de un personaje abierto. soloLectura: lo decide quien llama (la ficha: fichaSoloLecturaPara).
  function nueva(id, duenoUid, cargada, soloLectura){
    return {
      id, duenoUid,
      editaGM: false,   // el GM puede pasar a editar (en la ficha: fichaAlternarEdicionGM)
      control: null,    // {uid, nombre, desde}: quien tiene el control del personaje (el GM, con "🎮 Tomar el control"); null = su dueño
      soloLectura,
      cargada,
      ultimo: {}, sucias: {}, enviando: {},
      ultimoResumen: '', revisarResumen: false,
      escribiendo: false, reintentarDesde: 0,
      cortes: [], cola: Promise.resolve(),
    };
  }

  /* ---------- Escuchar ----------
     o: {db, ruta (fbRutaCampana('fichas/<id>')), vigente() (¿sigue siendo el personaje abierto?),
         alDoc(doc)           — el documento principal cambió (dueño, borrado…),
         alCargar(armado)     — la primera vez: {datos, control, ultimo, imgInvocaciones} (FichaGuardado.armarDatos); la
                                sesión ya puso f.control y f.ultimo. Quien llama arma su personaje y PONE f.cargada = true,
         alControl(control)   — cambió la marca de 🎮 control (null = la tiene su dueño),
         aplicarParte(parte, datos) — una parte cambió desde otra ventana (datos ya leídos con FichaGuardado.leerParte),
         alCambiar()          — terminó de aplicar partes que cambiaron,
         alErrorPartes(err)} */
  function escuchar(f, o){
    const base = o.db.doc(o.ruta);
    f.cortes.push(base.onSnapshot(doc => {
      if(!o.vigente()) return;
      o.alDoc(doc);
    }, err => console.error('Error escuchando el personaje:', err)));
    // Partes: la primera vez arman el personaje entero; después, cada parte que cambia desde otra ventana (o el dueño, si
    // es solo lectura) se aplica sola. En cola, para que una carga lenta no se cruce con la siguiente.
    f.cortes.push(base.collection('partes').onSnapshot(snap => {
      f.cola = f.cola.then(() => {
        if(!o.vigente()) return;
        if(!f.cargada){
          const armado = FichaGuardado.armarDatos(snap.docs.map(d => ({id: d.id, json: d.data().json})));
          // La marca de control del GM no es un dato del personaje: va aparte.
          if(armado.control) f.control = armado.control;
          Object.assign(f.ultimo, armado.ultimo);
          o.alCargar(armado);
          return;
        }
        let cambio = false;
        snap.docChanges().forEach(ch => {
          if(ch.doc.id === 'control'){
            if(ch.doc.metadata.hasPendingWrites) return;   // lo escribió esta misma pantalla: ya se aplicó
            let c = null;
            if(ch.type !== 'removed'){ try{ c = JSON.parse(String(ch.doc.data().json || 'null')); }catch(e){} }
            const nuevo = c && c.uid ? c : null;
            if((nuevo && nuevo.uid) !== (f.control && f.control.uid)) o.alControl(nuevo);
            return;
          }
          if(ch.type === 'removed' || ch.doc.metadata.hasPendingWrites) return;
          const json = String(ch.doc.data().json || '');
          if(json === f.ultimo[ch.doc.id] || json === f.enviando[ch.doc.id]) return;
          o.aplicarParte(ch.doc.id, FichaGuardado.leerParte(ch.doc.id, json));
          f.ultimo[ch.doc.id] = json;
          delete f.sucias[ch.doc.id];
          cambio = true;
        });
        if(cambio) o.alCambiar();
      }).catch(err => console.error('Error aplicando cambios de la ficha:', err));
    }, err => {
      console.error('Error escuchando las partes del personaje:', err);
      if(o.alErrorPartes) o.alErrorPartes(err);
    }));
  }
  // Deja de escuchar (no guarda nada).
  function cortar(f){
    if(!f) return;
    f.cortes.forEach(c => c());
    f.cortes = [];
  }

  /* ---------- Guardar ----------
     Llamarla seguido (la ficha, cada 1 s): escribe solo las partes que cambiaron y ya dejaron de cambiar (o forzar = ya).
     o: {db, ruta, marcaDeTiempo() (serverTimestamp), partes() ({parte: json}, FichaGuardado.partes), resumen(), nombre(),
         miniatura() (async: la del token), juntos() / juntosListo() (todas las partes en el mismo lote: recién migrada la
         escala de Tipos), alEstado() (mostrar "Guardando…", "✓ Guardado"…), vigente(), alError(err, primeraVez)} */
  async function guardar(f, forzar, o){
    if(!f || f.soloLectura || !f.cargada || f.escribiendo) return;
    const ahora = Date.now();
    if(f.reintentarDesde && ahora < f.reintentarDesde && !forzar) return;
    const estado = () => { if(o.alEstado) o.alEstado(); };
    // Recién pasada a la escala nueva de Tipos: la marca (en "otros") y los ítems corridos tienen que llegar juntos, o la
    // próxima carga los correría otra vez.
    const juntos = !!(o.juntos && o.juntos());
    forzar = forzar || juntos;
    const actuales = o.partes();
    const listas = [];
    Object.entries(actuales).forEach(([parte, json]) => {
      if(json === f.ultimo[parte]){ delete f.sucias[parte]; return; }
      const s = f.sucias[parte];
      if(!s) f.sucias[parte] = {json, desde: ahora, cambio: ahora};
      else if(s.json !== json){ s.json = json; s.cambio = ahora; }
      const t = f.sucias[parte];
      if(forzar || ahora - t.cambio >= QUIETO_MS || ahora - t.desde >= MAX_MS) listas.push([parte, json]);
    });
    if(juntos && !listas.length && o.juntosListo) o.juntosListo();
    if(!listas.length && !f.revisarResumen && !f.reponerMiniatura){ estado(); return; }

    f.escribiendo = true;
    f.revisarResumen = false;
    estado();
    const ts = o.marcaDeTiempo();
    const base = o.db.doc(o.ruta);
    const batch = o.db.batch();
    listas.forEach(([parte, json]) => {
      batch.set(base.collection('partes').doc(parte), {json, actualizado: ts});
      f.enviando[parte] = json;
    });
    const cambios = {};
    const nombre = o.nombre();
    const resumen = o.resumen();
    const resumenJson = JSON.stringify([nombre, resumen]);
    if(resumenJson !== f.ultimoResumen){ cambios.nombre = nombre; cambios.resumen = resumen; }
    const retrato = listas.find(([parte]) => parte === 'retrato');
    if(retrato) cambios.miniatura = await o.miniatura();
    else if(f.reponerMiniatura){
      const mini = await o.miniatura();
      if(mini) cambios.miniatura = mini;
      f.reponerMiniatura = false;
    }
    if(Object.keys(cambios).length){ cambios.actualizado = ts; batch.update(base, cambios); }

    try{
      await batch.commit();
      listas.forEach(([parte, json]) => {
        f.ultimo[parte] = json;
        if(f.sucias[parte] && f.sucias[parte].json === json) delete f.sucias[parte];
      });
      f.ultimoResumen = resumenJson;
      f.reintentarDesde = 0;
      if(juntos && o.juntosListo) o.juntosListo();
    }catch(err){
      console.error('No se pudo guardar la ficha en la mesa:', err);
      if(o.alError) o.alError(err, !f.reintentarDesde);
      f.reintentarDesde = Date.now() + REINTENTO_MS;
    }finally{
      listas.forEach(([parte]) => { delete f.enviando[parte]; });
      f.escribiendo = false;
      if(!o.vigente || o.vigente()) estado();
    }
  }
  // ¿Queda algo sin guardar? partes(): lo de ahora ({parte: json}).
  function pendiente(f, partes){
    if(!f || f.soloLectura || !f.cargada) return false;
    if(f.escribiendo) return true;
    const actuales = partes();
    return Object.keys(actuales).some(p => actuales[p] !== f.ultimo[p]);
  }

  return {QUIETO_MS, MAX_MS, nueva, escuchar, cortar, guardar, pendiente};
})();
