/* 🎰 El rodillo (2026-10-18, dueño, con la Varita del caos: «un botón girar y que se muestre una especie de ruleta… los nombres que van
   pasando de abajo hacia arriba como si fuera un rodillo, y en momentos empieza a bajar la velocidad hasta que pum, muestra el efecto
   seleccionado… salió tal efecto, el detalle, la cantidad de turnos, y un botón aplicar»; «el rodillo quedará como opción para ocasiones que lo
   ameriten»). Una pieza común: el resultado ya viene decidido (`elegido`); el rodillo solo lo muestra con su momento.
   Rodillo.girar({titulo, subtitulo, opciones: [{nombre, detalle, extra}], elegido (índice), girar ('🎰 Girar'), aplicar ('✔ Aplicar'), ms})
   → Promise<{indice, opcion}> cuando se toca Aplicar. Usa los colores del cuadro del duelo. */
const Rodillo = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const ALTO = 46;   // alto de cada renglón del rodillo, en px
  const CSS = `
#rodillo-fondo{position:fixed;inset:0;background:rgba(6,8,14,.55);z-index:99700;display:flex;align-items:center;justify-content:center}
#rodillo-fondo .rod-panel{width:min(440px,94vw);background:#151a26;border:2px solid #39435c;border-radius:16px;padding:18px 20px 16px;color:#e8ecf5;box-shadow:0 18px 50px rgba(0,0,0,.6);font-family:inherit;text-align:center}
#rodillo-fondo h3{margin:0 0 4px;font-size:18px}
#rodillo-fondo .rod-sub{margin:0 0 12px;color:#9aa3b8;font-size:13px}
#rodillo-fondo .rod-ventana{position:relative;height:${ALTO * 3}px;overflow:hidden;border-radius:12px;background:#0d111a;border:1px solid #2b3347}
#rodillo-fondo .rod-ventana::before,#rodillo-fondo .rod-ventana::after{content:'';position:absolute;left:0;right:0;height:${ALTO}px;z-index:2;pointer-events:none}
#rodillo-fondo .rod-ventana::before{top:0;background:linear-gradient(#0d111a,rgba(13,17,26,.2))}
#rodillo-fondo .rod-ventana::after{bottom:0;background:linear-gradient(rgba(13,17,26,.2),#0d111a)}
#rodillo-fondo .rod-marco{position:absolute;left:8px;right:8px;top:${ALTO}px;height:${ALTO}px;border:2px solid #ffd25a;border-radius:10px;z-index:3;pointer-events:none;box-shadow:0 0 14px rgba(255,210,90,.35)}
#rodillo-fondo .rod-tira{position:absolute;left:0;right:0;top:0;will-change:transform}
#rodillo-fondo .rod-item{height:${ALTO}px;line-height:${ALTO}px;font-size:19px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 14px}
#rodillo-fondo .rod-item.gano{color:#ffd25a;animation:rodGano .6s ease-out 2}
@keyframes rodGano{50%{transform:scale(1.12);text-shadow:0 0 14px rgba(255,210,90,.9)}}
#rodillo-fondo .rod-res{margin-top:12px;display:none}
#rodillo-fondo .rod-res.ver{display:block;animation:rodVer .35s ease-out}
@keyframes rodVer{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
#rodillo-fondo .rod-grande{font-size:22px;font-weight:800;margin:2px 0 6px}
#rodillo-fondo .rod-det{font-size:13.5px;color:#cfd6e6;margin:0 0 4px;line-height:1.45}
#rodillo-fondo .rod-extra{font-size:13px;color:#9cc7ff;margin:0 0 10px}
#rodillo-fondo button{background:#2d6cdf;color:#fff;border:2px solid #8db3ff;border-radius:12px;padding:11px 26px;font-size:17px;font-weight:800;cursor:pointer;margin-top:12px}
#rodillo-fondo button:hover{background:#3b7bf0}
#rodillo-fondo button:disabled{opacity:.5;cursor:default}`;
  function estilos(){
    if(document.getElementById('rodillo-css')) return;
    const st = document.createElement('style'); st.id = 'rodillo-css'; st.textContent = CSS; document.head.appendChild(st);
  }
  // Una tira larga: las opciones mezcladas varias veces y, al final, la elegida (con una más abajo, para que se vea debajo del marco).
  function tira(opciones, elegido){
    const n = opciones.length, idx = [];
    const vueltas = Math.max(3, Math.ceil(36 / Math.max(1, n)));
    for(let v = 0; v < vueltas; v++){
      const orden = opciones.map((_, i) => i).sort(() => Math.random() - 0.5);
      idx.push(...orden);
    }
    idx.push(elegido, (elegido + 1) % n);
    return idx;
  }
  function girar(o){
    estilos();
    const opciones = (o.opciones || []).filter(x => x && x.nombre);
    if(!opciones.length) return Promise.resolve(null);
    const elegido = Math.max(0, Math.min(opciones.length - 1, Math.round(Number(o.elegido) || 0)));
    const ms = Math.max(1500, Number(o.ms) || 3800);
    return new Promise(ok => {
      const viejo = document.getElementById('rodillo-fondo'); if(viejo) viejo.remove();
      const idx = tira(opciones, elegido), destino = idx.length - 2;
      const f = document.createElement('div');
      f.id = 'rodillo-fondo';
      f.innerHTML = `<div class="rod-panel"><h3>${esc(o.titulo || '🎰 El rodillo')}</h3>${o.subtitulo ? `<p class="rod-sub">${esc(o.subtitulo)}</p>` : ''}
        <div class="rod-ventana"><div class="rod-marco"></div><div class="rod-tira">${idx.map(i => `<div class="rod-item">${esc(opciones[i].nombre)}</div>`).join('')}</div></div>
        <button type="button" data-rod-girar>${esc(o.girar || '🎰 Girar')}</button>
        <div class="rod-res"><div class="rod-grande"></div><p class="rod-det"></p><p class="rod-extra"></p><button type="button" data-rod-aplicar>${esc(o.aplicar || '✔ Aplicar')}</button></div></div>`;
      document.body.appendChild(f);
      const cinta = f.querySelector('.rod-tira'), bG = f.querySelector('[data-rod-girar]');
      // Arranca mostrando el primer renglón en el marco (el del medio de la ventana).
      cinta.style.transform = `translateY(${ALTO}px)`;
      bG.onclick = () => {
        bG.disabled = true; bG.style.display = 'none';
        const desde = ALTO, hasta = ALTO - destino * ALTO, t0 = performance.now();
        const paso = ahora => {
          const x = Math.min(1, (ahora - t0) / ms), e = 1 - Math.pow(1 - x, 4);   // rápido al principio y frenando hasta clavarse
          cinta.style.transform = `translateY(${desde + (hasta - desde) * e}px)`;
          if(x < 1){ requestAnimationFrame(paso); return; }
          const it = cinta.children[destino]; if(it) it.classList.add('gano');
          const op = opciones[elegido], res = f.querySelector('.rod-res');
          res.querySelector('.rod-grande').textContent = `¡Salió ${op.nombre}!`;
          res.querySelector('.rod-det').textContent = op.detalle || '';
          res.querySelector('.rod-extra').textContent = op.extra || '';
          res.classList.add('ver');
          const bA = res.querySelector('[data-rod-aplicar]');
          bA.onclick = () => { bA.disabled = true; f.remove(); ok({indice: elegido, opcion: op}); };
          bA.focus();
        };
        requestAnimationFrame(paso);
      };
      bG.focus();
      if(o.auto) bG.click();   // ya se tocó «Girar» antes (el Anuncio del caos): arranca solo
    });
  }
  return {girar};
})();
