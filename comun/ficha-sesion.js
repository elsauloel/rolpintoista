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
      ultimo: {}, sucias: {}, enviando: {}, debe: {}, otraVez: false,
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
  // El resumen en una forma que no depende del orden de las claves (Firestore las devuelve en otro orden): para comparar.
  const estable = v => Array.isArray(v) ? '[' + v.map(estable).join(',') + ']'
    : v && typeof v === 'object' ? '{' + Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => JSON.stringify(k) + ':' + estable(v[k])).join(',') + '}'
    : JSON.stringify(v === undefined ? null : v);
  function escuchar(f, o){
    const base = o.db.doc(o.ruta);
    f.cortes.push(base.onSnapshot(doc => {
      if(!o.vigente()) return;
      // Lo que quedó escrito en el servidor (2026-10-20, probado en el mapa): el daño de un duelo escribe el resumen desde afuera
      // (danioPj); si la sesión solo se acordaba de lo que ELLA escribió, un cambio que volvía a ese valor no se guardaba y el resumen
      // quedaba viejo (la ficha en 20 de vida, el mapa mostrando 14).
      if(doc.exists && !doc.metadata.hasPendingWrites){ const d = doc.data() || {}; f.ultimoResumen = estable([d.nombre, d.resumen]); }
      o.alDoc(doc);
    }, err => console.error('Error escuchando el personaje:', err)));
    // Partes: la primera vez arman el personaje entero; después, cada parte que cambia desde otra ventana (o el dueño, si
    // es solo lectura) se aplica sola. En cola, para que una carga lenta no se cruce con la siguiente.
    // includeMetadataChanges: para enterarse cuando el servidor confirma lo que ya estaba en la memoria local (ver abajo).
    f.cortes.push(base.collection('partes').onSnapshot({includeMetadataChanges: true}, snap => {
      f.cola = f.cola.then(() => {
        if(!o.vigente()) return;
        if(!f.cargada){
          // La primera carga espera al servidor (2026-10-01): lo que Firestore tenga en memoria puede ser solo algunas partes
          // (las que esta misma página escribió o leyó antes), y armar el personaje con eso lo deja a medias — sin "otros",
          // hasta corre +2 los Tipos de las armas que sí llegaron (la migración de la escala de Tipos).
          if(snap.metadata.fromCache) return;
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
          if(f.debe) delete f.debe[ch.doc.id];   // lo de afuera pisa lo que esta pantalla tenía sin guardar en esa parte
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
  /* 🐞 (2026-11-20, «después de revivir con el Pacto dejan de entrarle los debuffs»): tres agujeros por los que un cambio ya hecho en memoria
     no llegaba nunca a Firebase, sin ningún aviso:
     - si llegaba un segundo cambio mientras el primero se estaba escribiendo, `guardar` volvía sin hacer nada y nadie lo llamaba de nuevo (el mapa
       guarda solo después de cada cambio, no cada segundo como la ficha): ahora queda anotado (`f.otraVez`) y se guarda apenas termina el primero;
     - si armar lo que se escribe fallaba (un `undefined` en el resumen: Firestore lo rechaza al armar el lote), `f.escribiendo` quedaba prendido
       para siempre y esa pantalla no volvía a guardar a ese personaje: ahora el armado va adentro del try, y al resumen se le sacan los `undefined`;
     - quien llama después de un cambio (el mapa) marcaba como «ya guardada» toda parte que su acción no tocó, también la que otro cambio había
       dejado sin guardar: ver `marcar` (la deuda, `f.debe`).
     → true si no quedó nada por escribir de lo que se intentó; false si falló o estaba ocupada. */
  const sinIndefinidos = v => Array.isArray(v) ? v.map(x => x === undefined ? null : sinIndefinidos(x))
    : (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => [k, sinIndefinidos(x)]))
    : v;
  async function guardar(f, forzar, o){
    if(!f || f.soloLectura || !f.cargada) return false;
    if(f.escribiendo){ if(forzar) f.otraVez = true; return false; }   // se guarda apenas termine la escritura en curso
    const ahora = Date.now();
    if(f.reintentarDesde && ahora < f.reintentarDesde && !forzar) return false;
    const estado = () => { if(o.alEstado) o.alEstado(); };
    // Recién pasada a la escala nueva de Tipos: la marca (en "otros") y los ítems corridos tienen que llegar juntos, o la
    // próxima carga los correría otra vez.
    const juntos = !!(o.juntos && o.juntos());
    forzar = forzar || juntos;
    const actuales = o.partes();
    const listas = [];
    Object.entries(actuales).forEach(([parte, json]) => {
      if(json === f.ultimo[parte]){ delete f.sucias[parte]; if(f.debe) delete f.debe[parte]; return; }
      const s = f.sucias[parte];
      if(!s) f.sucias[parte] = {json, desde: ahora, cambio: ahora};
      else if(s.json !== json){ s.json = json; s.cambio = ahora; }
      const t = f.sucias[parte];
      if(forzar || ahora - t.cambio >= QUIETO_MS || ahora - t.desde >= MAX_MS) listas.push([parte, json]);
    });
    if(juntos && !listas.length && o.juntosListo) o.juntosListo();
    if(!listas.length && !f.revisarResumen && !f.reponerMiniatura){ estado(); return true; }

    f.escribiendo = true;
    f.revisarResumen = false;
    let ok = false;
    try{
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
      const resumen = sinIndefinidos(o.resumen());
      const resumenJson = estable([nombre, resumen]);
      if(resumenJson !== f.ultimoResumen){ cambios.nombre = nombre; cambios.resumen = resumen; }
      const retrato = listas.find(([parte]) => parte === 'retrato');
      if(retrato) cambios.miniatura = await o.miniatura();
      else if(f.reponerMiniatura){
        const mini = await o.miniatura();
        if(mini) cambios.miniatura = mini;
        f.reponerMiniatura = false;
      }
      if(Object.keys(cambios).length){ cambios.actualizado = ts; batch.update(base, cambios); }

      const antes = listas.map(([parte, json]) => [parte, f.ultimo[parte], json]);   // para el registro de la pausa (lo de antes y lo de ahora)
      await batch.commit();
      if(typeof Pausa !== 'undefined') try{ Pausa.alGuardar(antes, nombre); }catch(err){ console.error('El registro de la pausa:', err); }   // ⏸ partida en pausa: lo importante que cambió queda anotado para el GM
      listas.forEach(([parte, json]) => {
        f.ultimo[parte] = json;
        if(f.sucias[parte] && f.sucias[parte].json === json) delete f.sucias[parte];
        if(f.debe) delete f.debe[parte];
      });
      f.ultimoResumen = resumenJson;
      // 🏷 Un nombre nuevo: su dueño pone al día el de sus tokens en todos los mapas (comun/tokens-auto.js, 2026-11-20).
      if(cambios.nombre && typeof TokensAuto !== 'undefined' && TokensAuto.nombresPonerAlDia && typeof fbUsuario !== 'undefined' && fbUsuario && f.duenoUid === fbUsuario.uid)
        TokensAuto.nombresPonerAlDia({fichaId: f.id, nombre}).catch(() => {});
      f.reintentarDesde = 0;
      if(juntos && o.juntosListo) o.juntosListo();
      ok = true;
    }catch(err){
      console.error('No se pudo guardar la ficha en la mesa:', err);
      if(o.alError) try{ o.alError(err, !f.reintentarDesde); }catch(e){}
      f.reintentarDesde = Date.now() + REINTENTO_MS;
    }finally{
      listas.forEach(([parte]) => { delete f.enviando[parte]; });
      f.escribiendo = false;
      try{ if(!o.vigente || o.vigente()) estado(); }catch(e){}
    }
    // Llegó otro cambio mientras se escribía: se guarda ahora (lo que haya quedado distinto de lo escrito).
    if(f.otraVez){ f.otraVez = false; if(ok) return guardar(f, true, o); }
    return ok;
  }
  /* Después de un cambio hecho por una acción (el mapa: la Botonera nueva y editarPersonajeMapa): `antes` y `despues` son las partes antes y
     después de la acción ({parte: json}). Lo que la acción cambió queda como DEUDA (`f.debe`) hasta que se escribe o hasta que llega esa parte
     de afuera; lo que no cambió y difiere de lo guardado solo por haberlo armado distinto se da por guardado (no se reescribe) — salvo que sea
     deuda de un cambio anterior que todavía no se escribió. → las partes que cambió esta acción. */
  function marcar(f, antes, despues){
    f.debe = f.debe || {};
    const cambiadas = [];
    Object.keys(despues).forEach(p => {
      if(despues[p] !== antes[p]){ f.debe[p] = true; cambiadas.push(p); }
      else if(!f.debe[p] && despues[p] !== f.ultimo[p]) f.ultimo[p] = despues[p];
    });
    return cambiadas;
  }
  const debe = f => Object.keys((f && f.debe) || {});
  /* Guardar YA y esperar a que quede escrito (hasta `intentos` veces, con una pausa entre una y otra): para lo que no se puede perder (un aviso
     que se tomó de la cola). → true si no quedó nada pendiente. */
  async function asentar(f, o, intentos, pausaMs){
    const n = intentos || 6, espera = pausaMs === undefined ? 1500 : pausaMs;
    for(let i = 0; i < n; i++){
      if(!pendiente(f, o.partes)) return true;
      await guardar(f, true, o);
      if(!pendiente(f, o.partes)) return true;
      if(i < n - 1) await new Promise(r => setTimeout(r, espera));
    }
    return !pendiente(f, o.partes);
  }
  // ¿Queda algo sin guardar? partes(): lo de ahora ({parte: json}).
  function pendiente(f, partes){
    if(!f || f.soloLectura || !f.cargada) return false;
    if(f.escribiendo) return true;
    const actuales = partes();
    return Object.keys(actuales).some(p => actuales[p] !== f.ultimo[p]);
  }

  return {QUIETO_MS, MAX_MS, nueva, escuchar, cortar, guardar, pendiente, marcar, debe, asentar};
})();
