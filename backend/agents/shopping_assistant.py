# agents/shopping_assistant.py
"""
Shopping Assistant Agent - Handles product searches and recommendations
"""
from services.filter_service import ProductFilterService
from utils.message_templates import MessageTemplates
from typing import Dict, List, Optional
import json
import pandas as pd
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
import os


class ShoppingAssistantAgent:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the shopping assistant agent"""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

        if not self.api_key:
            raise ValueError(
                "OPENAI_API_KEY not found in environment variables")

        self.llm = ChatOpenAI(
            model="gpt-4",
            openai_api_key=self.api_key,
            temperature=0.3
        )

    def search_products(self, query: str, products_df: pd.DataFrame,
                        filters: Optional[Dict] = None) -> List[Dict]:
        """Enhanced search with category support and natural language processing"""
        
        # If filters are provided, use them
        if filters:
            filter_service = ProductFilterService(products_df)
            return filter_service.filter_products(**filters)
        
        # Category mapping for natural language
        category_keywords = {
            'electronics': ['electronics', 'gadget', 'device', 'tech', 'computer', 'phone', 'electronic'],
            'kitchen': ['kitchen', 'cooking', 'utensil', 'cookware', 'food', 'dining'],
            'home': ['home', 'furniture', 'decor', 'household', 'living'],
            'beauty': ['beauty', 'cosmetic', 'skincare', 'makeup', 'personal care'],
            'clothing': ['clothing', 'clothes', 'fashion', 'apparel', 'wear', 'outfit']
        }
        
        # Check if query is asking for a specific category
        query_lower = query.lower()
        detected_category = None
        
        for category, keywords in category_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                detected_category = category
                break
        
        # If category detected, filter by category
        if detected_category:
            results = products_df[products_df['category'] == detected_category]
            
            # If query also contains eco/sustainable, filter by high EarthScore
            if any(word in query_lower for word in ['eco', 'sustainable', 'green', 'eco-friendly']):
                if 'earth_score' in results.columns:
                    results = results[results['earth_score'] >= 70]
            
            # Sort by earth_score
            if 'earth_score' in results.columns:
                results = results.sort_values('earth_score', ascending=False)
            
            return results.head(10).to_dict('records')
        
        # Original eco-keyword search
        eco_keywords = ['eco', 'sustainable', 'green', 'eco-friendly', 'environmental']
        if any(keyword in query_lower for keyword in eco_keywords):
            if 'earth_score' in products_df.columns:
                results = products_df[products_df['earth_score'] >= 70]
                results = results.sort_values('earth_score', ascending=False)
                return results.head(10).to_dict('records')
        
        # General search
        stop_words = {
            'i', 'want', 'need', 'show', 'me', 'the', 'a', 'an', 'for',
            'to', 'buy', 'products', 'items', 'find', 'looking', 'search',
            'please', 'can', 'you', 'help'
        }
        
        words = query_lower.split()
        search_words = [word for word in words if word not in stop_words and len(word) > 2]
        
        if not search_words:
            # Return top rated products if no specific search terms
            if 'earth_score' in products_df.columns:
                return products_df.nlargest(10, 'earth_score').to_dict('records')
            return products_df.head(10).to_dict('records')
        
        # Search in product names and categories
        search_pattern = '|'.join(search_words)
        mask = (
            products_df['product_name'].str.contains(search_pattern, case=False, na=False, regex=True) |
            products_df['category'].str.contains(search_pattern, case=False, na=False, regex=True)
        )
        
        results = products_df[mask]
        
        if results.empty:
            # If no results, return top products
            if 'earth_score' in products_df.columns:
                return products_df.nlargest(10, 'earth_score').to_dict('records')
            return products_df.head(10).to_dict('records')
        
        # Sort by earth_score if available
        if 'earth_score' in results.columns:
            results = results.sort_values('earth_score', ascending=False)
        
        return results.head(10).to_dict('records')

    def generate_response(self, query: str, products: List[Dict], 
                         user_context: Optional[Dict] = None) -> str:
        """Generate natural language response about products"""
        
        if not products:
            return """I couldn't find specific products matching your search. 
            
