import pandas as pd

# Define the weights for each category based on the presentation
WEIGHTS = {
    "carbon_footprint": 0.30,
    "materials_packaging": 0.25,
    "ethical_sourcing": 0.25,
    "product_longevity": 0.20,
}

# Define min/max values for normalization. These are assumptions based on our mock data.
# In a real-world scenario, these would be determined from a larger dataset.
NORM_RANGES = {
    "manufacturing_emissions_gco2e": (100, 60000),
    "transport_distance_km": (50, 20000),
    "recyclability_percent": (0, 100),
    "biodegradability_score": (1, 5),
    "is_fair_trade": (0, 1),
    "supply_chain_transparency_score": (1, 5),
    "durability_rating": (1, 5),
    "repairability_index": (1, 5),
}


def normalize(value, feature_name):
    """Normalizes a feature's value to a 0-1 scale (0 is worst, 1 is best)."""
    min_val, max_val = NORM_RANGES[feature_name]

    # Ensure value is within bounds
    value = max(min_val, min(value, max_val))

    # Standard normalization for features where higher is better
    if feature_name not in ["manufacturing_emissions_gco2e", "transport_distance_km"]:
        return (value - min_val) / (max_val - min_val)
    else:
        # Inverted normalization for features where lower is better (like emissions)
        return 1 - ((value - min_val) / (max_val - min_val))


def calculate_earth_score(product: pd.Series) -> int:
    """
    Calculates the EarthScore for a single product.
    The product is a pandas Series (a row from our DataFrame).
    """
    # 1. Calculate sub-score for Carbon Footprint
    norm_emissions = normalize(
        product["manufacturing_emissions_gco2e"], "manufacturing_emissions_gco2e")
    norm_transport = normalize(
        product["transport_distance_km"], "transport_distance_km")
    carbon_score = (norm_emissions + norm_transport) / 2

    # 2. Calculate sub-score for Materials & Packaging
    norm_recyclability = normalize(
        product["recyclability_percent"], "recyclability_percent")
    norm_biodegradability = normalize(
        product["biodegradability_score"], "biodegradability_score")
    materials_score = (norm_recyclability + norm_biodegradability) / 2

    # 3. Calculate sub-score for Ethical Sourcing
    norm_fair_trade = normalize(product["is_fair_trade"], "is_fair_trade")
    norm_transparency = normalize(
        product["supply_chain_transparency_score"], "supply_chain_transparency_score")
    ethical_score = (norm_fair_trade + norm_transparency) / 2

    # 4. Calculate sub-score for Product Longevity
    norm_durability = normalize(
        product["durability_rating"], "durability_rating")
    norm_repairability = normalize(
        product["repairability_index"], "repairability_index")
    longevity_score = (norm_durability + norm_repairability) / 2

    # 5. Calculate final weighted score and scale to 0-100
    final_score = (
        carbon_score * WEIGHTS["carbon_footprint"] +
        materials_score * WEIGHTS["materials_packaging"] +
        ethical_score * WEIGHTS["ethical_sourcing"] +
        longevity_score * WEIGHTS["product_longevity"]
    )

    return int(final_score * 100)


# This block allows us to test the engine directly by running "python ml/engine.py"
if __name__ == "__main__":
    print("Running EarthScore Engine Test...")

    # Load the data from the relative path
    try:
        products_df = pd.read_csv("../../data/products.csv")
        print(f"Successfully loaded {len(products_df)} products.")
    except FileNotFoundError:
        print("Error: `products.csv` not found. Make sure it's in the `data` directory.")
        exit()

    # Calculate EarthScore for each product
    products_df["earth_score"] = products_df.apply(
        calculate_earth_score, axis=1)

    # Display the results, sorted by the new score
    print("\n--- Product EarthScores ---")
    print(products_df[["product_name", "category", "price", "earth_score"]].sort_values(
        by="earth_score", ascending=False
    ))
    print("\nTest complete.")
