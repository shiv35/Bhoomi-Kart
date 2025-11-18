import pandas as pd
from faker import Faker
import random
import numpy as np

# Initialize Faker
fake = Faker()

# Number of products to generate
NUM_PRODUCTS = 200

# Define categories
CATEGORIES = ["Kitchen", "Groceries", "Apparel",
              "Accessories", "Beauty", "Electronics", "Office", "Home"]

data = []
for i in range(1, NUM_PRODUCTS + 1):
    category = random.choice(CATEGORIES)

    # Generate more realistic data points
    base_price = round(random.uniform(5.99, 199.99), 2)
    base_emissions = int(random.uniform(200, 20000))
    base_distance = int(random.uniform(100, 15000))

    # Create correlations - e.g., electronics are less biodegradable, more emissions
    if category == 'Electronics':
        base_price = round(random.uniform(89.99, 1299.99), 2)
        base_emissions *= 3
        biodegradability = 1
        repairability = random.randint(1, 3)
    else:
        biodegradability = random.randint(2, 5)
        repairability = random.randint(1, 5)

    product_name = fake.bs().title() + " " + \
        random.choice(["Gadget", "Tool", "Appliance", "Kit", "Wearable"])

    record = {
        'product_id': i,
        'product_name': f"{category} {product_name}",
        'category': category,
        'price': base_price,
        # Placeholder
        'image_url': f"https://i.imgur.com/example{random.randint(1, 8)}.png",
        'manufacturing_emissions_gco2e': base_emissions,
        'transport_distance_km': base_distance,
        'recyclability_percent': random.randint(5, 100),
        'biodegradability_score': biodegradability,
        'is_fair_trade': random.choice([0, 1]),
        'supply_chain_transparency_score': random.randint(1, 5),
        'durability_rating': random.randint(1, 5),
        'repairability_index': repairability
    }
    data.append(record)

df = pd.DataFrame(data)

# Save to a new CSV file
df.to_csv('../data/products_large.csv', index=False)

print(
    f"Successfully generated and saved {NUM_PRODUCTS} products to data/products_large.csv")
