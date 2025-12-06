@echo off
echo ========================================
echo Installing Bhommi-Kart Dependencies
echo ========================================
echo.

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
)

echo.
echo Installing core dependencies...
pip install fastapi==0.115.13 uvicorn[standard]==0.34.3 python-dotenv==1.1.0 python-multipart==0.0.20
pip install numpy==1.26.4 pandas==2.3.0 scikit-learn==1.7.0 xgboost==3.0.2
pip install redis==5.0.1 geopy==2.4.1 rich==14.0.0

echo.
echo Installing LangChain packages (this may take a moment)...
pip install langchain==0.3.0
pip install langchain-core
pip install langchain-google-genai==2.0.0
pip install langchain-community==0.3.0
pip install langchain-openai
pip install langgraph

echo.
echo Installing optional dependencies...
pip install python-jose[cryptography]==3.3.0 passlib[bcrypt]==1.7.4 email_validator==2.2.0
pip install aioredis==2.0.1 celery==5.3.4 sendgrid==6.11.0
pip install optuna==3.5.0 websockets==15.0.1 websocket-client==1.7.0

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo You can now run: python main.py
echo.
pause

