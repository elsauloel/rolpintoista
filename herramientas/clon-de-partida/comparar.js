#!/usr/bin/env node
// Compara dos fotos de la partida original (antes y después de copiar): tienen que ser iguales.
// Uso:  node comparar.js <etiqueta antes> <etiqueta después>
'use strict';
const {entorno, fs, path} = require('./base.js');
const dir = entorno('CLON_DIR'), leer = e => JSON.parse(fs.readFileSync(path.join(dir, `foto-${e}.json`), 'utf8'));
const a = leer(process.argv[2] || 'antes'), b = leer(process.argv[3] || 'despues');
const distintas = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(c => !a[c] || !b[c] || a[c].docs !== b[c].docs || a[c].huella !== b[c].huella);
const total = f => Object.values(f).reduce((s, x) => s + x.docs, 0);
if(!distintas.length){ console.log(`La partida original está IGUAL antes y después: ${Object.keys(a).length} colecciones, ${total(a)} documentos, mismas huellas.`); process.exit(0); }
console.log('La partida original CAMBIÓ entre las dos fotos en: ' + distintas.map(c => `${c} (${a[c] ? a[c].docs : 0} → ${b[c] ? b[c].docs : 0} documentos)`).join(', '));
console.log('Si alguien estaba jugando en ese momento, es esperable (tiradas, historial, mapa…). El script de copia no puede escribir ahí.');
process.exit(3);
