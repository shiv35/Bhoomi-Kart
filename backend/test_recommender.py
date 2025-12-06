#!/usr/bin/env python3
"""
Test script for the Apriori Recommender System
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

import pandas as pd
from services.recommender_service import RecommenderService

def test_recommender():
    """Test the recommender service"""
    print("🧪 Testing Apriori Recommender System\n")
    
    # Load product data
    try:
        products_df = pd.read_csv("../data/products_large.csv")
        print(f"✅ Loaded {len(products_df)} products")
    except FileNotFoundError:
        print("❌ Error: products_large.csv not found")
        print("   Please ensure the data file exists in ../data/")
        return
    
    # Initialize recommender
    print("\n🔄 Initializing recommender service...")
    recommender = RecommenderService(products_df)
    
    # Train the recommender
    print("\n🔄 Training recommender with synthetic data...")
    recommender.train(num_transactions=1000)
    
    # Test with sample cart items
    print("\n📦 Testing recommendations with sample cart items...")
    
    # Get first 3 product IDs as sample cart
    sample_cart = products_df['product_id'].head(3).tolist()
    print(f"   Cart items: {sample_cart}")
    
    # Get recommendations
    recommendations = recommender.get_recommendations(sample_cart, top_n=5)
    
    print(f"\n✅ Found {len(recommendations)} recommendations:\n")
    for i, rec in enumerate(recommendations, 1):
        print(f"   {i}. {rec['product_name']}")
        print(f"      Price: ${rec['price']:.2f} | EarthScore: {rec['earth_score']}")
        print(f"      Confidence: {rec['confidence']:.2%} | Reason: {rec['reason']}")
        print()
    
    print("✅ Recommender system test completed successfully!")

if __name__ == "__main__":
    test_recommender()

