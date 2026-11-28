#!/bin/bash
# Actualiza la partida clon: foto de la original → leerla → vaciar y escribir el clon → otra foto de la original → comparar.
# Necesita las variables de entorno de LEEME.md (nombres de las partidas, personajes y cuentas de prueba).
set -e
cd "$(dirname "$0")"
echo "1/4 · Leo la partida original (solo lectura)…"
node leer.js antes
echo "2/4 · Vacío el clon y le escribo la copia…"
node escribir.js antes
echo "3/4 · Vuelvo a leer la original para comprobar que no cambió…"
node leer.js despues > /dev/null
echo "4/4 · Comparo las dos fotos de la original:"
node comparar.js antes despues
