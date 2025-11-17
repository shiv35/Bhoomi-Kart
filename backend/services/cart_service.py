# services/cart_service.py
"""
Cart Service - Manages shopping cart state using Redis
This replaces the simple cart tracking in the agent
"""

import json
import redis
from typing import Dict, List, Optional
from datetime import datetime, timedelta


class CartService:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        """Initialize cart service with Redis connection"""
        try:
            self.redis_client = redis.from_url(
                redis_url, decode_responses=True)
            self.redis_client.ping()
            print("✅ Cart Service: Redis connected successfully")
        except:
            print("⚠️ Cart Service: Redis not available, using in-memory storage")
            self.redis_client = None
            self.memory_store = {}

    def _get_cart_key(self, user_id: str) -> str:
        """Generate Redis key for user's cart"""
        return f"cart:{user_id}"

    def add_to_cart(self, user_id: str, product_id: int, product_name: str,
                    quantity: int, price: float, earth_score: int) -> Dict:
        """Add item to user's cart"""
        cart_key = self._get_cart_key(user_id)

        # Create cart item
        cart_item = {
            "product_id": product_id,
            "product_name": product_name,
            "quantity": quantity,
            "price": price,
            "earth_score": earth_score,
            "added_at": datetime.now().isoformat()
        }

        if self.redis_client:
            # Use Redis
            self.redis_client.hset(cart_key, product_id, json.dumps(cart_item))
            # Set expiry to 7 days
            self.redis_client.expire(cart_key, 60 * 60 * 24 * 7)
        else:
            # Use memory store
            if user_id not in self.memory_store:
                self.memory_store[user_id] = {}
            self.memory_store[user_id][str(product_id)] = cart_item

        return {
            "status": "success",
            "message": f"Added {quantity} x {product_name} to cart",
            "cart_item": cart_item
        }

    def get_cart(self, user_id: str) -> List[Dict]:
        """Get all items in user's cart"""
        cart_key = self._get_cart_key(user_id)
        cart_items = []

        if self.redis_client:
            # Get from Redis
            cart_data = self.redis_client.hgetall(cart_key)
            for product_id, item_json in cart_data.items():
                cart_items.append(json.loads(item_json))
        else:
            # Get from memory
            if user_id in self.memory_store:
                cart_items = list(self.memory_store[user_id].values())

        return cart_items

    def update_quantity(self, user_id: str, product_id: int, new_quantity: int) -> Dict:
        """Update quantity of item in cart"""
        cart_key = self._get_cart_key(user_id)

        if self.redis_client:
            item_json = self.redis_client.hget(cart_key, product_id)
            if item_json:
                item = json.loads(item_json)
                item["quantity"] = new_quantity
                self.redis_client.hset(cart_key, product_id, json.dumps(item))
                return {"status": "success", "message": "Quantity updated"}
        else:
            if user_id in self.memory_store and str(product_id) in self.memory_store[user_id]:
                self.memory_store[user_id][str(
                    product_id)]["quantity"] = new_quantity
                return {"status": "success", "message": "Quantity updated"}

        return {"status": "error", "message": "Item not found in cart"}

    def remove_from_cart(self, user_id: str, product_id: int) -> Dict:
        """Remove item from cart"""
        cart_key = self._get_cart_key(user_id)

        if self.redis_client:
            result = self.redis_client.hdel(cart_key, product_id)
            if result:
                return {"status": "success", "message": "Item removed from cart"}
        else:
            if user_id in self.memory_store and str(product_id) in self.memory_store[user_id]:
                del self.memory_store[user_id][str(product_id)]
                return {"status": "success", "message": "Item removed from cart"}

        return {"status": "error", "message": "Item not found in cart"}

    def clear_cart(self, user_id: str) -> Dict:
        """Clear entire cart"""
        cart_key = self._get_cart_key(user_id)

        if self.redis_client:
            self.redis_client.delete(cart_key)
        else:
            if user_id in self.memory_store:
                del self.memory_store[user_id]

        return {"status": "success", "message": "Cart cleared"}

    def get_cart_summary(self, user_id: str) -> Dict:
        """Get cart summary with totals"""
        cart_items = self.get_cart(user_id)

        total_items = sum(item["quantity"] for item in cart_items)
        total_price = sum(item["price"] * item["quantity"]
                          for item in cart_items)
        avg_earth_score = sum(
            item["earth_score"] for item in cart_items) / len(cart_items) if cart_items else 0

        return {
            "items_count": len(cart_items),
            "total_items": total_items,
            "total_price": round(total_price, 2),
            "average_earth_score": round(avg_earth_score, 1),
            "items": cart_items
        }


# Test the service if run directly
if __name__ == "__main__":
    # Create cart service
    cart = CartService()

    # Test adding items
    print("\n🛒 Testing Cart Service...")

    # Add item
    result = cart.add_to_cart(
        user_id="test_user_1",
        product_id=1,
        product_name="Eco Water Bottle",
        quantity=2,
        price=24.99,
        earth_score=85
    )
    print(f"\nAdd to cart: {result}")

    # Get cart
    cart_items = cart.get_cart("test_user_1")
    print(f"\nCart items: {cart_items}")

    # Get summary
    summary = cart.get_cart_summary("test_user_1")
    print(f"\nCart summary: {summary}")
