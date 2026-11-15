@echo off
title Lancement Saez Soundboard
cd /d "%~dp0"
if exist "Saez Soundboard.exe" (
    start "" "Saez Soundboard.exe"
) else (
    echo [Saez Soundboard] Lancement en mode developpement Web...
    call npm run dev
)

