# Rework del catálogo — armas (hoja de trabajo)

> Fase 1 de la [hoja de ruta](hoja-de-ruta-rework-catalogo.md) (2026-09-25). Aquí se van **haciendo las preguntas y anotando las respuestas**, en orden. Las reglas de fondo están en
> [`guia-de-diseno.md`](guia-de-diseno.md) y en las preguntas P112–P118 de [`preguntas-abiertas.md`](preguntas-abiertas.md). Cada pregunta trae una **propuesta del asistente** para poder
> responder rápido (sí / no / cambiá esto). Estado: ⬜ sin responder · ✅ respondida.

## Objetivo
Un **catálogo amplio y diverso de armas** de distintos tipos y efectos, con un **pool muy grande** para que el **randomizador de tiendas** tenga sentido. Se **preservan conceptualmente** algunos objetos
del catálogo anterior (ej.: el **set completo de Martín Fierro**, muy raro y poderoso de coleccionar) y se **reajustan sus valores** con los parámetros nuevos. Se trabaja en **tandas** por familia; el asistente
propone y el dueño audita.

## Punto de partida (catálogo actual, 137 armas)
| Tier | Armas | Precio (mín / promedio / máx) |
|---|---|---|
| Común | 47 | 30 / 60 / 120 |
| Buena calidad | 36 | 60 / 102 / 170 |
| Raro | 26 | 75 / 212 / 2000 |
| Excepcional | 17 | 200 / 677 / 950 |
| Legendario | 11 | 1100 / 1422 / 1900 |

- **Por Tipo (dado):** T4 28 · T6 46 · T8 30 · T10 31 · T12 2 · de rango 16 (dentro de los anteriores) · una mano 122 · dos manos 15.
- **Efectos al golpear:** 52 armas tienen alguno; **85 no tienen ninguno**, 45 tienen uno, 6 dos, 1 tres. 19 efectos distintos, muy desparejos: **Rompe armadura en 18 armas**, Sangrado 9, "Ignora 1 de Res. crítico" 7, Envenenar 6…
- **Set Martín Fierro:** hoy hay 3 piezas sueltas (Facón, Boina, Poncho), todas legendarias.
- No hay armas mágicas (solo un Báculo mágico); las armas mágicas van en la fase 3.

## Preguntas (en orden)
### A · Tamaño y reparto del pool
1. ⬜ **¿Cuántas armas en total?** *Propuesta:* ~**300** (más del doble), en forma de pirámide: Común ~90 · Buena calidad ~80 · Raro ~60 · Excepcional ~45 · Legendario ~25.
2. ⬜ **¿Cómo se reparten por familia y Tipo?** *Propuesta:* Tipo 4 (punzantes) 20 % · Tipo 6 (cortantes) 25 % · Tipo 8 (hachas y armas pesadas) 20 % · Tipo 10 (contundentes) 15 % · Tipo 12 (explosivos) 5 % · **de rango** 15 %; y por cada familia, pesos de 1 a 4 (dados) según el tier.
3. ⬜ **¿Una mano y dos manos?** *Propuesta:* ~80 % una mano, ~20 % dos manos (más Peso y más efectos a cambio de ocupar las dos manos).

### B · Efectos
4. ⬜ **¿Cuántos efectos distintos habrá y cuáles?** *Propuesta:* los de la guía (Rompe armadura, Knockdown, Aturdir, Lisiado, Sangrado, Envenenar, Derribar, Agarrar, Prende fuego, Drena vida) + un puñado de "modificadores" (Ignora N de Res. crítico, Ignora armadura, Crítico frecuente/potente). Repartirlos parejo: hoy uno solo (Rompe armadura) está en 13 % de las armas.
5. ⬜ **¿Cuántos efectos lleva un arma según su tier?** *Propuesta:* Común 0 (algunas 1) · Buena calidad 0–1 · Raro 1 · Excepcional 1–2 · Legendario 2–3.
6. ⬜ **¿Con qué probabilidad se aplican?** *Propuesta:* Común/Buena 25 % · Raro 50 % · Excepcional 75 % · Legendario 100 % (o efectos extra del 100 %). Se tira con moneda/d4 como hoy.
7. ⬜ **¿Qué peso tiene cada efecto para valorizar el arma?** *Propuesta (escala 1 a 5, provisoria):* Aturdir 5 · Rompe armadura 4 · Knockdown 4 · Drena vida 4 · Lisiado 3 · Sangrado 3 · Envenenar 3 · Agarrar 3 · Prende fuego 3 · Derribar 2 · Ignora 1 de Res. crítico 2. Se multiplica por un factor según sea **de casa** (×1), **habilitado** (×1,25) o **excepcional** (×1,5) para la familia.

### C · Valorización, tier y precio (P112)
8. ⬜ **¿Cuáles son los ingredientes del puntaje de calidad?** *Propuesta:* daño esperado (dados del Tipo × Peso) + bonos (PdG, Parry, Bloqueo, Dmg…) + Σ(peso del efecto × probabilidad) + Crítico frecuente/potente + costo en Nitros del ataque (más caro = menos puntaje) − peso del arma (relevancia intermedia).
9. ⬜ **¿El tier lo determina el puntaje o se elige aparte?** *Propuesta:* lo determina el puntaje por **umbrales** (Común < Buena < Raro < Excepcional < Legendario), y solo se rompe la regla a propósito (ítems únicos, sets).
10. ⬜ **¿Qué precio corresponde a cada tier?** *Propuesta:* mantener los rangos actuales como ancla (Común ~60, Buena ~100, Raro ~210, Excepcional ~680, Legendario ~1400) y que el precio salga del puntaje dentro de cada rango.

### D · Contenido a preservar y sets
11. ⬜ **¿Qué armas del catálogo actual se conservan conceptualmente?** *Propuesta:* el asistente arma una **hoja con las 137 armas** (nombre, tier, Tipo, efectos) y vos marcás **conservar / reajustar / descartar**.
12. ⬜ **Sets (ej.: Martín Fierro completo).** ¿Cuántas piezas tiene un set y qué bonus da tener **el set completo** (o 2 de 3)? *Propuesta:* sets de 3 a 5 piezas (arma + 2–4 de defensa), con un estado extra al tenerlas todas equipadas. **Ojo:** hoy el juego no tiene bonus de set; habría que construirlo.

### E · Método
13. ⬜ **¿En qué orden y qué tamaño de tanda?** *Propuesta:* por familia (punzantes → cortantes → hachas → contundentes → rango → explosivos → híbridas), de ~12 armas por tanda, en 3 pasos: (a) lista de ideas/nombres, (b) números, (c) carga al editor de catálogo tras tu auditoría.

## Respuestas y decisiones
*(se completan a medida que se responden)*
