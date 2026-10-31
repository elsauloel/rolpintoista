# Rework de armas — hoja de revisión del catálogo actual

Generada por `herramientas/calculadora_armas.py hoja` (2026-09-25). Es la pregunta **P11** de [`rework-armas.md`](rework-armas.md): para cada arma actual, la decisión del dueño:
**C** = conservar la idea y reajustar sus valores · **R** = reimaginar (mantener el nombre o el concepto pero cambiar lo que hace) · **D** = descartar. Se completa en la columna *Decisión*.
Los valores "Nuevo" salen de la fórmula v0 (`calculadora_armas.py`) y son solo una referencia: el catálogo viejo no seguía las reglas nuevas.

## Punzantes (Tipo 4) — 26 armas

| Arma | Tier | Manos | Dado×Peso | Bonos | Efectos | Precio hoy | Nuevo (PC · tier · precio) | Decisión |
|---|---|---|---|---|---|---|---|---|
| Cuchillo de cazador | Común | 1 | d4×1 | — | — | $30 | 2.3 · Común · $50 | |
| Cuchillo del grumete polizón | Común | 1 | d4×1 | — | — | $30 | 2.3 · Común · $50 | |
| Daga | Común | 1 | d4×1+1 | — | — | $40 | 4.3 · Común · $65 | |
| Estileto común | Común | 1 | d4×1 | crit +1 | — | $50 | 7.5 · Buena Calidad · $120 | |
| Estileto ritual del acólito | Común | 1 | d4×1 | crit +1 | — | $50 | 7.5 · Buena Calidad · $120 | |
| Horquilla | Común | 1 | d4×1 | rng +1 | — | $50 | 2.8 · Común · $50 | |
| Lanza corta | Común | 1 | d4×2 | rng +1 | — | $75 | 5.1 · Común · $70 | |
| Lanza de guardia de puerta | Común | 1 | d4×2 | rng +1 | — | $75 | 5.1 · Común · $70 | |
| Pica Hielos | Común | 1 | d4×2 | — | — | $40 | 4.6 · Común · $65 | |
| Punzón del ladronzuelo | Común | 1 | d4×1+1 | — | — | $40 | 4.3 · Común · $65 | |
| Daga de Capitán | Buena Calidad | 1 | d4×1 | pdg +1 | — | $90 | 3.3 · Común · $55 | |
| Daga de guardia | Buena Calidad | 1 | d4×1+1 | — | Ignora 1 de Res. crítico 100% | $60 | 9.6 · Buena Calidad · $130 | |
| Daga de la viuda verde | Buena Calidad | 1 | d4×1+1 | — | Ignora 1 de Res. crítico 100% | $60 | 9.6 · Buena Calidad · $130 | |
| Daga del sacrificio | Buena Calidad | 1 | d4×1 | pdg +1 | — | $90 | 3.3 · Común · $55 | |
| Estilete de competencia | Buena Calidad | 1 | d4×2 | crit +1 | — | $75 | 9.8 · Buena Calidad · $130 | |
| Estoque | Buena Calidad | 1 | d4×2 | ini +1 | — | $60 | 5.2 · Común · $70 | |
| Pico de guerra | Buena Calidad | 1 | d4×2 | rng +1 | Rompe armadura 50% | $90 | 8.1 · Buena Calidad · $95 | |
| Aguijón de esgrima | Raro | 1 | d4×2 | pdg +1, parry +2 | — | $110 | 8.1 · Buena Calidad · $95 | |
| Estoque de duelista | Raro | 1 | d4×1+2 | — | Ignora 2 de Res. crítico 100% | $80 | 16.8 · Raro · $350 | |
| Lanza militar | Raro | 1 | d4×2+2 | rng +1 | — | $110 | 9.1 · Buena Calidad · $120 | |
| Puñal aserrado | Raro | 1 | d4×2 | — | Rompe armadura 100% | $100 | 10.6 · Buena Calidad · $150 | |
| Rompemalla | Raro | 1 | d4×2 | — | Rompe armadura 50% | $75 | 7.6 · Buena Calidad · $80 | |
| Báculo mágico | Excepcional | 1 | d4×2 | esp +2, rangocasteo +5, bonos +2 | — | $200 | 12.7 · Raro · $210 | |
| Colmillo dientes de sable | Excepcional | 1 | d4×2+1 | — | Sangrado 100% | $900 | 9.1 · Buena Calidad · $120 | |
| Puñal de Dorne | Excepcional | 1 | d4×2+2 | — | Envenenar 100% | $850 | 11.1 · Raro · $150 | |
| Facón de Martín Fierro | Legendario | 1 | d4×1 | crit +4 | Sangrado 100%, Ignora 1 de Res. crítico 100%, Primera sangre 100% | $1300 | 20.6 · Excepcional · $600 | |

