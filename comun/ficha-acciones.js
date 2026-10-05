/* =========================================================
   FICHA-ACCIONES — botones de la Botonera que cambian al personaje (paso 4, etapa 3c de docs/plan-paso4-etapa3.md,
   2026-10-01)
   Lo que hacen (cobrar No2, poner o sacar un estado) es lo mismo en la ficha y en la Botonera nueva del mapa; lo que se ve
   (el cartel de "no te alcanzan los Nitros", el aviso, redibujar) lo pone cada pantalla con `ui`:
     ui = {presets (los estados estándar, forma ficha: estadosPresetFicha()), toast(texto),
           avisarSinNitros(costo, accion, continuar) (el cartel con Cancelar / "Realizar de cualquier modo"),
           cambio(lista) (qué cambió: 'efectos', 'nitros' — para redibujar y guardar)}
   Copiado tal cual de la ficha (js/02 y js/09), con `S` como parámetro. Necesita ficha-calculo.js, ficha-habilidades.js y
   ficha-botonera.js antes; gastoNitrosForzado usa la sesión de Firebase de la página (fbDb, fbUsuario, fbMiembro).
   ========================================================= */
const FichaAcciones = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  function fmt(n){ return Number.isInteger(n) ? n : Math.round(n*100)/100; }
  const uid = () => Math.random().toString(36).slice(2,9);
  const IT2 = () => FichaCalculo.IT2;

  // Publica la línea roja y devuelve cuántos Nitros descontar (los que haya, nunca de más). (js/09)
  function gastoNitrosForzado(S, costo, hizo){
    const disp = Math.max(0, num(S.nitros));
    if(typeof fbDb !== 'undefined' && fbDb && fbUsuario && fbMiembro){
      const nombre = ((S.meta && S.meta.nombre) || '').trim() || fbMiembro.nombre;
      fbDb.collection(fbRutaCampana('tiradas')).add({
        uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '',
        origen: `⚠ ${nombre} ${hizo} sin Nitros suficientes`, formula: `Costaba ${fmt(costo)} No2 y tenía ${fmt(disp)}`,
        rolls: [], mod: 0, total: 0, desde: 'alerta-roja',
        cuando: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(err => console.error('No se pudo publicar la alerta de Nitros:', err));
    }
    return Math.min(costo, disp);
  }

  /* ---------- Sigilo: entrar y salir con un botón (js/02) ----------
     Quien tiene la habilidad "Sigilo" ve en la Botonera un botón directo, sin
     pasar por "+ Estado". Entrar cuesta IT2.nitrosSigilo (1 No2, a revisar) y
     aplica el estado alterado "Sigilo" sobre uno mismo (el mapa lo lee de ahí);
     salir es gratis. No se avisa en la Mesa: el sigilo no se anuncia. */
  function alternarSigilo(S, forzar, ui){
    const actual = FichaBotonera.efectoSigilo(S);
    if(actual){
      S.efectos = S.efectos.filter(e => e !== actual);
      ui.cambio(['efectos']);
      ui.toast('Saliste del sigilo');
      return;
    }
    // Marcado (2026-10-05): mientras dure la marca no se puede entrar en sigilo (se le saca a mano si la mesa decide otra cosa).
    if(Combatiente.marcadoEn(S.efectos)){ ui.toast('Estás Marcado: no podés entrar en sigilo hasta que se te vaya la marca'); return; }
    const costo = num(IT2().nitrosSigilo);
    if(num(S.nitros) < costo && !forzar){
      ui.avisarSinNitros(costo, 'entrar en sigilo', () => alternarSigilo(S, true, ui));
      return;
    }
    const preset = ui.presets.find(p => p.nombre === 'Sigilo');
    S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? gastoNitrosForzado(S, costo, 'entró en sigilo') : costo);
    S.efectos.push({id: uid(), nombre: 'Sigilo', imagen: '', turnos: 0, stacks: 1, hpturno: 0, stacksturno: 0,
      permanente: true, activo: true, popup: false, detalle: (preset && preset.detalle) || '', mods: [], ...FichaHabilidades.flagsDePreset(ui.presets, 'Sigilo')});
    ui.cambio(['efectos', 'nitros']);
    ui.toast(`Entraste en sigilo${costo ? ` · -${fmt(costo)} No2` : ''}`);
  }

  /* ---------- Sentado: levantarse cuesta 1 No2 (js/02) ----------
     El estado Sentado no vence solo; el botón "Levantarse" de la Botonera lo saca y cobra IT2.nitrosLevantarse. */
  function levantarse(S, forzar, ui){
    const actual = FichaBotonera.efectoSentado(S);
    if(!actual) return;
    const costo = num(IT2().nitrosLevantarse);
    if(num(S.nitros) < costo && !forzar){
      ui.avisarSinNitros(costo, 'levantarte', () => levantarse(S, true, ui));
      return;
    }
    S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? gastoNitrosForzado(S, costo, 'se levantó') : costo);
    S.efectos = S.efectos.filter(e => e !== actual);
    ui.cambio(['efectos', 'nitros']);
    ui.toast(`Te levantaste${costo ? ` · -${fmt(costo)} No2` : ''}`);
  }

  /* ---------- Soltarse (2026-10-03): el estado que dejó una trampa de Atrapar dice qué tirar y cuánto cuesta (Combatiente.soltarNorm) ----------
     Se paga se suelte o no; si la tirada llega a la dificultad, se saca el estado. ui = el de Levantarse + registrarTirada(origen, r). */
  function soltarse(S, forzar, ui){
    const est = Combatiente.estadoSoltable(S.efectos);
    if(!est) return;
    const s = Combatiente.soltarNorm(est.soltar);
    if(num(S.nitros) < s.no2 && !forzar){
      ui.avisarSinNitros(s.no2, 'intentar soltarte', () => soltarse(S, true, ui));
      return;
    }
    S.nitros = num(S.nitros) - (forzar && s.no2 > num(S.nitros) ? gastoNitrosForzado(S, s.no2, 'intentó soltarse') : s.no2);
    const t = Combatiente.tiradaSoltarse(est, num(FichaCalculo.calcular(S).final[s.stat]), S.efectos);
    if(t.r && ui.registrarTirada) ui.registrarTirada(`Soltarse (${est.nombre}) · ${s.etq} contra ${s.dif}`, t.r);
    if(t.ok) S.efectos = S.efectos.filter(e => e !== est);
    const hundio = Combatiente.hundirSiFalla(est, t);
    ui.cambio(['efectos', 'nitros']);
    ui.toast(`${t.ok ? 'Te soltaste' : 'No te soltaste'} (${t.r ? t.r.total : '—'} contra ${s.dif})${s.no2 ? ` · −${fmt(s.no2)} No2` : ''}${hundio ? ` · te hundiste más: +${s.hunde} turno${s.hunde === 1 ? '' : 's'}` : ''}`);
  }

  /* ---------- La vida: Ankh y estado de muerte (js/02) ----------
     Lo que cambia en el personaje; lo que se ve (el campo de HP, el cartel de "Inconsciente", el aviso) lo pone cada pantalla. */
  // Usa un Ankh: gasta una unidad y revive con el 25 % del HP máximo. Devuelve el nombre del ítem (o null).
  function aplicarRevivirConAnkh(S, key, id){
    const it = S[key].find(x => x.id === id);
    if(!it) return null;
    it.unidades = num(it.unidades) - 1;
    purgarSiAgotado(S, key, it.id);
    const cc = FichaCalculo.calcular(S);
    const hpmaxAnkh = Number.isNaN(cc.final.hpmax) ? 0 : cc.final.hpmax;
    S.hp = Math.max(1, Math.floor(hpmaxAnkh * 0.25));
    return it.nombre;
  }
  // Toda baja de HP pasa por acá: nunca baja de 0 ni pasa del máximo. Devuelve el HP que quedó.
  function fijarHp(S, valor){
    const c = FichaCalculo.calcular(S);
    const hpmax = Number.isNaN(c.final.hpmax) ? 0 : c.final.hpmax;
    const tope = hpmax > 0 ? hpmax : Math.max(0, num(valor));
    S.hp = Math.max(0, Math.min(tope, num(valor)));
    return S.hp;
  }
  // Si el HP llega a 0 y hay un Ankh de Reencarnación en el cinturón, se activa solo (en la mochila no). Devuelve su nombre si se activó.
  function revisarAnkh(S){
    if(num(S.hp) > 0) return null;
    if(S.muerto && S.muerto.definitivo) return null; // muerte definitiva: ya no hay vuelta atrás
    const idx = S.cinturon.findIndex(i => i.nombre === 'Ankh de Reencarnación' && num(i.unidades) > 0);
    if(idx < 0) return null;
    return aplicarRevivirConAnkh(S, 'cinturon', S.cinturon[idx].id);
  }
  // ✚ Revivir (2026-10-02, A6b; antes calcularHpRevivir de la ficha, js/11): con cuánto HP revive — un % del máximo o un valor neto,
  // mínimo 1. → {hpmax, val}. El diálogo lo pone cada pantalla; revivir(S, val) deja el HP (y el estado de muerte, al día).
  function hpRevivir(S, modo, pct, valor){
    const c = FichaCalculo.calcular(S);
    const hpmax = Number.isNaN(c.final.hpmax) ? 0 : c.final.hpmax;
    if(modo === 'pct'){
      const p = Math.max(0, Math.min(100, num(pct) || 0));
      return {hpmax, val: Math.max(1, Math.floor(hpmax * p / 100))};
    }
    return {hpmax, val: Math.max(1, Math.floor(num(valor) || 1))};
  }
  function revivir(S, val){
    S.hp = val;
    return revisarMuerte(S);
  }
  // Con HP > 0 deja de estar inconsciente; con 0, queda inconsciente (5 turnos para morir). Devuelve {vivo, revivio} o {vivo: false, cayo}.
  function revisarMuerte(S){
    if(!S.muerto) S.muerto = {activo:false, turnos:5, definitivo:false};
    if(num(S.hp) > 0){
      if(S.muerto.activo){
        S.muerto = {activo:false, turnos:5, definitivo:false};
        return {vivo: true, revivio: true};
      }
      return {vivo: true, revivio: false};
    }
    if(!S.muerto.activo && !S.muerto.definitivo){
      S.muerto.activo = true;
      S.muerto.turnos = 5;
      return {vivo: false, cayo: true};
    }
    return {vivo: false, cayo: false};
  }

  /* ---------- Consumir un ítem (js/06, el botón Consumir; js/02 y js/09) ---------- */
  function purgarSiAgotado(S, key, id){
    const it = S[key].find(x=>x.id===id);
    if(it && it.consumible && num(it.unidades) <= 0){
      S[key] = S[key].filter(x=>x.id!==id);
      return true;
    }
    return false;
  }
  function restaurarSpDeConsumo(S, it){
    const pct = num(it.curaspPct);
    if(pct <= 0) return 0;
    const restaurar = Math.ceil(FichaBotonera.spMaximo(S) * Math.min(pct, 100) / 100);
    S.spGastado = Math.max(0, num(S.spGastado) - restaurar);
    return restaurar;
  }
  // Oleo reparador: quita Armadura rota si está activa (es permanente, no vence sola). Devuelve cuántas se quitaron.
  function repararArmadura(S){
    const antes = S.efectos.length;
    S.efectos = S.efectos.filter(e => e.nombre !== 'Armadura rota');
    return antes - S.efectos.length;
  }
  // El estado del sistema anterior que deja el consumible (comun/ficha-habilidades.js); avisa si una inmunidad lo bloqueó.
  function efectoDeConsumo(S, it, presets, toast){
    const r = FichaHabilidades.aplicarEfectoDeConsumo(S, it, presets);
    if(!r) return null;
    if(!r.ok){ toast(`Inmune ahora mismo${r.motivo === 'inmune' ? '' : ` (${r.motivo})`} — ${r.nombre} no hizo efecto`); return null; }
    return r.estado;
  }
  // Las tiradas propias del ítem (su stat con su bono, y su fórmula), armadas sin publicar: [{origen, r} | {error}].
  // La ficha usa las suyas (tirarExtraDeItem, con el cartel de sobrepeso si el stat es la Evasión); el mapa, estas.
  function tiradasDeItem(S, it){
    const out = [];
    const stat = it.tiradaStat;
    if(stat && (FichaCalculo.ATTR_LIST.some(a => a.id === stat) || FichaBotonera.statsConTirada().some(s => s.id === stat))){
      const nombre = `${it.nombre} · ${FichaCalculo.STAT_LABEL[stat]}`, valor = FichaCalculo.calcular(S).final[stat] + num(it.tiradaBono);
      if(!formulaParaValor(valor)) out.push({error: `${nombre}: ${fmt(num(valor))} no se puede tirar con dados reales`});
      else out.push({origen: nombre, r: Combatiente.tirarStat(valor, S.efectos, stat, {extra: undefined})});
    }
    const formula = (it.tiradaExtra || '').trim();
    if(formula){
      const r = tirarDados(formula);
      if(r) out.push({origen: it.nombre, r});
    }
    return out;
  }
  /* Consumir (el botón Consumir de la Botonera, la mochila o el cinturón). id: el del ítem (mochila o cinturón).
     ui, además de lo de siempre: fijarHp(valor) (y lo que la pantalla muestre de la vida), efecto(it) (el estado que deja, o
     null), tirarExtra(it) (sus tiradas), colocarTrampa(it) (async → true si se colocó; una trampa consumible no se gasta si
     no). cambio(lista) recibe 'inventario' o 'cinturon', 'efectos' si hubo estado o reparación, 'vitals' y 'nitros'. */
  const consumiendoTrampa = new Set();
  /* Lo que cuesta sacar este consumible (2026-10-05): del cinturón 1 No2, de la mochila 2; el primero del turno, con Saque rápido (cinturón,
     una chance que se tira a la vista) puede no costar, y con Bolsillo exterior (mochila) cuesta 1. → {costo, saque: bool, bolsillo: bool}. */
  function costoDeSacar(S, key, ui){
    const f = FichaCalculo.calcular(S).final, meta = S.meta || (S.meta = {}), turno = num(S.turno) || 1;
    let costo = FichaBotonera.costoConsumirNitros(key), saque = false, bolsillo = false;
    if(key === 'cinturon' && num(f.saquerapido) > 0 && meta.saqueTurno !== turno){
      const pct = Combatiente.chancePct(f.saquerapido), d = Combatiente.chanceDado(pct);
      // Sin dado que rueda (dueño, 2026-10-05: «sacar algo del cinturón no amerita pararse a tirar un dado»): se tira callado y se anuncia en texto.
      let sale = pct >= 100, saqueTxt = '⚡ Saque rápido: no costó No2';
      if(d){
        const r = tirarDados('1d' + d.caras);
        if(r){ sale = r.total >= d.caras - d.exitos + 1; saqueTxt = `⚡ Saque rápido (${Combatiente.chanceTexto(pct)}): 1d${d.caras} = ${r.total} → ${sale ? 'salió, no costó No2' : 'no salió'}`; }
      }
      saque = {sale, txt: saqueTxt};
      if(sale) costo = 0;
    }
    if(key === 'inventario' && num(f.bolsilloext) > 0 && meta.bolsilloTurno !== turno){ costo = Math.max(0, costo - 1); bolsillo = true; }
    return {costo, saque, bolsillo};
  }
  async function consumir(S, id, forzar, ui, sacado){
    { const it = [...(S.inventario || []), ...(S.cinturon || [])].find(x => x.id === id); if(it && (it.enMesa || it.reservado)){ ui.toast(`Está ofrecido a ${it.reservadoPara || 'otro personaje'}: cancelá la oferta primero (🤝)`); return; } }   // 🤝 comun/intercambio.js
    let it = S.inventario.find(x=>x.id===id);
    let key = 'inventario';
    if(!it){ it = S.cinturon.find(x=>x.id===id); key = 'cinturon'; }
    if(it && num(it.unidades) > 0){
      const sac = sacado || costoDeSacar(S, key, ui);   // Saque rápido / Bolsillo exterior: se calcula una vez (si pide «hacerlo igual», no se vuelve a tirar)
      const costoNitros = sac.costo;
      let gastoNitros = costoNitros;
      if(costoNitros > num(S.nitros)){
        if(!forzar){
          ui.avisarSinNitros(costoNitros, `consumir ${it.nombre} ${key === 'cinturon' ? 'del cinturón' : 'de la mochila'}`, () => consumir(S, id, true, ui, sac));
          return;
        }
        gastoNitros = gastoNitrosForzado(S, costoNitros, `consumió ${it.nombre}`);
      }
      // Trampa consumible (2026-09-25): al usarla se coloca sola junto a tu token; si no se puede, no se gasta.
      if(it.trampaDatos){
        if(consumiendoTrampa.has(id)) return;
        consumiendoTrampa.add(id);
        let ok = false;
        try{ ok = await ui.colocarTrampa(it); }finally{ consumiendoTrampa.delete(id); }
        if(!ok) return;
      }
      S.nitros = num(S.nitros) - gastoNitros;
      if(sac.saque) S.meta.saqueTurno = num(S.turno) || 1;   // el primero del turno ya se sacó
      if(sac.bolsillo) S.meta.bolsilloTurno = num(S.turno) || 1;

      const cargaMax = Math.max(1, num(it.cargaMax) || 1);
      let carga = num(it.cargaActual ?? cargaMax);
      if(carga <= 0) carga = cargaMax;
      carga -= 1;
      let gastoUnidad = false;
      if(carga <= 0){
        it.unidades = num(it.unidades) - 1;
        carga = cargaMax;
        gastoUnidad = true;
      }
      it.cargaActual = carga;
      purgarSiAgotado(S, key, id);

      // Solo se toca el HP si el ítem efectivamente cura o daña: si no,
      // el clamp contra hpmax lo bajaría igual (con la ficha recién
      // abierta hpmax es 0 y eso mataba al personaje de una).
      // Mano de boticario (2026-10-05): suma a lo que cura una poción.
      const boticario = num(it.curahp) > 0 ? num(FichaCalculo.calcular(S).final.boticario) : 0;
      if(num(it.curahp)){
        ui.fijarHp(num(S.hp) + num(it.curahp) + boticario);
      }
      const efecto = ui.efecto(it);
      ui.tirarExtra(it);
      const spRestaurado = restaurarSpDeConsumo(S, it);
      const reparados = it.nombre === 'Oleo reparador' ? repararArmadura(S) : 0;
      ui.cambio([key, ...(efecto || reparados ? ['efectos'] : []), 'vitals', 'nitros']);
      const partes = [];
      if(it.curahp) partes.push(`${num(it.curahp)>=0?'+':''}${fmt(num(it.curahp) + boticario)} HP${boticario ? ` (+${fmt(boticario)} de Mano de boticario)` : ''}`);
      if(spRestaurado) partes.push(`+${fmt(spRestaurado)} SP`);
      partes.push(`-${costoNitros} No2${sac.saque && sac.saque.sale ? ' (Saque rápido)' : sac.bolsillo ? ' (Bolsillo exterior)' : ''}`);
      if(cargaMax > 1) partes.push(gastoUnidad ? 'última carga usada' : `carga ${carga}/${cargaMax}`);
      if(efecto) partes.push(`${efecto.nombre}${efecto.permanente ? '' : ` (${fmt(efecto.turnos)} turnos)`}`);
      if(reparados) partes.push(reparados > 1 ? 'armadura reparada por completo' : 'armadura reparada');
      ui.toast(`${it.nombre}: ${partes.join(' · ')}`);
      // El anuncio (dueño, 2026-10-05: «se anuncia en el log y en la crónica»): una línea en la Mesa y, en el mapa, la Crónica para los demás.
      const quien = (S.meta && S.meta.nombre) || 'Alguien';
      const publicas = [...(it.curahp ? [`${num(it.curahp) >= 0 ? '+' : ''}${fmt(num(it.curahp) + boticario)} HP`] : []), ...(efecto ? [efecto.nombre] : [])];
      const resultado = [publicas.join(' · '), sac.saque ? sac.saque.txt : ''].filter(Boolean).join(' · ');
      const anuncio = {titulo: `${quien} usó ${it.nombre}`, resultado, texto: `🧪 ${quien} usó ${it.nombre}${resultado ? ': ' + resultado : ''}`, item: it.nombre, saqueSalio: !!(sac.saque && sac.saque.sale)};
      if(ui.anunciar) ui.anunciar(anuncio);
      else{ if(typeof mesaLinea === 'function') mesaLinea(anuncio.texto); if(anuncio.saqueSalio) ui.toast(`⚡ Saque rápido: sacar ${it.nombre} del cinturón no te costó No2`); }
    }
  }

  /* ---------- Combate suelto: tiradas de la Botonera fuera del duelo (paso 3c-4a; js/03, js/11 y js/02) ----------
     ui, además de toast / avisarSinNitros: registrarTirada(origen, r) (publicarla), preguntarSobrepeso({nombre, valor, extra,
     sobre}) (el cartel; la pantalla después llama a sobrepesoPagar y tirarValorStat), cambio(lista) ('nitros', 'refresh',
     'botonera', en ese orden), getParry() / setParry(id) (el arma o escudo del último Parry, que espera su Bloqueo: lo guarda
     cada pantalla), elegirArma(tipo, armas) (el cartel "¿Con qué arma?": 'parry' | 'bloqueo' | 'fuerza' | 'dano'; la pantalla
     llama a armaElegida) y efectosAlPegar(arma) (los efectos al golpear, comun/efectos-golpe.js). */
  // Tirar un stat: Afortunado, mitades y Evasión mínimo 1 (Combatiente.tirarStat); la Evasión con sobrepeso pregunta antes.
  function tirarValorStat(S, nombre, valor, statId, extra, sobrepeso, sobre, ui){
    const f = formulaParaValor(valor);
    if(!f){ ui.toast(`${nombre}: ${fmt(num(valor))} no se puede tirar con dados reales`); return; }
    if(statId === 'eva' && !sobrepeso){
      const s = FichaCalculo.calcular(S).sobrecarga;
      if(s > 0){
        ui.preguntarSobrepeso({nombre, valor, extra, sobre: s});
        return;
      }
    }
    if(sobrepeso === 'penal') extra = num(extra) - num(sobre);
    // La tirada en sí (Afortunado, mitades, Evasión mínimo 1) es la del motor común: comun/combatiente.js.
    const r = Combatiente.tirarStat(valor, S.efectos, statId, {extra});
    if(sobrepeso === 'penal') r.estados.push({n: 'Sobrepeso', p: 'debuff'});
    else if(sobrepeso === 'pagado') r.estados.push({n: 'Sobrepeso (pagó 1 No2)', p: 'otro'});
    ui.registrarTirada(nombre, r);
  }
  // El cartel de sobrepeso, "Pagar 1 No2": devuelve false si no alcanzan (y no cierra el cartel).
  function sobrepesoPagar(S, ui){
    if(num(S.nitros) < 1){ ui.toast('No tenés Nitros para pagar: tirá con la penalidad o cancelá'); return false; }
    S.nitros = num(S.nitros) - 1;
    ui.cambio(['nitros', 'refresh']);
    return true;
  }
  // Parry: siempre 1 No2 (Combatiente.costoParry); queda esperando su Bloqueo con esa misma arma o escudo.
  function parryConArma(S, arma, forzar, ui){
    const costo = Combatiente.costoParry();
    const con = arma ? ' con ' + arma.nombre : '';
    if(costo > num(S.nitros) && !forzar){
      ui.avisarSinNitros(costo, `hacer Parry${con}`, () => parryConArma(S, arma, true, ui));
      return;
    }
    S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? gastoNitrosForzado(S, costo, `hizo Parry${con}`) : costo);
    ui.cambio(['nitros']);
    ui.setParry(arma ? arma.id : null);   // queda esperando su Bloqueo (si ganás el Parry)
    tirarValorStat(S, arma ? `Parry · ${arma.nombre}` : 'Parry', FichaCombate.statParaArma(S, 'parry', arma), 'parry', undefined, undefined, undefined, ui);
    ui.toast(`Parry${con}: −${fmt(costo)} No2 · te quedan ${fmt(num(S.nitros))}${arma ? ' · si lo ganás, tirá el Bloqueo' : ''}`);
    ui.cambio(['refresh', 'botonera']);
  }
  // Bloqueo: tu Bloqueo (de Fuerza) MÁS el peso del arma o escudo; esa suma es el dado.
  function bloqueoConArma(S, arma, ui){
    tirarValorStat(S, arma ? `Bloqueo · ${arma.nombre}` : 'Bloqueo', FichaCombate.bloqueoValor(S, arma), 'bloqueo', undefined, undefined, undefined, ui);
  }
  // Fuerza del golpe: tu Fuerza + el peso de tu arma; esa suma es el dado (contra el Bloqueo del defensor). Sin costo.
  function fuerzaGolpeValorConArma(S, arma){
    return FichaCombate.statParaArma(S, 'fue', arma) + (arma ? num(arma.peso) : 0);
  }
  function fuerzaGolpeConArma(S, arma, ui){
    tirarValorStat(S, arma ? `Fuerza del golpe · ${arma.nombre}` : 'Fuerza del golpe', fuerzaGolpeValorConArma(S, arma), 'fue', undefined, undefined, undefined, ui);
  }
  // Botones Parry, Bloqueo y Fuerza del golpe: con dos o más armas equipadas se elige con cuál.
  function elegirArmaDefensa(S, tipo, ui){
    // El Bloqueo solo existe después de un Parry, y es con la misma arma o escudo (regla del dueño, 2026-09-30).
    if(tipo === 'bloqueo'){
      const pendiente = ui.getParry();
      const armaDelParry = pendiente ? S.inventario.find(x => x.id === pendiente && x.equipado) : null;
      ui.setParry(null);
      if(armaDelParry) bloqueoConArma(S, armaDelParry, ui);
      else ui.toast(Combatiente.BLOQUEO_SOLO_TRAS_PARRY);
      ui.cambio(['botonera']);
      return;
    }
    // Parry: con un arma o un escudo (regla del dueño, 2026-09-30); la Fuerza del golpe, con un arma que pega.
    const armas = tipo === 'fuerza' ? FichaCombate.armasEquipadasConDano(S) : FichaCombate.armasYEscudosParaParry(S);
    if(tipo !== 'fuerza' && !armas.length){ ui.toast(Combatiente.SIN_ARMA_DEFENSA); return; }
    if(armas.length <= 1){ armaElegida(S, tipo, armas.length ? armas[0].item : null, ui); return; }
    ui.elegirArma(tipo, armas);
  }
  // Lo elegido en "¿Con qué arma?".
  function armaElegida(S, tipo, arma, ui){
    if(tipo === 'dano'){ if(arma) tirarDanoDeArma(S, arma, ui); return; }
    if(tipo === 'parry') parryConArma(S, arma, false, ui); else if(tipo === 'fuerza') fuerzaGolpeConArma(S, arma, ui); else bloqueoConArma(S, arma, ui);
  }
  // Daño del arma (con lo que suma el stat Daño) y sus efectos al golpear.
  function tirarDanoDeArma(S, it, ui){
    const dmg = FichaCalculo.calcular(S).final.dmg;
    const r = tirarDados(FichaCombate.armaDanoTxt(it, dmg));
    if(!r) return;
    ui.registrarTirada(it.nombre, r);
    ui.efectosAlPegar(it);
  }
  function pedirArmaYTirar(S, ui){
    const armas = FichaCombate.armasEquipadasConDano(S);
    if(!armas.length){   // sin arma: el daño sin arma (provisorio, P150)
      const r = tirarDados(FichaCombate.danoSinArmaTxt(FichaCalculo.calcular(S).final.dmg));
      if(r) ui.registrarTirada('Sin arma', r);
      return;
    }
    if(armas.length === 1){ tirarDanoDeArma(S, armas[0].item, ui); return; }
    ui.elegirArma('dano', armas);
  }

  /* ---------- Atacar (paso 3c-4b; js/11) ----------
     Lo que hace el ataque suelto (sin objetivo) o el que el duelo le pide al atacante: cobrar los No2 y tirar el PdG.
     Ataque normal: el primero del turno con esa arma cuesta Tipo ÷ 2, los siguientes el Tipo completo (cuenta como ataque).
     Ataque de oportunidad y Contraataque (regla a prueba, P139): SIEMPRE Tipo ÷ 2 y NO suman al conteo de ataques. */
  const confirmarSentado = (S, ui) => { const q = Combatiente.preguntaSentado(S.efectos); return !q || (ui.confirmar || (t => confirm(t)))(q); };
  function atacarConArma(S, arma, forzar, ui){
    if(!forzar && !confirmarSentado(S, ui)) return;   // Sentado no puede atacar: avisa y deja seguir
    ui.setParry(null);
    const costo = FichaCombate.costoAtaque(S, arma);
    if(costo > num(S.nitros) && !forzar){
      ui.avisarSinNitros(costo, `atacar${arma ? ' con ' + arma.nombre : ''}`, () => atacarConArma(S, arma, true, ui));
      return;
    }
    S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? gastoNitrosForzado(S, costo, `atacó${arma ? ' con ' + arma.nombre : ''}`) : costo);
    const primero = FichaCombate.registrarAtaque(S, arma);   // cuenta el ataque con esa arma (comun/ficha-combate.js)
    ui.cambio(['nitros']);
    tirarValorStat(S, arma ? `PdG · ${arma.nombre}` : 'PdG', FichaCombate.pdgParaArma(S, arma).valor, 'pdg', undefined, undefined, undefined, ui);
    const tipo = FichaCombate.tipoAtaque(arma);
    const impar = primero && tipo % 2 !== 0;
    ui.toast(`${arma ? arma.nombre : 'Sin arma ⚠ (Tipo provisorio)'}: -${fmt(costo)} No2 · ${primero ? 'primer ataque con esta arma' : `ataque ${FichaCombate.ataquesConArma(S, arma)} con esta arma`}${impar ? ' · ⚠ Tipo impar, redondeo provisorio' : ''}`);
  }
  const NOMBRE_ATAQUE_ESPECIAL = {oportunidad: 'Ataque de oportunidad', contra: 'Contraataque'};
  function ataqueEspecialConArma(S, arma, tipo, forzar, ui){
    const costo = FichaCombate.costoAtaqueEspecial(arma, tipo), nombre = NOMBRE_ATAQUE_ESPECIAL[tipo] || 'Ataque';
    const con = arma ? ' con ' + arma.nombre : '';
    if(!forzar && !confirmarSentado(S, ui)) return;
    if(costo > num(S.nitros) && !forzar){
      ui.avisarSinNitros(costo, `hacer un ${nombre.toLowerCase()}${con}`, () => ataqueEspecialConArma(S, arma, tipo, true, ui));
      return;
    }
    S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? gastoNitrosForzado(S, costo, `hizo un ${nombre.toLowerCase()}${con}`) : costo);
    ui.cambio(['nitros']);
    // Solo el contraataque suma el «PdG en contraataque» de la propia arma (los tipos 6 lo traen: +1 a +3, mucho menos valioso que un PdG normal porque es circunstancial);
    // y solo el ataque de oportunidad suma el «PdG en oportunidad» (los tipos 4, mismo criterio).
    const bonoContra = tipo === 'contra' ? FichaCombate.statParaArma(S, 'pdgcontra', arma) : tipo === 'oportunidad' ? FichaCombate.statParaArma(S, 'pdgopor', arma) : 0;
    tirarValorStat(S, `${nombre} · PdG${arma ? ' · ' + arma.nombre : ''}`, FichaCombate.pdgParaArma(S, arma).valor + (Number.isNaN(bonoContra) ? 0 : bonoContra), 'pdg', undefined, undefined, undefined, ui);
    ui.toast(`${nombre}${con}: −${fmt(costo)} No2 (lo de un primer ataque)${bonoContra > 0 ? ` · PdG +${fmt(bonoContra)} por ${tipo === 'contra' ? 'contraataque' : 'oportunidad'}` : ''} · te quedan ${fmt(num(S.nitros))}`);
    ui.cambio(['refresh']);
  }

  /* ---------- Habilidades (paso 3c-5a): Ejecutar / Anunciar, el costo X y la 🎲 segunda tirada (js/11 y js/02) ----------
     Lo que pasa después de cobrar (anunciar y tirar, o abrir la Ejecución paso a paso, colocar una trampa, avisar una zona) lo
     decide cada pantalla con `ui`:
       ui = el de combate (toast, registrarTirada, avisarSinNitros, cambio, preguntarSobrepeso…) +
            mesaHabilidad(nombre, detalle) (la línea de la habilidad en la Mesa, a nombre del personaje), fijarHp(valor),
            efecto(it) (el estado del sistema anterior: FichaAcciones.efectoDeConsumo), colocarTrampa(it), avisarZona(it),
            terminar(it, arma, xSp, xNitros) (anunciar y tirar, o la Ejecución), flashFuera(it), elegirArmaHab(it, opciones)
            (el cartel "¿con qué arma?"), pedirCostoX(it, arma) (el cartel del costo X) y cerrarCostoX().
       cambio(lista) además recibe 'habilidades' y 'efectos'. */
  // Al ejecutar una habilidad, su descripción va a la Mesa aunque no tire dados: si tira, viaja con la tirada (una sola línea);
  // si no, va en su propia línea.
  function habilidadTira(h){
    return !!(h && (String(h.tiradaExtra || "").trim() || h.tiradaStat));
  }
  function anunciarHabilidad(S, h, ui){
    const detalle = (h && (h.detalle || h.efectoDetalle)) || "";
    if(habilidadTira(h)) mesaConTexto(detalle);
    else ui.mesaHabilidad(h.nombre, detalle);
  }
  // Ejecutar tira SOLO la primera tirada: el stat vinculado o, si no tiene, la fórmula. La segunda va con el botón 🎲.
  function tirarPrimeraDeHab(S, it, ui){
    if(FichaBotonera.habStatTirable(it)){
      tirarValorStat(S, `${it.nombre} · ${FichaCalculo.STAT_LABEL[it.tiradaStat]}`, FichaCalculo.calcular(S).final[it.tiradaStat] + num(it.tiradaBono), it.tiradaStat, undefined, undefined, undefined, ui);   // tiradaBono: bono fijo de la habilidad al stat (ej. Takle: +1 PdG)
      return true;
    }
    const formula = (it.tiradaExtra || '').trim();
    if(formula){
      const r = tirarDados(formula);
      if(r){ ui.registrarTirada(it.nombre, r); return true; }
    }
    return false;
  }
  function tirarSegundaDeHab(S, id, ui){
    const it = S.habilidades.find(h => h.id === id);
    if(!it) return;
    const r = tirarDados((it.tiradaExtra || '').trim());
    if(r) ui.registrarTirada(`${it.nombre} · Efecto`, r);
    else ui.toast('La fórmula de la habilidad no es válida');
  }
  // Si la habilidad cuesta como un ataque, cuenta como ese ataque del arma (el próximo ataque con esa arma ya paga Tipo
  // completo). Devuelve el texto.
  function registrarAtaqueDeHabilidad(S, it, arma){
    if(!FichaHabilidades.nitrosAtaque(it)) return '';
    const primero = FichaCombate.registrarAtaque(S, arma);   // cuenta como ese ataque (comun/ficha-combate.js)
    return `ataque con ${arma ? arma.nombre : 'sin arma'}${primero ? ' (primero del turno)' : ''}`;
  }
  // Tope de X en costos variables. PLACEHOLDER: ver IT2.limiteXNitros/limiteXSp.
  function limiteCostoX(S, cual){
    const f = cual === 'sp' ? IT2().limiteXSp : IT2().limiteXNitros;
    return typeof f === 'function' ? f(FichaCalculo.calcular(S)) : null;
  }
  async function ejecutarHabilidad(S, id, armaId, forzar, ui){
    const it = S.habilidades.find(h => h.id === id);
    if(!it) return;
    // 📣 Manual: "Anunciar" solo publica la descripción en la Mesa.
    if(FichaBotonera.modoHab(it) === 'manual'){
      ui.mesaHabilidad(it.nombre, it.detalle || it.efectoDetalle || '');
      ui.toast(`${it.nombre} anunciada`);
      return;
    }
    // Silencio (2026-10-04): avisa y deja seguir.
    const sil = Combatiente.preguntaSilencio(S.efectos, it);
    if(sil && !(ui.confirmar || (txt => typeof confirm === 'function' && confirm(txt)))(sil)) return;
    if(Combatiente.tipoEjecucion(FichaBotonera.dueloDe(it)) === 'flash'){ ui.flashFuera(it); return; }   // ⚡ su propia regla de costo (P136)
    // Costo en vida: hace falta que sobre vida después de pagarlo.
    if(num(it.hpCosto) > 0 && num(S.hp) <= num(it.hpCosto)){
      ui.toast(`No te alcanza la vida — ${it.nombre} cuesta ${fmt(num(it.hpCosto))} HP y tenés ${fmt(num(S.hp))}`);
      return;
    }
    // Con costo de ataque: primero se elige el arma (si hay más de una).
    let arma = null;
    if(FichaHabilidades.nitrosAtaque(it)){
      const opciones = FichaBotonera.armasParaHabilidad(S);
      if(armaId === undefined && opciones.length > 1){ ui.elegirArmaHab(it, opciones); return; }
      arma = armaId ? (S.inventario.find(x => x.id === armaId) || null) : opciones[0].arma;
    }
    const armaPendiente = FichaHabilidades.nitrosAtaque(it) ? arma : undefined;
    if(FichaHabilidades.habCostoVariable(it)){ ui.pedirCostoX(it, armaPendiente); return; }
    const costoNitros = FichaBotonera.costoNitrosHab(S, it, arma);
    if(costoNitros > num(S.nitros) && !forzar){
      ui.avisarSinNitros(costoNitros, `usar ${it.nombre}${FichaHabilidades.nitrosAtaque(it) ? ` (ataque con ${arma ? arma.nombre : 'sin arma'})` : ''}`, () => ejecutarHabilidad(S, id, armaId, true, ui));
      return;
    }
    let costoSp = FichaHabilidades.parseCostoSp(it.costo);
    // Costo distinto en turno ajeno (2026-09-28, pedido del dueño): antes de cobrar nada, un cartelito pregunta.
    if(String(it.turnoAjenoSp || '').trim() && !FichaHabilidades.spVariable(it)){
      const elegido = await ConfirmarTurno.pedir(it.nombre, costoSp, num(it.turnoAjenoSp));
      if(elegido === null) return;   // canceló: no se cobra ni se ejecuta nada
      costoSp = elegido;
    }
    S.nitros = num(S.nitros) - (forzar && costoNitros > num(S.nitros) ? gastoNitrosForzado(S, costoNitros, `usó ${it.nombre}`) : costoNitros);
    S.spGastado = num(S.spGastado) + costoSp;
    const costoHp = num(it.hpCosto);
    if(costoHp > 0) ui.fijarHp(num(S.hp) - costoHp);
    const curaHp = num(it.curaHp);
    if(curaHp > 0) ui.fijarHp(num(S.hp) + curaHp);   // cura sobre uno mismo, sin pasar del máximo
    const ataque = registrarAtaqueDeHabilidad(S, it, arma);
    const efecto = ui.efecto(it);
    ui.colocarTrampa(it);
    ui.avisarZona(it);
    const invocada = invocarConHab(S, it, ui);
    ui.terminar(it, arma, 0, 0);
    ui.cambio(['habilidades', ...(efecto ? ['efectos'] : []), ...(invocada ? ['invocaciones'] : []), 'nitros', 'vitals']);
    const partes = [`ejecutada`];
    if(costoSp) partes.push(`-${fmt(costoSp)} SP`);
    partes.push(costoNitros ? `-${fmt(costoNitros)} No2` : 'sin costo de Nitros');
    if(costoHp > 0) partes.push(`-${fmt(costoHp)} HP`);
    if(curaHp > 0) partes.push(`+${fmt(curaHp)} HP`);
    if(ataque) partes.push(ataque);
    if(efecto) partes.push(`${efecto.nombre}${efecto.permanente ? '' : ` (${fmt(efecto.turnos)} turnos)`}`);
    ui.toast(`${it.nombre} ${partes.join(' · ')}`);
  }
  /* ---------- ✨ Armas especiales (2026-10-05, rework mágico, docs/rework-armas.md) ----------
     Una varita o un báculo es «un hechizo equipable»: el ítem equipado trae `especial` = {nombre?, sp, no2? (1), sube? (1), dano (fórmula),
     sumaEspecial (true = el Ef.Esp entero, 0.5 = la mitad), duelo (la misma Ejecución ✨ de una habilidad: objetivo, tira, contra, tipoDano,
     efectos con caras/éxitos, radio…), trampaColocar?}. Usarla arma una habilidad con eso y sigue el mismo camino de una ✨ (cuadro del duelo,
     área, cono, zona, trampa). Costo (dueño): 1 No2 el primer uso del turno y +1 por cada uso más de ESA arma (el conteo es el de los ataques de
     cada arma, `S.ataquesArma['esp:<id>']`, que se vacía en el Mantenimiento), más su SP; sin SP, cada SP se paga con 1 No2 más. */
  const claveEsp = it => 'esp:' + it.id;
  const armasEspeciales = S => (S.inventario || []).filter(i => i && i.equipado && i.especial && !FichaCalculo.itemRoto(i));
  const usosEspecial = (S, it) => num((S.ataquesArma || {})[claveEsp(it)]);
  function costoEspecial(S, it){
    const e = it.especial || {}, usos = usosEspecial(S, it);
    return {no2: Math.max(0, num(e.no2 ?? 1)) + usos * Math.max(0, num(e.sube ?? 1)), sp: Math.max(0, num(e.sp)), usos};
  }
  const spDisponible = S => Math.max(0, num(FichaCalculo.calcular(S).final.sp) - num(S.spGastado));
  function habDeArmaEspecial(S, it){
    const e = it.especial || {}, f = FichaCalculo.calcular(S).final;
    const suma = e.sumaEspecial ? Math.floor(num(f.dmgesp) * (e.sumaEspecial === true ? 1 : num(e.sumaEspecial))) : 0;
    const dano = String(e.dano || '').trim();
    return {id: claveEsp(it), deItem: it.id, nombre: e.nombre || it.nombre, detalle: it.detalle || '', modo: 'auto',
      duelo: e.duelo ? structuredClone(e.duelo) : null, tiradaStat: (e.duelo && e.duelo.tira) || 'pdgmg',
      tiradaExtra: dano ? dano + (suma > 0 ? `+${suma}` : '') : '', ...(e.trampaColocar ? {trampaColocar: structuredClone(e.trampaColocar)} : {})};
  }
  // El «Qué hace» de un arma especial en la Botonera: su costo ahora y lo que hace (sin las notas de automatización).
  const ataqueEspecialMenu = (S, it) => {
    const t = String(it.detalle || '').split(' ⚙')[0].split(' ✋')[0].trim();
    return {costo: costoEspecialTxt(S, it), que: t.length <= 200 ? t : t.slice(0, 200).replace(/[\s,;:(]+\S*$/, '') + '…'};   // corta en una palabra, nunca a la mitad
  };
  const costoEspecialTxt = (S, it) => { const c = costoEspecial(S, it); return `${fmt(c.no2)} No2${c.sp ? ` + ${fmt(c.sp)} SP` : ''}${c.usos ? ` (uso ${c.usos + 1} del turno)` : ''}`; };
  /* Los orbes equipados (2026-10-05) al usar un arma especial: el de resguardo te pone Escudo especial 2 hasta tu próximo turno (una vez por turno: el
     conteo vive en S.ataquesArma, que vacía el Mantenimiento); el salvaje tira 1d6: con 1 te hace 1 de daño, con 6 el efecto sale doble (los dados del
     daño ×2; si el arma no hace daño, el doble lo decide la mesa). Todo a la vista en la Mesa. Devuelve true si sale doble. */
  function orbesAlUsar(S, item, it, ui){
    let doble = false;
    (S.inventario || []).filter(o => o && o.equipado && o.orbe && !FichaCalculo.itemRoto(o)).forEach(o => {
      const k = 'orbe:' + o.id;
      if(o.orbeResguardo && !num((S.ataquesArma || {})[k])){
        S.ataquesArma = {...(S.ataquesArma || {}), [k]: 1};
        S.efectos = Array.isArray(S.efectos) ? S.efectos : [];
        const r = Combatiente.agregarEstado(S.efectos, estadoDeSpec({nombre: 'Escudo especial', turnos: 1, escudoMagico: num(o.orbeResguardo)}, ui.presets || []));
        ui.mesaHabilidad(o.nombre, r.ok ? `Escudo especial ${fmt(num(o.orbeResguardo))} hasta tu próximo turno.` : `No entra el Escudo especial (${r.motivo || 'bloqueado'}).`);
      }
      if(o.orbeSalvaje){
        const d = 1 + Math.floor(Math.random() * 6);
        if(d === 1 && ui.fijarHp) ui.fijarHp(num(S.hp) - 1);
        if(d === 6) doble = true;
        ui.mesaHabilidad(o.nombre, `1d6 → ${d}: ${d === 1 ? 'te hace 1 de daño' : d === 6 ? (String(it.tiradaExtra || '').match(/\d+d\d+/) ? '¡el efecto sale doble! (los dados del daño, ×2)' : '¡el efecto sale doble! ✋ A mano: qué es el doble lo decide la mesa') : 'nada'}.`);
      }
    });
    return doble;
  }
  async function usarArmaEspecial(S, itemId, forzar, ui, sinSp){
    const item = armasEspeciales(S).find(x => x.id === itemId);
    if(!item){ ui.toast('Esa arma especial no está equipada'); return; }
    const it = habDeArmaEspecial(S, item), c = costoEspecial(S, item);
    const confirmar = ui.confirmar || (t => typeof confirm === 'function' && confirm(t));
    let no2 = c.no2, sp = c.sp;
    if(sp > spDisponible(S) && !sinSp){
      if(!(await confirmar(`Te falta SP: ${it.nombre} cuesta ${fmt(sp)} SP y tenés ${fmt(spDisponible(S))}. ¿La pagás con No2? (${fmt(no2 + sp)} No2 en vez de ${fmt(no2)} No2 + ${fmt(sp)} SP)`))) return;
      return usarArmaEspecial(S, itemId, forzar, ui, true);
    }
    if(sinSp){ no2 += sp; sp = 0; }
    if(no2 > num(S.nitros) && !forzar){
      ui.avisarSinNitros(no2, `usar ${it.nombre}`, () => usarArmaEspecial(S, itemId, true, ui, sinSp));
      return;
    }
    S.nitros = num(S.nitros) - (forzar && no2 > num(S.nitros) ? gastoNitrosForzado(S, no2, `usó ${it.nombre}`) : no2);
    S.spGastado = num(S.spGastado) + sp;
    S.ataquesArma = {...(S.ataquesArma || {}), [claveEsp(item)]: c.usos + 1};
    const doble = orbesAlUsar(S, item, it, ui);   // los orbes de la otra mano (resguardo, salvaje)
    if(doble) it.tiradaExtra = String(it.tiradaExtra || '').replace(/(\d+)d(\d+)/g, (m, n, k) => `${2 * num(n)}d${k}`);
    // Lo que el arma le pone a quien la usa (2026-10-05, Varita de la luz: luz y «ve lo oculto» hasta el final del turno).
    const propio = item.especial && item.especial.estadoPropio;
    if(propio && propio.nombre){
      S.efectos = Array.isArray(S.efectos) ? S.efectos : [];
      Combatiente.agregarEstado(S.efectos, {id: uid(), imagen: '', stacks: 1, hpturno: 0, stacksturno: 0, permanente: false, activo: true, popup: false,
        polaridad: 'buff', detalle: '', mods: [], ...structuredClone(propio)});
    }
    ui.colocarTrampa(it);
    ui.terminar(it, null, 0, 0);
    ui.cambio(['nitros', 'vitals', 'habilidades', 'efectos']);
    ui.toast(`${it.nombre}: −${fmt(no2)} No2${sp ? ` · −${fmt(sp)} SP` : ''}${sinSp ? ' (sin SP: pagado con No2)' : ''}`);
  }

  // El costo X ya elegido en el cartel (sp y nitros): valida, cobra y sigue como Ejecutar. Devuelve true si se ejecutó.
  function confirmarCostoVariable(S, it, sp, nitros, arma, ui){
    if(sp < 0 || nitros < 0){
      ui.toast('Los valores no pueden ser negativos');
      return false;
    }
    if(nitros > num(S.nitros)){
      ui.toast(`No te alcanzan los Nitros — tenés ${fmt(num(S.nitros))}`);
      return false;
    }
    const limN = limiteCostoX(S, 'nitros'), limS = limiteCostoX(S, 'sp');
    if(limN !== null && nitros > limN){ ui.toast(`Como mucho ${fmt(limN)} Nitros en X`); return false; }
    if(limS !== null && sp > limS){ ui.toast(`Como mucho ${fmt(limS)} SP en X`); return false; }
    S.nitros = Math.max(0, num(S.nitros) - nitros);
    S.spGastado = num(S.spGastado) + sp;
    const costoHp = num(it.hpCosto);
    if(costoHp > 0) ui.fijarHp(num(S.hp) - costoHp);
    if(num(it.curaHp) > 0) ui.fijarHp(num(S.hp) + num(it.curaHp));
    const ataque = registrarAtaqueDeHabilidad(S, it, arma);
    const efecto = ui.efecto(it);
    ui.colocarTrampa(it);
    ui.avisarZona(it);
    const invocada = invocarConHab(S, it, ui);
    ui.terminar(it, arma, sp, nitros);
    ui.cerrarCostoX();
    ui.cambio(['habilidades', ...(efecto ? ['efectos'] : []), ...(invocada ? ['invocaciones'] : []), 'nitros', 'vitals']);
    const partes = [`ejecutada`, `-${fmt(sp)} SP`, `-${fmt(nitros)} No2`];
    if(costoHp > 0) partes.push(`-${fmt(costoHp)} HP`);
    if(ataque) partes.push(ataque);
    if(efecto) partes.push(`${efecto.nombre}${efecto.permanente ? '' : ` (${fmt(efecto.turnos)} turnos)`}`);
    ui.toast(`${it.nombre} ${partes.join(' · ')}`);
    return true;
  }

  /* ---------- Paso 3c-5b: lo que termina una habilidad ✨ automática (js/02 y js/01) ----------
     ui además de lo de habilidades: yo() → {ref, tipo: 'pj', nombre} (el lado del duelo), dueloDisponible() (el duelo conectado y
     el personaje editable), puedeEscribir() (editable, aunque el duelo no esté), elegirObjetivo({yo, ataque, suelto}) (elegir el
     token y abrir el duelo), colocarZona(it, xSp, xNitros) → true/false, presets (los estados estándar), recordatorios(avisos)
     (líneas para la Mesa); cambio además recibe 'equipo' y 'mochila'. */
  // Aviso al quedar en 1 punto y al romperse: cartel y una línea en la Mesa para todos.
  function durAviso(S, i, ui){
    const a = FichaCalculo.durActual(i), quien = ((S.meta && S.meta.nombre) || '').trim();
    const txt = a <= 0 ? `💥 ${i.nombre} se rompió: sigue ocupando el lugar pero no da ningún efecto hasta que se repare` : a === 1 ? `⚠ ${i.nombre} está a punto de romperse (queda 1 punto de durabilidad)` : '';
    if(!txt) return;
    ui.toast(txt);
    try{ ui.recordatorios([{nombre: `🔧 ${quien ? quien + ': ' : ''}${txt}`, detalle: ''}]); }catch(e){}
  }
  function desgastarItem(S, i, n, ui){
    const antes = FichaCalculo.durActual(i);
    i.dur = Math.max(0, antes - Math.max(1, n || 1));
    if(FichaCalculo.durActual(i) !== antes) durAviso(S, i, ui);
  }
  // Rompe armadura: una pieza de armadura equipada (que todavía no esté rota) elegida AL AZAR.
  function rompeArmaduraAlAzar(S, veces, ui){
    const tocadas = [];
    for(let k = 0; k < Math.max(1, veces || 1); k++){
      const pool = S.inventario.filter(i => i.equipado && FichaCalculo.esArmaduraItem(i) && FichaCalculo.durActual(i) > 0);
      if(!pool.length) break;
      const it = pool[Math.floor(Math.random() * pool.length)];
      it.armRota = Math.min(FichaCalculo.durMax(it), FichaCalculo.armRotaDe(it) + 1);
      desgastarItem(S, it, 1, ui);
      tocadas.push(it.nombre);
    }
    if(!tocadas.length){ ui.toast('Rompe armadura: no tenés piezas de armadura equipadas que se puedan romper'); return 0; }
    ui.toast(`💥 Rompe armadura: se dañó ${[...new Set(tocadas)].join(', ')}`);
    ui.cambio(['equipo', 'mochila', 'refresh']);
    return tocadas.length;
  }
  // Un estado armado a partir de lo que manda una habilidad o una trampa ({nombre, turnos, mods, hp, stacks, escudoMagico…}):
  // el preset con ese nombre con los números de la habilidad encima (comun/combatiente.js, ajustarPreset), o uno propio.
  function estadoDeSpec(spec, presets){
    const preset = FichaHabilidades.presetPorNombre(presets, spec.nombre);
    let draft;
    if(preset){
      const {nombre, ...resto} = preset;
      draft = {id: uid(), nombre, ...structuredClone(resto)};
      Combatiente.ajustarPreset(draft, spec, 'hpturno');
    }else{
      const mods = (spec.mods || []).map(m => ({stat: m.stat, val: num(m.val)}));
      const txt = mods.map(m => `${num(m.val) > 0 ? '+' : ''}${fmt(num(m.val))} ${FichaCalculo.STAT_LABEL[m.stat] || m.stat}`);
      if(spec.hp) txt.push(`${spec.hp > 0 ? '+' : ''}${spec.hp} HP por turno`);
      if(spec.escudoMagico) txt.push(`escudo de ${num(spec.escudoMagico)}`);
      draft = {id: uid(), nombre: spec.nombre || 'Efecto', polaridad: spec.polaridad || (spec.escudoMagico ? 'buff' : 'debuff'), turnos: num(spec.turnos), stacks: 1, hpturno: num(spec.hp), stacksturno: 0,
        permanente: false, detalle: spec.detalle || txt.join(', '), mods, ...(num(spec.escudoMagico) ? {escudoMagico: num(spec.escudoMagico)} : {})};
    }
    draft.activo = true;
    if(!draft.polaridad) draft.polaridad = 'debuff';
    if(spec.soltar && Combatiente.soltarNorm(spec.soltar)) draft.soltar = Combatiente.soltarNorm(spec.soltar);   // cómo se suelta (trampas de Atrapar)
    return draft;
  }
  function aplicarEstadoRecibido(S, spec, origen, ui){
    // Durabilidad (2026-09-26): la Armadura rota y el desgaste son de los ÍTEMS, no un estado del personaje.
    if(spec.nombre === 'Desgaste'){
      const it = S.inventario.find(x => x.id === spec.item);
      if(it && FichaCalculo.durableItem(it)){ desgastarItem(S, it, 1, ui); ui.cambio(['equipo', 'mochila', 'refresh']); }
      else ui.toast(`Desgaste: no encuentro ese ítem en tu inventario`);
      return;
    }
    if(spec.nombre === 'Armadura rota'){ rompeArmaduraAlAzar(S, Math.max(1, num(spec.stacks) || 1), ui); return; }
    // «Pierde SP» (2026-10-04, Succión arcana): gasta `stacks` SP (sin pasar de lo que tiene).
    if(spec.nombre === 'Pierde SP'){
      const max = num(FichaCalculo.calcular(S).final.sp), antes = Math.max(0, max - num(S.spGastado));
      const n = Math.min(antes, Math.max(0, Math.round(num(spec.stacks))));
      S.spGastado = num(S.spGastado) + n;
      ui.cambio(['vitals', 'refresh']);
      ui.toast(`${origen ? origen + ': ' : ''}−${fmt(n)} SP (${fmt(antes)} → ${fmt(antes - n)})`);
      return;
    }
    // «Acortar estado» (2026-10-04, Recuperarse rápido de los pies): le saca `stacks` turnos al estado `estado` (si llega a 0, se va).
    if(spec.nombre === 'Acortar estado'){
      const e = (S.efectos || []).find(x => x && x.activo !== false && x.nombre === spec.estado && !x.permanente);
      if(!e){ ui.toast(`${origen ? origen + ': ' : ''}ya no tenés ${spec.estado}`); return; }
      const menos = Math.max(1, Math.round(num(spec.stacks) || 1));
      e.turnos = Math.max(0, num(e.turnos) - menos);
      if(e.turnos <= 0) S.efectos = S.efectos.filter(x => x !== e);
      ui.cambio(['efectos', 'refresh']);
      ui.toast(`${origen ? origen + ': ' : ''}${spec.estado} ${e.turnos > 0 ? `queda en ${e.turnos} turno${e.turnos === 1 ? '' : 's'}` : 'se terminó'}`);
      return;
    }
    // «Pierde No2» (2026-10-02, Sonic Boom): baja los No2 (`stacks` = cuántos); si llega a 0 y corresponde, queda Sentado.
    if(spec.nombre === 'Pierde No2'){
      const n = Math.max(0, Math.round(num(spec.stacks))), antes = num(S.nitros);
      S.nitros = Math.max(0, antes - n);
      let txt = `−${fmt(n)} No2 (${fmt(antes)} → ${fmt(S.nitros)})`;
      if(S.nitros <= 0 && spec.sentadoEnCero){ const r = Combatiente.agregarEstado(S.efectos, estadoDeSpec({nombre: 'Sentado'}, ui.presets)); if(r.ok) txt += ' · quedás Sentado'; }
      ui.cambio(['nitros', 'efectos', 'refresh']);
      ui.toast(`${origen ? origen + ': ' : ''}${txt}`);
      return;
    }
    const draft = estadoDeSpec(spec, ui.presets);
    const quien = origen ? `${origen}: ` : '';
    // Inmunidades, acumulación y renovación: la regla común (comun/combatiente.js, agregarEstado).
    const r = Combatiente.agregarEstado(S.efectos, draft);
    if(!r.ok){ ui.toast(`🛡 ${quien}Inmune ahora mismo (${r.motivo}) — ${draft.nombre} no te afectó`); return; }
    if(r.que === 'yaLoTiene'){ ui.toast(`${quien}${draft.nombre}: ya lo tenías, no se acumula`); return; }
    ui.cambio(['efectos', 'refresh']);
    ui.toast(`🎯 ${quien}recibiste ${draft.nombre}${r.que === 'renovado' ? ' (se renovó el que tenías)' : r.que === 'acumulado' ? ` (×${r.estado.stacks})` : ''}`);
  }
  // Aplica un efecto del cuadro de Ejecución directo sobre el propio personaje (`fichaId`), sin esperar al GM.
  function dueloAplicarEfectoPropio(S, fichaId, d, ef, ui){
    if(!fichaId || d.defensor.tipo !== 'pj' || d.defensor.ref !== fichaId) return {manual: true, nota: 'a mano'};
    const spec = Duelo.specDeEfecto(ef);
    if(!spec) return {manual: true, nota: 'a mano'};
    if(spec.cura){
      const antes = num(S.hp);
      ui.fijarHp(antes + num(spec.cura));
      return {nota: `+${fmt(num(spec.cura))} HP (${fmt(antes)} → ${fmt(num(S.hp))})`};
    }
    aplicarEstadoRecibido(S, spec, `${d.atacante.nombre} · ${ef.nombre}`, ui);
    return {nota: typeof EstadosAplicar !== 'undefined' ? EstadosAplicar.texto(spec) : spec.nombre};
  }
  function xDeHab(it, xSp, xNitros){ return FichaHabilidades.spVariable(it) ? num(xSp) : FichaHabilidades.nitrosVariable(it) ? num(xNitros) : 0; }
  // La Ejecución para el cuadro del duelo: la regla común (comun/combatiente.js, habEjecucion).
  // `arma`: con la que se ejecuta (si cuesta lo mismo que un ataque); sin ella, la principal — para «el daño de tu arma».
  function habDueloDatos(S, it, xSp, xNitros, arma){
    const c = FichaCalculo.calcular(S);
    const a = arma || ((FichaCombate.armasEquipadasConDano(S)[0] || {}).item) || null;
    return Combatiente.habEjecucion(it, FichaBotonera.dueloDe(it), {stat: s => c.final[s], etq: s => FichaCalculo.STAT_LABEL[s] || s, X: xDeHab(it, xSp, xNitros),
      armaDano: a ? FichaCombate.armaDanoTxt(a, c.final.dmg) : ''});
  }
  // Ataque con arma hecho con una habilidad (`duelo.modo === 'arma'`): el ataque con arreglos (comun/combatiente.js).
  function ataqueDeHabArma(S, it, arma, xSp, xNitros, ui){
    const c = FichaBotonera.dueloDe(it);
    if(!c || c.modo !== 'arma' || !ui.dueloDisponible()) return null;
    return Combatiente.ataqueConArreglos(it, c, {X: c.x === 'sp' ? num(xSp) : num(xNitros),
      arma: {id: arma ? arma.id : '', nombre: arma ? arma.nombre : '', tipoDado: FichaCombate.tipoAtaque(arma), rango: !!(arma && arma.armaDeRango), espalda: arma && arma.espalda, sinParry: !!(arma && arma.sinParry)},
      alcance: c.alcance !== undefined && c.alcance !== 'auto' ? Combatiente.alcanceHab(c, 'pdg', s => FichaCalculo.calcular(S).final[s]) : FichaCombate.alcanceDeArma(S, arma)});
  }
  // ✨ Automática, solo sobre uno mismo y sin tiradas (Blindaje y parecidos): se aplica directo, sin abrir el cuadro, y se anuncia.
  // Devuelve false si no es ese caso.
  function aplicarHabSobreMiDirecto(S, it, h, ui){
    if(!Combatiente.sobreSiSinTiradas(h) || !ui.puedeEscribir()) return false;
    const yo = ui.yo();
    const d = {defensor: {tipo: 'pj', ref: yo.ref}, atacante: {nombre: (S.meta && S.meta.nombre) || 'Personaje'}};
    const hechos = (h.efectos || []).map(ef => { const r = dueloAplicarEfectoPropio(S, yo.ref, d, ef, ui); return r && !r.manual && r.nota ? r.nota : `${ef.nombre || 'Efecto'}: a mano`; });
    const texto = [it.detalle || it.efectoDetalle || '', hechos.length ? '→ ' + hechos.join(' · ') : '', h.efectoLibre || '', h.efectosNota || ''].filter(Boolean).join(' ');
    ui.mesaHabilidad(it.nombre, texto);
    ui.cambio(['efectos', 'vitals']);
    return true;
  }
  // Lo último que hace ejecutar una habilidad: anunciarla y tirar su primera tirada, o abrir el duelo.
  function terminarEjecucionHab(S, it, arma, xSp, xNitros, ui){
    // 💰 Semiautomática: ya cobró el costo; anuncia y tira la tirada inicial (si tiene). Los efectos, a mano.
    if(FichaBotonera.modoHab(it) !== 'auto'){ anunciarHabilidad(S, it, ui); tirarPrimeraDeHab(S, it, ui); return; }
    if(!FichaBotonera.dueloDe(it)){
      if(it.trampaColocar) return;   // una trampa sola: el anuncio y la casilla ya los maneja colocarTrampa
      if(it.invoca && it.invoca.invId){ ui.mesaHabilidad(it.nombre, it.detalle || it.efectoDetalle || ''); return; }   // solo invoca: se anuncia (la invocación ya la hizo invocarConHab)
      ui.toast(`${it.nombre}: todavía no tiene armada la ejecución paso a paso (✨) — se ejecutó como semiautomática`); anunciarHabilidad(S, it, ui); tirarPrimeraDeHab(S, it, ui); return;
    }
    const aArma = ataqueDeHabArma(S, it, arma, xSp, xNitros, ui);
    if(aArma){
      ui.mesaHabilidad(it.nombre, it.detalle || it.efectoDetalle || '');
      ui.elegirObjetivo({yo: ui.yo(), ataque: aArma, suelto: () => tirarPrimeraDeHab(S, it, ui)});
      return;
    }
    // Zona persistente: no abre el cuadro del duelo — queda puesta en el mapa y se resuelve sola.
    const cZona = FichaBotonera.dueloDe(it);
    if(cZona && typeof cZona === 'object' && cZona.objetivo === 'zona'){
      ui.mesaHabilidad(it.nombre, it.detalle || it.efectoDetalle || '');
      if(!ui.colocarZona(it, xSp, xNitros)) ui.toast(`${it.nombre}: para colocar la zona hace falta tener el mapa abierto`);
      return;
    }
    // Solo sobre uno mismo y sin nada que tirar (Blindaje y parecidos): no hace falta el cuadro — se aplica directo y se anuncia.
    if(aplicarHabSobreMiDirecto(S, it, habDueloDatos(S, it, xSp, xNitros, arma), ui)) return;
    const hDuelo = ui.dueloDisponible() ? habDueloDatos(S, it, xSp, xNitros, arma) : null;   // habilidad dirigida (duelo): se anuncia sin tirada y la contienda va en el cuadro
    if(hDuelo) ui.mesaHabilidad(it.nombre, it.detalle || it.efectoDetalle || ''); else anunciarHabilidad(S, it, ui);
    if(hDuelo) ui.elegirObjetivo({yo: ui.yo(), ataque: {tipo: 'habilidad', hab: hDuelo, alcance: hDuelo.alcance}, suelto: () => tirarPrimeraDeHab(S, it, ui)});
    else tirarPrimeraDeHab(S, it, ui);
  }

  /* ---------- Paso 3c-5c: habilidades que colocan algo en el mapa (js/10 y js/02) ----------
     ui además: enMapa() (la página corre dentro del mapa —la ficha en su marco— o ES el mapa) y alMapa(tipo, msg) (la ficha le
     manda el mensaje al mapa; el mapa llama directo a lo que hace con él: zona-habilidad, portal-habilidad,
     zona-persistente-habilidad, trampa-habilidad). */
  const TRAMPA_DANO_RE = /^\d{1,2}d\d{1,3}([+-]\d{1,3})?$/i;
  // Habilidad con zona en el mapa (zonaMapa: 'cono'/'flor') o Invocar portal (portalMapa): se le avisa al mapa.
  function avisarZonaAlMapa(S, h, ui){
    if(!h || !ui.enMapa() || !ui.yo().ref) return;
    // Invocar portal: le pide al mapa que deje elegir los dos puntos (dentro del rango de casteo) y cree los portales.
    if(h.portalMapa){
      try{ ui.alMapa('portal-habilidad', {fichaId: ui.yo().ref, turnos: Math.max(1, num(h.portalMapa.turnos) || 3), nombre: h.nombre}); }
      catch(err){ console.error('No se pudo avisar el portal al mapa:', err); }
      return;
    }
    if(!h.zonaMapa) return;
    try{ ui.alMapa('zona-habilidad', {fichaId: ui.yo().ref, forma: h.zonaMapa, radio: num(h.zonaRadio) || 1, nombre: h.nombre}); }
    catch(err){ console.error('No se pudo avisar la zona al mapa:', err); }
  }
  // Se ejecuta con la habilidad: coloca la trampa en el mapa (si hay token del personaje en el mapa en juego).
  async function colocarTrampaDeHab(S, h, ui){
    const t = h.trampaColocar;
    if(!t || typeof TokensAuto === 'undefined' || !ui.yo().ref) return;
    // La dificultad para detectarla sale de quien la coloca (P145): el personaje, o la invocación si `ui.valorStat` lo dice.
    const valorDe = ui.valorStat || (st => FichaCalculo.calcular(S).final[st]);
    // ✨ Automática (2026-09-30): se anuncia (sin la ubicación) y se elige la casilla en el mapa. Sin el mapa abierto (ficha suelta),
    // queda al lado del token como siempre.
    if(FichaBotonera.modoHab(h) === 'auto' && ui.enMapa()){
      ui.mesaHabilidad(h.nombre, `${h.detalle || ''}${h.detalle ? ' — ' : ''}${t.pilar ? '🧱 levanta pilares de piedra' : `🪤 colocó una trampa${t.nombre ? ` («${String(t.nombre).trim()}»)` : ''}`}.`);
      try{ ui.alMapa('trampa-habilidad', {fichaId: ui.yo().ref, tipoToken: 'pj', nombre: h.nombre, trampa: Combatiente.trampaDeHab(h, valorDe)}); }
      catch(err){ console.error('No se pudo avisar la trampa al mapa:', err); }
      return;
    }
    if(t.pilar){ ui.toast(`🧱 ${h.nombre}: los pilares se levantan desde el mapa (abrilo y usala ahí)`); return; }
    try{
      const dano = TRAMPA_DANO_RE.test(String(t.dano || '').trim()) ? String(t.dano).trim() : '';
      const r = await TokensAuto.colocarTrampas({fichaId: ui.yo().ref, tipoToken: 'pj', trampa: {...Combatiente.trampaDeHab(h, valorDe), dano}});
      if(r.colocadas) ui.toast(`🪤 ${h.nombre}: ${r.colocadas > 1 ? r.colocadas + ' trampas colocadas' : 'trampa colocada'} en el mapa`);
      else ui.toast(r.motivo === 'sin-token' ? `🪤 ${h.nombre}: tu personaje no tiene token en el mapa en juego — no se colocó la trampa` : `🪤 ${h.nombre}: no hay lugar libre al lado de tu token`);
    }catch(err){ console.error('No se pudo colocar la trampa:', err); ui.toast('No se pudo colocar la trampa — revisá la consola'); }
  }
  // Manda al mapa todo lo que hace falta para crear la zona persistente: radio, duración, estado y/o daño, y con qué resistencia.
  // Si hay tirada («tira» del ✨), NO se tira acá (2026-10-02, P143: la habilidad no falla, la zona aparece siempre): se manda el valor
  // del stat en este momento y el mapa lo tira cada vez que la zona afecta a alguien. Devuelve false si no se pudo avisar (sin mapa abierto).
  function colocarZonaDeHab(S, it, xSp, xNitros, ui){
    const c = FichaBotonera.dueloDe(it);
    if(!c || typeof c !== 'object' || c.objetivo !== 'zona') return false;
    if(!ui.enMapa() || !ui.yo().ref) return false;
    const stat = c.tira || '';
    const v = stat ? FichaCalculo.calcular(S).final[stat] : NaN;
    try{
      // El mensaje lo arma la regla común (comun/combatiente.js, zonaDeHab), el mismo que manda un creep.
      const zona = Combatiente.zonaDeHab(it, c, {fichaId: ui.yo().ref, tipo: 'pj', X: xDeHab(it, xSp, xNitros), tiraValor: Number.isFinite(v) ? v : undefined});
      ui.alMapa(zona.tipo, zona);
      return true;
    }catch(err){ console.error('No se pudo avisar la zona al mapa:', err); return false; }
  }

  /* ---------- Habilidad que invoca (2026-10-02, pedido del dueño: «Invocar Abeja» de Bizzante) ----------
     `h.invoca = {invId}`: una de las invocaciones del personaje, la plantilla. Al ejecutarla (después de cobrar) despierta la
     plantilla —o una copia suya que esté dormida— con sus turnos («Cuántos turnos dura»), la vida y los No2 llenos y los cooldowns a
     cero; si ya están todas en juego, crea una copia nueva («Abeja 2», con `copiaDe`), así se puede usar varias veces seguidas. Con el
     mapa abierto le pide la casilla donde aparece (el mapa mueve su token o lo crea, y la mesa se entera por la Crónica). Devuelve la
     invocación, {falta: true} si la invocación elegida ya no existe, o null si la habilidad no invoca. */
  function invocacionDeHab(S, h){
    const c = h && h.invoca;
    if(!c || !c.invId) return null;
    const lista = S.invocaciones = Array.isArray(S.invocaciones) ? S.invocaciones : [];
    const plantilla = lista.find(i => i && i.id === c.invId);
    if(!plantilla) return {falta: true};
    const familia = [plantilla, ...lista.filter(i => i && i.copiaDe === plantilla.id)];
    let inv = familia.find(i => i.activa === false);
    if(!inv){
      inv = structuredClone(plantilla);
      inv.id = uid();
      inv.copiaDe = plantilla.id;
      const base = plantilla.nombre || 'Invocación';
      let n = familia.length + 1;
      while(lista.some(i => i && i.nombre === `${base} ${n}`)) n++;
      inv.nombre = `${base} ${n}`;
      inv.habilidades = (inv.habilidades || []).map(x => ({...x, id: uid()}));
      inv.estados = (inv.estados || []).map(x => ({...x, id: uid()}));
      inv.equipo = (inv.equipo || []).map(x => ({...x, id: uid()}));
      lista.splice(lista.indexOf(familia[familia.length - 1]) + 1, 0, inv);
    }
    inv.activa = true;
    inv.cooldownActual = num(inv.cooldown);
    if(num(inv.hpMax) > 0) inv.hp = num(inv.hpMax);
    inv.nitros = InvCalculo.nitrosMax(inv);
    (inv.habilidades || []).forEach(x => { x.cdActual = 0; });
    return inv;
  }
  function invocarConHab(S, h, ui){
    const inv = invocacionDeHab(S, h);
    if(!inv) return null;
    if(inv.falta){ ui.toast(`${h.nombre}: la invocación que tenía elegida ya no está en tu ficha — elegí otra en el editor de la habilidad`); return null; }
    const turnos = num(inv.cooldown);
    const ref = ui.yo().ref;
    if(ref && ui.enMapa()){
      try{ ui.alMapa('invocacion-habilidad', {fichaId: ref, ref: `${ref}~${inv.id}`, nombre: inv.nombre, color: inv.color || '', quien: (S.meta && S.meta.nombre) || 'Personaje', habilidad: h.nombre, turnos}); }
      catch(err){ console.error('No se pudo avisar la invocación al mapa:', err); }
    }else ui.toast(`🔮 ${inv.nombre} invocada${turnos ? ` (${fmt(turnos)} turnos)` : ''} — poné su token en el mapa`);
    return inv;
  }

  /* ---------- Talentos, trampas consumibles y el Ankh a mano (paso 4, etapa 3c-7, 2026-10-01; antes en js/05, js/10 y js/06) ---------- */
  // Tirar un talento: 1d(nivel × 2) + la Inteligencia sin invertir. La publica cada pantalla (ui.registrarTirada).
  function tirarSocial(S, i, ui){
    const r = tirarDados(FichaLupa.formulaSocial(S, i));
    if(!r){ ui.toast(`${i.nombre}: sin nivel ni Inteligencia sin invertir — no hay nada que tirar`); return; }
    ui.registrarTirada(i.nombre, r);
  }
  // Trampa consumible: coloca en el mapa la trampa del ítem (`trampaDatos`) en la casilla libre al frente de tu token; después la arrastrás a donde quieras
  // (solo la ven vos y el GM, y la disparan los rivales). Devuelve true si se colocó (entonces se gasta la unidad). fichaId: el del personaje.
  async function colocarTrampaDeItem(fichaId, it, ui){
    const d = it.trampaDatos;
    if(!d || typeof TokensAuto === 'undefined' || !fichaId){ ui.toast('Para colocar la trampa tenés que estar en la mesa, con tu personaje en el mapa'); return false; }
    try{
      const dano = TRAMPA_DANO_RE.test(String(d.dano || '').trim()) ? String(d.dano).trim() : '';
      // Forma única de trampa (P123): el `tamano` de la flor es su radio (tamano 2 = flor de 19 casillas, como dice el ítem).
      const r = await TokensAuto.colocarTrampas({fichaId, tipoToken: 'pj',
        trampa: {...d, nombre: String(d.nombre || it.nombre).slice(0, 40), dano, cant: 1},
        item: (() => { const c = structuredClone(it); delete c.imagen; delete c.equipado; delete c.enMesa; delete c.reservado; delete c.reservadoPara; delete c.id; c.unidades = 1; c.cargaActual = 1; return JSON.stringify(c); })()});
      if(r.colocadas){ ui.toast(`🪤 ${it.nombre} colocada junto a tu token: arrastrala en el mapa a donde la quieras`); return true; }
      ui.toast(r.motivo === 'sin-token' ? `🪤 ${it.nombre}: tu personaje no tiene token en el mapa en juego — no se usó` : `🪤 ${it.nombre}: no hay lugar libre al lado de tu token — no se usó`);
      return false;
    }catch(err){ console.error('No se pudo colocar la trampa:', err); ui.toast('No se pudo colocar la trampa — revisá la consola'); return false; }
  }
  // El Ankh usado a mano (el botón Consumir de uno de la mochila): revive con el 25 % del HP máximo. Devuelve el nombre del
  // ítem, o null si no está o no le quedan unidades.
  function ankhAMano(S, key, id){
    const it = S[key] && S[key].find(x => x.id === id);
    if(!it || num(it.unidades) <= 0) return null;
    return aplicarRevivirConAnkh(S, key, id);
  }

  return {gastoNitrosForzado, alternarSigilo, levantarse, soltarse, hpRevivir, revivir,
    tirarSocial, colocarTrampaDeItem, ankhAMano,
    TRAMPA_DANO_RE, avisarZonaAlMapa, colocarTrampaDeHab, colocarZonaDeHab, invocacionDeHab, invocarConHab,
    durAviso, desgastarItem, rompeArmaduraAlAzar, estadoDeSpec, aplicarEstadoRecibido, dueloAplicarEfectoPropio, xDeHab, habDueloDatos,
    ataqueDeHabArma, aplicarHabSobreMiDirecto, terminarEjecucionHab,
    habilidadTira, anunciarHabilidad, tirarPrimeraDeHab, tirarSegundaDeHab, registrarAtaqueDeHabilidad, limiteCostoX,
    ejecutarHabilidad, confirmarCostoVariable, armasEspeciales, costoEspecial, costoEspecialTxt, habDeArmaEspecial, usarArmaEspecial, ataqueEspecialMenu,
    atacarConArma, ataqueEspecialConArma, NOMBRE_ATAQUE_ESPECIAL,
    tirarValorStat, sobrepesoPagar, parryConArma, bloqueoConArma, fuerzaGolpeValorConArma, fuerzaGolpeConArma, elegirArmaDefensa, armaElegida, tirarDanoDeArma, pedirArmaYTirar,
    aplicarRevivirConAnkh, fijarHp, revisarAnkh, revisarMuerte,
    purgarSiAgotado, restaurarSpDeConsumo, repararArmadura, efectoDeConsumo, tiradasDeItem, consumir};
})();
