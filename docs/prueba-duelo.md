# Cómo probar el duelo (lista de pruebas para la mesa)

> Hecha el 2026-09-26 para cuando el dueño pueda probar. **No está cargada en «Falta testear»** (esa lista solo se toca cuando el dueño lo pide). Todo lo del duelo se probó con un Firestore simulado, **no en mesa**.

## Antes de empezar
- **Pegar `firebase/firestore.rules`** en la consola de Firebase (Desarrollar y realizar pruebas → Ctrl+A → pegar → Publicar). Cambiaron varias veces: colección `duelos` y sus campos (`fase`, `defensa`, `critDatos`, `crit`, `dano`, `efectos`, `resumido`…), y el campo `destacar` de las tiradas.
- Recargar con **Ctrl+F5** (el sitio cachea hasta 10 minutos).
- Hace falta **el GM conectado en el mapa**: solo él puede escribir la vida y los estados de otros (daño y «Aplicar»).
- Tener un token de personaje y otro de creep **vinculado a su ficha de GM Tools** (con «Traer tokens», no con «Nuevo token»; si es un «Nuevo token» el mapa intenta vincularlo solo por nombre).

## Pruebas (en este orden)
1. **Atacar y elegir el objetivo.** Botón Atacar → tipo de ataque → aparece el cartel flotante y el menú del token propio se guarda → clic sobre el token rival. *Debe abrirse el cuadro en todas las pantallas.* Probar también Esc, clic derecho y «Sin objetivo».
2. **Minimizar y volver.** «—» y el botón «⚔ Ver duelo».
3. **Contacto a ciegas.** El atacante tira el PdG (se ve solo *su* número; el otro ve «ya tiró 1d8+1»). El defensor ve las opciones con **cuánto tiraría** y elige. *Nada debe aparecer en la Mesa hasta que tiran los dos.* Después ruedan **los dos juegos de dados juntos** y, cuando quedan quietos, aparece el resultado (cuadro y Mesa).
4. **Defensor con sobrepeso** (Evasión): las dos opciones (pagar 1 No2 / con penalidad).
5. **Parry y Bloqueo.** Ganar el Parry → Fuerza del golpe contra Bloqueo. Probar los tres finales: **bloqueado** (con el botón ⚔ Contraatacar, que abre otro duelo con los roles invertidos), **pasa la mitad** (con el aviso de durabilidad), y **el Parry falla** (el golpe pega).
6. **Empates.** Con dos tiradas iguales: solo una con «+» (gana la otra) y las dos iguales (par o impar; lo anuncia la Mesa con el motivo).
7. **Crítico.** Diferencia grande: «¡ES CRÍTICO!», tabla del d20 (con Crítico potente, la tabla modificada y su explicación), tirar los d20 (**el más alto crece, sube, brilla y suelta ondas**), y un d20 bajo = crítico ×1 que igual ignora la Defensa. Probar también un golpe **sin crítico** y uno anulado por la **Resistencia a crítico**.
8. **Daño.** «Tirar el daño»; el GM aplica: sin crítico (daño − Defensa), con crítico (derecho a la vida, «36 DERECHO A LA VIDA»), «pasa la mitad», Invulnerable y Escudo mágico. Ver que la vida del token cambia y que **Ctrl+Z no lo deshace**.
9. **Efectos del golpe.** Un arma con Lisiado 25 %, Aturdir, Demora y Envenenar: tirar cada uno, «¡FUNCIONÓ!»/«No funcionó», **Aplicar** (el estado aparece en el creep, o le llega a la ficha del personaje), y los efectos que **necesitan daño** deben quedar tachados cuando el golpe no hizo daño.
10. **Resumen final.** Una línea de reporte en la Mesa con todo lo que pasó.
11. **Invocaciones y creeps** como atacante y como defensor (los creeps: opciones de defensa y Parry a 1 No2).
12. **Sin el defensor** (o sin sus opciones): el botón «Tirar a mano» y «Reintentar».

## Si algo falla
- El aviso «No se pudo abrir el duelo: …» y la **línea gris** del cuadro dicen el motivo: copiarlos.
- Errores típicos: reglas de Firestore sin pegar, token sin ficha vinculada, GM desconectado.
