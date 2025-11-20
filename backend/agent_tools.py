import pandas as pd
import json
from services.cart_service import CartService

# These are now plain Python functions. The agent will not see these directly.
# Their job is to contain the logic.

# Initialize cart service (add this after imports)
cart_service = CartService()


def implement_search_by_category(category: str, products_df: pd.DataFrame) -> str:
    """The internal logic for searching by category."""
    print(f"--- IMPL: Searching for category: {category} ---")
    results = products_df[products_df['category'].str.contains(
        category, case=False, na=False)]
    if results.empty:
        return json.dumps({"error": f"No products found in the '{category}' category."})
    response_list = results.head(
        5)[['product_name', 'product_id']].to_dict(orient='records')
    return json.dumps(response_list)


def implement_get_details(product_name: str, products_df: pd.DataFrame) -> str:
    """The internal logic for getting product details."""
    print(f"--- IMPL: Getting details for: {product_name} ---")
    results = products_df[products_df['product_name'].str.contains(
        product_name, case=False, na=False)]
    if results.empty:
        return json.dumps({"error": f"Could not find a product named '{product_name}'."})

    product_details = results.iloc[0].to_dict()
    # Convert any non-standard types (like numpy int64) to standard Python types for JSON
    for key, value in product_details.items():
        if hasattr(value, 'item'):
            product_details[key] = value.item()
    return json.dumps(product_details)


# Now, UPDATE the implement_add_to_cart function (replace the existing one):
def implement_add_to_cart(user_id: str, product_name: str, quantity: int, products_df: pd.DataFrame) -> str:
    """The internal logic for adding an item to the cart - now with real cart management"""
    print(
        f"--- IMPL: Adding to cart for user {user_id}: {quantity} of {product_name} ---")

    # Find the product in the dataframe
    results = products_df[products_df['product_name'].str.contains(
        product_name, case=False, na=False)]

    if results.empty:
        return json.dumps({
            "status": "error",
            "message": f"Could not find product '{product_name}'"
        })

    # Get product details
    product = results.iloc[0]
    product_id = int(product['product_id'])
    price = float(product['price'])

    # Calculate earth score (if not in dataframe, use default)
    earth_score = int(product.get('earth_score', 75))

    # Add to cart using cart service
    result = cart_service.add_to_cart(
        user_id=user_id,
        product_id=product_id,
        product_name=product['product_name'],
        quantity=quantity,
        price=price,
        earth_score=earth_score
    )

    # Get updated cart summary
    summary = cart_service.get_cart_summary(user_id)

    return json.dumps({
        "status": result["status"],
        "message": result["message"],
        "cart_summary": {
            "total_items": summary["total_items"],
            "total_price": summary["total_price"],
            "average_earth_score": summary["average_earth_score"]
        }
    })

# Add a new function for viewing cart


def implement_view_cart(user_id: str) -> str:
    """View the current cart contents"""
    print(f"--- IMPL: Viewing cart for user {user_id} ---")

    summary = cart_service.get_cart_summary(user_id)

    if not summary["items"]:
        return json.dumps({
            "status": "empty",
            "message": "Your cart is empty"
        })

    return json.dumps({
        "status": "success",
        "cart": summary
    })
