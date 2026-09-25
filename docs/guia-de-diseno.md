# Guía de diseño: campos de juego y mecánicas

> Borrador vivo (2026-09-25, idea del dueño). Sirve para que, al diseñar o rehacer una **habilidad, un arma o un equipo**, uno vea de un vistazo
> **qué mecánicas existen** y **a qué elementos del juego les "pertenece" cada una**. La forma final todavía no está decidida: por ahora es una
> lista para ir completando. Complementa a [`herramientas-de-diseno.md`](herramientas-de-diseno.md) (ingredientes nuevos a construir) y a las
> reglas del manual (`manual-usuario/notas/`).
>
> **Versión visual dentro del juego:** `comun/guia-diseno.js` (☰ → 📐 Guía de diseño) presenta esto como grillas de tarjetas, paso a paso; sus datos espejan este documento. La clase se llama **Asalto** (no "emboscador").
>
> **Cómo leerla (esencia del proyecto).** Todo esto son **territorios sugeridos, no leyes**: la mesa puede salirse de ellos siempre. La idea es que cada
> familia tenga *su sabor* propio; que **otra familia use esa mecánica es posible pero excepcional** (una hacha que sangra por ser especial, no porque
> sí). Si algo se puede automatizar, se automatiza; si no, se aclara (⚙ / ✋). Y "equipo" incluye **las armas**, no solo lo defensivo.

## 1. Familias de arma y su mecánica "de casa"

| Familia | Mecánica de casa | Otras (excepcional) | Estado en el juego |
|---|---|---|---|
| **Hachas** | **Rompe armadura** (baja la Defensa del rival) | — | ✅ existe el efecto y el estado *Armadura rota* (se acumula, editable) |
| **Contundentes** (mazas, martillos…) | **Knockdown**: bajar al golpeado al fondo de la iniciativa | Aturdir | 🔲 el efecto sobre la iniciativa no existe todavía (ver `herramientas-de-diseno.md` §2) |
| **Punzantes** (lanzas, estoques, dagas…) | **Lisiado** (PdG y Parry a la mitad) | Sangrado, Envenenar | ✅ el estado *Lisiado* existe; como efecto de arma se recuerda y se tira |
| **Cortantes** (espadas, sables…) | **Sangrado** (pierde HP por turno; se acumula de a 1) | Lisiado | ✅ estado *Sangrado* |
| Explosivos, de rango, escudos, armas naturales, mágicas | *por definir* | | 🔲 |

- Los dados del tipo de arma ya orientan la familia (glosario: 4 perforante, 6 cortante, 8 cortante pesado / contundente liviano, 10 contundente pesado, 12 explosivo).
- El daño elemental (fuego, hielo, electricidad, veneno) suele ir por su lado: *Prende fuego*, *Escarcha*, *Stun*, *Envenenar*.
- Hay que decidir qué pasa con los nombres: en el juego **"Derribar"** ya es un efecto de arma (cae al suelo, a mano). *Knockdown* como efecto de iniciativa necesita un nombre que no se pise con ese.

## 1b. Tres niveles de efecto por familia (aclaración del dueño, 2026-09-25)
Para cada efecto de arma, cada familia lo tiene en uno de tres niveles:
- 🏠 **De casa**: le da *identidad* a la familia (hacha → Rompe armadura).
- 🤝 **Habilitado por contexto / compartido**: tiene sentido en varias familias. Ej.: **Envenenar** lo puede llevar cualquier arma con filo (hachas, cortantes, punzantes) y las de rango (flechas, dardos).
- ✨ **Excepcional**: va contra el concepto (un martillo que envenena). Siempre se puede hacer la excepción; solo va a ser raro.

**Peso de cada efecto** (idea): cada efecto va a tener un peso según cuán relevante sea en combate, para poder calcular después la **calidad y el precio** de un arma (y, eventualmente, diseñar una mecánica de balance). Hoy los pesos (1–5) en `comun/guia-diseno.js` son **provisorios**; falta definir la fórmula (ver P112 en `preguntas-abiertas.md`).

## 2. Inventario de mecánicas disponibles (para jugar "acá o allá")