## Cortantes (Tipo 6) — 38 armas

| Arma | Tier | Manos | Dado×Peso | Bonos | Efectos | Precio hoy | Nuevo (PC · tier · precio) | Decisión |
|---|---|---|---|---|---|---|---|---|
| Bastón ferrado | Común | 2 | d6×1+1 | parry +1 | — | $50 | 5.6 · Común · $75 | |
| Cimitarra | Común | 1 | d6×1 | parry +1 | — | $69 | 4.3 · Común · $65 | |
| Espada ancha | Común | 1 | d6×1+1 | — | — | $70 | 4.6 · Común · $65 | |
| Espada corta | Común | 1 | d6×1 | — | — | $30 | 3.3 · Común · $55 | |
| Espada corta de instrucción | Común | 1 | d6×2 | — | — | $50 | 6.6 · Común · $85 | |
| Espada corta oxidada | Común | 1 | d6×1 | — | Envenenar 50% | $70 | 4.5 · Común · $65 | |
| Espada de alquiler oxidada | Común | 1 | d6×1 | — | Envenenar 50% | $70 | 4.5 · Común · $65 | |
| Espada de recluta de la guardia | Común | 1 | d6×2 | — | — | $50 | 6.6 · Común · $85 | |
| Espada de taberna | Común | 1 | d6×1+1 | — | — | $70 | 4.6 · Común · $65 | |
| Hoz | Común | 1 | d6×1 | — | Sangrado 50% | $75 | 4.3 · Común · $65 | |
| Hoz ceremonial | Común | 1 | d6×1 | — | Sangrado 50% | $75 | 4.3 · Común · $65 | |
| Machete | Común | 1 | d6×1 | — | Rompe armadura 50% | $60 | 6.3 · Común · $80 | |
| Sable común | Común | 1 | d6×1 | ini +1 | — | $40 | 3.8 · Común · $60 | |
| Sable de abordaje | Común | 1 | d6×1 | ini +1 | — | $40 | 3.8 · Común · $60 | |
| Sable mellado del camino real | Común | 1 | d6×1 | ini +1 | — | $40 | 3.8 · Común · $60 | |
| Cimitarra de guardia | Buena Calidad | 1 | d6×1 | parry +2 | — | $75 | 5.3 · Común · $70 | |
| Cimitarra del contramaestre | Buena Calidad | 1 | d6×1 | parry +2 | — | $75 | 5.3 · Común · $70 | |
| Espada del Jefe de los Mil Caminos | Buena Calidad | 1 | d6×1 | pdg +2 | — | $90 | 5.8 · Común · $75 | |
| Espada del veterano de mil batallas | Buena Calidad | 1 | d6×1 | pdg +2 | — | $90 | 5.8 · Común · $75 | |
| Espada larga | Buena Calidad | 1 | d6×1 | pdg +2 | — | $90 | 5.8 · Común · $75 | |
| Falchion | Buena Calidad | 1 | d6×2 | — | Ignora 1 de Res. crítico 100% | $75 | 9.6 · Buena Calidad · $130 | |
| Sable de caballería | Buena Calidad | 1 | d6×1 | pdg +1, parry +1 | — | $75 | 5.5 · Común · $75 | |
| Sable de mando del capitán | Buena Calidad | 1 | d6×1 | pdg +1, parry +1 | — | $75 | 5.5 · Común · $75 | |
| Sable del sargento | Buena Calidad | 1 | d6×2 | pdg +1 | — | $80 | 7.8 · Buena Calidad · $90 | |
| Sable militar | Buena Calidad | 1 | d6×2 | pdg +1 | — | $80 | 7.8 · Buena Calidad · $90 | |
| Cuchilla de carnicero | Raro | 1 | d6×2 | — | Rompe armadura 100% | $110 | 12.6 · Raro · $200 | |
| Espada bastarda | Raro | 1 | d6×2+1 | parry +1, bloqueo +1 | — | $120 | 10.2 · Buena Calidad · $140 | |
| Espada bastarda del Espectro | Raro | 1 | d6×2+1 | parry +1, bloqueo +1 | — | $120 | 10.2 · Buena Calidad · $140 | |
| Katana | Raro | 1 | d6×2 | pdg +2, crit +1 | — | $120 | 12.1 · Raro · $190 | |
| Katana del cazarrecompensas | Raro | 1 | d6×2 | pdg +2, crit +1 | — | $120 | 12.1 · Raro · $190 | |
| Mandoble | Raro | 1 | d6×2 | parry +2, bloqueo +1 | — | $110 | 9.8 · Buena Calidad · $130 | |
| Espada larga de Dorne | Excepcional | 1 | d6×2 | pdg +2 | Envenenar 100% | $500 | 11.6 · Raro · $170 | |
| Espadón | Excepcional | 1 | d6×4 | parry +2, bloqueo +3 | — | $500 | 18.9 · Excepcional · $500 | |
| Flamberge | Excepcional | 1 | d6×1+2 | pdg +1 | Sangrado 100% | $550 | 9.2 · Buena Calidad · $120 | |
| Gladius | Excepcional | 1 | d6×3 | parry +2, bloqueo +2 | — | $400 | 14.4 · Raro · $260 | |
| Aguijón de mantícora | Legendario | 1 | d6×2 | crit +2, dmg +2 | Envenenar 100% | $1100 | 19.0 · Excepcional · $500 | |
| Espada de Nosferatu | Legendario | 1 | d6×2+2 | — | Ignora armadura 50%, Drena vida 100% | $1300 | 14.3 · Raro · $260 | |
| Reflejo de Acero | Legendario | 1 | d6×1+3 | parry +3, bloqueo +2 | — | $1400 | 12.8 · Raro · $210 | |

