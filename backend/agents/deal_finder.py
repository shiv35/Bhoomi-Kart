# agents/deal_finder.py
"""
Deal Finder Agent - Manages group buys and finds sustainable deals
"""

from services.group_buy_service import GroupBuyService
from typing import Dict, List, Optional
import json
from datetime import datetime, timedelta
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class DealFinderAgent:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the deal finder agent"""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

        if not self.api_key:
            raise ValueError(
                "OPENAI_API_KEY not found in environment variables")

        self.group_buy_service = GroupBuyService()

        self.system_instruction = """You are the GreenCart Deal Finder, specializing in group buys and sustainable deals.

Your expertise:
- Finding and creating group buy opportunities
- Explaining group buy benefits (reduced packaging, lower carbon footprint)
- Matching users with nearby group buys
- Calculating bulk savings and environmental impact

Your personality:
- Enthusiastic about community and collaboration
- Clear about savings and environmental benefits
- Encouraging about joining or starting group buys
- Helpful in explaining the process

Always emphasize both financial and environmental benefits of group buying."""

        self.llm = ChatOpenAI(
            model="gpt-4",
            openai_api_key=self.api_key,
            temperature=0.7
        )

        # Mock some active group buys for demo
        self._create_mock_group_buys()

    def _create_mock_group_buys(self):
        """Create some mock group buys for demonstration"""
        # Group buy for bamboo products
        self.group_buy_service.create_group_buy(
            product_id=1,
            initiator_user_id="demo_user_1",
            location="Mumbai",
            target_size=5
        )

        # Add some members
        group_id = list(self.group_buy_service.active_groups.keys())[0]
        self.group_buy_service.join_group_buy(group_id, "demo_user_2")
        self.group_buy_service.join_group_buy(group_id, "demo_user_3")

        # Another group buy
        self.group_buy_service.create_group_buy(
            product_id=2,
            initiator_user_id="demo_user_4",
            location="Mumbai",
            target_size=3
        )

    def find_relevant_group_buys(self, query: str, user_location: str = "Mumbai") -> List[Dict]:
        """Find group buys relevant to user's query"""
        # For demo, return all active groups
        active_groups = []

        for group_id, group in self.group_buy_service.active_groups.items():
            if group["status"] == "open" and group["location"] == user_location:
                # Calculate impact
                impact = self.group_buy_service.calculate_group_impact(
                    group_id)

                group_info = {
                    "group_id": group_id,
                    "product_id": group["product_id"],
                    "members": group["current_size"],
                    "target": group["target_size"],
                    "spots_left": group["target_size"] - group["current_size"],
                    "co2_saved": impact["co2_saved_kg"],
                    "packaging_saved": impact["packaging_saved_grams"],
                    "expires": group["expires_at"]
                }
                active_groups.append(group_info)

        return active_groups

    def generate_response(self, user_message: str, group_buys: List[Dict]) -> str:
        """Generate response about group buys"""

        if not group_buys:
            return """I don't see any active group buys in your area right now, but that's a great opportunity! 

Would you like to start a new group buy? Here's how it works:
1. Choose a product you want to buy
2. We'll create a group and find neighbors who want the same item
3. Once we have enough people, everyone gets:
   - 15-20% discount
   - 40% less packaging waste
   - Reduced shipping emissions
   
Starting a group buy makes you a sustainability leader in your community! 🌟"""

        # Build response about available group buys
        response = f"Great news! I found {len(group_buys)} active group buy opportunities for you:\n\n"

        for i, group in enumerate(group_buys, 1):
            response += f"""🛍️ Group Buy #{i}:
- {group['members']}/{group['target']} members (only {group['spots_left']} spots left!)
- Save {group['co2_saved']:.1f}kg CO2 and {group['packaging_saved']}g of packaging
- Expires: {group['expires'].split('T')[0]}

"""

        response += "\nJoining a group buy is easy and helps the environment! Would you like to join one of these?"

        return response

    def handle_request(self, message: str, user_context: Optional[Dict] = None) -> Dict:
        """Handle a deal finding request"""

        user_location = user_context.get(
            "location", "Mumbai") if user_context else "Mumbai"
        user_id = user_context.get(
            "user_id", "anonymous") if user_context else "anonymous"

        # Find relevant group buys
        group_buys = self.find_relevant_group_buys(message, user_location)

        # Check if user wants to join a specific group
        if "join" in message.lower():
            if group_buys:
                # For demo, join the first available group
                group_id = group_buys[0]["group_id"]
                join_result = self.group_buy_service.join_group_buy(
                    group_id, user_id)

                if join_result["status"] == "success":
                    response = f"""🎉 {join_result['message']}

You're making a real difference:
- CO2 saved: {group_buys[0]['co2_saved']:.1f}kg
- Packaging reduced: {group_buys[0]['packaging_saved']}g
- You're now part of a community making sustainable choices!

We'll notify you when the group buy completes."""
                else:
                    response = join_result["message"]
            else:
                response = "Let me help you start a new group buy! Which product are you interested in?"
        else:
            # Generate general response about available group buys
            response = self.generate_response(message, group_buys)

        return {
            "response": response,
            "group_buys": group_buys,
            "agent": "deal_finder"
        }


# Test the deal finder
if __name__ == "__main__":
    print("💰 Testing Deal Finder Agent\n")

    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Please set OPENAI_API_KEY environment variable")
        exit(1)

    finder = DealFinderAgent()

    test_queries = [
        "Show me available group buys",
        "I want to join a group buy for kitchen items"
    ]

    for query in test_queries:
        print(f"\n👤 User: {query}")
        result = finder.handle_request(
            query, {"user_id": "test_user", "location": "Mumbai"})
        print(f"💰 Deal Finder: {result['response']}")
        if result['group_buys']:
            print(f"   Found {len(result['group_buys'])} group buys")
