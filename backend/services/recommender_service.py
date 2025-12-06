# services/recommender_service.py
"""
Recommender Service using Apriori Algorithm
Generates recommendations based on cart items using association rule mining
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Set, Tuple, Optional
from collections import defaultdict
import random
import json
import os


class AprioriRecommender:
    """
    Apriori Algorithm implementation for market basket analysis
    """
    
    def __init__(self, min_support: float = 0.01, min_confidence: float = 0.3):
        """
        Initialize Apriori recommender
        
        Args:
            min_support: Minimum support threshold (0.01 = 1%)
            min_confidence: Minimum confidence threshold (0.3 = 30%)
        """
        self.min_support = min_support
        self.min_confidence = min_confidence
        self.frequent_itemsets = []
        self.association_rules = []
        self.transactions = []
        
    def generate_synthetic_transactions(self, products_df: pd.DataFrame, num_transactions: int = 1000) -> List[List[int]]:
        """
        Generate synthetic transaction data based on product categories and relationships
        
        Args:
            products_df: DataFrame with product information
            num_transactions: Number of synthetic transactions to generate
            
        Returns:
            List of transactions (each transaction is a list of product_ids)
        """
        transactions = []
        
        # Get product categories
        categories = products_df['category'].unique().tolist()
        products_by_category = {}
        for category in categories:
            products_by_category[category] = products_df[
                products_df['category'] == category
            ]['product_id'].tolist()
        
        # Define category relationships (which categories are often bought together)
        category_relationships = {
            'kitchen': ['home', 'electronics'],
            'home': ['kitchen', 'beauty'],
            'electronics': ['home', 'kitchen'],
            'beauty': ['home', 'clothing'],
            'clothing': ['beauty', 'home']
        }
        
        # Generate transactions
        for _ in range(num_transactions):
            transaction = []
            
            # Random number of items in transaction (1-5 items)
            num_items = random.randint(1, 5)
            
            # Start with a random category
            primary_category = random.choice(categories)
            primary_products = products_by_category.get(primary_category, [])
            
            if primary_products:
                # Add 1-2 products from primary category
                num_primary = random.randint(1, min(2, len(primary_products)))
                transaction.extend(random.sample(primary_products, num_primary))
            
            # Add related category products (60% chance)
            if random.random() < 0.6:
                related_categories = category_relationships.get(primary_category, [])
                if related_categories:
                    related_category = random.choice(related_categories)
                    related_products = products_by_category.get(related_category, [])
                    if related_products:
                        transaction.append(random.choice(related_products))
            
            # Add random products (30% chance for each additional item)
            remaining_items = num_items - len(transaction)
            all_products = products_df['product_id'].tolist()
            for _ in range(remaining_items):
                if random.random() < 0.3 and len(transaction) < num_items:
                    product = random.choice(all_products)
                    if product not in transaction:
                        transaction.append(product)
            
            if transaction:
                transactions.append(transaction)
        
        self.transactions = transactions
        return transactions
    
    def calculate_support(self, itemset: Set[int]) -> float:
        """
        Calculate support for an itemset
        
        Args:
            itemset: Set of product IDs
            
        Returns:
            Support value (0.0 to 1.0)
        """
        if not self.transactions:
            return 0.0
        
        count = sum(1 for transaction in self.transactions 
                   if itemset.issubset(set(transaction)))
        return count / len(self.transactions)
    
    def generate_candidates(self, itemsets: List[Set[int]], k: int) -> List[Set[int]]:
        """
        Generate candidate itemsets of size k from itemsets of size k-1
        
        Args:
            itemsets: List of frequent itemsets of size k-1
            k: Size of candidate itemsets to generate
            
        Returns:
            List of candidate itemsets
        """
        candidates = []
        n = len(itemsets)
        
        for i in range(n):
            for j in range(i + 1, n):
                # Union of two itemsets
                union = itemsets[i] | itemsets[j]
                if len(union) == k:
                    # Check if all subsets of size k-1 are frequent
                    is_valid = True
                    for item in union:
                        subset = union - {item}
                        if subset not in itemsets:
                            is_valid = False
                            break
                    if is_valid and union not in candidates:
                        candidates.append(union)
        
        return candidates
    
    def find_frequent_itemsets(self, transactions: List[List[int]]) -> List[Tuple[Set[int], float]]:
        """
        Find all frequent itemsets using Apriori algorithm
        
        Args:
            transactions: List of transactions
            
        Returns:
            List of tuples (itemset, support)
        """
        self.transactions = transactions
        
        # Step 1: Find frequent 1-itemsets
        item_counts = defaultdict(int)
        for transaction in transactions:
            for item in transaction:
                item_counts[item] += 1
        
        num_transactions = len(transactions)
        min_count = int(self.min_support * num_transactions)
        
        frequent_1_itemsets = [
            ({item}, count / num_transactions)
            for item, count in item_counts.items()
            if count >= min_count
        ]
        
        all_frequent = frequent_1_itemsets.copy()
        current_frequent = [itemset for itemset, _ in frequent_1_itemsets]
        
        # Step 2: Iteratively find larger frequent itemsets
        k = 2
        while current_frequent:
            # Generate candidates
            candidates = self.generate_candidates(current_frequent, k)
            
            # Count support for candidates
            candidate_counts = defaultdict(int)
            for transaction in transactions:
                transaction_set = set(transaction)
                for candidate in candidates:
                    if candidate.issubset(transaction_set):
                        candidate_counts[tuple(sorted(candidate))] += 1
            
            # Filter by minimum support
            current_frequent = []
            for candidate in candidates:
                candidate_tuple = tuple(sorted(candidate))
                count = candidate_counts.get(candidate_tuple, 0)
                support = count / num_transactions
                if support >= self.min_support:
                    current_frequent.append(candidate)
                    all_frequent.append((candidate, support))
            
            k += 1
        
        self.frequent_itemsets = all_frequent
        return all_frequent
    
    def calculate_confidence(self, antecedent: Set[int], consequent: Set[int]) -> float:
        """
        Calculate confidence for a rule: antecedent -> consequent
        
        Args:
            antecedent: Set of items in the antecedent
            consequent: Set of items in the consequent
            
        Returns:
            Confidence value (0.0 to 1.0)
        """
        antecedent_support = self.calculate_support(antecedent)
        if antecedent_support == 0:
            return 0.0
        
        union_support = self.calculate_support(antecedent | consequent)
        return union_support / antecedent_support
    
    def generate_association_rules(self) -> List[Dict]:
        """
        Generate association rules from frequent itemsets
        
        Returns:
            List of association rules with support and confidence
        """
        rules = []
        
        # Only consider itemsets with 2+ items
        multi_item_itemsets = [
            (itemset, support) for itemset, support in self.frequent_itemsets
            if len(itemset) >= 2
        ]
        
        for itemset, support in multi_item_itemsets:
            itemset_list = list(itemset)
            
            # Generate rules: for each item, create a rule with it as consequent
            for item in itemset_list:
                antecedent = itemset - {item}
                consequent = {item}
                
                confidence = self.calculate_confidence(antecedent, consequent)
                
                if confidence >= self.min_confidence:
                    rules.append({
                        'antecedent': list(antecedent),
                        'consequent': list(consequent),
                        'support': support,
                        'confidence': confidence,
                        'lift': confidence / self.calculate_support(consequent) if self.calculate_support(consequent) > 0 else 0
                    })
        
        self.association_rules = rules
        return rules
    
    def get_recommendations(self, cart_items: List[int], top_n: int = 5) -> List[Dict]:
        """
        Get product recommendations based on cart items
        
        Args:
            cart_items: List of product IDs in the cart
            top_n: Number of recommendations to return
            
        Returns:
            List of recommended products with confidence scores
        """
        print(f"🔍 [AprioriRecommender] get_recommendations called with cart_items: {cart_items}, top_n: {top_n}")
        print(f"📊 [AprioriRecommender] Total association rules: {len(self.association_rules)}")
        
        if not cart_items:
            print("⚠️ [AprioriRecommender] Cart is empty, returning empty list")
            return []
        
        cart_set = set(cart_items)
        recommendations = defaultdict(float)
        matched_rules = 0
        
        # Find rules where cart items match the antecedent
        for rule in self.association_rules:
            antecedent_set = set(rule['antecedent'])
            consequent_set = set(rule['consequent'])
            
            # Check if cart contains the antecedent
            if antecedent_set.issubset(cart_set):
                matched_rules += 1
                # Recommend items from consequent that are not in cart
                for item in consequent_set:
                    if item not in cart_set:
                        # Use confidence as score, but prefer higher confidence
                        recommendations[item] = max(
                            recommendations[item],
                            rule['confidence'] * rule['support']  # Weighted score
                        )
        
        print(f"📊 [AprioriRecommender] Matched {matched_rules} rules, found {len(recommendations)} candidate recommendations")
        
        # Sort by score and return top N
        sorted_recommendations = sorted(
            recommendations.items(),
            key=lambda x: x[1],
            reverse=True
        )[:top_n]
        
        result = [
            {
                'product_id': product_id,
                'confidence': round(score, 3),
                'reason': f"Frequently bought with items in your cart"
            }
            for product_id, score in sorted_recommendations
        ]
        
        print(f"✅ [AprioriRecommender] Returning {len(result)} recommendations")
        return result


class RecommenderService:
    """
    Service wrapper for the Apriori recommender
    """
    
    def __init__(self, products_df: pd.DataFrame):
        """
        Initialize recommender service
        
        Args:
            products_df: DataFrame with product information
        """
        self.products_df = products_df
        self.recommender = AprioriRecommender(min_support=0.01, min_confidence=0.2)
        self.is_trained = False
        
    def train(self, num_transactions: int = 2000):
        """
        Train the recommender with synthetic transaction data
        
        Args:
            num_transactions: Number of synthetic transactions to generate
        """
        print(f"🔄 Generating {num_transactions} synthetic transactions...")
        transactions = self.recommender.generate_synthetic_transactions(
            self.products_df,
            num_transactions
        )
        
        print(f"🔄 Finding frequent itemsets...")
        self.recommender.find_frequent_itemsets(transactions)
        
        print(f"🔄 Generating association rules...")
        self.recommender.generate_association_rules()
        
        self.is_trained = True
        print(f"✅ Recommender trained: {len(self.recommender.frequent_itemsets)} frequent itemsets, {len(self.recommender.association_rules)} rules")
    
    def get_recommendations(self, cart_items: List[int], top_n: int = 5) -> List[Dict]:
        """
        Get product recommendations based on cart items
        
        Args:
            cart_items: List of product IDs in the cart
            top_n: Number of recommendations to return
            
        Returns:
            List of recommended products with full details
        """
        print(f"🔍 [RecommenderService] Getting recommendations for cart_items: {cart_items}, top_n: {top_n}")
        
        if not self.is_trained:
            print("🔄 [RecommenderService] Recommender not trained, training now...")
            self.train()
        
        # Get recommendations from Apriori
        print(f"🔍 [RecommenderService] Getting Apriori recommendations...")
        recommendations = self.recommender.get_recommendations(cart_items, top_n * 2)
        print(f"📊 [RecommenderService] Apriori returned {len(recommendations)} recommendations")
        
        # Enrich with product details
        enriched_recommendations = []
        for rec in recommendations:
            product_id = rec['product_id']
            product = self.products_df[self.products_df['product_id'] == product_id]
            
            if not product.empty:
                product_data = product.iloc[0]
                enriched_recommendations.append({
                    'product_id': int(product_id),
                    'product_name': product_data['product_name'],
                    'price': float(product_data['price']),
                    'earth_score': int(product_data.get('earth_score', 75)),
                    'category': product_data.get('category', 'home'),
                    'image_url': f"/images/{product_data.get('category', 'home').lower()}.png",
                    'confidence': rec['confidence'],
                    'reason': rec['reason']
                })
        
        print(f"📊 [RecommenderService] Enriched {len(enriched_recommendations)} recommendations from Apriori")
        
        # Get cart item categories for category-based recommendations
        cart_set = set(cart_items)
        cart_products = self.products_df[self.products_df['product_id'].isin(cart_set)]
        cart_categories = cart_products['category'].unique().tolist() if not cart_products.empty else ['home']
        print(f"📊 [RecommenderService] Cart categories: {cart_categories}")
        
        # Category relationships for fallback
        category_relationships = {
            'kitchen': ['home', 'electronics'],
            'home': ['kitchen', 'beauty', 'electronics'],
            'electronics': ['home', 'kitchen'],
            'beauty': ['home', 'clothing'],
            'clothing': ['beauty', 'home']
        }
        
        # If we don't have enough recommendations, add category-based and popular products
        min_recommendations = max(2, top_n)  # Always return at least 2 recommendations
        if len(enriched_recommendations) < min_recommendations:
            print(f"📊 [RecommenderService] Need more recommendations. Current: {len(enriched_recommendations)}, Target: {min_recommendations}")
            
            # First, try to get products from same or related categories
            related_categories = set(cart_categories)
            for cat in cart_categories:
                related_categories.update(category_relationships.get(cat.lower(), []))
            
            print(f"📊 [RecommenderService] Related categories: {related_categories}")
            
            # Get products from related categories
            category_products = self.products_df[
                (self.products_df['category'].isin(related_categories)) &
                (~self.products_df['product_id'].isin(cart_set))
            ].nlargest(min_recommendations * 2, 'earth_score')
            
            for _, product in category_products.iterrows():
                if len(enriched_recommendations) >= min_recommendations:
                    break
                
                # Check if already in recommendations
                if product['product_id'] not in [r['product_id'] for r in enriched_recommendations]:
                    enriched_recommendations.append({
                        'product_id': int(product['product_id']),
                        'product_name': product['product_name'],
                        'price': float(product['price']),
                        'earth_score': int(product.get('earth_score', 75)),
                        'category': product.get('category', 'home'),
                        'image_url': f"/images/{product.get('category', 'home').lower()}.png",
                        'confidence': 0.2,  # Medium confidence for category-based
                        'reason': f"Similar to items in your cart ({product.get('category', 'home')} category)"
                    })
            
            print(f"📊 [RecommenderService] After category-based: {len(enriched_recommendations)} recommendations")
            
            # If still not enough, add top products by earth_score
            if len(enriched_recommendations) < min_recommendations:
                print(f"📊 [RecommenderService] Still need more, adding popular products...")
                available_products = self.products_df[
                    ~self.products_df['product_id'].isin(cart_set)
                ].nlargest(min_recommendations * 2, 'earth_score')
                
                for _, product in available_products.iterrows():
                    if len(enriched_recommendations) >= min_recommendations:
                        break
                    
                    # Check if already in recommendations
                    if product['product_id'] not in [r['product_id'] for r in enriched_recommendations]:
                        enriched_recommendations.append({
                            'product_id': int(product['product_id']),
                            'product_name': product['product_name'],
                            'price': float(product['price']),
                            'earth_score': int(product.get('earth_score', 75)),
                            'category': product.get('category', 'home'),
                            'image_url': f"/images/{product.get('category', 'home').lower()}.png",
                            'confidence': 0.1,  # Lower confidence for fallback
                            'reason': "Popular sustainable product"
                        })
        
        result = enriched_recommendations[:top_n]
        print(f"✅ [RecommenderService] Returning {len(result)} recommendations")
        return result
    
    def save_model(self, filepath: str):
        """Save the trained model to disk"""
        model_data = {
            'frequent_itemsets': [
                (list(itemset), support)
                for itemset, support in self.recommender.frequent_itemsets
            ],
            'association_rules': self.recommender.association_rules,
            'min_support': self.recommender.min_support,
            'min_confidence': self.recommender.min_confidence
        }
        
        with open(filepath, 'w') as f:
            json.dump(model_data, f)
    
    def load_model(self, filepath: str):
        """Load a trained model from disk"""
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                model_data = json.load(f)
            
            self.recommender.frequent_itemsets = [
                (set(itemset), support)
                for itemset, support in model_data['frequent_itemsets']
            ]
            self.recommender.association_rules = model_data['association_rules']
            self.recommender.min_support = model_data['min_support']
            self.recommender.min_confidence = model_data['min_confidence']
            self.is_trained = True

