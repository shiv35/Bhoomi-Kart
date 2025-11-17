# main.py
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

# Import the enhanced agent
from agent import create_greencart_agent

# Import services
from services.cart_service import CartService
from services.group_buy_service import GroupBuyService
from clustering_service import GroupBuyClusteringService
from services.filter_service import ProductFilterService
from services.express_checkout_service import ExpressCheckoutService
from utils.message_templates import MessageTemplates

app = FastAPI(title="GreenCart API")

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

# Startup Event
@app.on_event("startup")
def startup_event():
    global products_df, agent, imputer, model, cart_service, group_buy_service, clustering_service, filter_service, express_checkout_service

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
    print("✅ Services initialized")

    # Create enhanced agent
    agent = create_greencart_agent()
    print("✅ Enhanced GreenCart agent created")

# --- API Endpoints ---


@app.get("/")
def read_root():
    return {"status": "ok", "service": "GreenCart API"}


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
        raise HTTPException(status_code=500, detail="Agent not configured")

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
    """Get optimal group buying suggestions based on location and cart items"""
    try:
        user_pincode = request.get('pincode', '400705')
        cart_items = request.get('items', [])
        radius_km = request.get('radius', 5.0)

        suggestions = clustering_service.find_optimal_groups(
            user_pincode=user_pincode,
            cart_items=cart_items,
            radius_km=radius_km
        )

        return {
            "success": True,
            "suggestions": suggestions
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "suggestions": []
        }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
