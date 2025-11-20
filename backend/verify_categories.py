#!/usr/bin/env python3
"""
Fixed script to verify categories match between products and users
"""

import pandas as pd
import os

# Find the data directory
if os.path.exists('data/products_large.csv'):
    products_file = 'data/products_large.csv'
    users_file = 'data/users_pincodes.csv'
elif os.path.exists('../data/products_large.csv'):
    products_file = '../data/products_large.csv'
    users_file = '../data/users_pincodes.csv'
else:
    print("❌ Cannot find data directory. Run from project root or backend directory.")
    exit(1)

print("📊 Checking category compatibility...\n")

# Load products
products_df = pd.read_csv(products_file)
print(f"Products loaded: {len(products_df)} items")
print("Product categories found:")
for cat, count in products_df['category'].value_counts().items():
    print(f"  - {cat}: {count} products")

# Load users and properly parse categories
print(f"\n📥 Loading users from {users_file}...")
users_df = pd.read_csv(users_file)
print(f"Users loaded: {len(users_df)} users")

# Extract user categories based on the file structure
user_categories = set()

# Check if we have category1/category2 columns (new format)
if 'category1' in users_df.columns and 'category2' in users_df.columns:
    print("✓ Found category1/category2 columns")
    for _, user in users_df.iterrows():
        if pd.notna(user.get('category1')):
            user_categories.add(user['category1'])
        if pd.notna(user.get('category2')):
            user_categories.add(user['category2'])
else:
    # Old format - categories in columns after longitude
    print("⚠️  Using old format - categories in separate columns")
    # Get column names after the first 5 standard columns
    category_columns = users_df.columns[5:]
    print(f"Category columns found: {list(category_columns)}")

    for _, user in users_df.iterrows():
        for col in category_columns:
            if col != 'preferred_categories' and pd.notna(user[col]):
                user_categories.add(user[col])

# Clean up categories
user_categories = {cat for cat in user_categories if isinstance(
    cat, str) and cat.strip()}

print("\nUser preferred categories found:")
for cat in sorted(user_categories):
    # Count how many users prefer this category
    if 'category1' in users_df.columns:
        count = sum(1 for _, user in users_df.iterrows()
                    if cat in [user.get('category1'), user.get('category2')])
    else:
        count = sum(1 for _, user in users_df.iterrows()
                    if any(user.get(col) == cat for col in users_df.columns[5:]))
    print(f"  - {cat}: {count} users")

# Find mismatches
product_categories = set(products_df['category'].unique())
print("\n🔍 Category Analysis:")
print(f"Product categories: {sorted(product_categories)}")
print(f"User categories: {sorted(user_categories)}")

# Find products with categories that don't match any user preferences
mismatched = product_categories - user_categories
if mismatched:
    print(f"\n⚠️  WARNING: These product categories have NO matching users:")
    for cat in sorted(mismatched):
        count = len(products_df[products_df['category'] == cat])
        print(f"  - '{cat}': {count} products")
    print("\n  These products won't be included in any group buys!")
else:
    print("\n✅ All product categories have matching user preferences!")

# Show which categories will work
matching = product_categories & user_categories
if matching:
    print(f"\n✅ These categories WILL work for group buying:")
    for cat in sorted(matching):
        product_count = len(products_df[products_df['category'] == cat])
        if 'category1' in users_df.columns:
            user_count = sum(1 for _, user in users_df.iterrows()
                             if cat in [user.get('category1'), user.get('category2')])
        else:
            user_count = sum(1 for _, user in users_df.iterrows()
                             if any(user.get(col) == cat for col in users_df.columns[5:]))
        print(
            f"  - '{cat}': {product_count} products, {user_count} interested users")

# Show sample matching possibilities
print("\n📍 Sample group buying possibilities by pincode:")
sample_pincodes = users_df['pincode'].unique()[:3]
for pincode in sample_pincodes:
    pincode_users = users_df[users_df['pincode'] == pincode]
    print(f"\n  Pincode {pincode}: {len(pincode_users)} users")

    # Get all categories these users are interested in
    pincode_categories = set()
    for _, user in pincode_users.iterrows():
        if 'category1' in users_df.columns:
            if pd.notna(user.get('category1')):
                pincode_categories.add(user['category1'])
            if pd.notna(user.get('category2')):
                pincode_categories.add(user['category2'])
        else:
            for col in users_df.columns[5:]:
                if col != 'preferred_categories' and pd.notna(user[col]):
                    pincode_categories.add(user[col])

    if pincode_categories:
        print(f"    Categories: {', '.join(sorted(pincode_categories))}")
