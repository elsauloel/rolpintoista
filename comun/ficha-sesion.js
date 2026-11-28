/* =========================================================
   FICHA-SESION — tener abierto un personaje en vivo, para cualquier pantalla (paso 4, etapa 3a de
   docs/plan-paso4-etapa3.md, 2026-10-01)
   Lo que antes vivía en ficha-personaje/js/12 y no es pantalla: escuchar el personaje en Firebase, armarlo la primera vez,
   aplicar lo que cambia desde otra ventana, guardar SOLO las partes que cambiaron (cuando dejan de cambiar 1,2 s, o cada
   5 s como mucho si no paran) y reintentar si falla. Así la ficha y el mapa abren un personaje con el MISMO código: dos
   pantallas con el mismo personaje se comportan como dos ventanas de la ficha (la otra se actualiza sola). Desde el 2026-11-27
   (P370) ya no gana la última que guarda: antes de escribir, cada pantalla mira si la parte cambió en Firebase y, si cambió,
   suma lo suyo encima (`mezclar`; los No2, el SP y la vida como diferencia).
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
    // 💾 P370: lo que `guardar` tuvo que sumar de otra pantalla se aplica acá igual que un cambio que llega de afuera.
    f.aplicarDeAfuera = lista => {
      if(!o.vigente() || !f.cargada) return;
      lista.forEach(([parte, json]) => o.aplicarParte(parte, FichaGuardado.leerParte(parte, json)));
      if(lista.length) o.alCambiar();
    };
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
          // 💾 P370: esta pantalla está escribiendo esa parte ahora mismo: no se aplica acá (se perdería lo que se está escribiendo); lo
          // resuelve `guardar` al terminar (si es algo que la escritura no tenía, lo vuelve a leer y lo suma).
          if(f.enviando[ch.doc.id] !== undefined){ (f.llegoDurante = f.llegoDurante || {})[ch.doc.id] = json; return; }
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
  /* ---------- 💾 Dos pantallas con el mismo personaje (P370, 2026-11-27) ----------
     En una partida, una pestaña dormida con una copia vieja del personaje guardó encima y le devolvió al jugador los No2 y el SP que había
     gastado (ganaba la última que guardaba). Ahora, antes de escribir una parte, `guardar` la lee en Firebase (en una transacción): si cambió
     desde la última vez que esta pantalla la leyó, no la pisa: le suma encima lo que esta pantalla cambió (`mezclar`, pura).
     - Lo que esta pantalla no tocó (igual a lo leído) queda como está en Firebase; lo que solo cambió esta pantalla, se escribe.
     - Si las dos cambiaron el mismo dato y es un contador (la vida, el SP gastado, los No2, los ataques del turno), se suma la DIFERENCIA:
       si acá se gastaron 2 y allá 5, quedan los 7 gastados.
     - Si las dos cambiaron el mismo dato y no es un contador (una lista: la mochila, los estados…; un texto), gana esta pantalla, solo en ese
       dato (`choques`; la duda: P371).
     - Si las dos tienen en ese dato el mismo valor, queda ese. */
  // Las reglas de los contadores, por parte. contador: se suma la diferencia (con `min`: no baja de ahí); hijos: la misma regla para cada clave
  // de un objeto ({idArma: ataques}); max: una marca (se queda el mayor); nulo 'menor': los No2 en null = llenos (no se sabe cuántos son: se
  // queda el menor de los dos, para no devolver nada gastado).
  const CONTADORES = {
    general: {
      hp: {contador: true, min: 0},
      spGastado: {contador: true, min: 0},
      nitros: {contador: true, nulo: 'menor'},   // puede quedar en negativo (la deuda de una defensa sin No2)
      ataquesTurno: {contador: true, min: 0},
      ataquesArma: {hijos: {contador: true, min: 0}, claves: {_golpe: {max: true}}},
    },
  };
  const esObjeto = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const igual = (a, b) => estable(a) === estable(b);
  function mezclarValor(b, m, s, regla, ruta, choques){
    if(igual(m, b)) return s;          // esta pantalla no lo tocó: lo de Firebase
    if(igual(s, b)) return m;          // solo lo cambió esta pantalla
    if(regla && regla.max && typeof m === 'number' && typeof s === 'number') return Math.max(m, s);
    // Un contador que cambiaron las dos (aunque haya quedado en el mismo número: dos gastos de 2 son 4 gastados).
    if(regla && regla.contador && typeof m === 'number' && typeof s === 'number'){
      let v;
      if(typeof b === 'number') v = s + (m - b);
      else if(b === null && regla.nulo === 'menor') v = Math.min(m, s);
      else if(b === undefined || b === null) v = s + m;   // no estaba: lo de las dos
      if(v !== undefined) return regla.min !== undefined ? Math.max(regla.min, v) : v;
    }
    if(esObjeto(m) && esObjeto(s)){
      const bb = esObjeto(b) ? b : {};
      const r = {};
      [...Object.keys(m), ...Object.keys(s).filter(k => !(k in m))].forEach(k => {
        const sub = regla ? ((regla.claves && regla.claves[k]) || regla.hijos) : undefined;
        const v = mezclarValor(bb[k], m[k], s[k], sub, ruta ? ruta + '.' + k : k, choques);
        if(v !== undefined) r[k] = v;
      });
      return r;
    }
    if(igual(m, s)) return m;          // las dos dejaron lo mismo
    choques.push(ruta || '(todo)');
    return m;
  }
  /* parte: el id de la parte; base: el json que esta pantalla había leído; mio: el de esta pantalla; servidor: el que está ahora en Firebase.
     → {json, choques: [rutas donde las dos cambiaron lo mismo y quedó lo de esta pantalla]}. */
  function mezclar(parte, base, mio, servidor){
    if(servidor === null || servidor === undefined || base === undefined || base === null || servidor === base) return {json: mio, choques: []};
    // (Si las dos quedaron iguales no se da por «ya escrito»: dos gastos iguales hechos en dos pantallas son dos gastos.)
    if(mio === base) return {json: servidor, choques: []};
    let b, m, s;
    try{ b = JSON.parse(base); m = JSON.parse(mio); s = JSON.parse(servidor); }catch(e){ return {json: mio, choques: ['(todo)']}; }
    const choques = [];
    const r = mezclarValor(b, m, s, CONTADORES[parte] ? {claves: CONTADORES[parte]} : undefined, '', choques);
    return {json: JSON.stringify(r === undefined ? null : r), choques};
  }

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
    // Lo que esta pantalla había leído de cada parte (la base de la mezcla), tomado ANTES de esperar nada: lo que llegue de afuera mientras
    // tanto no se aplica (ver `escuchar`, f.llegoDurante).
    const bases = {};
    f.llegoDurante = {};
    listas.forEach(([parte, json]) => { bases[parte] = f.ultimo[parte]; f.enviando[parte] = json; });
    let ok = false;
    try{
      estado();
      const ts = o.marcaDeTiempo();
      const base = o.db.doc(o.ruta);
      const ref = parte => base.collection('partes').doc(parte);
      const nombre = o.nombre();
      const resumen = sinIndefinidos(o.resumen());
      const resumenJson = estable([nombre, resumen]);
      const fijos = {};
      const retrato = listas.find(([parte]) => parte === 'retrato');
      if(retrato) fijos.miniatura = await o.miniatura();
      else if(f.reponerMiniatura){
        const mini = await o.miniatura();
        if(mini) fijos.miniatura = mini;
        f.reponerMiniatura = false;
      }
      const sabido = f.ultimoResumen;
      const leerJson = d => d && d.exists ? String((d.data() || {}).json || '') : null;
      let r = null;
      await o.db.runTransaction(async t => {
        const rr = {escritas: [], adoptadas: [], resumenServidor: '', resumen: false};
        const [doc, ...docs] = await Promise.all([t.get(base), ...listas.map(([parte]) => t.get(ref(parte)))]);
        const dd = doc.exists ? (doc.data() || {}) : null;
        rr.resumenServidor = dd ? estable([dd.nombre, dd.resumen]) : '';
        // ¿Esta pantalla está atrasada? (el resumen de Firebase ya no es el último que vio): entonces lee también las otras partes, para
        // ponerse al día con lo que cambió otra pantalla.
        const atrasada = !!(dd && sabido && rr.resumenServidor !== sabido);
        listas.forEach(([parte, mio], i) => {
          const servidor = leerJson(docs[i]);
          const m = mezclar(parte, bases[parte], mio, servidor);
          rr.escritas.push({parte, mio, escrito: m.json, base: bases[parte], servidor, choques: m.choques});
        });
        if(atrasada){
          const resto = Object.keys(actuales).filter(p => !listas.some(([q]) => q === p));
          const ds = await Promise.all(resto.map(p => t.get(ref(p))));
          resto.forEach((p, i) => {
            const servidor = leerJson(ds[i]);
            if(servidor !== null && f.ultimo[p] !== undefined && servidor !== f.ultimo[p]) rr.adoptadas.push({parte: p, base: f.ultimo[p], servidor});
          });
        }
        rr.escritas.forEach(e => t.set(ref(e.parte), {json: e.escrito, actualizado: ts}));
        const mezclo = rr.escritas.some(e => e.escrito !== e.mio) || rr.adoptadas.length > 0;
        const cambios = {...fijos};
        // El resumen público sale de lo que tiene esta pantalla: si tuvo que sumar algo de otra, se escribe recién cuando lo tenga aplicado.
        if(!mezclo && resumenJson !== rr.resumenServidor){ cambios.nombre = nombre; cambios.resumen = resumen; rr.resumen = true; }
        if(Object.keys(cambios).length){ cambios.actualizado = ts; t.update(base, cambios); }
        rr.mezclo = mezclo;
        r = rr;
      });

      // Algo que llegó de afuera mientras se escribía y no estaba en lo que se leyó: se vuelve a leer (lo último de Firebase) y se suma.
      for(const e of r.escritas){
        const llego = f.llegoDurante[e.parte];
        if(llego === undefined || llego === e.escrito || llego === e.servidor) continue;
        try{
          const d = await ref(e.parte).get({source: 'server'});
          const servidor = leerJson(d);
          if(servidor !== null && servidor !== e.escrito){ r.adoptadas.push({parte: e.parte, base: e.escrito, servidor, tarde: true}); r.mezclo = true; }
        }catch(err){ console.error('No se pudo releer una parte del personaje:', err); }
      }

      const antes = r.escritas.map(e => [e.parte, e.base, e.escrito]);   // para el registro de la pausa (lo de antes y lo de ahora)
      if(typeof Pausa !== 'undefined') try{ Pausa.alGuardar(antes, nombre); }catch(err){ console.error('El registro de la pausa:', err); }   // ⏸ partida en pausa: lo importante que cambió queda anotado para el GM
      // Lo que quedó en Firebase vuelve a esta pantalla (sumado a lo que se haya cambiado acá mientras se escribía).
      const local = o.partes();
      const aplicar = [];
      const incorporar = (parte, baseLocal, nuevo) => {
        const actual = local[parte];
        const queda = actual === baseLocal ? nuevo : mezclar(parte, baseLocal, actual, nuevo).json;
        f.ultimo[parte] = nuevo;
        delete f.sucias[parte];
        if(f.debe) delete f.debe[parte];
        if(queda !== actual) aplicar.push([parte, queda]);
        if(queda !== nuevo){ f.debe = f.debe || {}; f.debe[parte] = true; f.otraVez = true; }   // lo que se cambió acá mientras tanto: se escribe enseguida
      };
      r.escritas.forEach(e => {
        const tarde = r.adoptadas.find(a => a.tarde && a.parte === e.parte);
        incorporar(e.parte, e.mio, tarde ? tarde.servidor : e.escrito);   // lo último de Firebase (si llegó algo más nuevo, ya trae lo escrito)
        if(e.choques.length) console.warn(`💾 ${nombre}: otra pantalla cambió lo mismo en «${e.parte}» (${e.choques.join(', ')}); quedó lo de esta.`);
      });
      r.adoptadas.filter(a => !a.tarde).forEach(a => incorporar(a.parte, a.base, a.servidor));
      if(aplicar.length && f.aplicarDeAfuera) f.aplicarDeAfuera(aplicar);
      if(r.resumen) f.ultimoResumen = resumenJson;
      else if(r.mezclo){ f.ultimoResumen = r.resumenServidor; f.revisarResumen = true; f.otraVez = true; }   // ahora sí: el resumen con todo
      else f.ultimoResumen = r.resumenServidor || f.ultimoResumen;
      // 🏷 Un nombre nuevo: su dueño pone al día el de sus tokens en todos los mapas (comun/tokens-auto.js, 2026-11-20).
      if(r.resumen && typeof TokensAuto !== 'undefined' && TokensAuto.nombresPonerAlDia && typeof fbUsuario !== 'undefined' && fbUsuario && f.duenoUid === fbUsuario.uid)
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
      f.llegoDurante = {};
      f.escribiendo = false;
      try{ if(!o.vigente || o.vigente()) estado(); }catch(e){}
    }
    // Llegó otro cambio mientras se escribía (o hubo que sumar lo de otra pantalla): se guarda ahora (lo que haya quedado distinto de lo escrito).
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

  return {QUIETO_MS, MAX_MS, CONTADORES, nueva, escuchar, cortar, guardar, pendiente, marcar, debe, asentar, mezclar};
})();