## Hachas y pesadas (Tipo 8) — 26 armas

| Arma | Tier | Manos | Dado×Peso | Bonos | Efectos | Precio hoy | Nuevo (PC · tier · precio) | Decisión |
|---|---|---|---|---|---|---|---|---|
| Hacha | Común | 1 | d8×1 | — | Rompe armadura 100% | $60 | 8.3 · Buena Calidad · $150 | |
| Hacha de constructor | Común | 1 | d8×2 | — | Rompe armadura 100% | $90 | 12.6 · Raro · $450 | |
| Hacha de leñador | Común | 1 | d8×2 | — | — | $60 | 8.6 · Buena Calidad · $160 | |
| Hacha del clan | Común | 1 | d8×1 | — | Rompe armadura 100% | $60 | 8.3 · Buena Calidad · $150 | |
| Hacha oxidada | Común | 1 | d8×1 | — | Envenenar 50% | $50 | 5.5 · Común · $75 | |
| Hachuela | Común | 1 | d8×1 | — | — | $40 | 4.3 · Común · $65 | |
| Lanza de caza | Común | 2 | d8×1 | rng +1 | — | $65 | 4.8 · Común · $70 | |
| Tomahawk | Común | 1 | d8×1 | rng +1 | — | $60 | 4.8 · Común · $70 | |
| Espadón de batalla | Buena Calidad | 2 | d8×2+1 | — | — | $170 | 9.6 · Buena Calidad · $130 | |
| Hacha con pico | Buena Calidad | 1 | d8×2 | — | Ignora 1 de Res. crítico 100% | $110 | 10.8 · Buena Calidad · $160 | |
| Hacha de batalla | Buena Calidad | 1 | d8×2 | bloqueo +1 | Rompe armadura 100% | $110 | 13.6 · Raro · $350 | |
| Hacha de doble filo | Buena Calidad | 1 | d8×1+1 | — | Rompe armadura 100% | $100 | 9.3 · Buena Calidad · $120 | |
| Hacha de guerra ligera | Buena Calidad | 1 | d8×2+1 | — | — | $100 | 9.6 · Buena Calidad · $130 | |
| Hacha de la furia roja | Buena Calidad | 1 | d8×2 | bloqueo +1 | Rompe armadura 100% | $110 | 13.6 · Raro · $350 | |
| Hacha dentada | Buena Calidad | 1 | d8×2 | — | Sangrado 50% | $115 | 9.8 · Buena Calidad · $130 | |
| Alabarda de guardia | Raro | 2 | d8×2+1 | rng +1 | Derribar 25% | $230 | 11.0 · Raro · $150 | |
| Hacha danesa | Raro | 1 | d8×2 | rng +1 | Rompe armadura 100% | $130 | 13.1 · Raro · $220 | |
| Hacha de doble filo | Raro | 1 | d8×3 | — | Rompe armadura 100%, Ignora 1 de Res. crítico 100% | $120 | 19.1 · Excepcional · $800 | |
| Hacha de guerra pesada | Raro | 1 | d8×2 | — | Arruina armadura 100% | $130 | 8.6 · Buena Calidad · $110 | |
| Hacha del Jefe de Guerra | Raro | 1 | d8×2 | rng +1 | Rompe armadura 100% | $130 | 13.1 · Raro · $220 | |
| Sagaris | Raro | 1 | d8×2+1 | — | Rompe armadura 100%, Sangrado 100% | $130 | 16.1 · Raro · $300 | |
| Hacha de guardia real | Excepcional | 1 | d8×2+1 | parry +2, bloqueo +3 | — | $500 | 15.1 · Raro · $290 | |
| Hacha de madera mística | Excepcional | 1 | d8×2 | — | Rompe armadura 100%, Drena vida 100% | $600 | 18.6 · Excepcional · $500 | |
| Hacha filo de diamante | Excepcional | 1 | d8×3 | — | Arruina armadura 100% | $450 | 12.9 · Raro · $210 | |
| Garra de Fafner | Legendario | 1 | d8×1+1 | — | Ignora armadura 100%, Golpes seguidos 100% | $1100 | 5.3 · Común · $70 | |
| Hacha de Durin | Legendario | 1 | d8×4+1 | — | Arruina armadura 100%, Lisiado 100% | $1200 | 22.7 · Excepcional · $700 | |

