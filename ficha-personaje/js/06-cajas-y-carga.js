// js/06-cajas-y-carga.js — tramo 6 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* =========================================================
   EVENTOS
   ========================================================= */

// Invocaciones: Hp.Max = Con*5 + mods y No2 máx. = Agilidad + mods, igual
// que en los creeps. Se recalcula al terminar de editar el atributo (no en
// cada tecla, para que borrar o escribir "12" no pase por valores
// intermedios). Si estaba lleno queda lleno; si no, solo se recorta si se
// pasa. Los No2 no tienen un "máximo guardado" como el HP (se calculan
// solos de Agilidad), así que si estaba lleno se anota al entrar al campo.
const invNitrosFullAlFoco = new WeakMap();
document.addEventListener('focusin', e => {
  const t = e.target;
  if(t.dataset.invattr !== 'agl' || !t.dataset.invid) return;
  const inv = S.invocaciones.find(x => x.id === t.dataset.invid);
  if(inv) invNitrosFullAlFoco.set(t, num(inv.nitros) >= invNitrosMax(inv));
});
document.addEventListener('change', e => {
  const t = e.target;
  if(!t.dataset.invid || (t.dataset.invattr !== 'con' && t.dataset.invattr !== 'agl')) return;
  const inv = S.invocaciones.find(x => x.id === t.dataset.invid);
  if(!inv) return;
  if(t.dataset.invattr === 'con'){
    actualizarHpMaxPorConInv(inv);
  }else{
    const nuevoMax = invNitrosMax(inv);
    const full = invNitrosFullAlFoco.get(t) !== false;
    inv.nitros = full ? nuevoMax : Math.min(num(inv.nitros), nuevoMax);
  }
  renderInvocaciones();
});

document.addEventListener('input', e => {
  const t = e.target;
  if(t.id === 'f-nombre'){ S.meta.nombre = t.value; return; }
  if(['f-raza','f-clase','f-subclase'].includes(t.id)){
    S.meta[t.id.slice(2)] = t.value;
    $('#eyebrow').textContent = [S.meta.raza,S.meta.clase,S.meta.subclase].filter(Boolean).join(' · ');
    return;
  }
  if(t.id === 'f-nivel'){ S.meta.nivel = num(t.value); renderExp(); refresh(); return; }
  if(CAJAS_DELTA.includes(t.id)) return;
  if(['f-loot-normal','f-loot-magico'].includes(t.id)){
    S.loot[t.id.replace('f-loot-','')] = num(t.value); return;
  }
  if(t.id === 'f-wildcards'){ S.meta.wildcards = num(t.value); return; }
  if(t.id === 'f-wildcardsMax'){ S.meta.wildcardsMax = num(t.value); return; }
  if(t.dataset.lootEsp !== undefined){
    const row = (S.loot.especial||[]).find(l => l.id === t.dataset.lootEsp);
    if(row){ row[t.dataset.lk] = t.dataset.lk === 'cantidad' ? num(t.value) : t.value; }
    lootEspTotal();
    return;
  }
  if(t.id === 'f-nitros'){
    S.nitros = num(t.value);
    renderNitros();
    renderList('habilidades');
    return;
  }
  if(t.id === 'f-capmochila'){ S.caps.mochila = num(t.value); renderVitals(); return; }
  if(t.dataset.invf !== undefined && t.dataset.invid){
    const inv = S.invocaciones.find(x=>x.id===t.dataset.invid);
    if(!inv) return;
    const campo = t.dataset.invf;
    const noNumericos = ['nombre','notas'];
    if(t.type === 'checkbox'){ inv[campo] = t.checked; renderInvocaciones(); return; }
    inv[campo] = noNumericos.includes(campo) ? t.value : num(t.value);
    if(campo === 'cooldown') inv.cooldownActual = Math.min(num(inv.cooldownActual), num(inv.cooldown));
    return;
  }
  if(t.dataset.invattr !== undefined && t.dataset.invid){
    const inv = S.invocaciones.find(x=>x.id===t.dataset.invid);
    if(!inv) return;
    inv[t.dataset.invattr] = num(t.value);
    actualizarDerivInvEnDOM(inv);
    return;
  }
  if(t.dataset.invcrit !== undefined && t.dataset.invid){
    const inv = S.invocaciones.find(x=>x.id===t.dataset.invid);
    if(inv) inv.crit[+t.dataset.invcrit] = num(t.value);
    return;
  }
  if(t.id === 'f-capcinturon'){ S.caps.cinturon = num(t.value); renderVitals(); return; }
  if(t.id === 'f-armanota'){ S.armadura.nota = t.value; return; }
  if(t.dataset.attr){
    // HP y Nitros siguen a su atributo (comun/ficha-stats.js, A6a; mismo criterio que los creeps y las invocaciones).
    FichaStats.cambiarAtributo(S, t.dataset.attr, t.value, t.dataset.mod);
    // Si S.nitros seguía null (todavía no se solidificó), se deja así:
    // renderAll() lo llena con el máximo nuevo, como al crear el personaje.
    const keep = t.dataset.attr, pos = t.selectionStart;
    refresh();
    const again = document.querySelector(`.scrim.open [data-attr="${keep}"]`) || document.querySelector(`[data-attr="${keep}"]`);
    if(again){ again.focus(); try{ again.setSelectionRange(pos,pos); }catch(_){} }
    return;
  }
  if(t.dataset.formula){
    FichaStats.cambiarFormula(S, t.dataset.formula, t.value);
    const id = t.dataset.formula, pos = t.selectionStart;
    refresh();
    const again = document.querySelector(`[data-formula="${id}"]`);
    if(again){ again.focus(); try{ again.setSelectionRange(pos,pos); }catch(_){} }
    return;
  }
});

