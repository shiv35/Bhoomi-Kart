# agent.py
"""
Main GreenCart Agent - Integrates all specialist agents
"""

from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage, SystemMessage
from langchain_core.tools import Tool
from pydantic.v1 import BaseModel, Field
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List, Union, Optional, Dict
import operator
import os
import json
import pandas as pd
from dotenv import load_dotenv

# Import agent tools and services
from agent_tools import (
    implement_search_by_category,
    implement_get_details,
    implement_add_to_cart,
    implement_view_cart
)

# Import all specialist agents
from agents.orchestrator import OrchestratorAgent
from agents.shopping_assistant import ShoppingAssistantAgent
from agents.sustainability_advisor import SustainabilityAdvisorAgent
from agents.deal_finder import DealFinderAgent
from agents.checkout_assistant import CheckoutAssistantAgent

# Import services
from services.cart_service import CartService
from services.group_buy_service import GroupBuyService

load_dotenv()

# Tool schemas


class SearchCategoryArgs(BaseModel):
    category: str = Field(description="The product category to search for")


class GetDetailsArgs(BaseModel):
    product_name: str = Field(
        description="The name of the product to get details for")


class AddToCartArgs(BaseModel):
    product_name: str = Field(description="The name of the product to add")
    quantity: int = Field(description="The quantity to add", default=1)


class ViewCartArgs(BaseModel):
    pass


# Define tools
tools = [
    Tool(
        name="search_products_by_category",
        description="Search for products in a specific category",
        args_schema=SearchCategoryArgs,
        func=lambda category: None
    ),
    Tool(
        name="get_product_details",
        description="Get detailed information about a product",
        args_schema=GetDetailsArgs,
        func=lambda product_name: None
    ),
    Tool(
        name="add_to_cart",
        description="Add a product to the shopping cart",
        args_schema=AddToCartArgs,
        func=lambda product_name, quantity: None
    ),
    Tool(
        name="view_cart",
        description="View the current shopping cart contents",
        args_schema=ViewCartArgs,
        func=lambda: None
    ),
]

# Agent state


class AgentState(TypedDict):
    messages: Annotated[List[Union[HumanMessage,
                                   AIMessage, ToolMessage]], operator.add]
    user_info: dict
    products_df: object
    current_agent: Optional[str]
    routing_info: Optional[dict]
    specialist_agents: dict

# Initialize specialist agents


def initialize_agents(provider: Optional[str] = None):
    """Initialize all specialist agents
    
    Args:
        provider: LLM provider to use for agents. Options: 'openai', 'gemini', or None (auto-detect).
                 If None, will check environment variable ORCHESTRATOR_PROVIDER, then auto-detect.
                 This provider will be used for orchestrator and shopping_assistant.
    """
    # Check for provider in environment variable if not provided
    if provider is None:
        provider = os.getenv("ORCHESTRATOR_PROVIDER", None)
    
    return {
        "orchestrator": OrchestratorAgent(provider=provider),
        "shopping_assistant": ShoppingAssistantAgent(provider=provider),
        "sustainability_advisor": SustainabilityAdvisorAgent(),
        "deal_finder": DealFinderAgent(),
        "checkout_assistant": CheckoutAssistantAgent(),
        "cart_service": CartService(),
        "group_buy_service": GroupBuyService()
    }


def orchestrator_node(state: AgentState):
    """Orchestrator decides which agent should handle the request"""
    print("--- ORCHESTRATOR NODE ---")

    # Get the last user message
    last_message = state["messages"][-1]

    if isinstance(last_message, HumanMessage):
        # Route the message
        orchestrator = state["specialist_agents"]["orchestrator"]
        routing = orchestrator.route_message(
            last_message.content,
            {"user_id": state["user_info"]["user_id"]}
        )

        # Update state with routing info
        state["routing_info"] = routing["routing"]
        state["current_agent"] = routing["routing"]["delegate_to"][0]

        return {"routing_info": routing["routing"], "current_agent": routing["routing"]["delegate_to"][0]}

    return {}


