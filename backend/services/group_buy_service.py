# services/group_buy_service.py
"""
Group Buy Service - Manages group buying opportunities to reduce packaging and shipping
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import random


class GroupBuyService:
    def __init__(self):
        """Initialize group buy service"""
        # In production, this would use a database
        self.active_groups = {}
        self.user_groups = {}

    def create_group_buy(self, product_id: int, initiator_user_id: str,
                         location: str, target_size: int = 5) -> Dict:
        """Create a new group buy opportunity"""
        group_id = f"GB_{product_id}_{int(datetime.now().timestamp())}"

        group = {
            "group_id": group_id,
            "product_id": product_id,
            "initiator": initiator_user_id,
            "location": location,
            "members": [initiator_user_id],
            "target_size": target_size,
            "current_size": 1,
            "status": "open",
            "created_at": datetime.now().isoformat(),
            "expires_at": (datetime.now() + timedelta(days=3)).isoformat(),
            "savings": {
                "packaging_reduction": "40%",
                "shipping_reduction": "35%",
                "co2_saved_kg": 2.5
            }
        }

        self.active_groups[group_id] = group

        # Track user's groups
        if initiator_user_id not in self.user_groups:
            self.user_groups[initiator_user_id] = []
        self.user_groups[initiator_user_id].append(group_id)

        return {
            "status": "success",
            "message": "Group buy created successfully",
            "group": group
        }

    def join_group_buy(self, group_id: str, user_id: str) -> Dict:
        """Join an existing group buy"""
        if group_id not in self.active_groups:
            return {"status": "error", "message": "Group buy not found"}

        group = self.active_groups[group_id]

        if user_id in group["members"]:
            return {"status": "error", "message": "Already a member of this group"}

        if group["status"] != "open":
            return {"status": "error", "message": "Group buy is closed"}

        # Add member
        group["members"].append(user_id)
        group["current_size"] += 1

        # Track user's groups
        if user_id not in self.user_groups:
            self.user_groups[user_id] = []
        self.user_groups[user_id].append(group_id)

        # Check if group is complete
        if group["current_size"] >= group["target_size"]:
            group["status"] = "complete"
            return {
                "status": "success",
                "message": "Group buy completed! 🎉 Orders will be bundled for eco-friendly shipping.",
                "group": group
            }

        return {
            "status": "success",
            "message": f"Joined group buy! {group['target_size'] - group['current_size']} more members needed.",
            "group": group
        }

    def find_nearby_groups(self, product_id: int, user_location: str) -> List[Dict]:
        """Find group buys near user's location"""
        nearby_groups = []

        for group_id, group in self.active_groups.items():
            if (group["product_id"] == product_id and
                group["status"] == "open" and
                    group["location"] == user_location):  # Simplified location matching
                nearby_groups.append(group)

        return nearby_groups

    def get_user_groups(self, user_id: str) -> List[Dict]:
        """Get all group buys a user is part of"""
        if user_id not in self.user_groups:
            return []

        user_group_list = []
        for group_id in self.user_groups[user_id]:
            if group_id in self.active_groups:
                user_group_list.append(self.active_groups[group_id])

        return user_group_list

    def calculate_group_impact(self, group_id: str) -> Dict:
        """Calculate environmental impact of a group buy"""
        if group_id not in self.active_groups:
            return {"error": "Group not found"}

        group = self.active_groups[group_id]
        members = group["current_size"]

        # Calculate savings (simplified)
        individual_packaging = members * 100  # grams
        group_packaging = 150  # grams for group
        packaging_saved = individual_packaging - group_packaging

        individual_shipping_co2 = members * 0.5  # kg CO2
        group_shipping_co2 = 0.8  # kg CO2 for group
        co2_saved = individual_shipping_co2 - group_shipping_co2

        return {
            "packaging_saved_grams": packaging_saved,
            "co2_saved_kg": round(co2_saved, 2),
            # 1 tree absorbs ~20kg CO2/year
            "trees_equivalent": round(co2_saved / 20, 2),
            "cost_savings_percent": 15
        }


# Test the service
if __name__ == "__main__":
    print("🤝 Testing Group Buy Service\n")

    service = GroupBuyService()

    # Create a group buy
    result = service.create_group_buy(
        product_id=123,
        initiator_user_id="user1",
        location="Mumbai",
        target_size=3
    )
    print(f"Create group: {json.dumps(result, indent=2)}\n")

    # Join the group
    group_id = result["group"]["group_id"]
    join_result = service.join_group_buy(group_id, "user2")
    print(f"User2 joins: {json.dumps(join_result, indent=2)}\n")

    # Calculate impact
    impact = service.calculate_group_impact(group_id)
    print(f"Group impact: {json.dumps(impact, indent=2)}")
