import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib

# Load the dataset
data = pd.read_csv('public/data/carbon_dataset.csv')

# Create label encoders for categorical variables
categorical_columns = ['transportMode', 'carpool', 'acUsage', 'renewableEnergy', 'localFood', 'recycle']
label_encoders = {}

for column in categorical_columns:
    label_encoders[column] = LabelEncoder()
    data[column] = label_encoders[column].fit_transform(data[column])

# Split features and target
X = data.drop('carbonFootprint_kg_per_month', axis=1)
y = data['carbonFootprint_kg_per_month']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the Random Forest model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Calculate and print the model's accuracy
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)
print(f"Training R² score: {train_score:.4f}")
print(f"Testing R² score: {test_score:.4f}")

# Save the model and label encoders
joblib.dump(model, 'public/data/carbon_footprint_model.joblib')
joblib.dump(label_encoders, 'public/data/label_encoders.joblib')

# Create a function to get feature importance
feature_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print("\nFeature Importance:")
print(feature_importance)

# Calculate some statistics for the frontend
stats = {
    'average_footprint': float(y.mean()),
    'min_footprint': float(y.min()),
    'max_footprint': float(y.max()),
    'percentiles': {
        '25': float(y.quantile(0.25)),
        '50': float(y.quantile(0.50)),
        '75': float(y.quantile(0.75))
    }
}

# Save statistics to a JSON file
import json
with open('public/data/carbon_stats.json', 'w') as f:
    json.dump(stats, f)

    # Save feature importance to JSON for frontend
feature_importance.to_json('public/data/feature_importance.json', orient='records')
print("✅ Feature importance saved to feature_importance.json")


print("✅ Model trained and saved as rf_model.pkl")
