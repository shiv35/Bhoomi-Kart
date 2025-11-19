#!/usr/bin/env python3
"""
Script to fix product categories in products_large.csv to match users_pincodes.csv categories
"""

import pandas as pd
import os


def fix_product_categories():
    # Valid categories from users_pincodes.csv
    VALID_CATEGORIES = ['kitchen', 'electronics',
                        'clothing', 'home', 'personal-care', 'beauty']

    # Category mapping - map current categories to valid ones
    CATEGORY_MAPPING = {
        # Direct mappings (just lowercase)
        'Home': 'home',
        'home': 'home',
        'Electronics': 'electronics',
        'electronics': 'electronics',
        'Beauty': 'beauty',
        'beauty': 'beauty',
        'Clothing': 'clothing',
        'clothing': 'clothing',

        # Mapped categories
        'Office': 'home',  # Office supplies go to home
        'office': 'home',
        'Groceries': 'kitchen',  # Groceries go to kitchen
        'groceries': 'kitchen',
        'Food': 'kitchen',
        'food': 'kitchen',
        'Kitchen': 'kitchen',
        'kitchen': 'kitchen',
        'Personal Care': 'personal-care',
        'personal care': 'personal-care',
        'Personal-Care': 'personal-care',
        'personal-care': 'personal-care',
        'Health': 'personal-care',
        'health': 'personal-care',
        'Fashion': 'clothing',
        'fashion': 'clothing',
        'Apparel': 'clothing',
        'apparel': 'clothing',
        'Tech': 'electronics',
        'tech': 'electronics',
        'Gadgets': 'electronics',
        'gadgets': 'electronics',
        'Furniture': 'home',
        'furniture': 'home',
        'Decor': 'home',
        'decor': 'home',
        'Garden': 'home',
        'garden': 'home',
        'Sports': 'home',
        'sports': 'home',
        'Toys': 'home',
        'toys': 'home',
        'Books': 'home',
        'books': 'home',
        'Cosmetics': 'beauty',
        'cosmetics': 'beauty',
        'Skincare': 'beauty',
        'skincare': 'beauty',
    }

    # Read the CSV file
    print("Reading products_large.csv...")
    try:
        df = pd.read_csv('../data/products_large.csv')
        print(f"✓ Loaded {len(df)} products")
    except FileNotFoundError:
        print("❌ Error: Could not find products_large.csv")
        print("Make sure you're running this script from the backend directory")
        return

    # Show current category distribution
    print("\n📊 Current category distribution:")
    category_counts = df['category'].value_counts()
    for cat, count in category_counts.items():
        print(f"  {cat}: {count} products")

    # Create backup
    backup_file = '../data/products_large_backup.csv'
    print(f"\n💾 Creating backup at {backup_file}")
    df.to_csv(backup_file, index=False)

    # Fix categories
    print("\n🔄 Fixing categories...")
    original_categories = df['category'].unique()

    # Apply mapping
    df['original_category'] = df['category']  # Keep original for reference
    df['category'] = df['category'].apply(
        lambda x: CATEGORY_MAPPING.get(x, 'home'))

    # Verify all categories are valid
    invalid_categories = set(df['category']) - set(VALID_CATEGORIES)
    if invalid_categories:
        print(
            f"⚠️  Warning: Found invalid categories after mapping: {invalid_categories}")

    # Show new category distribution
    print("\n📊 New category distribution:")
    new_category_counts = df['category'].value_counts()
    for cat, count in new_category_counts.items():
        print(f"  {cat}: {count} products")

    # Show mapping summary
    print("\n🔄 Category mappings applied:")
    for orig_cat in original_categories:
        new_cat = CATEGORY_MAPPING.get(orig_cat, 'home')
        if orig_cat != new_cat:
            print(f"  {orig_cat} → {new_cat}")

    # Save the updated file
    print("\n💾 Saving updated products_large.csv...")
    # Remove the temporary original_category column before saving
    df_to_save = df.drop(columns=['original_category'])
    df_to_save.to_csv('../data/products_large.csv', index=False)

    print("\n✅ Done! Categories have been fixed.")
    print(f"   Backup saved as: {backup_file}")
    print(f"   Updated file: ../data/products_large.csv")

    # Show sample products for verification
    print("\n📋 Sample products with new categories:")
    sample_df = df[['product_id', 'product_name',
                    'original_category', 'category']].head(10)
    print(sample_df.to_string(index=False))

    # Test specific categories that were problematic
    print("\n🔍 Checking products that had 'Office' or 'Groceries' categories:")
    problem_products = df[df['original_category'].isin(
        ['Office', 'Groceries'])].head(5)
    if len(problem_products) > 0:
        print(problem_products[[
              'product_name', 'original_category', 'category']].to_string(index=False))
    else:
        print("   No products found with these categories")


if __name__ == "__main__":
    print("🛠️  Product Category Fixer")
    print("=" * 50)
    fix_product_categories()
