/* =========================================================
   RESPALDO DE LA PARTIDA
   Compartido por la ficha y gm-tools (se carga después de sesion.js).
   Firebase gratis no hace copias de seguridad: cualquiera baja un .json
   con lo que puede ver de la partida.

   - Todos: partida, miembros, personajes (armados igual que "Guardar
     copia" de la ficha, con retrato e imágenes de invocaciones), tokens,
     mapa, tiradas, lo público de los creeps y la tienda publicada.
   - El GM, además: los creeps completos con su imagen y el turno
     (gmCreeps, con la forma de gm-creeps.json) y el borrador de la tienda
     que está armando. Los jugadores no pueden
     leer eso (lo imponen las reglas), así que su respaldo no lo trae.

   Para recuperar: "Cargar archivo" en la ficha (pregunta qué personaje)
   o en gm-tools (toma los creeps; solo sirve el respaldo de un GM).
   Ver docs/workflow-firebase.md.
   ========================================================= */

// Fechas de Firestore a texto, en cualquier profundidad.
function fbRespaldoPlano(v){
  if(v instanceof firebase.firestore.Timestamp) return v.toDate().toISOString();
  if(Array.isArray(v)) return v.map(fbRespaldoPlano);
  if(v && typeof v === 'object'){
    const o = {};
    Object.keys(v).forEach(k => { o[k] = fbRespaldoPlano(v[k]); });
    return o;
  }
  return v;
}