/* =========================================================
   CAJAS CON DELTA (Vida, SP, DDE, Experiencia)
   Escribir un número fija el valor. Escribir +50 / -35 y
   apretar Enter suma o resta eso al valor que había al
   entrar a la caja.
   ========================================================= */

const CAJAS_DELTA = ['f-hp', 'f-sp-vital', 'f-dde', 'f-exp'];
let cajaDeltaBase = {};

function resolverCajaDelta(t){
  const raw = (t.value || '').trim();
  const m = raw.match(/^([+-])\s*(\d+(?:[.,]\d+)?)$/);
  const base = cajaDeltaBase[t.id] ?? 0;
  const val = m ? base + parseFloat(m[2].replace(',', '.')) * (m[1] === '-' ? -1 : 1) : num(raw);
  let final = val;
  if(t.id === 'f-hp'){ final = fijarHp(val); }
  else if(t.id === 'f-sp-vital'){ const max = spMaximo(); final = Math.min(max, val); S.spGastado = max - final; renderVitals(); }
  else if(t.id === 'f-dde'){ S.meta.dde = val; renderExp(); refresh(); }
  else if(t.id === 'f-exp'){ applyExp(val); refresh(); final = S.meta.exp; }
  t.value = fmt(final);
  cajaDeltaBase[t.id] = final;
}

document.addEventListener('focusin', e => {
  if(CAJAS_DELTA.includes(e.target.id)){ cajaDeltaBase[e.target.id] = num(e.target.value); e.target.select(); }
});
document.addEventListener('keydown', e => {
  if((e.key === 'Enter' || e.keyCode === 13) && CAJAS_DELTA.includes(e.target.id)){
    e.preventDefault();
    resolverCajaDelta(e.target);
    e.target.blur();
  }
});
document.addEventListener('focusout', e => {
  if(CAJAS_DELTA.includes(e.target.id)) resolverCajaDelta(e.target);
});

// Contenedores principales que se pueden contraer a solo el título con el
// ojito del header. El estado se guarda en localStorage (por navegador,
// no viaja con la ficha) para que no haya que volver a cerrarlos cada vez.
function cargarColapsados(){
  try{ return JSON.parse(localStorage.getItem('ficha-colapsados') || '{}'); }catch(e){ return {}; }
}
function guardarColapsados(estado){
  try{ localStorage.setItem('ficha-colapsados', JSON.stringify(estado)); }catch(e){}
}
function pintarColapsable(btn, colapsada){
  const cont = btn.closest('.card') || btn.closest('.botonera-caja');
  if(cont) cont.classList.toggle('colapsada', colapsada);
  btn.textContent = colapsada ? '🙈' : '👁';
}
function toggleColapsable(btn){
  const key = btn.dataset.colapsar;
  const estado = cargarColapsados();
  estado[key] = !estado[key];
  guardarColapsados(estado);
  pintarColapsable(btn, estado[key]);
}
function aplicarColapsados(){
  const estado = cargarColapsados();
  document.querySelectorAll('[data-colapsar]').forEach(btn => pintarColapsable(btn, !!estado[btn.dataset.colapsar]));
}