**Estados sobre el golpeado o el objetivo** (existen; ver Estados en el manual): Veneno, Veneno severo, Sangrado, Armadura rota, Lisiado, Inmovilizado, Rengo, Pajaritos,
Stun, Cansado, Exhausto, Escarcha, Sentado.
**Estados a favor**: Regeneración, Hypeado, Invulnerable, Inmunidad a CC, Espinas, Barrera / Escudo especial (con máximo, se recarga), **Excedente de vida** (HP por encima del máximo, sin tope ni recarga),
Afortunado, Sangre pura, Coagulación extrema, Blindado, Sigilo.
**Efectos de arma al golpear** (se recuerdan y se tiran, no se aplican solos): Rompe armadura, Envenenar, Sangrado, Aturdir, Derribar, Agarrar, Prende fuego, Drena vida.
**Sobre el mapa**: formas y terreno (con turnos y Colisión), trampas (con daño, estado, fuego amigo del efecto y **teleport**), sigilo (cono y zona de alerta), niebla y visión, auras, ping.
**Sobre la iniciativa** (por construir): bajar al fondo, subir N lugares o al primero, con o sin duración.
**Sobre la niebla y la visibilidad** (por construir): modificar el radio de visión, ver a través de Sólidos, destapar/tapar niebla, ceguera, detectar lo oculto.
**Recursos y números**: HP, SP, No2 (Nitros), Defensa y resistencias a crítico, Movimiento, Rango y Rango de casteo, Crg.Max (Sobrepeso), Iniciativa.
**Reglas de tirada**: ventaja (Afortunado), mitades (Pajaritos, Lisiado), Bloqueo / Parry / Esquivar, redondeo (buffs hacia arriba, debuffs hacia abajo).

## 3. Cómo usar esta guía al diseñar
1. Elegí a qué familia pertenece lo que estás haciendo y mirá su **mecánica de casa** (§1): empezá por ahí.
2. Si querés salirte, hacelo a propósito y que sea **excepcional** (un ítem raro, una skill especial), no la norma de la familia.
3. Buscá en el **inventario** (§2) si la mecánica ya existe y se puede **automatizar**; si no, escribila y marcala ✋ A mano.
4. Sumá la mecánica que falte a `herramientas-de-diseno.md` y, si genera dudas, a `preguntas-abiertas.md`.

## Objetivo: calcular calidad y tier de ítems y armar catálogos por grupo
El dueño va dando herramientas de diseño para que, cuando pida un catálogo, se pueda **calcular la calidad y el tier de cada ítem** e **imaginar ítems en grupo** (sets, familias) que él después **audita**. Piezas: los tres niveles de efecto por familia (§1b), el peso de cada efecto (P112) y las reglas de combate de las que depende el valor de cada número. Reglas base ya dadas:
- **Golpe crítico (P113, en elaboración):** PdG − Evasión ≥ Tipo del arma → crítico; ignora armadura y tira 1d20 para el multiplicador de daño (menos de 7 ×1, 7+ doble daño, 17+ triple daño, 20 cuádruple daño) sobre **todo** el daño del golpe (dados, Fuerza y demás bonos). El nivel del crítico es N = diferencia ÷ Tipo (hacia abajo): se tiran **N d20 y vale el mejor** (2 × Tipo = doble crítico = 2d20…). La **Resistencia a crítico resta niveles** (un punto = un crítico anulado, por Tipo de arma): se tiran N − R dados. La **Resistencia a crítico** se define después de esto.

- **Escasez de la Resistencia a crítico por slots (P114, en elaboración):** los Tipos altos solo los dan pocos slots (ej.: Tipo 10 solo cascos; Tipo 8 dos slots sin casco; Tipo 6 tres slots; Tipo 4 en más). El máximo que se puede juntar equipado = la cantidad de slots elegibles.

- **Anillos:** mágicos, uno por mano (2 slots). Más libertad de efectos, pero más escasos y caros. Los preceptos de esta guía son la base de un futuro **rework del catálogo**.

- **Dos formas de mejorar el crítico (P115, cerrada):** **Crítico frecuente** (baja el rango del crítico: Tipo 4 pasa a 3; mínimo 2; también cambia el nivel de doble crítico) y **Crítico potente** (baja los umbrales del d20: doble daño con 6+, triple 16+, cuádruple 19+; se pueden afinar por separado). Vocabulario: **doble crítico** = diferencia doble (2d20); **doble / triple / cuádruple daño** = el multiplicador del d20.

## Para completar (a medida que el dueño las defina)
- Mecánica de casa de las demás familias de arma (explosivos, rango, escudos, armas naturales).
- Territorios por **clase** y por **tipo de skill** (tanque, asalto, mago, shooter…), ver [`clases-borrador.md`](clases-borrador.md).
- Territorios por **pieza de equipo** (casco, botas, anillos…) y por **rareza**.
- Qué mecánicas son de "un solo dueño" y cuáles se pueden compartir libremente.
