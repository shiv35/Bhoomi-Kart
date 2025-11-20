# agents/sustainability_advisor.py
"""
Sustainability Advisor Agent - Provides environmental impact insights and education
"""

from typing import Dict, List, Optional
import json
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
import os


class SustainabilityAdvisorAgent:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the sustainability advisor agent"""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

        if not self.api_key:
            raise ValueError(
                "OPENAI_API_KEY not found in environment variables")

        self.system_instruction = """You are the GreenCart Sustainability Advisor, an expert in environmental impact and sustainable living.

Your expertise includes:
- Explaining EarthScores and how they're calculated
- Providing environmental impact comparisons
- Offering eco-friendly tips and alternatives
- Educating about carbon footprints, recycling, and sustainability
- Motivating users with positive environmental impact statistics

Your personality:
- Knowledgeable but approachable
- Encouraging and positive about small changes
- Use simple analogies to explain complex concepts
- Celebrate sustainable choices

Always provide accurate information and help users understand the real impact of their choices."""

        self.llm = ChatOpenAI(
            model="gpt-4",
            openai_api_key=self.api_key,
            temperature=0.3
        )

        # Knowledge base of sustainability facts
        self.sustainability_facts = {
            "plastic_bottles": {
                "impact": "One plastic bottle takes 450 years to decompose",
                "alternative": "A reusable bottle can save 1,460 plastic bottles per year",
                "co2_saved": "3.5 kg CO2 per year with reusable bottle"
            },
            "bamboo": {
                "benefit": "Bamboo grows 3 feet in 24 hours and produces 35% more oxygen than trees",
                "impact": "Choosing bamboo products can reduce deforestation",
                "earth_score_boost": "+15 points for bamboo material"
            },
            "organic_cotton": {
                "water_saved": "Saves 1,800 gallons of water vs conventional cotton",
                "pesticide_free": "No harmful pesticides that damage ecosystems",
                "earth_score_boost": "+20 points for organic certification"
            }
        }

    def calculate_impact_comparison(self, product_type: str, sustainable_choice: bool) -> Dict:
        """Calculate environmental impact comparison"""

        impacts = {
            "water_bottle": {
                "regular": {"co2_kg": 82.8, "waste_kg": 8.5, "years_to_decompose": 450},
                "sustainable": {"co2_kg": 2.1, "waste_kg": 0, "years_to_decompose": 0}
            },
            "shopping_bag": {
                "regular": {"co2_kg": 33, "waste_kg": 5.5, "years_to_decompose": 20},
                "sustainable": {"co2_kg": 0.5, "waste_kg": 0, "years_to_decompose": 0}
            }
        }

        default_impact = {
            "regular": {"co2_kg": 10, "waste_kg": 2, "years_to_decompose": 50},
            "sustainable": {"co2_kg": 2, "waste_kg": 0.2, "years_to_decompose": 1}
        }

        impact_data = impacts.get(product_type, default_impact)
        choice = "sustainable" if sustainable_choice else "regular"

        return impact_data[choice]

    def explain_earth_score(self, score: int) -> str:
        """Explain what an EarthScore means"""

        if score >= 90:
            level = "Excellent"
            message = "This product is among the most sustainable choices available! 🌟"
        elif score >= 75:
            level = "Very Good"
            message = "A great eco-friendly choice that makes a real difference! 🌱"
        elif score >= 60:
            level = "Good"
            message = "A solid sustainable option with positive environmental impact. 👍"
        elif score >= 45:
            level = "Fair"
            message = "Some sustainable features, but room for improvement. 🤔"
        else:
            level = "Needs Improvement"
            message = "Consider more eco-friendly alternatives when possible. 💡"

        explanation = f"""EarthScore {score}/100 - {level}

{message}

This score considers:
- Carbon footprint (30%) - Manufacturing and transport emissions
- Materials & packaging (25%) - Recyclability and biodegradability
- Ethical sourcing (25%) - Fair trade and supply chain transparency  
- Product longevity (20%) - Durability and repairability

Every point higher means less environmental impact!"""

        return explanation

    def provide_eco_tip(self, context: str) -> str:
        """Provide a relevant eco tip based on context"""

        messages = [
            SystemMessage(content=self.system_instruction),
            HumanMessage(content=f"""Based on this context: "{context}"

Provide one specific, actionable eco-tip that's relevant and encouraging.
Keep it under 50 words and include a specific impact metric if possible.""")
        ]

        response = self.llm.invoke(messages)
        return response.content

    def handle_request(self, message: str, context: Optional[Dict] = None) -> Dict:
      """Handle a sustainability advice request"""

      # Determine the type of request
      message_lower = message.lower()

      if "earthscore" in message_lower or "earth score" in message_lower:
          # Extract score if mentioned
          import re
          score_match = re.search(r'\b(\d+)\b', message)
          score = int(score_match.group(1)) if score_match else 75

          response = self.explain_earth_score(score)

      elif "bamboo" in message_lower:
          # Special handling for bamboo queries
          response = """🎋 Bamboo - A Sustainability Superstar!

  Environmental Benefits:
  - Grows up to 3 feet in 24 hours (no replanting needed!)
  - Produces 35% more oxygen than equivalent trees
  - Requires NO pesticides or fertilizers
  - Uses 30% less water than hardwood trees
  - Naturally antibacterial and biodegradable

  Impact Comparison:
  - Bamboo cutting board vs plastic: Saves 5.2kg CO2/year
  - Bamboo utensils vs plastic: Prevents 200+ plastic items from oceans
  - Decomposes naturally in 4-6 months vs 450 years for plastic

  EarthScore Boost: +15-20 points for bamboo products! 🌱"""

      elif any(word in message_lower for word in ["impact", "environment", "carbon", "co2"]):
          # Provide impact information
          if "bamboo" in message_lower:
              sustainable = True
              product_type = "bamboo_product"
          else:
              product_type = "water_bottle" if "bottle" in message_lower else "shopping_bag"
              sustainable = "sustainable" in message_lower or "eco" in message_lower

          impact = self.calculate_impact_comparison(product_type, sustainable)

          response = f"""Environmental Impact Analysis:

  CO2 Emissions: {impact['co2_kg']} kg per year
  Waste Generated: {impact['waste_kg']} kg
  Decomposition Time: {impact['years_to_decompose']} years

  {'Great choice! 🌍' if sustainable else 'Consider switching to a sustainable alternative to reduce this impact! 🌱'}"""

      else:
          # General sustainability advice
          response = self.provide_eco_tip(message)

      return {
          "response": response,
          "agent": "sustainability_advisor",
          "educational_content": True
      }
      
    
# Test the sustainability advisor
if __name__ == "__main__":
    print("🌱 Testing Sustainability Advisor Agent\n")

    # Make sure API key is set
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Please set OPENAI_API_KEY environment variable")
        exit(1)

    advisor = SustainabilityAdvisorAgent()

    test_queries = [
        "What does an EarthScore of 85 mean?",
        "What's the environmental impact of plastic bottles?",
        "Give me tips for sustainable shopping"
    ]

    for query in test_queries:
        print(f"\n👤 User: {query}")
        result = advisor.handle_request(query)
        print(f"🌱 Advisor: {result['response']}")
