// 📸 Saca la «foto» del mapa (por defecto «Prueba · General» de «Claude · pruebas 2»): el mapa, sus tokens, elementos, dibujos y estado
// (modo, orden de turnos, niebla…), cuál es el mapa publicado, y las fichas (con todas sus partes: vida, SP, No2, estados, equipo,
// habilidades, pasivas, invocaciones) y los creeps (con su ficha privada) que están en él. Uso: node foto.js [archivo.json]
'use strict';
const B = require('./base');
(async () => {
  const {nav, page, ids} = await B.abrir();
  try{
    const r = await B.leer(page, ids.mid);
    const archivo = B.archivoFoto(process.argv[2]);
    B.fs.mkdirSync(B.path.dirname(archivo), {recursive: true});
    B.fs.writeFileSync(archivo, JSON.stringify({tipo: 'foto-mapa', partida: B.PARTIDA, mapa: B.MAPA, mid: ids.mid, creado: new Date().toISOString(),
      fichas: r.fichas, creeps: r.creeps, docs: r.docs}, null, 1));
    const n = k => Object.keys(r.docs).filter(x => x.includes(k)).length;
    console.log(`📸 Foto de «${B.MAPA}» guardada en ${archivo}`);
    console.log(`   ${n('/tokens/')} tokens · ${n('/elementos/')} elementos · ${n('/trazos/')} dibujos · ${r.fichas.length} fichas · ${r.creeps.length} creeps · ${Object.keys(r.docs).length} documentos`);
  }finally{ await nav.close(); }
})().catch(e => { console.error('❌', e.message); process.exit(1); });
