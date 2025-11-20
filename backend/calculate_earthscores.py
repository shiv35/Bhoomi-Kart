from ml.engine import calculate_earth_score
import pandas as pd
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def add_earthscores_to_csv():
    """Calculate EarthScores for all products and save to CSV"""

    # Load the products
    print("Loading products...")
    products_df = pd.read_csv("../data/products_large.csv")
    print(f"Loaded {len(products_df)} products")

    # Check current columns
    print(f"Current columns: {list(products_df.columns)}")

    # Calculate EarthScore for each product
    print("Calculating EarthScores...")
    products_df['earth_score'] = products_df.apply(
        calculate_earth_score, axis=1)

    # Show score distribution
    print("\nEarthScore Distribution:")
    print(f"Min: {products_df['earth_score'].min()}")
    print(f"Max: {products_df['earth_score'].max()}")
    print(f"Mean: {products_df['earth_score'].mean():.2f}")
    print(f"Median: {products_df['earth_score'].median()}")

    # Show sample of scores
    print("\nSample products with EarthScores:")
    sample = products_df[['product_name', 'category', 'earth_score']].head(10)
    print(sample)

    # Save back to CSV
    print("\nSaving to CSV...")
    products_df.to_csv("../data/products_large_with_scores.csv", index=False)
    print("✅ Saved to products_large_with_scores.csv")

    # Also update the original file (make a backup first)
    import shutil
    shutil.copy("../data/products_large.csv",
                "../data/products_large_backup.csv")
    products_df.to_csv("../data/products_large.csv", index=False)
    print("✅ Updated original products_large.csv (backup saved as products_large_backup.csv)")

    # Show top 10 eco-friendly products
    print("\nTop 10 Most Eco-Friendly Products:")
    top_eco = products_df.nlargest(10, 'earth_score')[
        ['product_name', 'category', 'price', 'earth_score']]
    print(top_eco)

    # Show bottom 10 products
    print("\nBottom 10 Least Eco-Friendly Products:")
    bottom_eco = products_df.nsmallest(10, 'earth_score')[
        ['product_name', 'category', 'price', 'earth_score']]
    print(bottom_eco)


if __name__ == "__main__":
    add_earthscores_to_csv()
