from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import joblib
from pathlib import Path

app = Flask(__name__)

# Enable CORS (simple)
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@app.route('/test', methods=['GET'])
def test():
    return jsonify({'status': 'success', 'message': 'Server is running!'})

# Ensure the data directory exists
Path("public/data").mkdir(parents=True, exist_ok=True)

# Load the trained model and other resources (optional)
try:
    model = joblib.load('public/data/carbon_footprint_model.joblib')
    label_encoders = joblib.load('public/data/label_encoders.joblib')
    # feature_importance might be used by frontend, but not required here
    feature_importance = pd.read_json('public/data/feature_importance.json')
    print("Model and resources loaded successfully")
except Exception as e:
    print(f"Warning: Error loading resources: {str(e)}")
    model = None
    label_encoders = None
    feature_importance = None

def _safe_ratio(num, denom):
    try:
        denom = float(denom)
        return float(num) / denom if denom != 0 else 0.0
    except Exception:
        return 0.0

def get_personalized_recommendations(full_data, prediction):
    """
    Use the full front-end data dict (strings like "yes"/"no") and
    return a short list of prioritized recommendations.
    """
    recommendations = []

    # Avoid division by 0
    total = prediction if prediction > 0 else 1.0

    # Derive crude percentage-ish contributions (not absolute)
    transport_score = float(full_data.get('travelKmPerDay', 0)) * (2.0 if full_data.get('transportMode') == 'car' else 1.0)
    electricity_score = float(full_data.get('electricityUnits', 0))
    diet_score = float(full_data.get('meatMealsPerWeek', 0)) + float(full_data.get('dairyLitersPerDay', 0))
    waste_score = float(full_data.get('wasteKgPerWeek', 0))

    categories = [
        ('transport', transport_score),
        ('electricity', electricity_score),
        ('diet', diet_score),
        ('waste', waste_score)
    ]
    categories.sort(key=lambda x: x[1], reverse=True)

    # Top two categories
    top_two = [c for c, _ in categories[:2]]

    # Transportation suggestions
    if 'transport' in top_two:
        if full_data.get('transportMode') == 'car':
            if str(full_data.get('carpool', 'no')).lower() != 'yes':
                recommendations.append("🚗 TOP PRIORITY: Carpooling can cut your transport emissions in half.")
            recommendations.append("🚌 Try public transport 2-3 times/week to reduce emissions.")
        if full_data.get('travelKmPerDay', 0) and float(full_data.get('travelKmPerDay', 0)) <= 10:
            recommendations.append("🚴 Short trips under 10 km are great for cycling or walking.")

    # Electricity suggestions
    if 'electricity' in top_two:
        if str(full_data.get('renewableEnergy', 'no')).lower() != 'yes':
            recommendations.append("⚡ TOP PRIORITY: Switch to a renewable electricity plan to cut electricity emissions.")
        ac_usage = str(full_data.get('acUsage', 'never')).lower()
        if ac_usage == 'daily':
            recommendations.append("❄️ Optimize AC use: 24°C + fans can save 20-30% energy.")
        if float(full_data.get('electricityUnits', 0)) > 500:
            recommendations.append("🔌 Consider energy-efficient appliances and unplug unused devices.")

    # Diet suggestions
    if 'diet' in top_two:
        meat_meals = float(full_data.get('meatMealsPerWeek', 0))
        if meat_meals > 10:
            recommendations.append("🌱 TOP PRIORITY: Try Meatless Mondays to reduce diet emissions.")
        elif meat_meals > 5:
            recommendations.append("🥗 Great job — try one more plant-based day each week.")
        if str(full_data.get('localFood', 'no')).lower() != 'yes':
            recommendations.append("🥬 Choose local/seasonal produce to cut transport-related food emissions.")

    # Waste suggestions
    if 'waste' in top_two:
        if str(full_data.get('recycle', 'no')).lower() != 'yes':
            recommendations.append("♻️ TOP PRIORITY: Start recycling to reduce waste emissions.")
        if float(full_data.get('wasteKgPerWeek', 0)) > 15:
            recommendations.append("🗑️ Reduce single-use plastics and start basic composting.")

    # Lifestyle suggestions (always check)
    if float(full_data.get('onlineOrders', 0)) > 15:
        recommendations.append("📦 Bundle online orders to reduce delivery emissions.")
    if float(full_data.get('shoppingFreq', 0)) > 8:
        recommendations.append("🛍️ Buy quality over quantity — consider second-hand when possible.")

    # Simple potential savings estimate for motivation
    potential_savings = 0.0
    if full_data.get('transportMode') == 'car' and str(full_data.get('carpool', 'no')).lower() != 'yes':
        potential_savings += prediction * 0.20
    if str(full_data.get('renewableEnergy', 'no')).lower() != 'yes':
        potential_savings += prediction * 0.10
    if float(full_data.get('meatMealsPerWeek', 0)) > 5:
        potential_savings += prediction * 0.08

    if potential_savings > 0:
        recommendations.append(f"💫 Following these tips could save ~{potential_savings:.1f} kg CO₂/month.")

    # De-duplicate and return top 5
    unique = []
    for r in recommendations:
        if r not in unique:
            unique.append(r)
    return unique[:5]


@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        df = pd.DataFrame([data])

        # Load model and encoders
        model = joblib.load('public/data/carbon_footprint_model.joblib')
        label_encoders = joblib.load('public/data/label_encoders.joblib')

        # Encode categorical columns safely (handle unseen values)
        categorical_columns = ['transportMode', 'carpool', 'acUsage', 'renewableEnergy', 'localFood', 'recycle']

        def safe_transform_column(col_name):
            le = label_encoders.get(col_name)
            if le is None or col_name not in df.columns:
                return

            classes = list(le.classes_)
            transformed = []
            for val in df[col_name].tolist():
                # If exact match exists, keep it
                if val in classes:
                    transformed.append(val)
                    continue

                # Try converting to string and matching
                sval = str(val)
                if sval in classes:
                    transformed.append(sval)
                    continue

                # Map booleans to common yes/no if present in classes
                if isinstance(val, (bool,)):
                    candidate = 'yes' if val else 'no'
                    if candidate in classes:
                        transformed.append(candidate)
                        continue

                # Last-resort: pick the most common class (first element)
                transformed.append(classes[0])

            # Now transform using the label encoder
            try:
                df[col_name] = le.transform(transformed)
            except Exception:
                # Fallback: replace with zeros if transform unexpectedly fails
                df[col_name] = 0

        for col in categorical_columns:
            safe_transform_column(col)

        # Predict
        prediction = model.predict(df)[0]

        # --- Breakdown logic ---
        breakdown = {
            "transportation": float(prediction * 0.27),
            "electricity": float(prediction * 0.29),
            "diet": float(prediction * 0.26),
            "waste": float(prediction * 0.05),
            "lifestyle": float(prediction * 0.13)
        }

        # Use incoming raw data to generate personalized recommendations
        try:
            recommendations = get_personalized_recommendations(data, float(prediction))
        except Exception:
            recommendations = []

        return jsonify({
            "status": "success",
            "prediction": float(prediction),
            "emissions_breakdown": breakdown,
            "recommendations": recommendations
        })
    except Exception as e:
        # Include the error string so frontend can fall back gracefully
        return jsonify({"status": "error", "error": str(e)})


if __name__ == '__main__':
    print("Server starting on port 5000...")
    app.run(port=5000, debug=True)
