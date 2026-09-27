/* comun/asistente-duelo-hab.js — «🎯 Duelo» de una habilidad (2026-09-27, docs/duelo-de-habilidades.md).
   Una ventana chica para decidir cómo se juega una habilidad dirigida en el duelo paso a paso: a quién apunta, qué tira quien la usa, con qué se resiste el objetivo,
   si hace daño (y de qué tipo), y qué efectos deja (estados o cura). Sin tocar ningún dato a mano: devuelve el objeto `duelo` que guarda la habilidad (o null = sin duelo).

   Uso:  AsistenteDueloHab.abrir({nombre, inicial, tieneFormula, alGuardar: cfg => …});   (cfg = {objetivo, tira, contra: [stats], dano, tipoDano, efectos: [{nombre, turnos} | {cura}]} o null)
   Los ids de stat son los de la ficha y los de gm-tools (pdg, pdgmg, fue, con, agl, des, esp / eva, resmg, resm). Sin Firebase. */
const AsistenteDueloHab = (() => {
  const TIRA = [['pdgmg', 'PdG.Esp (magia u otros efectos del Especial)'], ['pdg', 'PdG (probabilidad de golpe)'], ['fue', 'Fuerza'], ['con', 'Constitución'], ['agl', 'Agilidad'], ['des', 'Destreza'], ['esp', 'Especial']];
  const CONTRA = [['eva', 'Evasión (esquivar un proyectil)'], ['resmg', 'Res.Esp (resistir magia u otros efectos del Especial)'], ['resm', 'Res.Mt (resistir la mente)'], ['con', 'Constitución'], ['fue', 'Fuerza'], ['esp', 'Especial'], ['des', 'Destreza'], ['agl', 'Agilidad']];
  const ALCANCES = [['auto', 'Automático (los hechizos usan su Rango de casteo)'], ['casteo', 'Rango de casteo'], ['rango', 'Rango (el de las armas a distancia)'], ['adyacente', 'Cuerpo a cuerpo (casilleros de al lado)'], ['fijo', 'Un número de casilleros'], ['ilimitado', 'Sin límite (no resalta nada)']];
  const BONOS = [['pdg', 'PdG'], ['dmg', 'Daño'], ['eva', 'Evasión'], ['def', 'Defensa'], ['nitros', 'No2'], ['resmg', 'Res.Esp'], ['resm', 'Res.Mt'], ['parry', 'Parry'], ['bloqueo', 'Bloqueo']];
  const TIPOS = [['arcano', 'Arcano (mágico)'], ['fuego', 'Fuego (mágico)'], ['hielo', 'Hielo (mágico)'], ['rayo', 'Rayo (mágico)'], ['fisico', 'Físico (respeta la Defensa)']];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  function css(){
    if(document.getElementById('adh-css')) return;
    const s = document.createElement('style');
    s.id = 'adh-css';
    s.textContent = `#adh-fondo{position:fixed;inset:0;z-index:99500;background:rgba(6,8,14,.78);display:flex;align-items:center;justify-content:center;padding:12px;font-family:inherit}
#adh-fondo .adh{background:#151a26;color:#e9ecf4;border:1px solid #39435c;border-radius:14px;width:min(640px,100%);max-height:94vh;overflow:auto;box-shadow:0 18px 60px rgba(0,0,0,.6)}
#adh-fondo header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #2b3347;font-weight:800;font-size:17px}
#adh-fondo .cuerpo{padding:14px 16px;display:flex;flex-direction:column;gap:14px}
#adh-fondo h4{margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#9aa4bd}
#adh-fondo .nota{font-size:12.5px;color:#aab3ca;margin:0 0 6px}
#adh-fondo select,#adh-fondo input[type=number],#adh-fondo input[type=text]{background:#0e1220;color:#fff;border:1px solid #39435c;border-radius:8px;padding:8px;font-size:14px;max-width:100%}
#adh-fondo label.op{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:14px;cursor:pointer}
#adh-fondo .fila{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:4px 0}
#adh-fondo button{background:#2d6cdf;color:#fff;border:0;border-radius:10px;padding:9px 14px;font-size:14px;font-weight:700;cursor:pointer}
#adh-fondo button.sec{background:#2b3347;color:#d5dbec}
#adh-fondo button.rojo{background:#5a2530;color:#fbd0d7}
#adh-fondo .pie{display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid #2b3347;flex-wrap:wrap}
#adh-fondo .aviso{background:rgba(255,210,90,.12);border:1px solid #d9b45a;border-radius:8px;padding:8px 10px;font-size:12.5px;color:#f8ecc6}`;
    document.head.appendChild(s);
  }

  function abrir(cfg){
    css();
    const ini = cfg.inicial || null;
    const st = {
      activo: !!ini, objetivo: (ini && ini.objetivo) || 'enemigo',
      tira: ini ? (ini.tira === undefined ? 'pdgmg' : ini.tira) : 'pdgmg',
      contra: new Set(ini && Array.isArray(ini.contra) ? ini.contra : ['resmg']),
      dano: !!(ini && ini.dano), tipoDano: (ini && ini.tipoDano) || 'arcano',
      // Independiente del tipo (2026-09-27, Paso 1 de las reglas de casteo: lo que ignora la armadura no es el
      // elemento, es cómo se narra la habilidad — una "ráfaga de hielo" ignora, una "aguja de hielo" física no).
      // Arranca según el tipo elegido (mágico = sí, físico = no) y se puede destildar a mano para la excepción.
      ignoraDano: (ini && ini.ignoraDano !== undefined) ? !!ini.ignoraDano : ((ini && ini.tipoDano) || 'arcano') !== 'fisico',
      efectos: ini && Array.isArray(ini.efectos) ? ini.efectos.map(e => ({...e})) : [],
      alcance: (ini && ini.alcance) || 'auto', alcanceN: (ini && ini.alcanceN) || 3,
      modo: (ini && ini.modo) || 'hab', x: (ini && ini.x) || 'nitros',
      flashEn: new Set(ini && ini.flash && Array.isArray(ini.flash.en) ? ini.flash.en : ['pdg', 'parry', 'bloqueo', 'dano']), flashBono: (ini && ini.flash && ini.flash.bono) || 2,
      arma: {pdg: 0, pdgPorX: 0, dadosPorX: 0, fijo: 0, fijoPorX: 0, sinParry: false, ...((ini && ini.arma) || {})},
    };
    const prev = document.getElementById('adh-fondo');
    if(prev) prev.remove();
    const f = document.createElement('div');
    f.id = 'adh-fondo';
    document.body.appendChild(f);
    const cerrar = () => f.remove();

    function alcanceHtml(esArma){
      const lista = esArma ? [['auto', 'El de tu arma (cuerpo a cuerpo: 1 + su Alcance; a distancia: su Rango)'], ...ALCANCES.slice(1)] : ALCANCES;
      return `<div><h4>Alcance</h4>
        <p class="nota">No limita a quién podés apuntar: al elegir el objetivo, <b>los tokens que están a tu alcance brillan</b> en el mapa.</p>
        <div class="fila"><select data-alcance>${lista.map(([v, t]) => `<option value="${v}"${st.alcance === v ? ' selected' : ''}>${t}</option>`).join('')}</select>${st.alcance === 'fijo' ? `<input type="number" min="1" style="width:70px" data-alcanceN value="${esc(st.alcanceN)}"><span>casilleros</span>` : ''}</div></div>`;
    }
    const FLASH_EN = [['pdg', 'La tirada de quien la usa (PdG, PdG.Esp…)'], ['eva', 'Evasión'], ['parry', 'Parry'], ['bloqueo', 'Bloqueo'], ['fuerza', 'Fuerza del golpe'], ['dano', 'El daño']];
    function flashHtml(){
      return `<div><h4>Reacción Flash en el duelo</h4>
        <p class="nota">Una habilidad Flash se usa <b>antes de una tirada</b> del duelo (nunca después de verla) y <b>no cuesta No2</b>, solo sus SP. En el cuadro del duelo aparece un botón «⚡» en las tiradas donde vale; al marcarlo y tirar, se cobran los SP y el bono se suma a esa tirada. Una vez por tirada.</p>
        <div class="fila"><span>Suma</span><input type="number" style="width:70px" data-flashbono value="${esc(st.flashBono)}"><span>a la tirada</span></div>
        <p class="nota" style="margin-top:8px">Vale para:</p>
        ${FLASH_EN.map(([v, t]) => `<label class="op"><input type="checkbox" data-flashen="${v}" ${st.flashEn.has(v) ? 'checked' : ''}> ${t}</label>`).join('')}</div>`;
    }
    function armaHtml(){
      const a = st.arma;
      const fila = (k, t) => `<div class="fila"><span style="min-width:250px">${t}</span><input type="number" style="width:80px" data-arma="${k}" value="${esc(a[k] ?? 0)}"></div>`;
      return `<div><h4>Lo que la habilidad le suma a tu ataque</h4>
        <p class="nota">Se juega como un ataque normal con tu arma (PdG contra Evasión o Parry, crítico, daño y efectos del arma). Los No2 del ataque ya los cobra la habilidad. «Por X» se multiplica por la X que elegís al ejecutarla.</p>
        ${fila('pdg', '+ a la PdG (fijo)')}${fila('pdgPorX', '+ a la PdG por cada X')}${fila('dadosPorX', 'Dados de daño extra por cada X (del Tipo del arma)')}${fila('fijo', 'Daño fijo extra')}${fila('fijoPorX', 'Daño fijo extra por cada X')}
        <div class="fila"><span style="min-width:250px">La X de su costo es…</span><select data-x><option value="nitros"${st.x === 'nitros' ? ' selected' : ''}>los No2 (Nitros)</option><option value="sp"${st.x === 'sp' ? ' selected' : ''}>los SP</option></select></div>
        <label class="op"><input type="checkbox" data-sinparry ${a.sinParry ? 'checked' : ''}> No se puede parrear (solo esquivar)</label></div>
      ${alcanceHtml(true)}`;
    }

    function dibujar(){
      const sinOp = !st.tira;
      f.innerHTML = `<div class="adh"><header><span>🎯 Duelo · ${esc(cfg.nombre || 'Habilidad')}</span><button type="button" class="sec" data-x>✕</button></header>
        <div class="cuerpo">
          <label class="op"><input type="checkbox" data-activo ${st.activo ? 'checked' : ''}> <b>Ejecutar esta habilidad abre el duelo paso a paso</b> (elegís el objetivo, se tira, se ve en vivo)</label>
          ${st.activo ? `
          <div><h4>¿Qué tipo de habilidad es?</h4>
            <select data-modo><option value="hab"${st.modo === 'hab' ? ' selected' : ''}>Habilidad dirigida (hechizo, control, apoyo…)</option><option value="arma"${st.modo === 'arma' ? ' selected' : ''}>Ataque con mi arma, con arreglos (Golpe brutal, Carga, Takle…)</option><option value="flash"${st.modo === 'flash' ? ' selected' : ''}>⚡ Reacción Flash (suma a una tirada del duelo)</option></select></div>
          ${st.modo === 'flash' ? flashHtml() : st.modo === 'arma' ? armaHtml() : `
          <div><h4>1 · ¿A quién apunta?</h4>
            <select data-objetivo>${[['enemigo', 'A un enemigo (o a cualquier otro token)'], ['aliado', 'A un aliado'], ['uno mismo', 'A uno mismo (no hay que elegir)']].map(([v, t]) => `<option value="${v}"${st.objetivo === v ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
          ${st.objetivo === 'uno mismo' ? '' : alcanceHtml(false)}
          <div><h4>2 · ¿Qué tira quien la usa?</h4>
            <select data-tira><option value=""${sinOp ? ' selected' : ''}>Nada: no hay nada que resistir, se aplica directo (buffs, curas)</option>${TIRA.map(([v, t]) => `<option value="${v}"${st.tira === v ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
          ${sinOp ? `<div class="aviso">Sin tirada: al ejecutarla se abre el cuadro del duelo con los efectos y su botón <b>Aplicar</b>. Así la acción tiene su momento en pantalla.</div>` : `
          <div><h4>3 · ¿Con qué se resiste el objetivo?</h4>
            <p class="nota">Si marcás más de uno, el objetivo elige uno a ciegas, antes de ver tu tirada. Un proyectil suele esquivarse (Evasión); un efecto sobre el cuerpo se resiste con Res.Esp; un control mental con Res.Mt. Un hechizo no se parrea ni se bloquea.</p>
            ${CONTRA.map(([v, t]) => `<label class="op"><input type="checkbox" data-contra="${v}" ${st.contra.has(v) ? 'checked' : ''}> ${t}</label>`).join('')}</div>`}
          <div><h4>${sinOp ? '3' : '4'} · Daño</h4>
            <label class="op"><input type="checkbox" data-dano ${st.dano ? 'checked' : ''}> La fórmula de daño de la habilidad (su «segunda tirada», por ejemplo 2d6+3) es el daño que hace${cfg.tieneFormula === false ? ' <span class="nota">(esta habilidad todavía no tiene fórmula: escribila en su editor)</span>' : ''}</label>
            ${st.dano ? `<div class="fila"><span>Tipo:</span><select data-tipodano>${TIPOS.map(([v, t]) => `<option value="${v}"${st.tipoDano === v ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
            <label class="op"><input type="checkbox" data-ignoradano ${st.ignoraDano ? 'checked' : ''}> Ignora la Defensa (va derecho a la vida y no critica)</label>
            <p class="nota">Arranca marcado o no según el tipo (mágico = sí, físico = no), pero es independiente: lo que decide no es el elemento, es cómo se narra la habilidad — una "ráfaga de hielo" (energía) ignora la Defensa; una "aguja de hielo" (un objeto físico arrojado) no, aunque las dos sean "Hielo". Destildá acá para esa excepción.</p>` : ''}</div>
          `}
          ${st.modo === 'flash' ? '' : `<div><h4>${st.modo === 'arma' ? '3 · Efectos al pegar' : (sinOp ? '4' : '5') + ' · Efectos sobre el objetivo'}</h4>
            <p class="nota">Cada uno sale como un momento propio, con su botón «Aplicar» (los que no se puedan aplicar solos quedan «a mano»). Solo entran si la habilidad funciona.</p>
            ${st.efectos.map((e, i) => e.cura !== undefined
              ? `<div class="fila"><span>💚 Cura</span><input type="number" min="1" style="width:80px" data-ef-cura="${i}" value="${esc(e.cura)}"><span>HP</span><button type="button" class="rojo" data-ef-x="${i}">Quitar</button></div>`
              : `<div class="fila"><span>◎ Estado</span><input type="text" list="adh-estados" data-ef-nombre="${i}" value="${esc(e.nombre)}" placeholder="nombre (elegí uno o escribí el tuyo)" style="width:200px"><span>durante</span><input type="number" min="0" style="width:64px" data-ef-turnos="${i}" value="${esc(e.turnos ?? 2)}"><span>turnos</span><button type="button" class="rojo" data-ef-x="${i}">Quitar</button></div>
                <div class="fila" style="margin-left:22px"><span class="nota" style="margin:0">y da (opcional):</span><select data-ef-stat="${i}"><option value="">— ningún bono —</option>${BONOS.map(([v, t]) => `<option value="${v}"${e.stat === v ? ' selected' : ''}>${t}</option>`).join('')}</select><input type="number" style="width:64px" data-ef-val="${i}" value="${esc(e.val ?? 1)}"><span class="nota" style="margin:0">(negativo = resta)</span></div>`).join('')}
            <datalist id="adh-estados">${nombresEstado().map(n => `<option value="${esc(n)}">`).join('')}</datalist>
            <div class="fila"><button type="button" class="sec" data-ef-mas="estado">＋ Estado</button><button type="button" class="sec" data-ef-mas="cura">＋ Cura</button></div></div>`}` : ''}
        </div>
        <div class="pie">${ini ? '<button type="button" class="rojo" data-quitar title="Vuelve a la ejecución de siempre (sin duelo)">Sacar el duelo de esta habilidad</button>' : ''}<button type="button" class="sec" data-x>Cancelar</button><button type="button" data-ok>Guardar</button></div></div>`;
      f.querySelectorAll('[data-x]').forEach(b => b.onclick = cerrar);
      f.querySelector('[data-activo]').onchange = e => { st.activo = e.target.checked; dibujar(); };
      const q = (sel, fn) => { const el = f.querySelector(sel); if(el) el.onchange = fn; };
      q('[data-objetivo]', e => { st.objetivo = e.target.value; dibujar(); });
      q('[data-modo]', e => { st.modo = e.target.value; dibujar(); });
      q('[data-flashbono]', e => { st.flashBono = Number(e.target.value) || 0; });
      f.querySelectorAll('[data-flashen]').forEach(c => c.onchange = () => { c.checked ? st.flashEn.add(c.dataset.flashen) : st.flashEn.delete(c.dataset.flashen); });
      q('[data-x]', e => { st.x = e.target.value; });
      q('[data-sinparry]', e => { st.arma.sinParry = e.target.checked; });
      f.querySelectorAll('[data-arma]').forEach(i => i.onchange = () => { st.arma[i.dataset.arma] = Number(i.value) || 0; });
      q('[data-tira]', e => { st.tira = e.target.value; dibujar(); });
      q('[data-alcance]', e => { st.alcance = e.target.value; dibujar(); });
      q('[data-alcanceN]', e => { st.alcanceN = Math.max(1, Math.round(Number(e.target.value) || 1)); });
      f.querySelectorAll('[data-contra]').forEach(c => c.onchange = () => { c.checked ? st.contra.add(c.dataset.contra) : st.contra.delete(c.dataset.contra); });
      q('[data-dano]', e => { st.dano = e.target.checked; dibujar(); });
      q('[data-tipodano]', e => { st.tipoDano = e.target.value; st.ignoraDano = st.tipoDano !== 'fisico'; dibujar(); });
      q('[data-ignoradano]', e => { st.ignoraDano = e.target.checked; });
      f.querySelectorAll('[data-ef-nombre]').forEach(i => i.onchange = () => { st.efectos[+i.dataset.efNombre].nombre = i.value.trim(); });
      f.querySelectorAll('[data-ef-stat]').forEach(i => i.onchange = () => { st.efectos[+i.dataset.efStat].stat = i.value; });
      f.querySelectorAll('[data-ef-val]').forEach(i => i.onchange = () => { st.efectos[+i.dataset.efVal].val = Number(i.value) || 0; });
      f.querySelectorAll('[data-ef-turnos]').forEach(i => i.onchange = () => { st.efectos[+i.dataset.efTurnos].turnos = Math.max(0, Math.round(Number(i.value) || 0)); });
      f.querySelectorAll('[data-ef-cura]').forEach(i => i.onchange = () => { st.efectos[+i.dataset.efCura].cura = Math.max(1, Math.round(Number(i.value) || 1)); });
      f.querySelectorAll('[data-ef-x]').forEach(b => b.onclick = () => { st.efectos.splice(+b.dataset.efX, 1); dibujar(); });
      f.querySelectorAll('[data-ef-mas]').forEach(b => b.onclick = () => { st.efectos.push(b.dataset.efMas === 'cura' ? {cura: 5} : {nombre: nombresEstado()[0] || 'Estado', turnos: 2}); dibujar(); });
      const bq = f.querySelector('[data-quitar]');
      if(bq) bq.onclick = () => { cerrar(); cfg.alGuardar(null); };
      f.querySelector('[data-ok]').onclick = () => {
        if(!st.activo){ cerrar(); cfg.alGuardar(null); return; }
        if(st.modo === 'flash'){
          if(!st.flashEn.size){ alert('Marcá al menos una tirada donde vale el Flash.'); return; }
          cerrar(); cfg.alGuardar({modo: 'flash', flash: {en: [...st.flashEn], bono: st.flashBono}}); return;
        }
        const efs = st.efectos.filter(e => e.cura !== undefined ? e.cura > 0 : e.nombre).map(e => e.cura !== undefined ? {cura: e.cura} : {nombre: e.nombre, turnos: e.turnos ?? 2, ...(e.stat ? {stat: e.stat, val: e.val ?? 1} : {})});
        if(st.modo === 'arma'){
          const o2 = {modo: 'arma', objetivo: 'enemigo', x: st.x, arma: {...st.arma}, efectos: efs};
          if(st.alcance !== 'auto'){ o2.alcance = st.alcance; if(st.alcance === 'fijo') o2.alcanceN = st.alcanceN; }
          cerrar(); cfg.alGuardar(o2); return;
        }
        const out = {objetivo: st.objetivo, tira: st.tira || '', contra: st.tira ? [...st.contra] : []};
        if(st.tira && !out.contra.length){ alert('Marcá con qué se resiste el objetivo (o elegí «Nada» en lo que tira quien la usa).'); return; }
        if(st.dano){ out.dano = true; out.tipoDano = st.tipoDano; out.ignoraDano = st.ignoraDano; }
        if(st.alcance !== 'auto'){ out.alcance = st.alcance; if(st.alcance === 'fijo') out.alcanceN = st.alcanceN; }
        out.efectos = st.efectos.filter(e => e.cura !== undefined ? e.cura > 0 : e.nombre).map(e => e.cura !== undefined ? {cura: e.cura} : {nombre: e.nombre, turnos: e.turnos ?? 2, ...(e.stat ? {stat: e.stat, val: e.val ?? 1} : {})});
        cerrar();
        cfg.alGuardar(out);
      };
    }
    // Nombres de estados que conoce el juego (debuffs automáticos); se puede escribir otro a mano si no hay lista.
    function nombresEstado(){
      return (typeof EstadosAplicar !== 'undefined' && EstadosAplicar.DEBUFFS) ? EstadosAplicar.DEBUFFS.map(p => p.nombre) : [];
    }
    dibujar();
  }
  return {abrir};
})();
