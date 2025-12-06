# Quick Test Guide: Recommender System (Apriori Algorithm)

## 🎯 Quick Start - Test Recommender in 3 Steps

### Step 1: Start the Backend Server
```bash
cd backend
python main.py
```
Wait for: `✅ Recommender system trained`

### Step 2: Test Recommendations (Choose one method)

#### Method A: Direct Product IDs
```bash
curl -X POST http://localhost:8000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "cart_items": [1, 2, 3],
    "top_n": 5
  }'
```

#### Method B: Using User Cart
```bash
# First, add items to cart
curl -X POST "http://localhost:8000/api/cart/test_user/add?product_id=1"
curl -X POST "http://localhost:8000/api/cart/test_user/add?product_id=2"

# Then get recommendations
curl "http://localhost:8000/api/recommendations/cart/test_user?top_n=5"
```

### Step 3: View Results
You should see JSON with recommended products, confidence scores, and reasons.

---

## 📋 Complete Test Workflow

```bash
# 1. Health check
curl http://localhost:8000/health

# 2. Get available product IDs
curl http://localhost:8000/api/products | head -20

# 3. Add items to cart
curl -X POST "http://localhost:8000/api/cart/demo_user/add?product_id=1&quantity=1"
curl -X POST "http://localhost:8000/api/cart/demo_user/add?product_id=2&quantity=1"
curl -X POST "http://localhost:8000/api/cart/demo_user/add?product_id=3&quantity=1"

# 4. View cart
curl http://localhost:8000/api/cart/demo_user

# 5. Get recommendations (Method 1 - from cart)
curl "http://localhost:8000/api/recommendations/cart/demo_user?top_n=5"

# 6. Get recommendations (Method 2 - direct)
curl -X POST http://localhost:8000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "cart_items": [1, 2, 3],
    "top_n": 5
  }'
```

---

## 🔍 Endpoint Details

### POST `/api/recommendations`
Get recommendations for specific product IDs.

**Request:**
```json
{
  "cart_items": [1, 2, 3],
  "top_n": 5
}
```

**Response:**
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

### GET `/api/recommendations/cart/{user_id}`
Get recommendations based on user's current cart.

**Parameters:**
- `user_id` (path): User identifier
- `top_n` (query, optional): Number of recommendations (default: 5)

**Example:**
```bash
curl "http://localhost:8000/api/recommendations/cart/user123?top_n=10"
```

---

## 🧪 Test Scenarios

### Scenario 1: Single Product
```bash
curl -X POST http://localhost:8000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"cart_items": [1], "top_n": 5}'
```

### Scenario 2: Multiple Products
```bash
curl -X POST http://localhost:8000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"cart_items": [1, 2, 3, 4, 5], "top_n": 10}'
```

### Scenario 3: Empty Cart
```bash
curl "http://localhost:8000/api/recommendations/cart/new_user"
# Returns: {"message": "Cart is empty. Add items to get recommendations!"}
```

### Scenario 4: Different Categories
```bash
# Add kitchen items
curl -X POST "http://localhost:8000/api/cart/user1/add?product_id=10"
curl -X POST "http://localhost:8000/api/cart/user1/add?product_id=11"

# Get recommendations
curl "http://localhost:8000/api/recommendations/cart/user1"
```

---

## 📊 Expected Response Format

```json
{
  "success": true,
  "recommendations": [
    {
      "product_id": 123,
      "product_name": "Product Name",
      "price": 29.99,
      "earth_score": 85,
      "category": "kitchen",
      "image_url": "/images/kitchen.png",
      "confidence": 0.45,
      "reason": "Frequently bought with items in your cart"
    }
  ],
  "count": 5
}
```

**Fields:**
- `product_id`: Unique product identifier
- `product_name`: Name of the product
- `price`: Product price
- `earth_score`: Sustainability score (0-100)
- `category`: Product category
- `confidence`: Recommendation confidence (0.0-1.0)
- `reason`: Why this product was recommended

---

## ⚠️ Troubleshooting

### No recommendations returned?
1. Check server is running: `curl http://localhost:8000/health`
2. Verify recommender trained: Look for `✅ Recommender system trained` in server logs
3. Try different product IDs (some may not have associations)
4. Increase `top_n` value

### Empty cart error?
```bash
# Add items first
curl -X POST "http://localhost:8000/api/cart/user123/add?product_id=1"
```

### Server not responding?
```bash
# Check if server is running
curl http://localhost:8000/health

# If not, start it:
cd backend
python main.py
```

---

## 💡 Tips

1. **Use real product IDs**: Get them from `/api/products` endpoint
2. **Test with different combinations**: Try kitchen + home items, etc.
3. **Check confidence scores**: Higher = stronger association
4. **Empty cart first**: Clear cart between tests for clean results

---

## 🔗 Related Endpoints

- Get all products: `GET /api/products`
- Add to cart: `POST /api/cart/{user_id}/add`
- View cart: `GET /api/cart/{user_id}`
- Filter products: `GET /api/products/filter`

---

**For all API endpoints, see: `CURL_COMMANDS.md`**

