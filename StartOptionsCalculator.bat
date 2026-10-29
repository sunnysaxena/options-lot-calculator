
@echo off
cd /d "%~dp0"

start "Options Calculator Server" /min cmd /c "python -m http.server 8000"

timeout /t 3 /nobreak >nul

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:8000
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:8000
) else (
    start "" msedge --app=http://localhost:8000
)