## Contundentes (Tipo 10) — 30 armas

| Arma | Tier | Manos | Dado×Peso | Bonos | Efectos | Precio hoy | Nuevo (PC · tier · precio) | Decisión |
|---|---|---|---|---|---|---|---|---|
| Bastón de monje | Común | 1 | d10×1+1 | rng +1 | — | $90 | 6.7 · Común · $85 | |
| Bastón del trueno | Común | 1 | d10×1+1 | rng +1 | — | $90 | 6.7 · Común · $85 | |
| Bate de Baseball | Común | 1 | d10×1+1 | — | — | $90 | 6.1 · Común · $80 | |
| Cachiporra | Común | 1 | d10×1 | — | — | $40 | 5.3 · Común · $70 | |
| Garrote | Común | 1 | d10×2 | — | — | $60 | 10.6 · Buena Calidad · $230 | |
| Martillo de bola | Común | 1 | d10×2 | bloqueo +1 | — | $115 | 11.6 · Raro · $400 | |
| Martillo de cantero | Común | 1 | d10×1 | rng +1 | — | $70 | 5.9 · Común · $75 | |
| Maza | Común | 1 | d10×2 | — | — | $50 | 10.6 · Buena Calidad · $230 | |
| Maza de hierro | Común | 1 | d10×1 | bloqueo +1 | — | $90 | 6.3 · Común · $80 | |
| garrote de hueso | Común | 1 | d10×2 | bloqueo +1 | — | $120 | 11.6 · Raro · $400 | |
| Báculo de batalla | Buena Calidad | 1 | d10×2 | bloqueo +1, rng +1 | — | $140 | 12.2 · Raro · $290 | |
| Báculo del Sumo Profeta | Buena Calidad | 1 | d10×2 | bloqueo +1, rng +1 | — | $140 | 12.2 · Raro · $290 | |
| Báculo del inquisidor | Buena Calidad | 1 | d10×2 | bloqueo +1, rng +1 | — | $140 | 12.2 · Raro · $290 | |
| Martillo | Buena Calidad | 1 | d10×3 | — | — | $100 | 15.9 · Raro · $450 | |
| Martillo de cabeza plana | Buena Calidad | 1 | d10×2 | bloqueo +2 | — | $135 | 12.6 · Raro · $300 | |
| Martillo ergonómico | Buena Calidad | 1 | d10×1 | bloqueo +3 | — | $130 | 8.3 · Buena Calidad · $100 | |
| Maza de guardia | Buena Calidad | 1 | d10×3 | — | — | $90 | 15.9 · Raro · $450 | |
| Hacha de batalla a dos manos | Raro | 2 | d10×3 | — | — | $250 | 15.9 · Raro · $300 | |
| Lucero del alba | Raro | 1 | d10×2 | rng +1 | Ignora 1 de Res. crítico 100% | $150 | 13.0 · Raro · $220 | |
| Mangual | Raro | 1 | d10×2+1 | rng +1 | — | $160 | 12.0 · Raro · $180 | |
| Mangual | Raro | 1 | d10×4 | rng +1 | — | $150 | 21.8 · Excepcional · $1000 | |
| Martillo de sargento | Raro | 1 | d10×4 | parry +1 | — | $140 | 22.2 · Excepcional · $1000 | |
| Maza de acero | Raro | 1 | d10×3 | bloqueo +3 | — | $160 | 18.9 · Excepcional · $750 | |
| Báculo Shao Lin | Excepcional | 1 | d10×2+1 | parry +2, bloqueo +1, rng +1 | — | $800 | 15.0 · Raro · $280 | |
| Guadaña del segador | Excepcional | 2 | d10×3 | crit +1 | Sangrado 50% | $880 | 19.2 · Excepcional · $500 | |
| Martillo de guerra rúnico | Excepcional | 1 | d10×3+1 | — | Pajaritos 100% | $850 | 16.7 · Raro · $350 | |
| Rompefilas | Excepcional | 1 | d10×4 | — | Empuje 100% | $900 | 21.2 · Excepcional · $650 | |
| Espadón del Titán caído | Legendario | 2 | d10×4+2 | dmg +2 | Rompe armadura 50% | $1900 | 26.9 · Legendario · $1100 | |
| Martillo de Vulcano | Legendario | 1 | d10×5 | — | Explosión 100% | $1600 | 26.5 · Legendario · $1000 | |
| Maza de vibranium | Legendario | 1 | d10×4+2 | bloqueo +3 | Media armadura 100% | $1400 | 25.8 · Excepcional · $900 | |

