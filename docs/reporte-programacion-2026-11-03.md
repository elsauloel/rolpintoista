# Reporte de programación — noche del 2026-11-02 al 03

Pedido del dueño: «Programá lo pendiente, probá y mandá reporte». Se programó solo lo **decidido**; lo que sigue en diseño (talismanes
elementales, la rápida de Debuffer, el equipo contra proyectiles) quedó para después. Commit `ab98ab78` en `nueva-version`.

## Qué se programó

1. **Piel de hierro escala con el nivel**: +(3 + nivel) a la Defensa y a la Defensa especial (nivel 1: +4 · nivel 3: +6, como antes · nivel 5:
   +8); sigue +1 a la Resistencia a crítico, 2 turnos. El texto de cada creep muestra su número. Los creeps guardados con +6 se ponen al día solos.
2. **Los misiles** (Lengua de fuego, Misil arcano, Dardo helado, Centella, Mancha corrosiva, Ponzoña y el Misil elemental): **lentos, cooldown 4**,
   sin arrancar la pelea en cooldown. Los guardados se ponen al día solos.
3. **Los dos pools de creeps**: el «+ Creep» de GM Tools tiene dos pestañas, **⭐ Pool esencial** y **🗺 Pool de campaña** (todo lo de fábrica de
   antes y lo que sube el grupo va al de campaña).
4. **Los 6 creeps de nivel 1 aprobados**, en el pool esencial (`comun/creeps-esenciales.js`): Escudero, Piromante, Sangrador, Sanador, Hachero
   (Fue 9 · Con 8 · Des 6 · Agi 6 · Esp 4) y Maldito, con sus atributos, su equipo del catálogo, sus dos habilidades con los cooldowns nuevos, sus
   consumibles en el cinturón (el Escudero lleva dos) y un texto con su estrategia.

## Qué se probó

- **Pruebas automáticas** (`comun/pruebas.html`): en verde, 714, con 2 nuevas (Piel de hierro por nivel y misiles, con la puesta al día de un creep
  viejo; el pool esencial). Una vieja esperaba +6 en un creep de nivel 1: ajustada a +4.
- **Con clics en GM Tools** («Claude · pruebas»): «+ Creep» muestra Pool esencial (6) y Pool de campaña (269). Se agregaron el Escudero y el
  Piromante: salieron con equipo, cinturón y habilidades. La Piel de hierro del Escudero dejó +4 Defensa y +4 Def. especial y quedó en cooldown 3.
  La Lengua de fuego del Piromante dice cooldown 4 y arranca disponible. Los dos creeps de prueba se borraron después.

## Qué no se probó

- Ponerlos en el mapa y usar la habilidad desde ahí, ni lanzar la Lengua de fuego de verdad: en ese mapa corría al mismo tiempo la tanda nocturna
  de pruebas y no se quiso interferir. GM Tools usa el mismo cálculo.

## Decisiones (para revisar)

- La Piel de hierro **puesta a mano desde el selector** sigue dando +6 (el valor de nivel 3); la de la habilidad usa el nivel del creep.
- Las pestañas de pools están en la biblioteca de creeps de GM Tools.
- Los esenciales van con nombre limpio (sin «(auditar)») y marcados como auditados.

## Capturas

`prog-1103-1-pool-esencial.png` · `prog-1103-5-escudero-piel.png` · `prog-1103-6-lengua-cooldown4.png` · `prog-1103-2-pool-campana.png` ·
`prog-1103-3-agregado-Escudero.png`
