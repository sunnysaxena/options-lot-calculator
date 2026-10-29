@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python 3 is required. Install it from python.org and try again.
  pause
  exit /b 1
)
start "Options Lot Calculator" http://localhost:8000
python -m http.server 8000
pause