async function fbArmarRespaldo(){
  const n = v => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };
  const base = fbDb.doc(fbRutaCampana());
  const docs = async ref => (await ref.get()).docs;
  const plano = d => ({id: d.id, ...d.data()});
  const esGM = !!(fbMiembro && fbMiembro.gm);
  const [partida, miembros, fichasDocs, creepsDocs, tokens, mapa, tiradas, gm, tiendaPublicada, tiendaBorrador] = await Promise.all([
    base.get(),
    docs(base.collection('miembros')), docs(base.collection('fichas')), docs(base.collection('creeps')),
    docs(base.collection('tokens')), docs(base.collection('mapa')), docs(base.collection('tiradas')),
    esGM ? docs(base.collection('gm')) : Promise.resolve([]),
    base.collection('tienda').doc('publicada').get(),
    esGM ? base.collection('tienda').doc('borrador').get() : Promise.resolve(null),
  ]);
  const tiendasGuardadas = esGM ? await docs(base.collection("tiendas")) : [];
  // Mapas guardados aparte del de siempre (vtt-hexgrid/mapa.html, "🗺
  // Mapas"): cada uno con su fondo/modo/iniciativa y sus tokens.
  // (Si las reglas todavía no conocen "mapas", el respaldo sale igual, sin ellos.)
  let mapasExtra = [];
  try{
    const mapasDocs = await docs(base.collection("mapas"));
    mapasExtra = await Promise.all(mapasDocs.map(async m => ({
      ...plano(m),
      estado: (await docs(m.ref.collection("estado"))).map(plano),
      tokens: (await docs(m.ref.collection("tokens"))).map(plano),
    })));
  }catch(e){ console.warn("Respaldo sin los mapas guardados aparte:", e); }
  // Bitácora compartida: cada página con sus entradas en orden.
  // (Si las reglas todavía no la conocen, el respaldo sale igual, sin ella.)
  let bitacora = [];
  try{
    const bitacoraPaginas = await docs(base.collection("bitacora").orderBy("creado"));
    bitacora = await Promise.all(bitacoraPaginas.map(async p => ({
      ...plano(p),
      entradas: (await docs(p.ref.collection("entradas").orderBy("creado"))).map(plano),
    })));
  }catch(e){ console.warn("Respaldo sin bitácora:", e); }
  // Bitácora privada del GM (solo la puede leer el GM).
  let bitacoraGM = [];
  if(esGM){
    try{
      const paginasGM = await docs(base.collection("gmBitacora").orderBy("creado"));
      bitacoraGM = await Promise.all(paginasGM.map(async p => ({
        ...plano(p),
        entradas: (await docs(p.ref.collection("entradas").orderBy("creado"))).map(plano),
      })));
    }catch(e){ console.warn("Respaldo sin la bitácora del GM:", e); }
  }
  // Tienda del vendedor: el json tal cual lo guarda el generador de tiendas.
  const tiendaJson = d => {
    if(!d || !d.exists) return null;
    try{ return JSON.parse(d.data().json || ''); }catch(e){ return null; }
  };
  const nombres = Object.fromEntries(miembros.map(m => [m.id, m.data().nombre]));

  // Personajes: se juntan sus partes como las arma la ficha al abrirse.
  const fichas = await Promise.all(fichasDocs.map(async d => {
    const partes = await docs(d.ref.collection('partes'));
    const ficha = {};
    let retrato = '';
    let imgInvocaciones = {};
    partes.forEach(p => {
      let v;
      try{ v = JSON.parse(p.data().json || ''); }catch(e){ return; }
      if(p.id === 'retrato') retrato = typeof v === 'string' ? v : '';
      else if(p.id === 'imgInvocaciones') imgInvocaciones = v && typeof v === 'object' ? v : {};
      else if(v && typeof v === 'object') Object.assign(ficha, v);
    });
    ficha.meta = {...(ficha.meta || {}), imagen: retrato};
    (ficha.invocaciones || []).forEach(inv => { if(inv && imgInvocaciones[inv.id]) inv.imagen = imgInvocaciones[inv.id]; });
    const md = d.data();
    return {id: d.id, nombre: md.nombre || '', duenoUid: md.duenoUid || '', dueno: nombres[md.duenoUid] || '', ficha};
  }));

  const respaldo = {
    tipo: 'respaldo-partida',
    version: 1,
    creado: new Date().toISOString(),
    hechoPor: {nombre: fbMiembro ? fbMiembro.nombre : '', gm: esGM},
    partida: {id: FB_CAMPANA, ...partida.data()},
    miembros: miembros.map(plano),
    fichas,
    creepsPublicos: creepsDocs.map(plano),
    tokens: tokens.map(plano),
    mapa: mapa.map(plano),
    mapasExtra,
    tiradas: tiradas.map(plano),
    bitacora,
    ...(esGM ? {bitacoraGM} : {}),
    tienda: {
      publicada: tiendaJson(tiendaPublicada),
      ...(esGM ? {borrador: tiendaJson(tiendaBorrador), guardadas: tiendasGuardadas.map(d => ({id: d.id, nombre: d.data().nombre, tienda: tiendaJson(d)}))} : {}),
    },
  };

  // Solo el GM: creeps completos, con su imagen, en el orden de gm-tools.
  if(esGM){
    const creeps = await Promise.all(creepsDocs.map(async d => {
      const [f, i] = await Promise.all([
        d.ref.collection('privado').doc('ficha').get(),
        d.ref.collection('privado').doc('imagen').get(),
      ]);
      let sc = {};
      try{ sc = f.exists ? JSON.parse(f.data().json || '{}') : {}; }catch(e){}
      return {orden: n(d.data().orden), creep: {...sc, id: d.id, nombre: sc.nombre || d.data().nombre, imagen: i.exists ? (i.data().dato || '') : ''}};
    }));
    creeps.sort((a, b) => a.orden - b.orden);
    const estado = gm.find(d => d.id === 'estado');
    respaldo.gmCreeps = {turno: estado ? n(estado.data().turno) : 1, creeps: creeps.map(c => c.creep)};
  }
  return fbRespaldoPlano(respaldo);
}

// Arma el respaldo y lo baja. Devuelve un texto corto para mostrar.
async function fbBajarRespaldo(){
  const respaldo = await fbArmarRespaldo();
  const fecha = new Date();
  const p2 = x => String(x).padStart(2, '0');
  const slug = String((fbPartida && fbPartida.nombre) || 'partida').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'partida';
  const nombre = `respaldo-${slug}-${fecha.getFullYear()}-${p2(fecha.getMonth() + 1)}-${p2(fecha.getDate())}.json`;
  const blob = new Blob([JSON.stringify(respaldo)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  const creeps = respaldo.gmCreeps ? `, ${respaldo.gmCreeps.creeps.length} creep(s)` : '';
  return `Respaldo bajado: ${respaldo.fichas.length} personaje(s)${creeps}`;
}
