@echo off
echo ========================================
echo Starting Bhommi-Kart Frontend
echo ========================================
echo.

cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies (this may take a few minutes)...
    call npm install
    echo.
)

REM Start the development server
echo.
echo ========================================
echo Starting Frontend Server...
echo Server will run on http://localhost:5173
echo Press Ctrl+C to stop
echo ========================================
echo.

call npm run dev

pause

