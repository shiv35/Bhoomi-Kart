@echo off
echo ========================================
echo Starting Bhommi-Kart (Backend + Frontend)
echo ========================================
echo.
echo This will open two windows:
echo 1. Backend server (http://localhost:8000)
echo 2. Frontend server (http://localhost:5173)
echo.
echo Press any key to continue...
pause >nul

REM Start backend in new window
start "Bhommi-Kart Backend" cmd /k "cd /d %~dp0backend && if not exist venv\Scripts\activate.bat python -m venv venv && call venv\Scripts\activate.bat && if not exist venv\Lib\site-packages\fastapi pip install -r requirements.txt && python main.py"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "Bhommi-Kart Frontend" cmd /k "cd /d %~dp0frontend && if not exist node_modules call npm install && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Two new windows have opened for the servers.
echo Close those windows to stop the servers.
echo.
pause

