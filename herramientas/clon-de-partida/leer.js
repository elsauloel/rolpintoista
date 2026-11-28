#!/usr/bin/env node
// Etapa 1: LEE la partida original (página con todas las escrituras bloqueadas) y la vuelca a un archivo JSON.
// Uso:  node leer.js <etiqueta>      → $CLON_DIR/volcado-<etiqueta>.json y foto-<etiqueta>.json
'use strict';
const {entorno, abrirNavegador, leerPartida, fotoDe, fs, path} = require('./base.js');
(async () => {
  const dir = entorno('CLON_DIR'), nombre = entorno('CLON_ORIGEN'), etiqueta = process.argv[2] || 'ultimo';
  const navegador = await abrirNavegador();
  try{
    const volcado = await leerPartida(navegador, nombre, entorno('ROL_GM_EMAIL'), entorno('ROL_GM_CLAVE'));
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(path.join(dir, `volcado-${etiqueta}.json`), JSON.stringify(volcado));
    const foto = fotoDe(volcado);
    fs.writeFileSync(path.join(dir, `foto-${etiqueta}.json`), JSON.stringify(foto, null, 1));
    console.log(`Leída «${volcado.partida.datos.nombre}»: ${volcado.docs.length} documentos. Quien lee es ${volcado.lector.miembro ? (volcado.lector.miembro.gm ? 'GM o co-GM' : 'jugador') : 'ajeno a la partida'} ahí.`);
    Object.keys(foto).forEach(c => console.log(`  ${c.padEnd(20)} ${String(foto[c].docs).padStart(5)}  ${foto[c].huella}`));
    if(volcado.fallas.length){ console.log('NO se pudo leer:'); volcado.fallas.forEach(f => console.log(`  ${f.ruta.replace(/\/[^/]{15,}\//g, '/…/')}: ${f.error}`)); }
  }finally{ await navegador.close(); }
})().catch(e => { console.error('FALLÓ:', String(e && e.message || e).slice(0, 400)); process.exit(1); });
