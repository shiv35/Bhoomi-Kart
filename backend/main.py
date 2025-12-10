# main.py
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Fix for XGBoost on macOS - set library path before importing
if sys.platform == 'darwin':  # macOS
    libomp_path = '/opt/homebrew/opt/libomp/lib'
    if os.path.exists(libomp_path):
        os.environ['DYLD_LIBRARY_PATH'] = libomp_path + ':' + os.environ.get('DYLD_LIBRARY_PATH', '')
        # Also try to set it via ctypes for more reliable loading
        try:
            import ctypes
            ctypes.CDLL(os.path.join(libomp_path, 'libomp.dylib'))
        except:
            pass

from fastapi import FastAPI
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pickle
from langchain_core.messages import HumanMessage
import json
import uvicorn
from datetime import datetime, timedelta

# Ensure environment variables are loaded from both backend and project root
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")

# Import the enhanced agent
from agent import create_greencart_agent

# Import services
from services.cart_service import CartService
from services.group_buy_service import GroupBuyService
from clustering_service import GroupBuyClusteringService
from services.filter_service import ProductFilterService
from services.express_checkout_service import ExpressCheckoutService
from services.recommender_service import RecommenderService
from utils.message_templates import MessageTemplates

app = FastAPI(title="Bhoomi Kart API")

# Add CORS middleware - THIS IS THE FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3111",  # Your frontend URL
        "http://localhost:3001",
        "http://127.0.0.1:3111",
        "*"  # For development only - remove in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
products_df = None
agent = None
imputer = None
model = None
cart_service = None
group_buy_service = None
clustering_service = None
filter_service = None
express_checkout_service = None
recommender_service = None

# Startup Event
@app.on_event("startup")
def startup_event():
    global products_df, agent, imputer, model, cart_service, group_buy_service, clustering_service, filter_service, express_checkout_service, recommender_service

    # Load product data
    products_df = pd.read_csv("../data/products_large.csv")
    print(f"✅ Product data loaded: {len(products_df)} items")

    # Load ML models
    with open('ml/imputer.pkl', 'rb') as f:
        imputer = pickle.load(f)
    with open('ml/model.pkl', 'rb') as f:
        model = pickle.load(f)
    print("✅ ML models loaded")

    # Initialize services
    cart_service = CartService()
    group_buy_service = GroupBuyService()
    clustering_service = GroupBuyClusteringService('../data/users_pincodes.csv')
    filter_service = ProductFilterService(products_df)
    express_checkout_service = ExpressCheckoutService()
    recommender_service = RecommenderService(products_df)
    print("✅ Services initialized")

    # Train recommender system (this will generate synthetic data and train Apriori)
    print("🔄 Training recommender system...")
    recommender_service.train(num_transactions=2000)
    print("✅ Recommender system trained")

    # Create enhanced agent (requires GEMINI_API_KEY)
    try:
        agent = create_greencart_agent()
        print("✅ Enhanced Bhoomi Kart agent created")
    except Exception as e:
        print(f"⚠️  Warning: Could not create AI agent: {e}")
        print("   AI chat features will be disabled, but other features will work.")
        agent = None

# --- API Endpoints ---


@app.get("/")
def read_root():
    return {"status": "ok", "service": "Bhoomi Kart API"}


@app.get("/api/products")
def get_all_products():
    if products_df is not None:
        return products_df.to_dict(orient="records")
    raise HTTPException(status_code=503, detail="Products not loaded yet")


@app.get("/api/products/{product_id}")
def get_product_by_id(product_id: int):
    product = products_df[products_df['product_id'] == product_id]
    if product.empty:
        raise HTTPException(
            status_code=404, detail=f"Product {product_id} not found")
    return product.iloc[0].to_dict()

# Enhanced products endpoint with filtering
@app.get("/api/products/filter")
def filter_products(
    category: Optional[str] = None,
    earth_score_min: Optional[int] = None,
    earth_score_max: Optional[int] = None,
    sort_by: str = "earth_score",
    limit: int = 20
):
    """Get filtered products"""
    filtered = filter_service.filter_products(
        category=category,
        earth_score_min=earth_score_min,
        earth_score_max=earth_score_max,
        sort_by=sort_by,
        limit=limit
    )
    return {
        "products": filtered,
        "count": len(filtered),
        "filters_applied": {
            "category": category,
            "earth_score_min": earth_score_min,
            "earth_score_max": earth_score_max
        }
    }


