# Ballestas y virotes — lluvia de ideas (para podar)

> Arrancó el 2026-10-10. La base ya está decidida en [`rework-armas-rango.md`](rework-armas-rango.md) (no suman Fuerza, Recarga 1/2/3 con cobro
> N, 2N, 3N…, pasan la armadura, las «de mano» a una mano, disparan pegadas, sin tiro alto, virotes comunes que no se cuentan y especiales como las
> flechas). Esto es la lista amplia para elegir: el dueño poda, y lo que quede se mide y se diseña. Mismo método que [`ideas-arcos-flechas.md`](ideas-arcos-flechas.md).
> Lo que se programa reusa lo que ya existe (marcado con ♻).

## Rasgos de ballesta (lo que trae el arma)

**De la mecánica (cargar y disparar)**
1. **Llega cargada:** el primer disparo del combate (o el primero después de un turno sin disparar) cuesta 0 No2. La ballesta se carga antes; lo
   lento es volver a cargarla. Premia la emboscada y el primer golpe.
2. **Recargar en vez de disparar:** gastar No2 en un turno sin disparar deja la próxima «cargada» (cuesta 0). Un ritmo: un turno carga, el otro dispara.
3. **Apuntada (mira):** si no te moviste en el turno, +2 PdG. El francotirador quieto contra el que se mueve.
4. **Doble carga:** dispara dos virotes juntos contra el mismo objetivo (dos tiradas de daño) por el doble de No2. Para pasar la armadura dos veces.
5. **De repetición (Recarga 1):** muchos tiros chicos (medido: solo sirve contra lo liviano). ♻ el cobro de las varitas.
6. **De asedio (Recarga 3)** y **emplazada:** no se puede mover y disparar en el mismo turno, pero con PdG o Perfora de más.

**De la distancia**
7. **A quemarropa:** pegada al objetivo (distancia 1), +2 de daño fijo o Perfora +2. La ballesta es la que dispara pegada: que lo aproveche.
8. **Alcance largo con caída:** más Rango, pero −1 de daño fijo por cada casillero más allá de la mitad del alcance.

**Contra la armadura y el escudo (su identidad)**
9. **Rompe armadura** (50 %, 25 %…) ♻ el efecto al golpear que ya existe.
10. **Atraviesa escudos:** si te paran con escudo, el escudo se rompe un poco (Armadura rota al que lo para) o el Parry cuesta más No2.
11. **Perfora N** en el arma (no solo en el virote) ♻.

**De mano y combinadas**
12. **Desenfunde rápido:** cambiar a la ballesta de mano cuesta 0 No2 (en combate cambiar de arma cuesta).
13. **Un par de ballestas de mano:** una en cada mano; la segunda dispara como «otro arma» (con su propio cobro).
14. **Ballesta-escudo:** una ballesta de mano montada en un escudo chico (Parry de escudo + disparo).
15. **Ballesta con bayoneta:** se puede pegar cuerpo a cuerpo con ella (como un arma Tipo 4 floja).

**En el mapa**
16. **Ballesta de muralla (torreta):** no se lleva encima; se coloca en el mapa como un elemento y la puede usar cualquiera que esté al lado.
    Defender un fortín, una almena. ♻ los elementos del mapa.
17. **Silenciosa:** disparar no rompe el sigilo (los arcos sí rompen). El asesino de lejos. Ver P184.
18. **Arpón / garfio con soga:** el virote lleva soga: tirás al objetivo 1 casillero hacia vos, o te tirás vos hacia un Sólido (movilidad).

## Virotes especiales (como las flechas; se comparten mecánicas ♻ «¿Qué flecha?», el carcaj, `limpiarEfectosFlecha`)

**Contra la armadura (la marca de la casa)**
1. **Virote perforante:** Perfora +2 (la base de los especiales).
2. **Virote de punta de diamante:** ignora toda la Defensa (de alta calidad, caro en No2: «nitros muy preciados»).
3. **Virote rompe-corazas:** Rompe armadura 100 % si entra.

**De control**
4. **Virote de plomo:** sin punta, golpe sordo: Aturdir 25 % o Derribar.
5. **Virote de clavo:** si el objetivo tiene un Sólido detrás, queda **clavado** (Inmovilizado 1 turno). Mira el mapa ♻ `solidosSet()`.
6. **Virote de red:** se abre en el aire: Inmovilizado 1 turno, sin daño.
7. **Virote de garfio:** la soga del rasgo 18, pero como munición.

**Elementales** (híbridos, igual que las flechas: el daño físico critea, el elemental es directo) ♻ `dn.magico`
8. Incendiario, de escarcha, eléctrico (con salto ♻ `flechaSalto`), ácido (Rompe armadura elemental).

**En el mapa**
9. **Virote explosivo:** área de diámetro 3 (flor de 7) donde cae, daño de fuego. ♻ las zonas.
10. **Virote de humo:** nube de diámetro 3 que tapa la línea de tiro 2 turnos. ♻ los Sólidos temporales.
11. **Virote de luz:** bengala, diámetro 3 (flor de 7), alumbra la niebla. ♻ las luces.
12. **Virote silbador:** avisa a los aliados (señal en la Mesa y en el mapa).

**Raros**
13. **Virote de rebote:** si falla, rebota a otro objetivo pegado al primero (la mitad del daño). Lo físico del «salto» eléctrico.
14. **Virote de sangre:** Sangrado 2 stacks.
15. **Virote envenenado:** Perfora 1 + Veneno (la flecha envenenada ♻).

## Ballestas con nombre (ideas para la lista, mitad clásico, mitad criollo)
- Ballesta de mano · de cazador · de estribo (Común) · de guardia · de fortín · de tranquera (Buena) · de guerra · pesada · de repetición (Rara) ·
  de asedio · del alguacil (Excepcional) · una Legendaria con un rasgo único (por ejemplo, «llega cargada» + «atraviesa escudos»).

## Para medir antes de elegir
- «Llega cargada» y «Apuntada»: cuánto suben el daño por turno (un disparo gratis por combate es mucho al principio y poco en un combate largo).
- «Doble carga» y «Un par de ballestas»: cuidado con duplicar el daño por turno.
- Los de control (Aturdir, Inmovilizado) van con porcentaje y en virotes caros: «la ballesta pasa la armadura», no es la reina del control.

## 2026-10-10 · Primera poda (dueño)
- **Silenciosa (17): en espera** hasta definir el dilema del rango con sigilo (P184).
- **Arpón / garfio con soga (18 y virote 7): no se descarta, pero va primero como ítem de utilería** — un **garfio con soga** (grappling hook) que
  se vende en la **Talabartería**, no un arma. Como arma habría que buscarle la vuelta (una tirada de Fuerza contra la Constitución del objetivo, etc.).
- **Virotes especiales:** se pueden **repetir muchos efectos de las flechas** sin problema; los que propuso Claude «están muy bien».
- **Virotes de control:** se ven caso por caso.
- Con esto «ya tenemos un panorama»: lo que sigue es elegir qué entra a la lista por calidad y medirlo.