## Explosivos (Tipo 12) — 1 armas

| Arma | Tier | Manos | Dado×Peso | Bonos | Efectos | Precio hoy | Nuevo (PC · tier · precio) | Decisión |
|---|---|---|---|---|---|---|---|---|
| Martillo del Titán | Excepcional | 2 | d12×3 | — | Aturdir 25% | $950 | 20.5 · Excepcional · $600 | |

## De rango — 16 armas

| Arma | Tier | Manos | Dado×Peso | Bonos | Efectos | Precio hoy | Nuevo (PC · tier · precio) | Decisión |
|---|---|---|---|---|---|---|---|---|
| Arco corto | Común | 2 | d6×1 | rng +4 | — | $70 | 5.3 · Común · $70 | |
| Arco del rastreador | Común | 2 | d6×1 | rng +4 | — | $70 | 5.3 · Común · $70 | |
| Honda de cuero | Común | 1 | d4×1 | rng +3 | — | $40 | 3.8 · Común · $60 | |
| Honda del cazador de jabalíes | Común | 1 | d4×1 | rng +3 | — | $40 | 3.8 · Común · $60 | |
| Arcabuz de cubierta | Buena Calidad | 1 | d6×1+1 | rng +3 | — | $130 | 6.1 · Común · $80 | |
| Arco largo de tejo | Buena Calidad | 2 | d6×2 | rng +5 | — | $160 | 9.1 · Buena Calidad · $120 | |
| Ballesta de almenara | Buena Calidad | 1 | d6×1+1 | rng +3 | — | $130 | 6.1 · Común · $80 | |
| Ballesta de mano | Buena Calidad | 1 | d6×1+1 | rng +3 | — | $130 | 6.1 · Común · $80 | |
| Ballesta del arbusto | Buena Calidad | 1 | d6×1+1 | rng +3 | — | $130 | 6.1 · Común · $80 | |
| Ballesta pesada | Raro | 2 | d8×2+2 | rng +5 | Rompe armadura 25% | $260 | 14.6 · Raro · $270 | |
| Lanzallamas | Raro | 2 | d12×4 | — | Prende fuego 100% | $2000 | 29.6 · Legendario · $3100 | |
| Pistola de chispa | Raro | 1 | d8×2 | rng +4 | Estruendo 100% | $210 | 10.6 · Buena Calidad · $150 | |
| Arco compuesto élfico | Excepcional | 2 | d6×3 | rng +7, pdg +2 | — | $900 | 15.4 · Raro · $300 | |
| Pistola de duelo de plata | Excepcional | 1 | d8×2+2 | rng +5, crit +1 | — | $780 | 15.3 · Raro · $300 | |
| Arco del cazador de eclipses | Legendario | 2 | d8×3+2 | rng +8, crit +2 | Sangrado 50% | $1850 | 24.9 · Excepcional · $850 | |
| Revólver del pistolero | Legendario | 1 | d10×2+2 | rng +5, crit +2 | Aturdir 50% | $1500 | 22.1 · Excepcional · $700 | |
