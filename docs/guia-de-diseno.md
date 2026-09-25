# Guía de diseño: campos de juego y mecánicas

> Borrador vivo (2026-09-25, idea del dueño). Sirve para que, al diseñar o rehacer una **habilidad, un arma o un equipo**, uno vea de un vistazo
> **qué mecánicas existen** y **a qué elementos del juego les "pertenece" cada una**. La forma final todavía no está decidida: por ahora es una
> lista para ir completando. Complementa a [`herramientas-de-diseno.md`](herramientas-de-diseno.md) (ingredientes nuevos a construir) y a las
> reglas del manual (`manual-usuario/notas/`).
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

## Para completar (a medida que el dueño las defina)
- Mecánica de casa de las demás familias de arma (explosivos, rango, escudos, armas naturales).
- Territorios por **clase** y por **tipo de skill** (tanque, asalto, mago, shooter…), ver [`clases-borrador.md`](clases-borrador.md).
- Territorios por **pieza de equipo** (casco, botas, anillos…) y por **rareza**.
- Qué mecánicas son de "un solo dueño" y cuáles se pueden compartir libremente.
