# agents/orchestrator.py
"""
Orchestrator Agent - The main coordinator that delegates to specialized agents
"""

from typing import Dict, List, Optional
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
import json
import os
import re

# Try to import Gemini, but make it optional
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    ChatGoogleGenerativeAI = None


class OrchestratorAgent:
    def __init__(self, api_key: Optional[str] = None, provider: Optional[str] = None):
        """Initialize the orchestrator agent
        
        Args:
            api_key: API key for the LLM provider. If None, will use environment variables.
            provider: LLM provider to use. Options: 'openai', 'gemini', or None (auto-detect).
                     If None, will check GEMINI_API_KEY first, then OPENAI_API_KEY.
        """
        # Determine which provider to use
        if provider is None:
            # Auto-detect: prefer Gemini if available and key is set
            if GEMINI_AVAILABLE and os.getenv("GEMINI_API_KEY"):
                provider = "gemini"
            elif os.getenv("OPENAI_API_KEY"):
                provider = "openai"
            else:
                raise ValueError(
                    "No API key found. Set either GEMINI_API_KEY or OPENAI_API_KEY in environment variables")
        else:
            provider = provider.lower()
        
        self.provider = provider
        
        # Initialize the appropriate LLM
        if provider == "gemini":
            if not GEMINI_AVAILABLE:
                raise ImportError(
                    "Gemini support not available. Install langchain-google-genai: pip install langchain-google-genai")
            
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
        elif provider == "openai":
            self.api_key = api_key or os.getenv("OPENAI_API_KEY")
            if not self.api_key:
                raise ValueError(
                    "OPENAI_API_KEY not found in environment variables")
            
            # Initialize OpenAI
            self.llm = ChatOpenAI(
                model="gpt-3.5",
                openai_api_key=self.api_key,
                temperature=0.3
            )
        else:
            raise ValueError(
                f"Unsupported provider: {provider}. Use 'openai' or 'gemini'")

    def analyze_intent(self, message: str) -> Dict:
        """Enhanced intent analysis with better natural language understanding"""
        message_lower = message.lower()
        
        # Greeting patterns
        greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "greetings"]
        if any(greeting in message_lower for greeting in greetings):
            return {
                "intent": "greeting",
                "confidence": 0.95,
                "delegate_to": ["main"],
                "keywords": []
            }
        
        # About/Info patterns
        about_patterns = ["who are you", "what are you", "what is this", "about", "tell me about", "what is greencart"]
        if any(pattern in message_lower for pattern in about_patterns):
            return {
                "intent": "about",
                "confidence": 0.95,
                "delegate_to": ["main"],
                "keywords": []
            }
        
        # Shopping patterns with categories
        shopping_indicators = ["show", "find", "search", "browse", "looking for", "need", "want"]
        categories = ["electronics", "kitchen", "home", "beauty", "clothing"]
        
        if any(indicator in message_lower for indicator in shopping_indicators) or \
           any(category in message_lower for category in categories):
            return {
                "intent": "shopping",
                "confidence": 0.9,
                "delegate_to": ["shopping_assistant"],
                "keywords": self._extract_keywords(message)
            }
        
        # Rest of the existing routing logic...
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
