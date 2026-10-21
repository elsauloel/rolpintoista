# Auditoría de las habilidades de creep (las de fábrica)

> Arrancada el 2026-10-20 (dueño: «vamos a ver las habilidades de creeps que ya están cargadas… clasificarlas por utilidad… auditando, partiendo
> de lo que sería útil para un warrior, alguien de choque frente a frente»). Las habilidades están en `comun/skills-creep-base.js` (321, con la
> receta `{sp, cd, lenta}` que `armarHab` de `comun/creeps-base.js` calcula con el nivel del creep). Método: **una por una** — el texto original,
> cómo está hoy, la propuesta; el dueño decide; se aplica, se prueba en el mapa y se marca acá.

## Criterios (decididos al auditar)

- **Los golpes usan el arma del creep y van al duelo** (2026-10-20): como los kobolds y goblins auditados (la Picada del Kobold Rabioso): «un
  ataque con su arma» con arreglos (`aA(detalle, arma, ataqueTxt, spCosto)` en la receta → `duelo: {modo: 'arma', arma: {…}}`), con PdG contra
  Evasión o Parry, Bloqueo y crítico. Antes tiraban un daño fijo (2d6 + nivel) sin arma ni duelo.
- **La misma escala que los jugadores**: se compara cada una con la habilidad de clase más parecida y se cobra lo mismo. Referencias:
  Amplificar daño (Warrior: +X dados del Tipo del arma, X SP), Carga (Warrior: +X PdG y +X de daño, X SP), Takle (Tanque: +1 PdG y no se
  puede parrear, 3 SP), Tajear (Asalto: Crítico frecuente +1, Perfora 1 y Sangrado, 3 SP), Lisiar (Asalto: crítico +1/+2 y Lesión, 2 SP).
- **Cada golpe con su identidad** (dueño, 2026-10-20: «me gusta que les des identidad a cada uno»): los golpes simples que hoy son el mismo con
  otro nombre pasan a tener cada uno su toque.
- **SP**: cada receta trae su `spCosto` (lo que cuesta en modo SP, ver «Creeps con SP» en `comun/CLAUDE.md`); el cooldown queda para el modo
  de siempre.

## Clasificación: las de choque («melee», 70 de las 321)

- **Golpes simples (8):** Golpe fuerte ✅, Tajo veloz, Estocada, Zarpazo, Mordisco feroz, Cornada, Puño de roca, Golpe de pomo.
- **Golpes con efecto (~14):** Golpe que sangra, Mordisco que lisia, Golpe atontador, Corte profundo, Zarpazo desgarrador, Zarpa oxidante, Golpe
  glacial, Toque abrasador, Mordisco vampírico, Golpe vigorizante, Golpe brutal y guardia, Golpe de escudo, Golpe doble, Ráfaga de golpes, Aplastar,
  Golpe de mano.
- **Golpes en área (6):** Barrido, Torbellino de acero, Pisotón, Pisoteo múltiple, Golpe sísmico, Coletazo (+ Aura de calor).
- **Golpes lentos y fuertes (6):** Golpe aplastante, Golpe cargado, Remate, Golpe de gracia, Ataque de furia, Devorar.
- **Carga y empuje (5):** Cargar, Embestida, Tackle, Empujón, Empujar a la trampa.
- **Buffs propios (15):** Furia, Grito de guerra, Frenesí, Afilar, Sed de sangre, Coraje, Modo turbo, Rabia ancestral, Fortalecerse, Hambre
  insaciable, Pelaje erizado, Despertar de la piedra, Adrenalina, Saqueo, Furia del jefe.
- **Aguantar y curarse (6):** Segundo aliento, Regeneración rápida, Frenesí de curación, Devorar cadáver, Segunda fase, Escudo de espinas.
- **Control (8):** Aturdir, Agarrón, Romper la rodilla, Desarmar, Lisiar, Romper armadura, Herida sangrante (y Golpe atontador).

## Auditadas

- ✅ **Golpe fuerte** (2026-10-20). Original: «Un golpe cargado con todo el peso.» Antes: 2d6 + nivel de daño fijo, sin arma ni duelo; costo de un
  ataque, cooldown 2. **Ahora** (como el Amplificar daño del Warrior con X = 1): un ataque con su arma que suma **+1 dado del Tipo de su arma**; va
  al duelo; costo de un ataque, cooldown 2 o **1 SP**. Probado en el mapa (creep con Daga: «Daño · Daga · 2d4 + 1 + 1d4»).
- De paso, **Golpe brutal** (Warrior, habilidad de clase): el −2 a la Evasión hasta su próximo turno quedó automático (estado «Guardia baja»).
  Probado en el mapa (Silvia: Evasión 6 → 4, 3 SP).

## Sigue

- Tajo veloz (propuesta en la conversación: +1 PdG y +1 al daño, 1 SP — como Carga con X = 1, sin la carrera).
