# Fixing LangChain Dependency Conflicts

If you encounter dependency conflicts when installing requirements.txt, use one of these solutions:

## Solution 1: Install LangChain packages separately (Recommended)

```powershell
# Activate virtual environment first
venv\Scripts\activate

# Install core dependencies first
pip install fastapi uvicorn[standard] pandas numpy scikit-learn xgboost

# Install LangChain packages in this order (lets pip resolve compatible versions)
pip install langchain==0.3.0
pip install langchain-core
pip install langchain-google-genai==2.0.0
pip install langchain-community==0.3.0
pip install langchain-openai
pip install langgraph

# Install remaining dependencies
pip install redis python-dotenv geopy rich
```

## Solution 2: Use requirements-core.txt (No AI agents)

If you only need the recommender system and don't need the AI chat agents:

```powershell
pip install -r requirements-core.txt
```

Note: This will disable the `/api/chat` endpoint, but the recommender system will work fine.

## Solution 3: Upgrade all LangChain packages

```powershell
# Install latest compatible versions
pip install --upgrade langchain langchain-core langchain-google-genai langchain-community langchain-openai langgraph
```

## Solution 4: Use pip-tools to resolve conflicts

```powershell
pip install pip-tools
pip-compile requirements.txt
pip-sync requirements.txt
```

## Verify Installation

After installing, test that it works:

```powershell
python -c "import langchain; import langchain_openai; print('✅ LangChain installed successfully')"
```

Then run the server:

```powershell
python main.py
```

