
@echo off
cd /d "%~dp0"

start "Options Calculator Server" /min cmd /c "python -m http.server 8000"

timeout /t 3 /nobreak >nul

start "" "http://localhost:8000"
