# agents/orchestrator.py
"""
Orchestrator Agent - The main coordinator that delegates to specialized agents
"""

from typing import Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
import json
import os
import re

# Local specialist agents
from .shopping_assistant import ShoppingAssistantAgent
from .checkout_assistant import CheckoutAssistantAgent
from .deal_finder import DealFinderAgent
from .sustainability_advisor import SustainabilityAdvisorAgent


class OrchestratorAgent:
    def __init__(self, api_key: Optional[str] = None, provider: Optional[str] = None):
        """Initialize the orchestrator agent (Gemini-only)."""
        self.provider = "gemini"
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "GEMINI_API_KEY not found in environment variables")

        # Initialize Gemini
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            google_api_key=self.api_key,
            temperature=0.3
        )

        # Lazily created specialist agents so we only instantiate what we need
        self._agents: Dict[str, object] = {}

    def analyze_intent(self, message: str) -> Dict:
        """Enhanced intent analysis with semantic similarity against keyword banks."""
        message_lower = message.lower()

        # Quick rule-based catches for greetings/about to keep latency low
        greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "greetings"]
        if any(greeting in message_lower for greeting in greetings):
            return {
                "intent": "greeting",
                "confidence": 0.95,
                "delegate_to": ["main"],
                "keywords": []
            }

        about_patterns = ["who are you", "what are you", "what is this", "about", "tell me about", "what is greencart"]
        if any(pattern in message_lower for pattern in about_patterns):
            return {
                "intent": "about",
                "confidence": 0.95,
                "delegate_to": ["main"],
                "keywords": []
            }

        # Semantic keyword banks per intent
        intent_keywords = {
            "shopping": [
                "show", "find", "search", "browse", "looking for", "need", "want",
                "electronics", "kitchen", "home", "beauty", "clothing", "product", "item"
            ],
            "sustainability_query": [
                "sustainability", "earthscore", "eco", "eco-friendly", "green", "environment",
                "carbon", "impact", "co2", "footprint"
            ],
            "checkout": [
                "checkout", "buy", "purchase", "pay", "order", "payment"
            ],
            "cart": [
                "cart", "basket", "my order", "add to cart", "view cart"
            ],
            "deal": [
                "deal", "group buy", "bulk", "discount", "save together", "join group"
            ]
        }

        matched_intent, score = self._semantic_match(message_lower, intent_keywords)

        if matched_intent == "shopping":
            return {
                "intent": "shopping",
                "confidence": score,
                "delegate_to": ["shopping_assistant"],
                "keywords": self._extract_keywords(message)
            }

        if matched_intent == "sustainability_query":
            return {
                "intent": "sustainability_query",
                "confidence": score,
                "delegate_to": ["sustainability_advisor"],
                "keywords": self._extract_keywords(message)
            }

        if matched_intent == "checkout":
            return {
                "intent": "checkout",
                "confidence": score,
                "delegate_to": ["checkout_assistant"],
                "keywords": self._extract_keywords(message)
            }

        if matched_intent == "cart":
            # If it's clearly an add, send to shopping; else checkout assistant to view
            delegate = "shopping_assistant" if "add" in message_lower or "put" in message_lower else "checkout_assistant"
            return {
                "intent": "add_to_cart" if delegate == "shopping_assistant" else "view_cart",
                "confidence": score,
                "delegate_to": [delegate],
                "keywords": self._extract_keywords(message)
            }

        if matched_intent == "deal":
            return {
                "intent": "deal_finder",
                "confidence": score,
                "delegate_to": ["deal_finder"],
                "keywords": self._extract_keywords(message)
            }

        # Fallback to existing logic and finally default general query
        return self._existing_routing_logic(message)

    def _extract_keywords(self, message: str) -> List[str]:
        """Extract keywords from the user's message"""
        # A simple implementation: extract nouns and adjectives.
        # For a more robust solution, consider using a library like NLTK or spaCy.
        words = re.findall(r'\b\w+\b', message.lower())
        # Filter out common stop words
        stop_words = set(["a", "an", "the", "in", "on", "for", "with", "is", "are", "of", "to", "show", "me", "find", "search", "browse", "looking", "need", "want"])
        return [word for word in words if word not in stop_words]

    def _existing_routing_logic(self, message: str) -> Dict:
        """Handle other routing scenarios"""
        message_lower = message.lower()
        
        # Sustainability query
        sustainability_keywords = ["sustainability", "earthscore", "eco-friendly", "green", "environment"]
        if any(keyword in message_lower for keyword in sustainability_keywords):
            return {
                "intent": "sustainability_query",
                "confidence": 0.9,
                "delegate_to": ["sustainability_advisor"],
                "keywords": self._extract_keywords(message)
            }
            
        # Cart management
        cart_keywords = ["cart", "basket", "my order"]
        if any(keyword in message_lower for keyword in cart_keywords):  
            if "add" in message_lower or "put" in message_lower:
                return {
                    "intent": "add_to_cart",
                    "confidence": 0.9,
                    "delegate_to": ["shopping_assistant"],
                    "keywords": self._extract_keywords(message)
                }
            return {
                "intent": "view_cart",
                "confidence": 0.9,
                "delegate_to": ["checkout_assistant"],
                "keywords": []
            }
            
        # Checkout
        checkout_keywords = ["checkout", "buy", "purchase", "pay"]
        if any(keyword in message_lower for keyword in checkout_keywords):
            return {
                "intent": "checkout",
                "confidence": 0.9,
                "delegate_to": ["checkout_assistant"],
                "keywords": self._extract_keywords(message)
            }
            
        # Default to main agent
        return {
            "intent": "general_query",
            "confidence": 0.7,
            "delegate_to": ["main"],
            "keywords": []
        }

    def _semantic_match(self, message_lower: str, keyword_banks: Dict[str, List[str]]) -> (str, float):
        """
        Lightweight semantic-ish matching using normalized token overlap and fuzzy ratio.
        Avoids extra API calls; good enough for routing.
        """
        from difflib import SequenceMatcher

        best_intent = None
        best_score = 0.0

        for intent, keywords in keyword_banks.items():
            for kw in keywords:
                # Exact/substring boost
                if kw in message_lower:
                    score = 0.9
                else:
                    # Fuzzy similarity
                    score = SequenceMatcher(None, kw, message_lower).ratio()
                if score > best_score:
                    best_score = score
                    best_intent = intent

        return best_intent, round(best_score, 2)

    def route_message(self, user_message: str, user_state: Dict) -> Dict:
        """Route the message to appropriate specialist agent(s)"""

        # Analyze intent
        routing = self.analyze_intent(
            user_message
        )

        # Log routing decision
        print(f"🧭 Orchestrator routing: {routing}")

        # Return routing information
        return {
            "routing": routing,
            "user_message": user_message,
            "user_id": user_state.get("user_id", "anonymous")
        }

    # === New high-level entry point used by chat UI ===
    def handle_chat(
        self,
        user_message: str,
        user_state: Optional[Dict] = None,
        products_df=None,
    ) -> Dict:
        """
        Single entry point for chat requests.
        - Routes user intent
        - Delegates to specialist agent
        - Returns the final response payload expected by the chat UI
        """
        user_state = user_state or {}
        routing_info = self.route_message(user_message, user_state)
        delegate_to = routing_info["routing"]["delegate_to"][0]

        try:
            if delegate_to == "shopping_assistant":
                if products_df is None:
                    return {
                        "response": "I need product data to search. Please try again.",
                        "agent": "orchestrator",
                    }
                agent = self._get_agent("shopping_assistant")
                result = agent.handle_request(user_message, products_df, user_state)
            elif delegate_to == "checkout_assistant":
                agent = self._get_agent("checkout_assistant")
                result = agent.handle_request(user_message, user_state)
            elif delegate_to == "deal_finder":
                agent = self._get_agent("deal_finder")
                result = agent.handle_request(user_message, user_state)
            elif delegate_to == "sustainability_advisor":
                agent = self._get_agent("sustainability_advisor")
                result = agent.handle_request(user_message, user_state)
            else:
                # Fallback simple response handled by orchestrator's LLM
                result = {
                    "response": self._generate_general_reply(user_message),
                    "agent": "orchestrator",
                }
        except Exception as exc:
            # Defensive: never break the chat UI; surface a helpful error
            result = {
                "response": f"Sorry, something went wrong while handling your request: {exc}",
                "agent": "orchestrator",
                "error": True,
            }

        # Attach routing meta so the UI can debug/trace
        result["routing"] = routing_info["routing"]
        result["user_message"] = user_message
        result["user_id"] = routing_info["user_id"]
        return result

    def _get_agent(self, name: str):
        """Create or return cached specialist agent."""
        if name in self._agents:
            return self._agents[name]

        if name == "shopping_assistant":
            self._agents[name] = ShoppingAssistantAgent(api_key=self.api_key)
        elif name == "checkout_assistant":
            self._agents[name] = CheckoutAssistantAgent(api_key=self.api_key)
        elif name == "deal_finder":
            self._agents[name] = DealFinderAgent(api_key=self.api_key)
        elif name == "sustainability_advisor":
            self._agents[name] = SustainabilityAdvisorAgent(api_key=self.api_key)
        else:
            raise ValueError(f"Unknown agent '{name}'")

        return self._agents[name]

    def _generate_general_reply(self, user_message: str) -> str:
        """Use orchestrator LLM to craft a polite fallback reply."""
        messages = [
            SystemMessage(
                content="You are Bhoomi Kart's friendly assistant. Be concise and helpful."
            ),
            HumanMessage(content=user_message),
        ]
        response = self.llm.invoke(messages)
        return response.content
