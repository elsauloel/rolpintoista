# Auditoría de trampas (arranca 2026-10-03)

Hoja de trabajo, como `rework-armas.md`: lo que hay, las preguntas, las propuestas y lo que decide el dueño. Pedido del dueño (2026-10-03):
«una auditoría de trampas: qué trampas hay; ir paso a paso definiendo una trampa común de cada tipo y en función de eso diseñar las de mejor calidad».

## Lo que hay hoy (2026-10-03)

**Cuatro lugares con trampas, sobre la misma base:**

| Dónde | Qué hay |
|---|---|
| Catálogo de trampas del mapa (`comun/trampas-base.js`) | 24 trampas, nivel 1 a 5, todas marcadas «requiere auditar». Las usa el GM desde 📚 Catálogo de trampas. |
| Trampas que se compran (`comun/catalogo.js`, consumibles con `trampaDatos`) | 72 ítems: las mismas 24 en tres tamaños (menor · normal · mayor). Generadas desde el catálogo de trampas. |
| Habilidades de creep (`comun/skills-creep-base.js`) | 21 habilidades que colocan una trampa (Trampa de púas, Cepo, Foso oculto, Mina de contacto, Campo minado, Trampa de veneno / fuego / hielo / red / runas / ácido / humo / alarma, Alambre tenso, Cepo de alma, Zarzal traicionero, Telaraña oculta, Descarga oculta, Trampa doble, Cebo, Trampa de raíces) y 5 que trabajan con trampas (Cazador de trampas, Desarmar, Rearmar, Empujar a la trampa, Ingeniero de trampas). |
| «Una trampa conocida» al armar una habilidad (`comun/elegir-trampa.js`) | 12 tipos con valores sugeridos: Púas y estacas, Cepo, Red, Veneno, Gas, Explosiva, Fuego, Hielo, Eléctrica, Pegajosa o resbaladiza, Runa (maldición), Alarma. |

**Las 24 del catálogo, por familia:**

| Familia | Trampas (nivel · daño · lo que deja) |
|---|---|
| Púas / cortes | Foso con estacas (3 · 3d6 · Sentado) · Cuchillas de guadaña (5 · 5d6 · Sangrado) · Dardos envenenados (2 · 1d6 · Veneno ×3) |
| Atrapar | Trampa de oso (2 · 2d6 · Inmovilizado) · Red de caza (1 · — · Inmovilizado) · Arena movediza (2 · — · Inmovilizado) |
| Pegajosa / resbaladiza | Brea pegajosa (1 · — · Rengo) · Aceite resbaladizo (1 · — · Sentado) |
| Gas / esporas | Nube de veneno (3 · — · Veneno ×2) · Gas somnífero (2 · — · Exhausto) · Bomba de esporas (4 · 2d6 · Veneno ×3) |
| Explosiva / derrumbe | Mina explosiva (3 · 3d6) · Barril de pólvora (4 · 4d6 · Pajaritos) · Derrumbe (4 · 4d6 · Sentado) |
| Elementales | Llamarada (2 · 2d6 · Quemadura) · Trampa de escarcha (3 · 2d6 · Escarcha) · Descarga eléctrica (3 · 3d6 · Stun 1 turno) |
| Runas / mágicas | Runa de silencio (3) · Runa de debilidad (2) · Niebla de confusión (3) · Succión arcana (3) · Espejo de discordia (4 · Pajaritos) · Portal cósmico (5 · Pajaritos) |
| Otras | Cable de alarma (1) · Trampa de teleport |

## Diagnóstico

1. **El tamaño y la calidad están mezclados.** Las compradas vienen en menor / normal / mayor, y el tier (Común, Buena, Rara) sale de eso, no de un
   criterio de calidad. Una Trampa de oso «mayor» ocupa una flor de radio 3: un cepo que agarra a 19 casillas.
2. **El daño es siempre en d6** (1d6 por nivel) y la dificultad para evitarla es «6 + 2 por nivel»: no hay identidad por familia.
3. **Mucho a mano todavía:** Runa de silencio, Runa de debilidad, Confusión, Succión arcana, Espejo de discordia, liberarse de un cepo o de la red,
   la alarma.
4. **Tres listas de familias que no coinciden** (el catálogo, los 12 tipos del menú y las habilidades de creep).
5. **Todo dice «requiere auditar».**

## Propuesta de método (paso a paso, como las armas)

1. **Familias:** acordar qué tipos de trampa existen y qué es lo propio de cada uno (qué deja, si hace daño, qué stat la evita, qué tamaño tiene).
2. **Una Común por familia:** la trampa de referencia de cada tipo.
3. **Mejor calidad:** a partir de la Común, qué sube en Buena y Rara (daño, efecto, dificultad para evitarla o detectarla, área, duración).
4. Recién ahí: regenerar las compradas, el catálogo del mapa y los valores del menú de habilidades desde la misma definición.