def agent_node(state: AgentState, llm):
    """Main agent node that can use tools or delegate to specialists"""
    print(
        f"--- AGENT NODE (Current: {state.get('current_agent', 'main')}) ---")

    current_agent = state.get("current_agent", "main")

    # Handle general queries and greetings
    if current_agent == "main":
        last_message = state["messages"][-1]
        message_lower = last_message.content.lower()
        
        # Handle greetings and general queries
        if any(greeting in message_lower for greeting in ["hello", "hi", "hey", "good morning", "good afternoon"]):
            response_text = """Hello! 👋 Welcome to GreenCart!

I'm your AI-powered sustainable shopping assistant. I'm here to help you:
- 🛍️ Find eco-friendly products
- 🌍 Calculate environmental impact
- 💚 Make sustainable shopping choices
- 👥 Join group buys to save money and reduce packaging

How can I help you shop sustainably today?"""
            return {"messages": [AIMessage(content=response_text)]}
        
        elif any(phrase in message_lower for phrase in ["who are you", "what are you", "tell me about yourself"]):
            response_text = """I'm the GreenCart Assistant! 🌱

I'm an AI-powered shopping companion designed to help you make environmentally conscious purchasing decisions. I can:

✅ Search for products by category (electronics, kitchen, home, beauty, clothing)
✅ Show you each product's EarthScore (0-100 sustainability rating)
✅ Help you find group buying opportunities
✅ Calculate your environmental impact
✅ Suggest greener alternatives

I'm here to make sustainable shopping easy and rewarding! What would you like to explore?"""
            return {"messages": [AIMessage(content=response_text)]}
        
        elif any(phrase in message_lower for phrase in ["what is this store", "what is greencart", "about this store", "what do you sell"]):
            response_text = """Welcome to GreenCart - Your Sustainable Shopping Destination! 🌍

**What makes us special:**

🏆 **EarthScore System**: Every product is rated 0-100 based on:
   • Carbon footprint
   • Recyclability
   • Durability
   • Ethical sourcing
   • Transport distance

📦 **Product Categories**: We offer sustainable alternatives in:
   • Electronics - Eco-friendly gadgets
   • Kitchen - Sustainable kitchenware
   • Home - Green home essentials
   • Beauty - Natural beauty products
   • Clothing - Sustainable fashion

👥 **Group Buying**: Join neighbors to:
   • Reduce packaging by up to 60%
   • Save 15-30% on costs
   • Lower carbon emissions

🎮 **Gamification**: Earn points, unlock achievements, and compete on our leaderboard!

Would you like to browse a specific category or learn more about our EarthScore system?"""
            return {"messages": [AIMessage(content=response_text)]}

    # Otherwise, delegate to specialist agent
    if current_agent in state["specialist_agents"]:
        specialist = state["specialist_agents"][current_agent]
        last_message = state["messages"][-1]

        # Get response from specialist
        if current_agent == "shopping_assistant":
            result = specialist.handle_request(
                last_message.content,
                state["products_df"],
                {"user_id": state["user_info"]["user_id"]}
            )
        elif current_agent == "checkout_assistant":
            result = specialist.handle_request(
                last_message.content,
                {"user_id": state["user_info"]["user_id"]}
            )
        else:
            result = specialist.handle_request(
                last_message.content,
                {"user_id": state["user_info"]["user_id"]}
            )

        # Format response with agent indicator
        agent_emoji = {
            "shopping_assistant": "🛍️",
            "sustainability_advisor": "🌱",
            "deal_finder": "💰",
            "checkout_assistant": "🛒"
        }.get(current_agent, "🤖")

        formatted_response = f"{agent_emoji} **{current_agent.replace('_', ' ').title()}**:\n\n{result['response']}"

        # If products were found, add them to response
        if "products" in result and result["products"]:
            formatted_response += "\n\n📦 **Found Products:**\n"
            for product in result["products"]:
                formatted_response += f"- {product['product_name']} - ${product['price']:.2f} (EarthScore: {product.get('earth_score', 'N/A')})\n"

        return {"messages": [AIMessage(content=formatted_response)]}

    # Fallback to main agent
    response = llm.invoke(state["messages"])
    return {"messages": [response]}


def tool_node(state: AgentState):
    """Execute tools when needed"""
    print("--- TOOL NODE ---")

    last_message = state["messages"][-1]
    if not hasattr(last_message, 'tool_calls') or not last_message.tool_calls:
        return {}

    tool_call = last_message.tool_calls[0]
    tool_name = tool_call["name"]

    # Map tools to implementations
    func_map = {
        "search_products_by_category": implement_search_by_category,
        "get_product_details": implement_get_details,
        "add_to_cart": implement_add_to_cart,
        "view_cart": implement_view_cart,
    }

    selected_func = func_map.get(tool_name)
    if not selected_func:
        raise ValueError(f"Tool {tool_name} not found")

    # Prepare arguments
    tool_args = tool_call["args"].copy()
    if tool_name in ["search_products_by_category", "get_product_details"]:
        tool_args['products_df'] = state['products_df']
    elif tool_name == 'add_to_cart':
        tool_args['user_id'] = state['user_info']['user_id']
        tool_args['products_df'] = state['products_df']
    elif tool_name == 'view_cart':
        tool_args['user_id'] = state['user_info']['user_id']

    # Execute tool
    tool_output = selected_func(**tool_args)

    return {"messages": [ToolMessage(content=str(tool_output), tool_call_id=tool_call["id"])]}


def should_continue(state: AgentState):
    """Decide next step in the graph"""
    messages = state.get("messages", [])
    if not messages:
        return END

    last_message = messages[-1]

    # If it's a human message, go to orchestrator
    if isinstance(last_message, HumanMessage):
        return "orchestrator"

    # If agent wants to use tools
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "use_tool"

    # Otherwise end
    return END


def create_agent_graph():
    """Create the enhanced agent graph with orchestrator"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in .env file.")

    # System prompt for main agent
    system_prompt = """You are GreenCart's main assistant. You coordinate with specialist agents and use tools when needed.

When you need to:
- Search for products: Use the search tool
- Add items to cart: Use the add_to_cart tool
- View cart: Use the view_cart tool

Always be helpful and guide users toward sustainable choices."""

    llm = ChatOpenAI(
        model="gpt-4",
        openai_api_key=api_key,
        temperature=0.7
    )

    # Initialize graph
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("orchestrator", orchestrator_node)
    graph.add_node("agent", lambda state: agent_node(state, llm))
    graph.add_node("use_tool", tool_node)

    # Set entry point
    graph.set_entry_point("orchestrator")

    # Add edges
    graph.add_conditional_edges(
        "orchestrator",
        lambda x: "agent",
        {"agent": "agent"}
    )

    graph.add_conditional_edges(
        "agent",
        should_continue,
        {
            "orchestrator": "orchestrator",
            "use_tool": "use_tool",
            END: END
        }
    )

    graph.add_edge("use_tool", "agent")

    # Compile
    agent = graph.compile()
    print("--- Enhanced GreenCart Agent Compiled Successfully ---")

    return agent

# Initialize the agent with specialist agents


def create_greencart_agent():
    """Create the full GreenCart agent with all specialists"""
    agent_graph = create_agent_graph()
    specialist_agents = initialize_agents()

    # Wrapper to inject specialist agents into state
    def agent_with_specialists(state):
        state["specialist_agents"] = specialist_agents
        return agent_graph.invoke(state)

    return agent_with_specialists
