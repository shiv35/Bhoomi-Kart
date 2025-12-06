# cURL Commands for Bhommi-Kart API

Base URL: `http://localhost:8000`

---

## 🔍 Health & Basic Endpoints

### 1. Health Check
```bash
curl http://localhost:8000/health
```

### 2. Root Endpoint
```bash
curl http://localhost:8000/
```

---

## 📦 Product Endpoints

### 3. Get All Products
```bash
curl http://localhost:8000/api/products
```

### 4. Get Product by ID
```bash
# Replace {product_id} with actual product ID (e.g., 1, 2, 3)
curl http://localhost:8000/api/products/1
```

### 5. Filter Products
```bash
# Filter by category
curl "http://localhost:8000/api/products/filter?category=kitchen"

# Filter by EarthScore range
curl "http://localhost:8000/api/products/filter?earth_score_min=80&earth_score_max=100"

# Combined filters
curl "http://localhost:8000/api/products/filter?category=home&earth_score_min=75&limit=10"

# All parameters
curl "http://localhost:8000/api/products/filter?category=kitchen&earth_score_min=70&earth_score_max=90&sort_by=earth_score&limit=5"
```

### 6. Debug Products (Get sample data)
```bash
curl http://localhost:8000/api/debug/products
```

---

## 🛒 Cart Endpoints

### 7. Get User's Cart
```bash
# Replace {user_id} with actual user ID
curl http://localhost:8000/api/cart/user123
```

### 8. Add Item to Cart
```bash
# Add product with default quantity (1)
curl -X POST "http://localhost:8000/api/cart/user123/add?product_id=1"

# Add product with specific quantity
curl -X POST "http://localhost:8000/api/cart/user123/add?product_id=1&quantity=2"
```

### 9. Remove Item from Cart
```bash
curl -X DELETE http://localhost:8000/api/cart/user123/item/1
```

---

## 🎯 Recommender System Endpoints (Apriori Algorithm)

### 10. Get Recommendations from Cart Items (POST)
```bash
# Get recommendations for specific product IDs
curl -X POST http://localhost:8000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "cart_items": [1, 2, 3],
    "top_n": 5
  }'

# Get more recommendations
curl -X POST http://localhost:8000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "cart_items": [1, 2],
    "top_n": 10
  }'
```

### 11. Get Recommendations from User's Cart (GET)
```bash
# Get recommendations based on user's current cart (default 5 recommendations)
curl "http://localhost:8000/api/recommendations/cart/user123"

# Get specific number of recommendations
curl "http://localhost:8000/api/recommendations/cart/user123?top_n=10"
```

**Example Workflow:**
```bash
# Step 1: Add items to cart
curl -X POST "http://localhost:8000/api/cart/user123/add?product_id=1&quantity=1"
curl -X POST "http://localhost:8000/api/cart/user123/add?product_id=2&quantity=1"

# Step 2: Get recommendations based on cart
curl "http://localhost:8000/api/recommendations/cart/user123?top_n=5"
```

---

## 💬 AI Chat Endpoint

### 12. Chat with AI Assistant
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me sustainable kitchen products",
    "user_id": "user123"
  }'
```

**Note:** Requires OPENAI_API_KEY in .env file. If not set, returns a helpful message.

---

## 📊 EarthScore Prediction

### 13. Predict EarthScore for Product Features
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "manufacturing_emissions_gco2e": 1500,
    "transport_distance_km": 500,
    "recyclability_percent": 90,
    "biodegradability_score": 5,
    "is_fair_trade": 1,
    "supply_chain_transparency_score": 5,
    "durability_rating": 5,
    "repairability_index": 4
  }'
```

---

## 🛍️ Checkout Endpoints

### 14. Express Checkout
```bash
curl -X POST http://localhost:8000/api/express-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "items": [
      {
        "product_id": 1,
        "product_name": "Eco Water Bottle",
        "quantity": 2,
        "price": 24.99,
        "earth_score": 85
      }
    ],
    "shipping_address": {
      "name": "John Doe",
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "phone": "1234567890"
    },
    "payment_method": "credit_card"
  }'
```

### 15. Optimize Checkout (Get group buy and packaging options)
```bash
curl -X POST http://localhost:8000/api/checkout/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "pincode": 400001,
    "cart": [
      {
        "product_id": 1,
        "quantity": 2
      }
    ]
  }'
```

