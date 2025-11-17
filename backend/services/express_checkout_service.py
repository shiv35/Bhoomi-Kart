from typing import Dict, Optional, List, Any
from datetime import datetime
import uuid
from pydantic import BaseModel


class ExpressCheckoutOrder(BaseModel):
    """Express checkout order model"""
    order_id: str
    user_id: str
    items: List[Dict[str, Any]]
    shipping_address: Dict[str, str]
    payment_method: str
    total_amount: float
    total_earth_score: float
    estimated_co2_saved: float
    created_at: datetime
    status: str = "pending"


class ExpressCheckoutService:
    def __init__(self):
        """Initialize express checkout service"""
        # In production, this would connect to a database
        self.orders = {}

    def create_express_order(
        self,
        user_id: str,
        cart_items: List[Dict[str, Any]],
        shipping_address: Dict[str, str],
        payment_method: str = "credit_card"
    ) -> ExpressCheckoutOrder:
        """
        Create an express checkout order
        
        Args:
            user_id: User identifier
            cart_items: List of cart items with product details
            shipping_address: Shipping information
            payment_method: Payment method selected
            
        Returns:
            Created order object
        """
        # Calculate totals
        total_amount = sum(item['price'] * item.get('quantity', 1)
                           for item in cart_items)
        total_earth_score = sum(
            item.get('earth_score', 50) * item.get('quantity', 1)
            for item in cart_items
        ) / len(cart_items) if cart_items else 0

        # Estimate CO2 saved (simplified calculation)
        estimated_co2_saved = (total_earth_score / 100) * len(cart_items) * 2.5

        # Create order
        order = ExpressCheckoutOrder(
            order_id=str(uuid.uuid4()),
            user_id=user_id,
            items=cart_items,
            shipping_address=shipping_address,
            payment_method=payment_method,
            total_amount=total_amount,
            total_earth_score=total_earth_score,
            estimated_co2_saved=estimated_co2_saved,
            created_at=datetime.now(),
            status="confirmed"  # Express checkout auto-confirms
        )

        # Store order
        self.orders[order.order_id] = order

        return order

    def validate_shipping_address(self, address: Dict[str, str]) -> bool:
        """Validate shipping address has required fields"""
        required_fields = ['name', 'street', 'city', 'state', 'pincode']
        return all(field in address and address[field] for field in required_fields)

    def process_payment(
        self,
        amount: float,
        payment_method: str,
        payment_details: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Process payment (mock implementation)
        
        In production, this would integrate with payment gateway
        """
        # Mock payment processing
        return {
            "success": True,
            "transaction_id": str(uuid.uuid4()),
            "amount": amount,
            "method": payment_method,
            "timestamp": datetime.now().isoformat()
        }

    def get_order_summary(self, order_id: str) -> Optional[Dict[str, Any]]:
        """Get order summary by ID"""
        order = self.orders.get(order_id)
        if not order:
            return None

        return {
            "order_id": order.order_id,
            "total": order.total_amount,
            "items_count": len(order.items),
            "earth_score": order.total_earth_score,
            "co2_saved": order.estimated_co2_saved,
            "status": order.status,
            "created_at": order.created_at.isoformat()
        }