document.addEventListener('click', async e => {
  const b = e.target.closest('button');

  if(b && b.dataset.colapsar){ toggleColapsable(b); return; }

  const tile = e.target.closest('.d');
  if(tile && !b){
    openStat = openStat === tile.dataset.stat ? null : tile.dataset.stat;
    renderAttrs(); renderArmadura();
    return;
  }

  if(!b) return;

  if(b.id === 'portrait-box'){
    if(S.meta.imagen){
      $('#portrait-view-img').src = S.meta.imagen;
      $('#scrim-portrait').classList.add('open');
    }else{
      $('#portrait-input').click();
    }
    return;
  }
  if(b.id === 'portrait-rm'){ S.meta.imagen = ''; S.meta.miniatura = ''; renderPortrait(); return; }
  if(b.id === 'portrait-view-x'){ $('#scrim-portrait').classList.remove('open'); return; }
  if(b.id === 'portrait-view-change'){ $('#scrim-portrait').classList.remove('open'); $('#portrait-input').click(); return; }
  if(b.id === 'portrait-view-recorte'){
    if(!S.meta.imagen) return;
    elegirRecorteRetrato(S.meta.imagen);
    return;
  }
  if(b.id === 'portrait-view-del'){
    if(!confirm('¿Eliminar la foto del personaje?')) return;
    S.meta.imagen = '';
    S.meta.miniatura = '';
    renderPortrait();
    $('#scrim-portrait').classList.remove('open');
    return;
  }

  if(b.dataset.tirarstat){
    const c = compute();
    const id = b.dataset.tirarstat;
    tirarValorStat(STAT_LABEL[id] || id, c.final[id], id);
    return;
  }
  if(b.dataset.botoneraaccion){
    // Atacar y Daño de la Botonera vienen con su arma (uno por arma).
    if(b.dataset.arma !== undefined && ['atacar', 'danio'].includes(b.dataset.botoneraaccion)){
      const arma = S.inventario.find(x => x.id === b.dataset.arma) || null;
      if(b.dataset.botoneraaccion === 'atacar') preguntarTipoAtaque(arma);
      else if(arma) tirarDanoDeArma(arma);
      return;
    }
    if(b.dataset.botoneraaccion === 'atacar') $('#btn-atacar-pdg').click();
    if(b.dataset.botoneraaccion === 'danio') $('#btn-danio-arma').click();
    if(b.dataset.botoneraaccion === 'esquivar') $('#btn-esquivar').click();
    if(b.dataset.botoneraaccion === 'percepcion') tirarPercepcion();
    if(b.dataset.botoneraaccion === 'parry') $('#btn-parry').click();
    if(b.dataset.botoneraaccion === 'bloqueo') $('#btn-bloqueo').click();
    if(b.dataset.botoneraaccion === 'fuerzagolpe') $('#btn-fuerza-golpe').click();
    return;
  }
  if(b.dataset.stat){
    openStat = openStat === b.dataset.stat ? null : b.dataset.stat;
    renderAttrs(); renderArmadura(); renderVitals();
    return;
  }

  if(b.id === 'btn-loot-esp'){ $('#loot-esp-pop').hidden = !$('#loot-esp-pop').hidden; return; }
  if(b.id === 'btn-loot-add'){
    $('#loot-esp-pop').hidden = false;
    S.loot.especial = S.loot.especial || [];
    S.loot.especial.push({id:uid(), nombre:'', cantidad:1});
    renderLootEspecial();
    document.querySelector('#loot-esp-list .nom:last-of-type')?.focus();
    return;
  }
  if(b.dataset.lootEspRm !== undefined){
    S.loot.especial = (S.loot.especial||[]).filter(l => l.id !== b.dataset.lootEspRm);
    renderLootEspecial();
    return;
  }
  if(b.dataset.add === 'efectos'){ abrirPresetsEfecto('directo'); return; }
  if(b.dataset.add === 'habilidades'){ abrirHabClase(); return; }
  if(b.dataset.add === 'pasivas'){ abrirPasivaNueva(); return; }
  if(b.dataset.add){ openEditor(b.dataset.add, null); return; }
  if(b.dataset.addInv !== undefined){ abrirChooser('inventario', b.dataset.addInv === '1'); return; }
  if(b.dataset.addChooser){ abrirChooser(b.dataset.addChooser, true); return; }
  if(b.id === 'chooser-nuevo'){
    $('#scrim-chooser').classList.remove('open');
    if(chooserTarget === 'cinturon') openEditor('cinturon', null);
    else openEditor('inventario', null, chooserPreset);
    return;
  }
  if(b.id === 'chooser-fabricante'){
    $('#scrim-chooser').classList.remove('open');
    $('#catalogo-buscar').value = '';
    renderCatalogoModal();
    $('#scrim-catalogo').classList.add('open');
    return;
  }
  if(b.id === 'chooser-x'){ $('#scrim-chooser').classList.remove('open'); return; }
  if(b.id === 'catalogo-x'){ $('#scrim-catalogo').classList.remove('open'); return; }
  if(b.id === 'btn-catalogo-nuevo'){
    $('#scrim-catalogo').classList.remove('open');
    openEditor('catalogo', null);
    return;
  }
  if(b.dataset.catalogoadd){ agregarDesdeCatalogo(b.dataset.catalogoadd); return; }
  if(b.dataset.catalogocarrito){ agregarAlCarrito(b.dataset.catalogocarrito); return; }
  if(b.dataset.carritorm){ quitarDelCarrito(b.dataset.carritorm); return; }
  if(b.id === 'carrito-comprar'){ comprarCarrito(); return; }
  if(b.id === 'carrito-vaciar'){ carritoCatalogo = []; renderCarritoCatalogo(); return; }
  if(b.dataset.catalogoedit){
    $('#scrim-catalogo').classList.remove('open');
    openEditor('catalogo', b.dataset.catalogoedit);
    return;
  }
  if(b.dataset.catalogodel){
    if(!confirm('¿Eliminar este ítem del catálogo? No afecta a lo que ya tengas en tu mochila.')) return;
    S.catalogo = S.catalogo.filter(x=>x.id!==b.dataset.catalogodel);
    renderCatalogoModal();
    return;
  }
  if(b.dataset.view){ const [k,id] = b.dataset.view.split(':'); openViewer(k, id); return; }
  if(b.dataset.comparar){ abrirComparar(b.dataset.comparar); return; }
  if(b.dataset.slotComparar){ abrirComparar(slotLlenoItemId); return; }
  if(b.dataset.reemplazar){ const [eqId, nuevoId] = b.dataset.reemplazar.split(':'); reemplazarEquipado(eqId, nuevoId); return; }
  if(b.dataset.compararElegir){ comparandoEquipadoId = b.dataset.compararElegir; renderComparar(); return; }
  if(b.dataset.jobver){
    const [k,id] = b.dataset.jobver.split(':');
    $('#scrim-job').classList.remove('open');
    openViewer(k, id);
    return;
  }
  if(b.dataset.edit){ const [k,id] = b.dataset.edit.split(':'); openEditor(k, id); return; }
  if(b.dataset.tirarsocial){
    const i = S.sociales.find(x=>x.id===b.dataset.tirarsocial);
    if(!i) return;
    tirarSocial(i);
    return;
  }
  if(b.dataset.nivelsocial){ abrirNivelSocial(b.dataset.nivelsocial); return; }
  if(b.dataset.escudo){
    const [erId, acc] = b.dataset.escudo.split(':');
    const er = S.efectos.find(x => x.id === erId);
    if(er){
      const neto = !!er.excedenteVida, max = neto ? null : num(er.escudoMagico), actual = num(er.escudoMagicoActual ?? er.escudoMagico);
      const txt = acc === 'set' ? prompt(neto ? `${er.nombre}: ${fmt(actual)}\nEscribí el valor nuevo, +N o -N (sin tope)` : `${er.nombre}: ${fmt(actual)}/${fmt(max)}\nEscribí el valor nuevo, +N o -N (para cambiar el máximo: max 12)`, fmt(actual)) : (num(acc) > 0 ? '+' : '') + acc;
      const nuevo = txt === null ? null : escudoParsear(txt, actual, max);
      if(nuevo){ er.escudoMagico = neto ? nuevo.actual : nuevo.max; er.escudoMagicoActual = nuevo.actual; renderList('efectos'); refresh(); }
      else if(txt !== null) toast(neto ? 'Escribí un número, +N o -N' : 'Escribí un número, +N, -N o "max N"');
    }
    return;
  }
  if(b.dataset.durmod){   // durabilidad a mano: −1 (desgaste) o +1 (reparar: también devuelve un punto de Armadura rota de la pieza)
    const [itId, d] = b.dataset.durmod.split(':');
    const it = S.inventario.find(x => x.id === itId);
    if(it && durableItem(it)){
      if(num(d) < 0) desgastarItem(it, 1);
      else{
        it.dur = Math.min(durMax(it), durActual(it) + 1);
        if(armRotaDe(it) > 0) it.armRota = armRotaDe(it) - 1;
      }
      renderList('equipo'); renderList('mochila');
      refresh();
    }
    return;
  }
  if(b.dataset.subirhab){ const it = S.habilidades.find(x => x.id === b.dataset.subirhab); if(it) subirHabilidad(it); return; }
  if(b.dataset.versionhab){ const it = S.habilidades.find(x => x.id === b.dataset.versionhab); if(it) abrirVersionNuevaHab(it); return; }
  if(b.dataset.duelohab){   // 🎯 cómo se juega la habilidad en el duelo (comun/asistente-duelo-hab.js)
    const it = S.habilidades.find(x => x.id === b.dataset.duelohab);
    if(it) abrirEjecucionHab(it, r => { renderList('habilidades'); refresh(); toast(r ? `${it.nombre}: ✨ automática (ejecución paso a paso)` : `${it.nombre}: sin ejecución paso a paso (queda semiautomática)`); });
    return;
  }
  if(b.dataset.armrota){
    const [erId, d] = b.dataset.armrota.split(':');
    const er = S.efectos.find(x => x.id === erId);
    if(er){
      const n = Math.max(1, num(er.stacks) || 1) + num(d);
      if(n <= 0){ S.efectos = S.efectos.filter(x => x.id !== erId); toast('Armadura reparada'); }
      else er.stacks = n;
      renderList('efectos');
      refresh();
    }
    return;
  }
  if(b.dataset.toggle){
    const id = b.dataset.toggle;
    // Equipar / sacar un ítem de la mochila: comun/ficha-equipo.js (hoja de ruta A4; el mapa usa la misma regla).
    if(FichaEquipo.equipar(S, id, equipoUi)) return;
    const it = S.efectos.find(x=>x.id===id);
    if(it){ it.activo = it.activo === false; renderList('efectos'); refresh(); return; }
  }
  if(b.dataset.tirararma){
    const it = S.inventario.find(x=>x.id===b.dataset.tirararma);
    if(!it) return;
    tirarDanoDeArma(it);
    return;
  }
  if(b.dataset.elegirarma){
    const it = S.inventario.find(x=>x.id===b.dataset.elegirarma);
    $('#scrim-elegir-arma').classList.remove('open');
    FichaAcciones.armaElegida(S, 'dano', it || null, combateUi);
    return;
  }
  if(b.dataset.habarma){
    const [habId, armaId] = b.dataset.habarma.split(":");
    $("#scrim-elegir-arma").classList.remove("open");
    ejecutarHabilidad(habId, armaId);
    return;
  }
  if(b.dataset.defarma){
    const [tipoDef, armaDefId] = b.dataset.defarma.split(':');
    $('#scrim-elegir-arma').classList.remove('open');
    const armaDef = S.inventario.find(x => x.id === armaDefId) || null;
    FichaAcciones.armaElegida(S, tipoDef, armaDef, combateUi);
    return;
  }
  if(b.dataset.atacararma){
    const it = S.inventario.find(x=>x.id===b.dataset.atacararma);
    $('#scrim-elegir-arma').classList.remove('open');
    if(it) preguntarTipoAtaque(it);
    return;
  }
  if(b.dataset.mesaPub){ mesaComunPublicarItem(b.dataset.mesaPub); return; }
  if(b.dataset.mesaRetItem){ mesaComunRetirar(b.dataset.mesaRetItem); return; }
  if(b.dataset.tocinturon){
    const it = S.inventario.find(x=>x.id===b.dataset.tocinturon);
    if(!it || num(it.unidades) <= 0) return;
    if(it.enMesa){ toast('Está ofrecido en la mesa común: retiralo primero'); return; }
    if(S.cinturon.length >= capCinturonEfectivo()){
      toast('No hay lugar en el cinturón');
      return;
    }
    it.unidades = num(it.unidades) - 1;
    const clon = structuredClone(it);
    clon.id = uid();
    clon.unidades = 1;
    clon.ranuras = 1;
    clon.equipado = false;
    clon.cargaActual = Math.max(1, num(it.cargaMax) || 1);
    S.cinturon.push(clon);
    purgarSiAgotado('inventario', it.id);
    renderInventario();
    renderList('cinturon');
    refresh();
    toast(`${it.nombre} · 1 unidad movida al cinturón`);
    return;
  }
  if(b.dataset.tomochila){
    const idx = S.cinturon.findIndex(x=>x.id===b.dataset.tomochila);
    if(idx < 0) return;
    const it = S.cinturon[idx];
    S.cinturon.splice(idx, 1);
    const clon = structuredClone(it);
    clon.id = uid();
    clon.unidades = 1;
    clon.equipado = false;
    S.inventario.push(clon);
    renderInventario();
    renderList('cinturon');
    refresh();
    toast(`${it.nombre} devuelto a la mochila`);
    return;
  }
  if(b.dataset.rmitem){
    const [key, id] = b.dataset.rmitem.split(':');
    const it = S[key].find(x=>x.id===id);
    if(!it) return;
    if(!confirm(`¿Eliminar "${it.nombre}"? No se puede deshacer.`)) return;
    S[key] = S[key].filter(x=>x.id!==id);
    if(key === 'inventario') renderInventario(); else renderList(key);
    refresh();
    toast(`${it.nombre} eliminado`);
    return;
  }
  if(b.dataset.unit){
    const [key, id, delta] = b.dataset.unit.split(':');
    const it = S[key].find(x=>x.id===id);
    if(it){
      const tope = key === 'inventario' ? stackMaxDe(it) : Infinity;
      it.unidades = Math.max(0, Math.min(tope, num(it.unidades) + num(delta)));
      purgarSiAgotado(key, id);
      if(key === 'inventario') renderInventario(); else renderList(key);
    }
    return;
  }
  if(b.dataset.sigilo){ alternarSigilo(); return; }
  if(b.dataset.levantarse){ levantarse(); return; }
  if(b.dataset.soltarse){ soltarse(); return; }
  if(b.dataset.danohab){ tirarSegundaDeHab(b.dataset.danohab); return; }
  if(b.dataset.ejecutar){ ejecutarHabilidad(b.dataset.ejecutar); return; }
  if(b.id === 'btn-invocar'){
    const inv = nuevaInvocacion();
    S.invocaciones.push(inv);
    renderInvocaciones();
    abrirEditarInv(inv.id, {nueva: true});   // paso a paso (Cancelar la saca)
    return;
  }
  if(b.dataset.rminv){
    if(!confirm('¿Eliminar esta invocación del todo? No se puede deshacer.')) return;
    S.invocaciones = S.invocaciones.filter(x=>x.id!==b.dataset.rminv);
    renderInvocaciones();
    return;
  }
  if(b.dataset.dupinv){ duplicarInvocacion(b.dataset.dupinv); return; }
  if(b.dataset.reinvocar){
    const inv = S.invocaciones.find(x=>x.id===b.dataset.reinvocar);
    if(inv){
      inv.activa = true;
      inv.cooldownActual = num(inv.cooldown);
      inv.nitros = invNitrosMax(inv);
      renderInvocaciones();
      toast(`${inv.nombre} invocada de nuevo`);
    }
    return;
  }
  if(b.dataset.invimg){
    document.querySelector(`[data-invimginput="${b.dataset.invimg}"]`)?.click();
    return;
  }
  if(b.dataset.invimgrm){
    const inv = S.invocaciones.find(x=>x.id===b.dataset.invimgrm);
    if(inv){ inv.imagen = ''; renderInvocaciones(); }
    return;
  }
  if(b.dataset.editarinv){ abrirEditarInv(b.dataset.editarinv); return; }
  if(b.dataset.usarinv){ abrirBotoneraInv(b.dataset.usarinv); return; }
  if(b.dataset.editararmainv){ abrirEditorArmaInv(b.dataset.editararmainv); return; }
  if(b.dataset.proponerpasiva){ proponerPasiva(b.dataset.proponerpasiva); return; }
  if(b.dataset.versionpasiva){ const p = S.pasivas.find(x => x.id === b.dataset.versionpasiva); if(p) abrirVersionNuevaPasiva(p); return; }
  if(b.dataset.additeminv){ abrirItemNuevoInv(b.dataset.additeminv); return; }
  if(b.dataset.quitarequipoinv){
    const [invId, equipoId] = b.dataset.quitarequipoinv.split(':');
    quitarEquipoDeInv(invId, equipoId);
    return;
  }
  if(b.dataset.addhabinv){ abrirEditorHabInv(b.dataset.addhabinv, null); return; }
  if(b.dataset.edithabinv){
    const [invId, habId] = b.dataset.edithabinv.split(':');
    abrirEditorHabInv(invId, habId);
    return;
  }
  if(b.dataset.rmhabinv){
    const [invId, habId] = b.dataset.rmhabinv.split(':');
    const inv = S.invocaciones.find(x=>x.id===invId);
    if(inv && confirm('¿Eliminar esta habilidad?')){ inv.habilidades = inv.habilidades.filter(h=>h.id!==habId); renderInvocaciones(); }
    return;
  }
  if(b.dataset.addestadoinv){ abrirPresetsEfectoInv(b.dataset.addestadoinv); return; }
  if(b.dataset.rmestadoinv){
    const [invId, esId] = b.dataset.rmestadoinv.split(':');
    const inv = S.invocaciones.find(x=>x.id===invId);
    if(inv){ inv.estados = (inv.estados||[]).filter(e=>e.id!==esId); renderInvocaciones(); }
    return;
  }
  if(b.dataset.verhabinv){
    const [invId, habId] = b.dataset.verhabinv.split(':');
    verHabInv(invId, habId);
    return;
  }
  if(b.dataset.invatacar){ invAtacar(b.dataset.invatacar); return; }
  if(b.dataset.invdanio){ invDanio(b.dataset.invdanio); return; }
  if(b.dataset.invlevantarse){ invLevantarse(b.dataset.invlevantarse); return; }
  if(b.dataset.invsoltarse){ invSoltarse(b.dataset.invsoltarse); return; }
  if(b.dataset.invtirarstat){
    const [invId, statId] = b.dataset.invtirarstat.split(':');
    invTirarStat(invId, statId);
    return;
  }
  if(b.dataset.danohabinv){
    const [invId, habId] = b.dataset.danohabinv.split(':');
    tirarSegundaDeHabInv(invId, habId);
    return;
  }
  if(b.dataset.ejecutarhabinv){
    const [invId, habId] = b.dataset.ejecutarhabinv.split(':');
    invEjecutarHab(invId, habId);
    return;
  }
  if(b.dataset.consumirankh){
    const [key, id] = b.dataset.consumirankh.split(':');
    const nombre = FichaAcciones.ankhAMano(S, key, id);   // comun/ficha-acciones.js (paso 3c-7)
    if(!nombre) return;
    $('#f-hp').value = S.hp;
    renderInventario(); renderList('cinturon');
    refresh();
    toast(`${nombre} activado a mano. Revivís con ${fmt(S.hp)} HP.`);
    return;
  }
  if(b.dataset.consume){ FichaAcciones.consumir(S, b.dataset.consume, false, consumoUi); return; }   // comun/ficha-acciones.js
});

