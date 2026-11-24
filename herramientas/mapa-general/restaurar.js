// ↩ Vuelve el mapa a la «foto» (la de foto.js): borra lo que se agregó en el mapa (tokens, elementos, dibujos, estado), vuelve a poner lo
// que se sacó y deja cada token, ficha (con sus partes) y creep (con su ficha privada) como estaba. Al final lo vuelve a leer y compara.
// Uso: node restaurar.js [archivo.json]   ·   Con --ver: solo dice qué cambiaría, sin escribir nada.
'use strict';
const B = require('./base');
const SOLO_VER = process.argv.includes('--ver');
const ahora = {__f: 'ahora'};
(async () => {
  const archivo = B.archivoFoto(process.argv.slice(2).find(a => !a.startsWith('--')));
  if(!B.fs.existsSync(archivo)) throw new Error(`No encuentro la foto (${archivo}): primero node foto.js`);
  const foto = JSON.parse(B.fs.readFileSync(archivo, 'utf8'));
  const {nav, page, ids} = await B.abrir();
  try{
    if(foto.mid !== ids.mid) throw new Error('La foto es de otro mapa (¿se borró y se volvió a crear?): sacá una foto nueva');
    const antes = await B.leer(page, ids.mid, {fichas: foto.fichas, creeps: foto.creeps});
    const F = foto.docs, A = antes.docs, m = `mapas/${ids.mid}`;
    const ops = [];   // {ruta, datos?, borrar?, que}
    // 1) Lo que sobra: en el mapa, en las partes de las fichas y en la ficha privada de los creeps de la foto; y los creeps nuevos del mapa.
    const borrable = r => r.startsWith(`${m}/`) || /^fichas\/[^/]+\/partes\//.test(r) || /^creeps\/[^/]+\/(privado|publico)\//.test(r);
    const creepsNuevos = antes.creeps.filter(c => !foto.creeps.includes(c));
    Object.keys(A).forEach(r => {
      const p = r.split('/');
      const deCreepNuevo = p[0] === 'creeps' && creepsNuevos.includes(p[1]);
      if(!(r in F) && (borrable(r) || deCreepNuevo)) ops.push({ruta: r, borrar: true, que: 'saco ' + B.nombreDe(A, r)});
    });
    // 2) Lo que cambió o falta: se escribe como estaba (la hora de «actualizado», la de ahora, así las pantallas abiertas lo toman).
    const fichasNoEstan = [];
    Object.keys(F).forEach(r => {
      if(r in A && B.igual(A[r], F[r])) return;
      if(/^fichas\/[^/]+$/.test(r) && !(r in A)){ fichasNoEstan.push(F[r].nombre); return; }   // una ficha borrada no la puede crear el GM
      const datos = {...F[r]};
      if('actualizado' in datos) datos.actualizado = ahora;
      ops.push({ruta: r, datos, nuevo: !(r in A), que: (r in A ? 'vuelvo ' : 'repongo ') + B.nombreDe(F, r)});
    });
    // Primero borrar, después escribir (los creeps nuevos: su ficha privada antes que el documento).
    ops.sort((a, b) => (b.borrar ? 1 : 0) - (a.borrar ? 1 : 0) || b.ruta.split('/').length - a.ruta.split('/').length);
    if(!ops.length) console.log('✔ El mapa ya está igual a la foto: no hay nada que volver.');
    ops.forEach(o => console.log('  · ' + o.que));
    if(fichasNoEstan.length) console.log(`⚠ No está la ficha de ${fichasNoEstan.join(', ')} (¿se borró?): el GM no puede crearla; la tiene que volver a armar su jugador.`);
    if(SOLO_VER || !ops.length){ return; }
    // Los estados que quedaron en cola para esos personajes (sin aplicar) se descartan: si no, la ficha los aplicaría al abrirse.
    const pendientes = await page.evaluate(() => MG.consulta('estados', 'aplicada', false));
    Object.keys(pendientes).filter(r => foto.fichas.includes(pendientes[r].fichaId)).forEach(r => ops.push({ruta: r, borrar: true, que: 'descarto un estado en cola'}));
    const fallas = [];
    for(const o of ops){
      let err = await page.evaluate(op => MG.escribir(op), o.borrar ? {ruta: o.ruta, borrar: true} : {ruta: o.ruta, datos: o.datos});
      // Un token o un elemento que no se deja cambiar así (o que hay que volver a crear): se borra y se crea de nuevo, con la hora de ahora y,
      // si no es del GM, a nombre del GM (las reglas no dejan crear a nombre de otro, salvo los tokens de personaje).
      if(err && !o.borrar && /\/(tokens|elementos|trazos)\//.test(o.ruta)){
        const d = {...o.datos, creado: ahora};
        if(!/\/tokens\//.test(o.ruta) && d.duenoUid) d.duenoUid = await page.evaluate(() => firebase.auth().currentUser.uid);
        if(!o.nuevo) await page.evaluate(r => MG.escribir({ruta: r, borrar: true}), o.ruta);
        err = await page.evaluate(op => MG.escribir(op), {ruta: o.ruta, datos: d});
      }
      if(err) fallas.push(o.que + ': ' + err);
    }
    // 3) Comprobar.
    const despues = await B.leer(page, ids.mid, {fichas: foto.fichas, creeps: foto.creeps});
    const D = despues.docs, distintos = [];
    new Set([...Object.keys(F), ...Object.keys(D)]).forEach(r => { if(!(r in F) || !(r in D) || !B.igual(F[r], D[r])) distintos.push(B.nombreDe(r in F ? F : D, r)); });
    if(fallas.length) console.log('❌ No se pudo:\n  - ' + fallas.join('\n  - '));
    if(!distintos.length) console.log(`✔ «${B.MAPA}» quedó igual a la foto (${Object.keys(F).length} documentos comparados).`);
    else { console.log('⚠ Quedó distinto:\n  - ' + distintos.join('\n  - ')); process.exitCode = 1; }
  }finally{ await nav.close(); }
})().catch(e => { console.error('❌', e.message); process.exit(1); });
