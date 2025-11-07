import { CarbonFormData } from "@/components/CarbonForm";

// Function to prepare form data for ML model prediction
export const prepareFormData = (formData: CarbonFormData) => {
  return {
    travelKmPerDay: formData.travelKmPerDay,
    transportMode: formData.transportMode,
    carpool: formData.carpool,
    electricityUnits: formData.electricityUnits,
    acUsage: formData.acUsage,
    renewableEnergy: formData.renewableEnergy,
    meatMealsPerWeek: formData.meatMealsPerWeek,
    dairyLitersPerDay: formData.dairyLitersPerDay,
    localFood: formData.localFood,
    wasteKgPerWeek: formData.wasteKgPerWeek,
    recycle: formData.recycle,
    waterUsageLiters: formData.waterUsageLiters,
    shoppingFreq: formData.shoppingFreq,
    onlineOrders: formData.onlineOrders
  };
};

// Function to make prediction request to Python backend
export const predictCarbonFootprint = async (formData: CarbonFormData): Promise<number> => {
  try {
    console.log("Preparing data for prediction:", formData);
    const preparedData = prepareFormData(formData);
    
    try {
      // First test if the server is running
      const testResponse = await fetch('http://localhost:5000/test');
      if (!testResponse.ok) {
        console.warn('Server health check failed, falling back to local calculation');
        return calculateFallbackPrediction(formData);
      }
      
      // Make the actual prediction request
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preparedData),
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        console.error('Server returned error status:', response.status);
        return calculateFallbackPrediction(formData);
      }
      
      const result = await response.json();
      console.log("Prediction result:", result);

      
      
      if (result.status === 'error') {
        console.error('Server reported error:', result.error);
        return calculateFallbackPrediction(formData);
      }
      
      // Ensure the prediction is a valid number
      if (typeof result.prediction !== 'number' || isNaN(result.prediction)) {
        console.error('Invalid prediction value received:', result.prediction);
        return calculateFallbackPrediction(formData);
      }
      
      return result.prediction;
    } catch (error) {
      console.error('Server error:', error);
      return calculateFallbackPrediction(formData);
    }
  } catch (error) {
    console.error('Error in prediction:', error);
    return calculateFallbackPrediction(formData);
  }
};

// Fallback calculation function
const calculateFallbackPrediction = (formData: CarbonFormData): number => {
  const baseValue = 500; // Base carbon footprint
  
  // Simple multipliers
  const transportFactors: { [key: string]: number } = {
    car: 1.5,
    bus: 0.8,
    bike: 0.2,
    walk: 0.1,
    metro: 0.6
  };
  
  const transportMultiplier = transportFactors[formData.transportMode] || 1.0;
  const electricityMultiplier = (formData.electricityUnits / 300);
  const meatMultiplier = (formData.meatMealsPerWeek / 7);
  
  return baseValue * transportMultiplier * electricityMultiplier * meatMultiplier;
};

// Mock stats data
const mockStats = {
  average_footprint: 750,
  min_footprint: 300,
  max_footprint: 1500,
  percentiles: {
    '25': 500,
    '50': 750,
    '75': 1000
  }
};

// Mock feature importance data
const mockFeatureImportance = [
  { feature: 'electricityUnits', importance: 0.3 },
  { feature: 'transportMode', importance: 0.2 },
  { feature: 'meatMealsPerWeek', importance: 0.15 },
  { feature: 'waterUsageLiters', importance: 0.1 },
  { feature: 'wasteKgPerWeek', importance: 0.1 },
  { feature: 'onlineOrders', importance: 0.05 },
  { feature: 'shoppingFreq', importance: 0.05 },
  { feature: 'dairyLitersPerDay', importance: 0.05 }
];

// Function to get carbon statistics
export const getCarbonStats = async () => {
  try {
    const response = await fetch('/data/carbon_stats.json');
    if (!response.ok) {
      return mockStats;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching carbon statistics:', error);
    return mockStats;
  }
};

// Function to get feature importance
export const getFeatureImportance = async () => {
  try {
    const response = await fetch('/data/feature_importance.json');
    if (!response.ok) {
      return mockFeatureImportance;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching feature importance:', error);
    return mockFeatureImportance;
  }
};