# Profile endpoint - derives sustainability stats from cart data
@app.get("/api/profile/{user_id}")
def get_profile(user_id: str):
    """
    Return profile data with live cart-derived sustainability stats.
    Uses cart contents to compute CO2 saved and related metrics.
    """
    display_name = user_id if user_id != "guest" else "Eco Warrior"

    summary = cart_service.get_cart_summary(user_id)
    items = summary.get("items", [])
    total_items = summary.get("total_items", 0)

    # Simple impact estimations (aligned with checkout assistant assumptions)
    cart_co2_saved = sum(item["quantity"] * 0.5 for item in items)  # kg CO2 saved assumption

    # Persist recent CO2 saved so it survives page reloads for some time
    snapshot = cart_service.get_impact_snapshot(user_id)
    snapshot_co2 = snapshot.get("co2_saved", 0) if snapshot else 0

    # Use the higher of current cart or last snapshot to avoid double-counting
    effective_co2_saved = max(cart_co2_saved, snapshot_co2)

    # Save snapshot with TTL (30 days)
    cart_service.save_impact_snapshot(user_id, effective_co2_saved, ttl_days=30)

    plastic_bottles_saved = int(effective_co2_saved * 10)  # derived proxy
    water_saved_liters = int(effective_co2_saved * 30)
    trees_equiv = round(effective_co2_saved / 22, 2)  # rough kg CO2 per tree per year

    sustainability_stats = {
        "totalCO2Saved": round(effective_co2_saved, 2),
        "treesEquivalent": trees_equiv,
        "plasticBottlesSaved": plastic_bottles_saved,
        "waterSaved": water_saved_liters,
        "level": 1 if total_items < 5 else 2 if total_items < 15 else 3,
        "levelName": "Getting Started" if total_items < 5 else "Eco Enthusiast" if total_items < 15 else "Eco Champion",
        "nextLevelProgress": min(100, int((total_items % 10) * 10))
    }

    return {
        "displayName": display_name,
        "email": "",
        "phone": "",
        "address": "",
        "city": "",
        "pincode": "",
        "preferences": {
            "emailNotifications": True,
            "groupBuyAlerts": True,
            "priceDropAlerts": False,
            "sustainabilityTips": True
        },
        "sustainabilityStats": sustainability_stats,
        "cartSummary": summary
    }

# Cart endpoints


@app.get("/api/cart/{user_id}")
def get_cart(user_id: str):
    """Get user's cart"""
    return cart_service.get_cart_summary(user_id)


@app.post("/api/cart/{user_id}/add")
def add_to_cart_api(user_id: str, product_id: int, quantity: int = 1):
    """Add item to cart via API"""
    product = products_df[products_df['product_id'] == product_id]
    if product.empty:
        raise HTTPException(status_code=404, detail="Product not found")

    product_data = product.iloc[0]
    result = cart_service.add_to_cart(
        user_id=user_id,
        product_id=product_id,
        product_name=product_data['product_name'],
        quantity=quantity,
        price=float(product_data['price']),
        earth_score=int(product_data.get('earth_score', 75))
    )
    return result


@app.delete("/api/cart/{user_id}/item/{product_id}")
def remove_from_cart(user_id: str, product_id: int):
    """Remove item from cart"""
    return cart_service.remove_from_cart(user_id, product_id)

# Express checkout endpoint
class ExpressCheckoutRequest(BaseModel):
    user_id: str
    items: List[Dict[str, Any]]
    shipping_address: Dict[str, str]
    payment_method: str = "credit_card"

@app.post("/api/express-checkout")
def express_checkout(request: ExpressCheckoutRequest):
    """Process express checkout"""
    # Validate address
    if not express_checkout_service.validate_shipping_address(request.shipping_address):
        raise HTTPException(status_code=400, detail="Invalid shipping address")
    
    # Create order
    order = express_checkout_service.create_express_order(
        user_id=request.user_id,
        cart_items=request.items,
        shipping_address=request.shipping_address,
        payment_method=request.payment_method
    )
    
    # Process payment (mock)
    payment_result = express_checkout_service.process_payment(
        amount=order.total_amount,
        payment_method=request.payment_method
    )
    
    if not payment_result["success"]:
        raise HTTPException(status_code=400, detail="Payment failed")
    
    return {
        "success": True,
        "order_id": order.order_id,
        "total": order.total_amount,
        "earth_score": order.total_earth_score,
        "co2_saved": order.estimated_co2_saved,
        "transaction_id": payment_result["transaction_id"],
        "message": MessageTemplates.get_product_selected_message(
            earth_score=int(order.total_earth_score),
            co2_saved=order.estimated_co2_saved
        )
    }

class CreateGroupFromOrderRequest(BaseModel):
    user_id: str
    pincode: str
    cart_items: List[Dict[str, Any]]
    order_id: str
    target_size: int = 5