---

## 👥 Group Buy Endpoints

### 16. Get Active Group Buys
```bash
# Default location (Mumbai)
curl http://localhost:8000/api/group-buys

# Specific location
curl "http://localhost:8000/api/group-buys?location=Delhi"
```

### 17. Join Group Buy
```bash
curl -X POST "http://localhost:8000/api/group-buys/GB_001/join?user_id=user123"
```

### 18. Get Group Buy Suggestions
```bash
curl -X POST http://localhost:8000/api/group-buy/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "pincode": "400705",
    "items": [1, 2, 3],
    "radius": 5.0
  }'
```

---

## 📈 Dashboard Endpoint

### 19. Get User Dashboard Data
```bash
curl http://localhost:8000/api/dashboard/user123
```

---

## 🧪 Complete Testing Workflow for Recommender System

### Step-by-Step Test:

```bash
# 1. Check server is running
curl http://localhost:8000/health

# 2. Get some product IDs to use
curl http://localhost:8000/api/products | head -20

# 3. Add items to cart (use actual product IDs from step 2)
curl -X POST "http://localhost:8000/api/cart/test_user/add?product_id=1&quantity=1"
curl -X POST "http://localhost:8000/api/cart/test_user/add?product_id=2&quantity=1"
curl -X POST "http://localhost:8000/api/cart/test_user/add?product_id=3&quantity=1"

# 4. View cart
curl http://localhost:8000/api/cart/test_user

# 5. Get recommendations based on cart (Method 1: Using cart endpoint)
curl "http://localhost:8000/api/recommendations/cart/test_user?top_n=5"

# 6. Get recommendations with specific product IDs (Method 2: Direct POST)
curl -X POST http://localhost:8000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "cart_items": [1, 2, 3],
    "top_n": 5
  }'

# 7. Test with different product combinations
curl -X POST http://localhost:8000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "cart_items": [1],
    "top_n": 10
  }'
```

---

## 📝 Pretty Print JSON Responses

For better readability, pipe to `jq` (if installed):

```bash
curl http://localhost:8000/api/products | jq '.[0:5]'
curl http://localhost:8000/api/recommendations/cart/test_user | jq
```

Or use Python:
```bash
curl http://localhost:8000/api/recommendations/cart/test_user | python -m json.tool
```

---

## 🔧 Windows PowerShell Alternative

If using PowerShell on Windows, use `Invoke-RestMethod`:

```powershell
# GET request
Invoke-RestMethod -Uri "http://localhost:8000/api/products" -Method Get

# POST request
$body = @{
    cart_items = @(1, 2, 3)
    top_n = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/recommendations" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

---

## 🎯 Quick Test Commands

### Test Recommender System Only:
```bash
# Quick test - get recommendations for products [1, 2, 3]
curl -X POST http://localhost:8000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"cart_items": [1, 2, 3], "top_n": 5}'
```

### Test Full Flow:
```bash
# 1. Add to cart
curl -X POST "http://localhost:8000/api/cart/demo_user/add?product_id=1"

# 2. Get recommendations
curl "http://localhost:8000/api/recommendations/cart/demo_user"
```

---

## 📋 Response Examples

### Successful Recommendation Response:
```json
{
  "success": true,
  "recommendations": [
    {
      "product_id": 5,
      "product_name": "Eco Water Bottle",
      "price": 24.99,
      "earth_score": 85,
      "category": "home",
      "image_url": "/images/home.png",
      "confidence": 0.45,
      "reason": "Frequently bought with items in your cart"
    }
  ],
  "count": 5
}
```

### Empty Cart Response:
```json
{
  "success": true,
  "recommendations": [],
  "count": 0,
  "message": "Cart is empty. Add items to get recommendations!"
}
```

---

## ⚠️ Troubleshooting

### Server not running:
```bash
# Check if server is running
curl http://localhost:8000/health

# If connection refused, start the server:
# cd backend
# python main.py
```

### CORS errors:
- The backend is configured to allow all origins in development
- If you see CORS errors, check the backend is running on port 8000

### Empty recommendations:
- Make sure you've added items to cart first
- The recommender needs to be trained (happens on server startup)
- Try with different product IDs

---

**Happy Testing! 🚀**

