import sys
import os
# Add the backend path to sys.path to import the engine
sys.path.append(os.path.abspath(os.path.join(
    os.path.dirname(__file__), '..', 'backend')))

from ml.engine import calculate_earth_score
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
import xgboost as xgb
import pickle

print("--- Starting ML Model Training ---")

# 1. Load Data
df = pd.read_csv('../data/products_large.csv')
print("Loaded generated data.")

# 2. Create Target Variable (Ground Truth)
# We use our original heuristic to create the 'earth_score' we want to predict
df['earth_score'] = df.apply(calculate_earth_score, axis=1)
print("Generated 'earth_score' as target variable using heuristic.")

# 3. Define Features (X) and Target (y)
features = [
    'manufacturing_emissions_gco2e', 'transport_distance_km',
    'recyclability_percent', 'biodegradability_score', 'is_fair_trade',
    'supply_chain_transparency_score', 'durability_rating', 'repairability_index'
]
X = df[features]
y = df['earth_score']

# 4. Split Data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)
print("Split data into training and testing sets.")

# 5. Train and Save Imputer
imputer = SimpleImputer(strategy='mean')
imputer.fit(X_train)  # Fit only on training data
with open('../backend/ml/imputer.pkl', 'wb') as f:
    pickle.dump(imputer, f)
print("Trained and saved imputer to backend/ml/imputer.pkl")

# Apply imputer to our data
X_train_imputed = imputer.transform(X_train)
X_test_imputed = imputer.transform(X_test)

# 6. Train and Save XGBoost Model
model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100,
                         learning_rate=0.1, max_depth=5, random_state=42)
model.fit(X_train_imputed, y_train)
with open('../backend/ml/model.pkl', 'wb') as f:
    pickle.dump(model, f)
print("Trained and saved XGBoost model to backend/ml/model.pkl")

# 7. Evaluate Model
score = model.score(X_test_imputed, y_test)
print(f"Model evaluation complete. R^2 Score: {score:.4f}")
print("--- ML Model Training Complete ---")