@app.post("/api/group-buy/create-from-order")
def create_group_from_order(request: CreateGroupFromOrderRequest):
    """Create a group buy opportunity from a completed order"""
    print(f"🔍 [API] Creating group buy from order {request.order_id} for pincode {request.pincode}")
    
    if not group_buy_service:
        raise HTTPException(status_code=503, detail="Group buy service not initialized")
    
    try:
        result = group_buy_service.create_group_from_order(
            user_id=request.user_id,
            pincode=request.pincode,
            cart_items=request.cart_items,
            order_id=request.order_id,
            target_size=request.target_size
        )
        
        print(f"✅ [API] Group buy created: {result['group']['group_id']}")
        return result
    except Exception as e:
        print(f"❌ [API] Error creating group from order: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Group buy endpoints


@app.get("/api/group-buys")
def get_group_buys(location: str = "Mumbai"):
    """Get active group buys"""
    active_groups = []
    for group_id, group in group_buy_service.active_groups.items():
        if group["status"] == "open" and group["location"] == location:
            active_groups.append(group)
    return active_groups


@app.post("/api/group-buys/{group_id}/join")
def join_group_buy(group_id: str, user_id: str):
    """Join a group buy"""
    return group_buy_service.join_group_buy(group_id, user_id)

# Chat endpoint


class ChatRequest(BaseModel):
    message: str
    user_id: str


@app.post("/api/chat")
async def chat_with_agent(request: ChatRequest):
    """Enhanced chat endpoint with multi-agent support and structured product data"""
    if not agent:
        return {
            "reply": "AI chat features are currently disabled. Please set GEMINI_API_KEY in your .env file to enable AI assistance. "
                    "However, you can still browse products, use the recommender system, and manage your cart!",
            "agent_used": "none",
            "routing": {},
            "products": []
        }

    try:
        # Initialize state with specialist agents
        initial_state = {
            "messages": [HumanMessage(content=request.message)],
            "user_info": {"user_id": request.user_id},
            "products_df": products_df,
            "current_agent": None,
            "routing_info": None,
            "specialist_agents": {}  # Will be set by agent wrapper
        }

        # Invoke agent
        final_state = agent(initial_state)

        # Get the response
        agent_response = final_state['messages'][-1].content

        # Extract structured product data if shopping assistant was used
        products_data = []
        if final_state.get("current_agent") == "shopping_assistant":
            # Parse products from the response
            import re
            product_pattern = r'- (.*?) - \$([\d.]+) \(EarthScore: (\d+)\)'
            matches = re.findall(product_pattern, agent_response)

            for match in matches:
                product_name = match[0]
                price = float(match[1])
                earth_score = int(match[2])

                # Find the full product details from products_df
                product_row = products_df[products_df['product_name'].str.contains(
                    product_name, case=False, na=False)]

                if not product_row.empty:
                    product = product_row.iloc[0]
                    products_data.append({
                        "product_id": int(product.get('product_id', 0)),
                        "product_name": product['product_name'],
                        "price": float(product['price']),
                        "earth_score": int(product.get('earth_score', 75)),
                        "category": product.get('category', 'home'),
                        "image_url": f"/images/{product.get('category', 'home').lower()}.png",
                        # Additional fields for detail view
                        "manufacturing_emissions_gco2e": float(product.get('manufacturing_emissions_gco2e', 2000)),
                        "transport_distance_km": float(product.get('transport_distance_km', 1000)),
                        "recyclability_percent": int(product.get('recyclability_percent', 80)),
                        "biodegradability_score": int(product.get('biodegradability_score', 4)),
                        "is_fair_trade": bool(product.get('is_fair_trade', False)),
                        "supply_chain_transparency_score": int(product.get('supply_chain_transparency_score', 4)),
                        "durability_rating": int(product.get('durability_rating', 4)),
                        "repairability_index": int(product.get('repairability_index', 4))
                    })

        # Include routing info for debugging
        response_data = {
            "reply": agent_response,
            "agent_used": final_state.get("current_agent", "main"),
            "routing": final_state.get("routing_info", {}),
            "products": products_data  # New: structured product data
        }

        return response_data

    except Exception as e:
        print(f"❌ Error in chat: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# EarthScore prediction endpoint


class ProductFeatures(BaseModel):
    manufacturing_emissions_gco2e: Optional[float] = None
    transport_distance_km: Optional[float] = None
    recyclability_percent: Optional[float] = None
    biodegradability_score: Optional[float] = None
    is_fair_trade: Optional[float] = None
    supply_chain_transparency_score: Optional[float] = None
    durability_rating: Optional[float] = None
    repairability_index: Optional[float] = None


@app.post("/api/predict")
def predict_score(features: ProductFeatures):
    """Predict EarthScore for product features"""
    data = pd.DataFrame([features.dict()])
    data_imputed = imputer.transform(data)
    prediction = model.predict(data_imputed)
    score = max(0, min(100, int(prediction[0])))
    return {"earth_score": score}

# Add this temporary endpoint to main.py to debug


@app.get("/api/debug/products")
def debug_products():
    sample = products_df.head(5).to_dict(orient="records")
    columns = list(products_df.columns)
    return {
        "columns": columns,
        "sample_products": sample,
        "has_earth_score": "earth_score" in columns
    }


@app.post("/api/checkout/optimize")
async def optimize_checkout(request: dict):
    # For now, return mock data
    return {
        "group_buy_options": [{
            "bundle_id": "GB_001",
            "name": "Eco Bundle - Mumbai",
            "num_other_customers": 3,
            "co2_saved_kg": 2.5,
            "estimated_delivery": "2025-06-25"
        }],
        "packaging_options": [{
            "name": "Zero Waste",
            "impact_points": 10,
            "message": "Great choice! Zero waste packaging selected."
        }]
    }


class CheckoutOptimizeRequest(BaseModel):
    user_id: str
    pincode: int
    cart: List[dict]


@app.post("/api/checkout/optimize")
async def optimize_checkout(request: CheckoutOptimizeRequest):
    """Optimize checkout with group buy and packaging options"""
    return {
        "group_buy_options": [
            {
                "bundle_id": "GB_001",
                "name": "Eco Bundle - Mumbai",
                "num_other_customers": 3,
                "co2_saved_kg": 2.5,
                "estimated_delivery": "2025-06-25"
            },
            {
                "bundle_id": "GB_002",
                "name": "Neighborhood Green Pack",
                "num_other_customers": 2,
                "co2_saved_kg": 1.8,
                "estimated_delivery": "2025-06-24"
            }
        ],
        "packaging_options": [
            {
                "name": "Zero Waste",
                "impact_points": 10,
                "message": "Reusable packaging - Return after use!"
            },
            {
                "name": "Minimal Pack",
                "impact_points": 5,
                "message": "Recycled paper only, no plastic"
            }
        ]
    }

# Add this endpoint to your main.py file after the cart endpoints


@app.get("/api/dashboard/{user_id}")
def get_dashboard_data(user_id: str):
    """Get user's sustainability dashboard data"""

    # Get user's cart to calculate impact
    cart_summary = cart_service.get_cart_summary(user_id)

    # Calculate mock sustainability metrics
    # In a real app, this would aggregate historical data
    dashboard_data = {
        # Mock: 2.5kg per sustainable purchase
        "co2_saved_kg": round(cart_summary["total_items"] * 2.5, 2),
        "avg_earth_score": cart_summary["average_earth_score"] if cart_summary["items"] else 75,
        "sustainable_purchases": cart_summary["total_items"],
        # Mock: 10 points per item
        "impact_points": cart_summary["total_items"] * 10
    }

    # Add some additional mock data for demo
    if not cart_summary["items"]:
        dashboard_data = {
            "co2_saved_kg": 12.5,
            "avg_earth_score": 82,
            "sustainable_purchases": 5,
            "impact_points": 50
        }

    return dashboard_data




@app.post("/api/group-buy/suggestions")
async def get_group_buy_suggestions(request: dict):
    """Get optimal group buying suggestions based on location and cart items using ML clustering"""
    print(f"🔍 [API] POST /api/group-buy/suggestions called")
    print(f"📊 [API] Request data: pincode={request.get('pincode')}, items={len(request.get('items', []))}")
    
    if not clustering_service:
        print("❌ [API] Clustering service not initialized")
        return {
            "success": False,
            "error": "Clustering service not available",
            "suggestions": []
        }
    
    try:
        user_pincode = request.get('pincode', '400705')
        cart_items = request.get('items', [])
        radius_km = request.get('radius', 5.0)

        if not cart_items:
            print("⚠️ [API] No cart items provided")
            return {
                "success": False,
                "error": "Cart is empty. Add items to find group buying options.",
                "suggestions": []
            }

        # First, check for existing group buys from previous orders
        existing_group_suggestions = []
        if group_buy_service:
            existing_groups = group_buy_service.find_groups_by_pincode(user_pincode)
            print(f"📊 [API] Found {len(existing_groups)} existing group buys for pincode {user_pincode}")
            
            # Convert existing groups to suggestion format
            for group in existing_groups:
                # Check if cart items match group categories
                cart_categories = [item.get('category', '').lower() for item in cart_items if item.get('category')]
                group_categories = [cat.lower() for cat in group.get('categories', [])]
                
                # If there's any category match, include this group
                if any(cat in group_categories for cat in cart_categories) or not cart_categories:
                    existing_group_suggestions.append({
                        'id': group['group_id'],
                        'name': f"Existing Group - Pincode {user_pincode}",
                        'matchingProducts': [item.get('name', 'Product') for item in group.get('cart_items', [])[:3]],
                        'participants': [
                            {'name': f"User {member}", 'pincode': user_pincode, 'avatar': '👤'}
                            for member in group.get('members', [])[:5]
                        ],
                        'savings': group.get('savings', {'cost': 0, 'co2': 0, 'percentage': 15}),
                        'minParticipants': group.get('target_size', 5),
                        'currentParticipants': group.get('current_size', 1),
                        'deadline': group.get('expires_at', ''),
                        'estimatedDelivery': (datetime.now() + timedelta(days=5)).isoformat(),
                        'status': 'available' if group.get('current_size', 1) < group.get('target_size', 5) else 'almost-full',
                        'commonCategories': group.get('categories', [])
                    })

        # Get ML clustering suggestions
        print(f"🔍 [API] Calling clustering service with pincode={user_pincode}, radius={radius_km}km")
        ml_suggestions = clustering_service.find_optimal_groups(
            user_pincode=user_pincode,
            cart_items=cart_items,
            radius_km=radius_km
        )

        # Combine existing groups and ML suggestions
        all_suggestions = existing_group_suggestions + ml_suggestions
        
        # Remove duplicates based on group ID
        seen_ids = set()
        unique_suggestions = []
        for suggestion in all_suggestions:
            if suggestion.get('id') not in seen_ids:
                seen_ids.add(suggestion.get('id'))
                unique_suggestions.append(suggestion)

        print(f"✅ [API] Returning {len(unique_suggestions)} suggestions ({len(existing_group_suggestions)} existing, {len(ml_suggestions)} ML)")
        return {
            "success": True,
            "suggestions": unique_suggestions
        }
    except Exception as e:
        print(f"❌ [API] Error in group-buy suggestions: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": f"Failed to find group buying options: {str(e)}",
            "suggestions": []
        }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

# Recommender endpoints

class RecommendationRequest(BaseModel):
    cart_items: List[int]
    top_n: int = 5

@app.post("/api/recommendations")
def get_recommendations(request: RecommendationRequest):
    """Get product recommendations based on cart items using Apriori algorithm"""
    print(f"🔍 [API] POST /api/recommendations called with cart_items: {request.cart_items}, top_n: {request.top_n}")
    
    if not recommender_service:
        print("❌ [API] Recommender service not initialized")
        raise HTTPException(status_code=503, detail="Recommender service not initialized")
    
    try:
        recommendations = recommender_service.get_recommendations(
            cart_items=request.cart_items,
            top_n=request.top_n
        )
        print(f"✅ [API] Returning {len(recommendations)} recommendations")
        return {
            "success": True,
            "recommendations": recommendations,
            "count": len(recommendations)
        }
    except Exception as e:
        print(f"❌ [API] Error getting recommendations: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommendations/cart/{user_id}")
def get_recommendations_from_cart(user_id: str, top_n: int = 5):
    """Get recommendations based on user's current cart"""
    print(f"🔍 [API] GET /api/recommendations/cart/{user_id} called with top_n: {top_n}")
    
    if not recommender_service:
        print("❌ [API] Recommender service not initialized")
        raise HTTPException(status_code=503, detail="Recommender service not initialized")
    
    try:
        # Get user's cart
        cart_summary = cart_service.get_cart_summary(user_id)
        cart_items = [item['product_id'] for item in cart_summary.get('items', [])]
        print(f"📊 [API] User cart has {len(cart_items)} items: {cart_items}")
        
        if not cart_items:
            print("⚠️ [API] Cart is empty")
            return {
                "success": True,
                "recommendations": [],
                "count": 0,
                "message": "Cart is empty. Add items to get recommendations!"
            }
        
        recommendations = recommender_service.get_recommendations(
            cart_items=cart_items,
            top_n=top_n
        )
        print(f"✅ [API] Returning {len(recommendations)} recommendations for user {user_id}")
        return {
            "success": True,
            "recommendations": recommendations,
            "count": len(recommendations),
            "cart_items": cart_items
        }
    except Exception as e:
        print(f"❌ [API] Error getting recommendations: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
