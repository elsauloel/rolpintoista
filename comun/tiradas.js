/* =========================================================
   TIRADAS — fórmulas de dados
   Compartido por la ficha, gm-tools y el mapa (antes estaba copiado en
   cada uno). Solo cálculo: publicar la tirada en la Mesa es
   comun/mesa.js. Usa num() de cada herramienta.
   ========================================================= */

// Soporta combinaciones de distintos tipos de dado en una sola fórmula,
// ej. "2d6+1d12+3", "1d20-2", "4d6". Los dados siempre suman (no hay "-1d4").
function parseDados(formula){
  const limpio = String(formula || '').trim().toLowerCase().replace(/\s+/g, '');
  if(!limpio) return null;
  const dadoRe = /(\d*)d(\d+)/g;
  const dados = [];
  let m;
  while((m = dadoRe.exec(limpio))){
    const n = m[1] ? parseInt(m[1], 10) : 1;
    const caras = parseInt(m[2], 10);
    if(n < 1 || n > 100 || caras < 2) return null;
    dados.push({n, caras});
  }
  const sinDados = limpio.replace(/\d*d\d+/g, '');
  let mod = 0;
  const modRe = /([+-]\d+)/g;
  let mm;
  while((mm = modRe.exec(sinDados))) mod += parseInt(mm[1], 10);
  if(!dados.length && !mod) return null;
  if(/[^+\-0-9]/.test(sinDados.replace(/[+-]\d+/g, ''))) return null;
  return {dados, mod};
}

// Tira una fórmula: {formula, rolls, mod, total}, o null si no es válida.
function tirarDados(formula){
  const p = parseDados(formula);
  if(!p) return null;
  const rolls = [];
  p.dados.forEach(d => { for(let i = 0; i < d.n; i++) rolls.push(1 + Math.floor(Math.random() * d.caras)); });
  const suma = rolls.reduce((a, b) => a + b, 0);
  const formulaTxt = p.dados.map(d => `${d.n}d${d.caras}`).join('+') + (p.mod ? (p.mod > 0 ? `+${p.mod}` : `${p.mod}`) : '');
  return {formula: formulaTxt || `${p.mod}`, rolls, mod: p.mod, total: suma + p.mod};
}

function horaTxt(fecha){
  const p = n => String(n).padStart(2, '0');
  return `${p(fecha.getHours())}:${p(fecha.getMinutes())}:${p(fecha.getSeconds())}`;
}

/* ---------- Tirar a partir del valor de un stat ---------- */

const DADOS_REALES = [4, 6, 8, 10, 12, 20, 100];

function combosDeSuma(n, k, minIdx){
  if(k === 0) return n === 0 ? [[]] : [];
  const out = [];
  for(let i = minIdx; i < DADOS_REALES.length; i++){
    const d = DADOS_REALES[i];
    if(d > n) break;
    combosDeSuma(n - d, k - 1, i).forEach(resto => out.push([d, ...resto]));
  }
  return out;
}

function mejorComboDados(n){
  for(let k = 1; k <= 6; k++){
    const combos = combosDeSuma(n, k, 0);
    if(combos.length){
      combos.sort((a, b) => (Math.max(...a) - Math.min(...a)) - (Math.max(...b) - Math.min(...b)));
      return combos[0];
    }
  }
  return null;
}

// Descompone un valor de stat en dados reales (4/6/8/10/12/20/100), con la
// menor cantidad de dados posible y, entre empates, la combinación más pareja.
// Impares: se resuelve el par inmediato inferior y se suma +1 fijo.
function formulaParaValor(valor){
  const n = Math.round(num(valor));
  if(n <= 0) return null;
  let base = n, mod = 0;
  if(base % 2 !== 0){ base -= 1; mod = 1; }
  const combo = base > 0 ? mejorComboDados(base) : null;
  if(!combo){
    // No se arma con dados reales (valores chicos como 1, 2 o 3): se tira
    // un dado "inexistente" del tamaño exacto del stat, ej. 1d3.
    return {combo: [n], mod: 0, formula: `1d${n}`};
  }
  const counts = {};
  combo.forEach(d => counts[d] = (counts[d] || 0) + 1);
  const formula = Object.keys(counts).map(Number).sort((a, b) => a - b)
    .map(d => `${counts[d]}d${d}`).join('+') + (mod ? `+${mod}` : '');
  return {combo, mod, formula};
}
