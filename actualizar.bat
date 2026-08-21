@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo === Trayendo lo ultimo del repo (pull --rebase)...
git pull --rebase origin main
if errorlevel 1 (
    echo.
    echo Fallo el pull. Si hay conflictos, resolvelos y volve a correr esto.
    pause
    exit /b 1
)

echo.
echo === Subiendo tus commits (push)...
git push origin main
if errorlevel 1 (
    echo.
    echo Fallo el push. Fijate el mensaje de arriba.
    pause
    exit /b 1
)

echo.
echo Listo: estas al dia y tus cambios quedaron subidos.
pause
