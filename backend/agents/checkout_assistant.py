# agents/checkout_assistant.py
"""
Checkout Assistant Agent - Manages cart operations and checkout process
"""

from services.cart_service import CartService
from typing import Dict, List, Optional
import json
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class CheckoutAssistantAgent:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the checkout assistant agent"""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

        if not self.api_key:
            raise ValueError(
                "OPENAI_API_KEY not found in environment variables")

        self.cart_service = CartService()

        self.system_instruction = """You are the GreenCart Checkout Assistant, helping users manage their cart and complete purchases.

Your capabilities:
- View and manage shopping cart
- Calculate total price and environmental impact
- Suggest eco-friendly packaging options
- Guide through checkout process
- Celebrate sustainable choices

Your personality:
- Efficient and helpful
- Encouraging about sustainable choices
- Clear about costs and impact
- Celebratory when users choose green options

Always show the environmental impact of their cart and suggest ways to make it even greener."""

        self.llm = ChatOpenAI(
            model="gpt-4",
            openai_api_key=self.api_key,
            temperature=0.3
        )

        self.packaging_options = [
            {
                "name": "Zero Waste",
                "description": "Reusable packaging that you return",
                "earth_score_bonus": 10,
                "cost": 0,
                "co2_saved": 0.5
            },
            {
                "name": "Minimal Pack",
                "description": "Recycled paper only, no plastic",
                "earth_score_bonus": 5,
                "cost": 0,
                "co2_saved": 0.3
            },
            {
                "name": "Standard Eco",
                "description": "Biodegradable materials",
                "earth_score_bonus": 3,
                "cost": 0,
                "co2_saved": 0.1
            }
        ]

    def get_cart_analysis(self, user_id: str) -> Dict:
        """Analyze cart for sustainability metrics"""
        cart_summary = self.cart_service.get_cart_summary(user_id)

        if cart_summary["items_count"] == 0:
            return {
                "empty": True,
                "message": "Your cart is empty. Let's find some sustainable products!"
            }

        # Calculate environmental impact
        total_co2 = sum(
            item["quantity"] * 0.5 for item in cart_summary["items"])  # Simplified

        # Sustainability rating
        avg_score = cart_summary["average_earth_score"]
        if avg_score >= 85:
            rating = "Excellent! 🌟"
            message = "Your cart is full of sustainable champions!"
        elif avg_score >= 70:
            rating = "Very Good! 🌱"
            message = "Great eco-friendly choices!"
        else:
            rating = "Good 👍"
            message = "Consider adding more high EarthScore items!"

        return {
            "empty": False,
            "summary": cart_summary,
            "co2_impact": total_co2,
            "sustainability_rating": rating,
            "message": message
        }

    def suggest_packaging(self, cart_value: float) -> List[Dict]:
        """Suggest packaging options based on cart"""
        suggestions = []

        for option in self.packaging_options:
            suggestion = option.copy()
            if cart_value > 50 and option["name"] == "Zero Waste":
                suggestion["recommended"] = True
                suggestion["reason"] = "Best for the planet and free for orders over $50!"
            elif cart_value < 20 and option["name"] == "Minimal Pack":
                suggestion["recommended"] = True
                suggestion["reason"] = "Perfect for small orders"

            suggestions.append(suggestion)

        return suggestions

    def handle_request(self, message: str, user_context: Dict) -> Dict:
        """Handle checkout-related requests"""

        user_id = user_context.get("user_id", "anonymous")
        message_lower = message.lower()

        # Get cart analysis
        cart_analysis = self.get_cart_analysis(user_id)

        if cart_analysis.get("empty"):
            return {
                "response": cart_analysis["message"],
                "cart_empty": True,
                "agent": "checkout_assistant"
            }

        summary = cart_analysis["summary"]

        # Generate appropriate response
        if "packaging" in message_lower:
            # Suggest packaging options
            packaging = self.suggest_packaging(summary["total_price"])
            response = "🌿 Sustainable Packaging Options:\n\n"

            for opt in packaging:
                emoji = "♻️" if opt.get("recommended") else "📦"
                response += f"{emoji} **{opt['name']}**: {opt['description']}\n"
                response += f"   EarthScore bonus: +{opt['earth_score_bonus']} | CO2 saved: {opt['co2_saved']}kg\n"
                if opt.get("recommended"):
                    response += f"   ✨ {opt['reason']}\n"
                response += "\n"

            response += "Which packaging option would you prefer?"

        elif any(word in message_lower for word in ["checkout", "buy", "purchase", "order"]):
            # Checkout summary
            response = f"""🛒 Ready to checkout? Here's your sustainable cart summary:

📦 Items: {summary['items_count']} products ({summary['total_items']} total items)
💰 Total: ${summary['total_price']:.2f}
🌍 Average EarthScore: {summary['average_earth_score']:.1f}/100 - {cart_analysis['sustainability_rating']}
♻️ Carbon Impact: {cart_analysis['co2_impact']:.1f}kg CO2

{cart_analysis['message']}

Would you like to:
1. Choose sustainable packaging (save more CO2!)
2. Join a group buy (save 15% and reduce packaging)
3. Proceed to payment

Every sustainable choice makes a difference! 🌱"""

        else:
            # Default cart view
            response = f"""📦 Your GreenCart Summary:

"""
            for item in summary["items"]:
                response += f"• {item['product_name']} (x{item['quantity']}) - ${item['price'] * item['quantity']:.2f} | EarthScore: {item['earth_score']}\n"

            response += f"""
💰 Total: ${summary['total_price']:.2f}
🌍 Average EarthScore: {summary['average_earth_score']:.1f}/100 - {cart_analysis['sustainability_rating']}

{cart_analysis['message']}"""

        return {
            "response": response,
            "cart_summary": summary,
            "cart_analysis": cart_analysis,
            "agent": "checkout_assistant"
        }


# Test the checkout assistant
if __name__ == "__main__":
    print("🛒 Testing Checkout Assistant Agent\n")

    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Please set OPENAI_API_KEY environment variable")
        exit(1)

    # Add some items to cart for testing
    cart = CartService()
    cart.add_to_cart("test_user", 1, "Bamboo Utensils", 2, 24.99, 92)
    cart.add_to_cart("test_user", 2, "Eco Water Bottle", 1, 19.99, 88)

    assistant = CheckoutAssistantAgent()

    test_queries = [
        "Show me my cart",
        "What packaging options do I have?",
        "I'm ready to checkout"
    ]

    for query in test_queries:
        print(f"\n👤 User: {query}")
        result = assistant.handle_request(query, {"user_id": "test_user"})
        print(f"🛒 Checkout Assistant: {result['response']}")