You can try browsing by category:
• Electronics - Eco-friendly gadgets and devices
• Kitchen - Sustainable cooking and dining products  
• Home - Green home essentials
• Beauty - Natural beauty and personal care
• Clothing - Sustainable fashion

Or ask me to show you our highest-rated eco-friendly products!"""
        
        # Check if this is a category search
        query_lower = query.lower()
        category_search = any(cat in query_lower for cat in ['electronics', 'kitchen', 'home', 'beauty', 'clothing'])
        
        if category_search:
            category = products[0].get('category', 'products')
            response = f"Here are the best {category} products I found:\n\n"
        else:
            response = "I found these sustainable products for you:\n\n"
        
        # Add product details with better formatting
        for i, product in enumerate(products[:5], 1):
            earth_score = product.get('earth_score', 'N/A')
            
            # Add emoji based on earth score
            if isinstance(earth_score, (int, float)):
                if earth_score >= 80:
                    emoji = "🌟"
                elif earth_score >= 60:
                    emoji = "✅"
                else:
                    emoji = "⭕"
            else:
                emoji = "📦"
            
            response += f"{i}. {emoji} **{product['product_name']}** - ${product['price']:.2f} (EarthScore: {earth_score}/100)\n"
        
        # Add helpful suggestions based on what they searched
        if 'eco' in query_lower or 'sustainable' in query_lower:
            response += "\n💚 These products have been selected for their high sustainability ratings!"
        elif category_search:
            response += f"\n📦 These are our top-rated {category} products based on EarthScore."
        
        response += "\n\nWould you like to:"
        response += "\n• See more details about any product"
        response += "\n• Add items to your cart"
        response += "\n• Learn about group buying options"
        response += "\n• Browse a different category"
        
        return response

    def handle_request(self, message: str, products_df: pd.DataFrame,
                       user_context: Optional[Dict] = None) -> Dict:
        """Handle a shopping request with enhanced filtering"""

        # Check for specific product requests
        if "add" in message.lower() and "cart" in message.lower():
            # This should be handled by main agent
            return {
                "response": "I'll help you add that to your cart. Please use the 'Add to Cart' function.",
                "products": [],
                "needs_cart_action": True,
                "agent": "shopping_assistant"
            }

        # Initialize filter service
        filter_service = ProductFilterService(products_df)

        # Parse the query for filters
        filters = filter_service.parse_filter_query(message)

        # If filters were detected, use the filter service
        if filters:
            products = filter_service.filter_products(**filters)

            # Get contextual message based on filters
            context_message = MessageTemplates.get_filter_message(
                category=filters.get('category'),
                score=filters.get('earth_score_min')
            )

            # Generate response with filtered products
            if products:
                response = f"{context_message}\n\n"

                # Add product details
                for i, product in enumerate(products[:5], 1):
                    earth_score = product.get('earth_score', 'N/A')

                    # Add emoji based on earth score
                    if isinstance(earth_score, (int, float)):
                        if earth_score >= 80:
                            emoji = "🌟"
                        elif earth_score >= 60:
                            emoji = "✅"
                        else:
                            emoji = "⭕"
                    else:
                        emoji = "📦"

                    response += f"{i}. {emoji} **{product['product_name']}** - ${product['price']:.2f} (EarthScore: {earth_score}/100)\n"

                # Add action suggestions
                response += "\n\nWould you like to:"
                response += "\n• See more details about any product"
                response += "\n• Add items to your cart"
                response += "\n• Filter by a different EarthScore range"
                response += "\n• Browse a different category"
            else:
                response = f"No products found with those filters. Try adjusting your criteria!"
        else:
            # Use the existing search logic for non-filter queries
            products = self.search_products(message, products_df)
            response = self.generate_response(message, products, user_context)

        return {
            "response": response,
            "products": products,
            "agent": "shopping_assistant",
            "filters_applied": filters if filters else None
        }
