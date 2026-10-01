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

  return {gastoNitrosForzado, alternarSigilo, levantarse};
})();