function cargarArchivoLocal(){
  if(fbMiembro && fbMiembro.gm){ toast(GM_SIN_PERSONAJES); return; }
  if(fichaVivo && fichaVivo.soloLectura){ toast('Este personaje no es tuyo: no podés cargarle un archivo'); return; }
  const aviso = fichaVivo
    ? `Cargar un archivo reemplaza todo el contenido de "${S.meta.nombre || 'este personaje'}" en la mesa: nombre, atributos, items, habilidades, estados.\n\n¿Seguís?`
    : (fbMiembro
      ? 'El archivo se va a cargar como un personaje nuevo tuyo en la mesa.\n\n¿Seguís?'
      : 'Cargar una ficha reemplaza todo lo que tengas puesto ahora. Como no entraste a la mesa, no se guarda en ningún lado.\n\n¿Seguís?');
  if(!confirm(aviso)) return;
  $('#file-input').click();
}
// Deja elegir qué parte de `fuente` (File recién subido, o el retrato ya
// guardado para "Editar recorte") se ve en el token del mapa — si se
// cancela, no cambia nada (miniatura vacía = se recorta el centro solo).
async function elegirRecorteRetrato(fuente){
  try{
    S.meta.miniatura = await recortarImagen(fuente, {lado: MINIATURA_PX, tope: MINIATURA_MAX});
    renderPortrait();
  }catch(err){
    if(err.message !== 'cancelado') toast('No se pudo recortar esa imagen');
  }
}
$('#portrait-input').onchange = async ev => {
  const file = ev.target.files[0];
  ev.target.value = '';
  if(!file) return;
  try{
    S.meta.imagen = await fileToDataURL(file, 480, 0.85);
    S.meta.miniatura = '';
    renderPortrait();
    await elegirRecorteRetrato(file);
    renderPortrait();
  }catch(err){
    toast('No se pudo cargar esa imagen');
  }
};

