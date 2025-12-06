@echo off
echo ========================================
echo Starting Bhommi-Kart Backend Server
echo ========================================
echo.

cd backend

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if requirements are installed
echo Checking dependencies...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies (this may take a few minutes)...
    pip install -r requirements.txt
    echo.
)

REM Start the server
echo.
echo ========================================
echo Starting Backend Server...
echo Server will run on http://localhost:8000
echo Press Ctrl+C to stop
echo ========================================
echo.

python main.py

pause

