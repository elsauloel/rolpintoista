// Lo que comparten foto.js y restaurar.js: abrir el navegador sin pantalla con la cuenta GM de pruebas, buscar la partida y el mapa por
// nombre, leer el estado del mapa y comparar. Ver LEEME.md.
'use strict';
const fs = require('fs'), path = require('path');
let playwright;
try{ playwright = require('playwright'); }catch(e){ playwright = require('/opt/node22/lib/node_modules/playwright'); }

const AQUI = __dirname, REPO = path.join(AQUI, '..', '..');
const BASE = 'http://localhost:8798/';   // no hace falta servidor: los archivos se entregan desde acá
const PARTIDA = process.env.MAPA_PARTIDA || 'Claude · pruebas 2';
const MAPA = process.env.MAPA_NOMBRE || 'Prueba · General';
const DIR = process.env.MAPA_FOTO_DIR || path.join(require('os').tmpdir(), 'mapa-general');

function entorno(n){ const v = process.env[n]; if(!v){ console.error(`Falta la variable de entorno ${n} (ver LEEME.md)`); process.exit(2); } return v; }
function archivoFoto(arg){ return arg ? path.resolve(arg) : path.join(DIR, 'foto-prueba-general.json'); }

async function abrir(){
  const ejecutable = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(p => fs.existsSync(p));
  const nav = await playwright.chromium.launch({args: ['--no-sandbox'], ...(ejecutable ? {executablePath: ejecutable} : {})});
  const page = await (await nav.newContext()).newPage();
  const servir = {'pagina.html': path.join(AQUI, 'pagina.html'), 'pagina.js': path.join(AQUI, 'pagina.js'), 'comun/sesion.js': path.join(REPO, 'comun', 'sesion.js')};
  await page.route(BASE + '**', r => {
    const a = servir[r.request().url().slice(BASE.length).split('?')[0]];
    if(!a) return r.fulfill({status: 404, body: ''});
    r.fulfill({contentType: a.endsWith('.html') ? 'text/html' : 'application/javascript', body: fs.readFileSync(a)});
  });
  await page.goto(BASE + 'pagina.html');
  await page.waitForFunction(() => typeof MG !== 'undefined' && typeof firebase !== 'undefined');
  await page.evaluate(([e, c]) => MG.entrar(e, c), [entorno('ROL_GM_EMAIL'), entorno('ROL_GM_CLAVE')]);
  const ids = await page.evaluate(([p, m]) => MG.buscar(p, m), [PARTIDA, MAPA]);
  return {nav, page, ids};
}

// Todo lo del mapa y de quienes están en él: {ruta relativa a la partida: datos}.
async function leer(page, mid, extra){
  const m = `mapas/${mid}`;
  const docs = await page.evaluate(([m]) => MG.colecciones([`${m}/estado`, `${m}/tokens`, `${m}/elementos`, `${m}/trazos`]), [m]);
  Object.assign(docs, await page.evaluate(([m]) => MG.docs([m, 'mapa/activo']), [m]));
  const toks = Object.keys(docs).filter(r => r.startsWith(`${m}/tokens/`)).map(r => docs[r]);
  const fichas = new Set((extra && extra.fichas) || []), creeps = new Set((extra && extra.creeps) || []);
  toks.forEach(t => { if(!t.fichaId) return; if(t.tipo === 'pj') fichas.add(t.fichaId.split('~')[0]); else if(t.tipo === 'creep') creeps.add(t.fichaId); });
  const enMapa = await page.evaluate(([mid]) => MG.consulta('creeps', 'mapa', mid), [mid]);
  Object.keys(enMapa).forEach(r => creeps.add(r.split('/')[1]));
  const f = [...fichas].sort(), c = [...creeps].sort();
  Object.assign(docs, await page.evaluate(r => MG.docs(r), [...f.map(x => `fichas/${x}`), ...c.map(x => `creeps/${x}`)]));
  Object.assign(docs, await page.evaluate(r => MG.colecciones(r), [...f.map(x => `fichas/${x}/partes`), ...c.flatMap(x => [`creeps/${x}/privado`, `creeps/${x}/publico`])]));
  Object.keys(docs).forEach(k => { if(docs[k] === null) delete docs[k]; });
  return {docs, fichas: f, creeps: c};
}

function canonico(v){
  if(Array.isArray(v)) return '[' + v.map(canonico).join(',') + ']';
  if(v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonico(v[k])).join(',') + '}';
  return JSON.stringify(v === undefined ? null : v);
}
// Lo que no cuenta al comparar: la hora en que se escribió o se creó cada cosa, y qué pantalla guardó la ficha por última vez
// (`resumen.pantalla`: cambia con solo abrir la ficha, sin que cambie nada del personaje).
const SIN_HORA = d => {
  if(!d || typeof d !== 'object') return d;
  const o = {...d}; delete o.actualizado; delete o.creado;
  if(o.resumen && typeof o.resumen === 'object'){ o.resumen = {...o.resumen}; delete o.resumen.pantalla; }
  return o;
};
const igual = (a, b) => canonico(SIN_HORA(a)) === canonico(SIN_HORA(b));

// Qué le pusimos de nombre a cada cosa (para los mensajes, sin ids).
function nombreDe(docs, ruta){
  const d = docs[ruta] || {};
  const p = ruta.split('/');
  if(p[0] === 'mapas' && p[2] === 'tokens') return `token «${d.nombre || '?'}»`;
  if(p[0] === 'mapas' && p[2] === 'elementos') return `elemento del mapa (${d.solido ? 'sólido' : 'terreno'}${d.trampa ? ', trampa' : ''}${d.zona ? ', zona' : ''})`;
  if(p[0] === 'mapas' && p[2] === 'trazos') return 'dibujo del lápiz';
  if(p[0] === 'mapas' && p[2] === 'estado') return `estado del mapa: ${p[3]}`;
  if(p[0] === 'mapas') return 'el mapa';
  if(p[0] === 'fichas') return `ficha ${(docs[`fichas/${p[1]}`] || {}).nombre || '?'}${p[3] ? ` (${p[3]})` : ''}`;
  if(p[0] === 'creeps') return `creep ${(docs[`creeps/${p[1]}`] || {}).nombre || '?'}${p[3] ? ` (${p[2]}/${p[3]})` : ''}`;
  return ruta.split('/')[0] + '/' + (p[1] || '');
}

module.exports = {abrir, leer, igual, canonico, nombreDe, archivoFoto, DIR, PARTIDA, MAPA, fs, path};
