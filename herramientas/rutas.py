# -*- coding: utf-8 -*-
"""Rutas del proyecto, relativas a este archivo.

Así las herramientas funcionan desde cualquier máquina sin tocar nada.
"""
import pathlib

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent

FICHA = str(RAIZ / "ficha-personaje" / "ficha.html")
GM = str(RAIZ / "gm-toolset" / "gm-tools.html")
VENDOR = str(RAIZ / "gm-toolset" / "vendor-generator.html")
XLSX = str(RAIZ / "assets" / "catalogo.xlsx")
SP = str(AQUI)
