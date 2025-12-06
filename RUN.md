# 🚀 How to Run Bhommi-Kart Project

## Quick Start (Windows)

### Step 1: Start the Backend Server

1. **Open PowerShell or Command Prompt**

2. **Navigate to backend folder:**
   ```powershell
   cd D:\Datamining_project\Bhommi-Kart\backend
   ```

3. **Create virtual environment (first time only):**
   ```powershell
   python -m venv venv
   ```

4. **Activate virtual environment:**
   ```powershell
   venv\Scripts\activate
   ```
   You should see `(venv)` in your prompt.

5. **Install dependencies (first time only):**
   
   **Option A - Use the install script (Recommended):**
   ```powershell
   .\install-deps.bat
   ```
   
   **Option B - Manual installation:**
   ```powershell
   pip install -r requirements.txt
   ```
   
   ⚠️ **If you get LangChain dependency conflicts**, see `INSTALL_FIX.md` or use:
   ```powershell
   .\install-deps.bat
   ```
   
   ⚠️ This may take 2-5 minutes on first run.

6. **(Optional) Create .env file for AI features:**
   ```powershell
   # Create .env file in backend folder
   echo OPENAI_API_KEY=your_key_here > .env
   ```
   ⚠️ **Note:** The API key is optional. Without it, AI chat will be disabled, but the recommender system and all other features will work fine!

7. **Run the backend server:**
   ```powershell
   python main.py
   ```

   You should see:
   ```
   ✅ Product data loaded: X items
   ✅ ML models loaded
   ✅ Services initialized
   🔄 Training recommender system...
   ✅ Recommender system trained
   ⚠️  WARNING: OPENAI_API_KEY not found. AI chat features will be disabled.
   ✅ Enhanced GreenCart agent created (or agent will be None if no key)
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

   **Keep this terminal window open!** The backend is now running on `http://localhost:8000`

---

### Step 2: Start the Frontend (New Terminal)

1. **Open a NEW PowerShell or Command Prompt window**

2. **Navigate to frontend folder:**
   ```powershell
   cd D:\Datamining_project\Bhommi-Kart\frontend
   ```

3. **Install dependencies (first time only):**
   ```powershell
   npm install
   ```
   ⚠️ This may take 2-5 minutes on first run.

4. **Start the frontend:**
   ```powershell
   npm run dev
   ```

   You should see:
   ```
   VITE v7.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

5. **Open your browser and go to:**
   ```
   http://localhost:5173
   ```

---

## ✅ Verify Everything Works

1. **Backend Health Check:**
   - Open: `http://localhost:8000/health`
   - Should show: `{"status":"healthy"}`

2. **Backend API Docs:**
   - Open: `http://localhost:8000/docs`
   - You'll see interactive API documentation

3. **Frontend:**
   - Open: `http://localhost:5173`
   - You should see the GreenCart homepage

---

## 🎯 What to Expect

### First Time Running:
- Backend will take **30-60 seconds** to start (training recommender system)
- You'll see messages like:
  - `🔄 Generating 2000 synthetic transactions...`
  - `🔄 Finding frequent itemsets...`
  - `🔄 Generating association rules...`
  - `✅ Recommender trained: X frequent itemsets, Y rules`

### Normal Operation:
- Backend starts in ~5-10 seconds
- Frontend starts in ~2-3 seconds

---

## 🛑 To Stop the Servers

- **Backend:** Press `Ctrl + C` in the backend terminal
- **Frontend:** Press `Ctrl + C` in the frontend terminal

---

## ⚠️ Troubleshooting

### Backend Issues:

**Problem: "Module not found"**
```powershell
# Solution: Make sure virtual environment is activated
venv\Scripts\activate
pip install -r requirements.txt
```

**Problem: "LangChain dependency conflicts" or "ResolutionImpossible"**
```powershell
# Solution 1: Use the install script (easiest)
cd backend
.\install-deps.bat

# Solution 2: Install packages in correct order
venv\Scripts\activate
pip install fastapi uvicorn pandas numpy scikit-learn
pip install langchain==0.3.0 langchain-core
pip install langchain-google-genai==2.0.0 langchain-community==0.3.0
pip install langchain-openai langgraph
pip install -r requirements.txt

# Solution 3: Use minimal requirements (no AI agents)
pip install -r requirements-core.txt
# See INSTALL_FIX.md for more solutions
```

**Problem: "File not found: ../data/products_large.csv"**
- Check that `data/products_large.csv` exists
- The backend looks for it in `Bhommi-Kart/data/products_large.csv`

**Problem: "Port 8000 already in use"**
- Change port in `main.py` line 474: `uvicorn.run(app, host="0.0.0.0", port=8001)`
- Or kill the process using port 8000

**Problem: "OPENAI_API_KEY not found"**
- This is OK! The app will run without it
- AI chat features will be disabled, but recommender system and other features work
- To enable AI chat: Create a `.env` file in `backend/` folder with: `OPENAI_API_KEY=your_key_here`
- Get API key from: https://platform.openai.com/api-keys

**Problem: "Redis connection error"**
- This is OK! Cart will use in-memory storage
- To use Redis: Install Redis for Windows and start it

### Frontend Issues:

**Problem: "Cannot connect to backend"**
- Make sure backend is running on `http://localhost:8000`
- Check `frontend/src/services/api.ts` - baseURL should be `http://localhost:8000`

**Problem: "npm install fails"**
```powershell
# Clear cache and retry
npm cache clean --force
npm install
```

**Problem: "Port 5173 already in use"**
- Vite will automatically use the next available port (5174, 5175, etc.)
- Check the terminal output for the actual URL

---

## 📝 Quick Reference

### Backend Commands:
```powershell
cd backend
venv\Scripts\activate          # Activate virtual environment
python main.py                 # Run server
```

### Frontend Commands:
```powershell
cd frontend
npm run dev                    # Start development server
npm run build                  # Build for production
```

---

## 🎉 You're All Set!

Once both servers are running:
- **Backend:** `http://localhost:8000`
- **Frontend:** `http://localhost:5173`

The recommender system will automatically:
- Generate recommendations when items are added to cart
- Show suggestions in the Cart page
- Use Apriori algorithm for "frequently bought together" items

---

## 💡 Tips

1. **Keep both terminals open** - Backend and Frontend need to run simultaneously
2. **First run is slower** - The recommender system trains on startup
3. **Check the terminal output** - It shows helpful status messages
4. **API Docs are helpful** - Visit `http://localhost:8000/docs` to explore endpoints

---

**Happy Shopping! 🌱**

