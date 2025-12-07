# Bhommi-Kart - GreenCart E-Commerce Platform

A sustainable e-commerce platform with AI-powered recommendations, EarthScore ratings, and group buying features.

## 🚀 Quick Start

### Frontend
```bash
npm i
```
 ```bash
npm start
```

### Backend

 ```bash
python3.11 -m venv myenv
```
 ```bash
source myenv/bin/activate
```
 ```bash
pip install --upgrade pip
```
 ```bash
pip install -r requirements.txt
```

### Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 16+** and **npm/yarn** (for frontend)
- **Redis** (optional, for cart persistence - falls back to in-memory if not available)
- **Data files** in `data/` directory:
  - `products_large.csv` - Product catalog
  - `users_pincodes.csv` - User location data (optional)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Verify data files exist:**
   ```bash
   # Ensure these files exist in ../data/
   # - products_large.csv
   # - users_pincodes.csv (optional)
   ```

5. **Run the backend server:**
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The server will start on `http://localhost:8000`

   **Note:** On first run, the recommender system will train with synthetic data (this may take 30-60 seconds).

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
Bhommi-Kart/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── services/
│   │   ├── cart_service.py     # Cart management
│   │   ├── recommender_service.py  # Apriori recommender system
│   │   └── ...
│   ├── agents/                 # AI agents for shopping assistance
│   ├── ml/                     # ML models (EarthScore prediction)
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Cart.tsx
│   │   │   └── ProductRecommendations.tsx
│   │   ├── services/
│   │   │   └── api.ts          # API client
│   │   └── ...
│   └── package.json
└── data/
    ├── products_large.csv      # Product catalog
    └── users_pincodes.csv      # User location data
```

## 🔧 Configuration

### Backend Configuration

- **API Port:** Default is `8000` (change in `main.py` or uvicorn command)
- **CORS:** Configured for `localhost:3000`, `localhost:3111`, `localhost:3001`
- **Data Path:** Products loaded from `../data/products_large.csv`

### Frontend Configuration

- **API Base URL:** Configured in `frontend/src/services/api.ts`
  - Default: `http://localhost:8000`
  - Change if backend runs on different port

## 🧪 Testing

### Test Recommender System

```bash
cd backend
python test_recommender.py
```

This will:
- Load product data
- Generate synthetic transactions
- Train the Apriori algorithm
- Test recommendations with sample cart items

## 📡 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{product_id}` - Get product by ID
- `GET /api/products/filter` - Filter products

### Cart
- `GET /api/cart/{user_id}` - Get user's cart
- `POST /api/cart/{user_id}/add` - Add item to cart
- `DELETE /api/cart/{user_id}/item/{product_id}` - Remove item

### Recommendations (NEW!)
- `POST /api/recommendations` - Get recommendations from cart items
- `GET /api/recommendations/cart/{user_id}` - Get recommendations from user's cart

### Other
- `POST /api/chat` - Chat with AI shopping assistant
- `POST /api/predict` - Predict EarthScore for product
- `GET /health` - Health check

## 🎯 Features

### Recommender System
- **Apriori Algorithm** for market basket analysis
- **Synthetic Data Generation** based on product categories
- **Real-time Recommendations** based on cart items
- **Confidence Scoring** for each recommendation

### GreenCart Features
- **EarthScore Ratings** - Sustainability scores for products
- **Group Buying** - Save money and reduce carbon footprint
- **AI Shopping Assistant** - Chat-based product discovery
- **Carbon Tracking** - Track your environmental impact

## 🐛 Troubleshooting

### Backend Issues

1. **Import errors:**
   - Ensure you're in the `backend` directory
   - Activate virtual environment
   - Install all requirements: `pip install -r requirements.txt`

2. **Data file not found:**
   - Ensure `products_large.csv` exists in `../data/` directory
   - Check file path in `main.py` line 58

3. **Port already in use:**
   - Change port in `main.py` or use: `uvicorn main:app --port 8001`

4. **Redis connection error:**
   - This is OK! The cart service falls back to in-memory storage
   - To use Redis: Install and start Redis server

### Frontend Issues

1. **Cannot connect to backend:**
   - Ensure backend is running on `http://localhost:8000`
   - Check CORS settings in `backend/main.py`
   - Verify API URL in `frontend/src/services/api.ts`

2. **Module not found:**
   - Run `npm install` in frontend directory
   - Clear node_modules and reinstall if needed

3. **Build errors:**
   - Check Node.js version (16+ required)
   - Clear cache: `npm cache clean --force`

## 🚀 Production Deployment

### Backend
```bash
# Using uvicorn with production settings
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend
```bash
# Build static files
npm run build

# Serve with nginx or similar
# Files will be in frontend/dist/
```

## 📝 Environment Variables (Optional)

Create a `.env` file in `backend/` for:
- OpenAI API keys (for AI agents)
- Redis connection string
- Database URLs

## 🔗 Useful Commands

```bash
# Backend
cd backend
python main.py                    # Run server
python test_recommender.py        # Test recommender
uvicorn main:app --reload         # Run with auto-reload

# Frontend
cd frontend
npm run dev                       # Development server
npm run build                     # Production build
npm run preview                    # Preview production build
```

## 📚 Additional Resources

- **FastAPI Docs:** Available at `http://localhost:8000/docs` when backend is running
- **API Health Check:** `http://localhost:8000/health`

## 🤝 Contributing

1. Ensure all tests pass
2. Follow code style guidelines
3. Update documentation as needed

## 📄 License

[Add your license here]

---

**Happy Shopping! 🌱**

