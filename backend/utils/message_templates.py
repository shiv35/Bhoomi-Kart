import random
from typing import Dict, List, Optional


class MessageTemplates:
    """Contextual message templates for the chatbot"""

    # Greeting messages
    GREETINGS = [
        "🌱 Welcome to GreenCart! I'm here to help you shop sustainably.",
        "👋 Hello eco-warrior! Ready to make a positive impact today?",
        "🌍 Hi there! Let's find some earth-friendly products together."
    ]

    # Filter acknowledgments
    FILTER_MESSAGES = {
        'high_score': [
            "Excellent choice! Here are products with EarthScore above {score} 🌟",
            "Great thinking! Showing our most sustainable {category} options 🌿",
            "You're making a difference! Here are top-rated eco-friendly products 🌍"
        ],
        'category': [
            "Looking for sustainable {category} products? Here are our best options! 🛍️",
            "Great choice! Our {category} selection includes these eco-champions 🌱",
            "Here are some amazing {category} products for conscious shoppers like you! ✨"
        ],
        'combined': [
            "Perfect! Here are {category} products with EarthScore above {score} 🎯",
            "You've got great standards! Showing {category} items rated {score}+ 🌟",
            "Eco-excellence found! These {category} products score {score} or higher 🏆"
        ]
    }

    # Product selection messages
    PRODUCT_SELECTED = [
        "Excellent pick! This product has an EarthScore of {score}/100 🌿",
        "Great choice! You'll save approximately {co2_saved}kg of CO2 with this item 🌍",
        "Wonderful selection! This sustainable choice makes a real difference 💚"
    ]

    # Cart messages
    CART_MESSAGES = [
        "✅ Added to your eco-cart! Your sustainable shopping journey continues.",
        "🛒 In your cart! Together, we're making shopping more sustainable.",
        "💚 Successfully added! Every green choice counts."
    ]

    # Express checkout messages
    EXPRESS_CHECKOUT = [
        "🚀 Let's complete your eco-friendly purchase quickly!",
        "⚡ Express checkout activated! Just a few steps to sustainability.",
        "🎯 Fast-track to making a difference! Let's checkout."
    ]

    @staticmethod
    def get_greeting() -> str:
        """Get a random greeting message"""
        return random.choice(MessageTemplates.GREETINGS)

    @staticmethod
    def get_filter_message(
        category: Optional[str] = None,
        score: Optional[int] = None
    ) -> str:
        """Get appropriate filter acknowledgment message"""
        if category and score:
            template = random.choice(
                MessageTemplates.FILTER_MESSAGES['combined'])
            return template.format(category=category.title(), score=score)
        elif score and score >= 60:
            template = random.choice(
                MessageTemplates.FILTER_MESSAGES['high_score'])
            return template.format(score=score, category=category.title() if category else "products")
        elif category:
            template = random.choice(
                MessageTemplates.FILTER_MESSAGES['category'])
            return template.format(category=category.title())
        else:
            return "Here are some sustainable products for you! 🌱"

    @staticmethod
    def get_product_selected_message(earth_score: int, co2_saved: float = 0) -> str:
        """Get product selection message"""
        if co2_saved > 0:
            template = MessageTemplates.PRODUCT_SELECTED[1]
            return template.format(co2_saved=round(co2_saved, 2))
        else:
            template = MessageTemplates.PRODUCT_SELECTED[0]
            return template.format(score=earth_score)
