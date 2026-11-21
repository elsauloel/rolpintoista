// Lo que comparten leer.js, escribir.js y comparar.js: abrir el navegador sin pantalla en una de las dos páginas del clon.
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
let playwright;
try{ playwright = require('playwright'); }catch(e){ playwright = require('/opt/node22/lib/node_modules/playwright'); }

const AQUI = __dirname, REPO = path.join(AQUI, '..', '..');
const BASE = 'http://localhost:8799/';   // no hace falta un servidor: cada archivo se le entrega al navegador desde acá

function entorno(nombre){
  const v = process.env[nombre];
  if(!v){ console.error(`Falta la variable de entorno ${nombre} (ver LEEME.md)`); process.exit(2); }
  return v;
}

async function abrirNavegador(){
  const ejecutable = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(p => fs.existsSync(p));
  return playwright.chromium.launch({args: ['--no-sandbox'], ...(ejecutable ? {executablePath: ejecutable} : {})});
}

// Abre una pestaña en la página pedida ('lectura' = candado total; 'escritura' = solo adentro del clon) y entra con esa cuenta.
async function abrirPagina(navegador, cual, email, clave){
  const ctx = await navegador.newContext({ignoreHTTPSErrors: true});
  const page = await ctx.newPage();
  const servir = {
    'pagina.html': path.join(AQUI, cual === 'lectura' ? 'pagina-lectura.html' : 'pagina-escritura.html'),
    'clon-pagina.js': path.join(AQUI, 'clon-pagina.js'),
    'comun/sesion.js': path.join(REPO, 'comun', 'sesion.js'),
  };
  await page.route(BASE + '**', r => {
    const archivo = servir[r.request().url().slice(BASE.length).split('?')[0]];
    if(!archivo) return r.fulfill({status: 404, body: ''});
    r.fulfill({contentType: archivo.endsWith('.html') ? 'text/html' : 'application/javascript', body: fs.readFileSync(archivo)});
  });
  page.on('console', m => { const t = m.text(); if(/BLOQUEADO/.test(t)) console.log('  [página]', t.slice(0, 160)); });
  await page.goto(BASE + 'pagina.html');
  await page.waitForFunction(() => typeof ClonPagina !== 'undefined' && typeof firebase !== 'undefined');
  const candado = await page.evaluate(() => window.CANDADO);
  if(candado !== (cual === 'lectura' ? 'total' : 'por-ruta')) throw new Error('La página no tiene puesto el candado: no sigo');
  const uid = await page.evaluate(({email, clave}) => ClonPagina.entrar(email, clave), {email, clave});
  return {page, uid, cerrar: () => ctx.close()};
}

// JSON siempre igual para los mismos datos (claves ordenadas), para poder sacar la huella.
function canonico(v){
  if(Array.isArray(v)) return '[' + v.map(canonico).join(',') + ']';
  if(v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonico(v[k])).join(',') + '}';
  return JSON.stringify(v === undefined ? null : v);
}
// La «foto» de un volcado: por cada colección, cuántos documentos tiene y una huella de todo su contenido.
function fotoDe(volcado){
  const grupos = {};
  for(const d of volcado.docs){ const c = d.ruta.split('/')[0]; (grupos[c] = grupos[c] || []).push(d); }
  const foto = {partida: {docs: 1, huella: huella(canonico(volcado.partida.datos))}};
  Object.keys(grupos).sort().forEach(c => {
    const lista = grupos[c].slice().sort((a, b) => a.ruta < b.ruta ? -1 : 1);
    foto[c] = {docs: lista.length, huella: huella(lista.map(d => d.ruta + '=' + canonico(d.datos)).join('\n'))};
  });
  return foto;
}
function huella(texto){ return crypto.createHash('sha256').update(texto).digest('hex').slice(0, 16); }

// Lee TODA una partida (por su nombre exacto) con la página de solo lectura.
async function leerPartida(navegador, nombre, email, clave){
  const {page, uid, cerrar} = await abrirPagina(navegador, 'lectura', email, clave);
  try{
    const partida = await page.evaluate(n => ClonPagina.partidaPorNombre(n), nombre);
    const colecciones = await page.evaluate(() => CLON_COLECCIONES);
    const docs = [], fallas = [];
    const orden = ['mapa', ...Object.keys(colecciones).filter(c => c !== 'mapa')];
    let idsMapas = [];
    for(const c of orden){
      const r = await page.evaluate(({id, c, subs, extra}) => ClonPagina.leerColeccion(id, c, subs, extra),
        {id: partida.id, c, subs: colecciones[c], extra: c === 'mapas' ? idsMapas : []});
      docs.push(...r.docs); fallas.push(...r.fallas);
      if(c === 'mapa'){
        const usos = r.docs.find(d => d.ruta === 'mapa/usos'), activo = r.docs.find(d => d.ruta === 'mapa/activo');
        idsMapas = [...Object.keys((usos && usos.datos.ids) || {}), ...(activo && activo.datos.mapaId ? [activo.datos.mapaId] : [])];
      }
    }
    return {tipo: 'volcado-partida', creado: new Date().toISOString(), partida: {id: partida.id, datos: partida.datos},
      lector: {uid, miembro: partida.miembro}, docs, fallas};
  }finally{ await cerrar(); }
}

module.exports = {entorno, abrirNavegador, abrirPagina, leerPartida, fotoDe, canonico, huella, fs, path};
