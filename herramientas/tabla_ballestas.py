# -*- coding: utf-8 -*-
"""La planilla de las ballestas (2026-10-11, dueño: «armá la planilla esa que decís»). Mide, con las reglas de balance_combate.py (Recarga y
Perfora incluidas), lo que rinde cada base de ballesta en manos del Shooter respecto de su mejor arma cuerpo a cuerpo, contra el blanco medio y el
pesado, en el nivel de su calidad (1 dado → nivel 1, Común; 2 o más → nivel 3, Buena). La guarda en herramientas/tabla_ballestas.json, que lee la
calculadora de armas (calculadora_armas.py: el precio del daño de una ballesta sale de acá, no de una cuenta).

  py herramientas/tabla_ballestas.py            → rehace la planilla (tarda unos minutos)
"""
import sys, json, random, os, itertools
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import balance_ballestas as BB

N = 3000
SALIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tabla_ballestas.json')
def clave(tipo, dados, fijo, perfora, recarga): return f'{tipo}|{dados}|{fijo}|{perfora}|{recarga}'

def main():
    random.seed(13)
    tabla = {}
    for tipo, dados, recarga in itertools.product((4, 6), (1, 2, 3), (2, 3)):
        nivel = 1 if dados == 1 else 3
        for fijo in range(0, 11):
            for perfora in range(0, 4):
                o = BB.opciones(bal_tipo=tipo, bal_dados=dados, bal_fijo=fijo, bal_perfora=perfora, bal_recarga=recarga)
                tabla[clave(tipo, dados, fijo, perfora, recarga)] = {'medio': round(BB.medir(nivel, 'medio', o, N), 3), 'pesado': round(BB.medir(nivel, 'pesado', o, N), 3)}
        print(f'Tipo {tipo} · {dados} dado(s) · Recarga {recarga}: listo', flush=True)
    json.dump({'nota': 'Shooter: ballesta ÷ su mejor cuerpo a cuerpo, nivel 1 (1 dado) o 3 (2+ dados); ver tabla_ballestas.py', 'bases': tabla},
              open(SALIDA, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)

if __name__ == '__main__':
    main()