document.addEventListener('change', async e => {
  if(e.target.dataset.invimginput === undefined) return;
  const invId = e.target.dataset.invimginput;
  const file = e.target.files[0];
  e.target.value = '';
  if(!file) return;
  const inv = S.invocaciones.find(x=>x.id===invId);
  if(!inv) return;
  try{
    inv.imagen = await fileToDataURL(file, 480, 0.85);
    renderInvocaciones();
  }catch(err){
    toast('No se pudo cargar esa imagen');
  }
});

const mergeDeep = FichaGuardado.mergeDeep;   // comun/ficha-guardado.js

$('#file-input').onchange = ev => {
  const f = ev.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = () => {
    let data;
    try{
      data = JSON.parse(r.result);
    }catch(err){
      toast('Ese archivo no es un JSON válido');
      ev.target.value = '';
      return;
    }
    fichaCargarArchivo(data);
  };
  r.readAsText(f);
  ev.target.value = '';
};

// Vuelca una ficha (objeto ya parseado) sobre el estado, con las mismas
// migraciones y merges tanto si viene de un archivo local como de GitHub.
function aplicarFicha(data){
    try{
      // La mezcla con el personaje en blanco y las migraciones: comun/ficha-guardado.js (paso 5, nivel B, área 4).
      const {S: next, tiposMigrados} = FichaGuardado.normalizar(data, {mezclarCatalogo: lista => ItemsSubidos.mezclar(lista, itemsSubidos, DEFAULT.catalogo)});
      if(tiposMigrados) tiposGuardarJunto = true;
      // Iteración 2 (Bonos → SP, Acciones/Mov → Nitros): ver migrarEstadoIt2,
      // que corre en renderAll.
      S = next;
      openStat = null;
      renderAll();
      toast('Ficha cargada');
    }catch(err){
      console.error('Error cargando la ficha:', err);
      toast('La ficha cargó pero algo no se pudo mostrar bien — revisá la consola');
    }
}

