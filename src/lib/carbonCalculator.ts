import { CarbonFormData } from "@/components/CarbonForm";

// Emission factors based on EPA, CarbonFootprint.com, and FAO data
const EMISSION_FACTORS = {
  transport: {
    car: 0.21, // kg CO2 per km
    bike: 0.05,
    bus: 0.08,
    metro: 0.04,
    bicycle: 0,
    walk: 0,
  },
  carpool: 0.5, // 50% reduction when carpooling
  electricity: 0.5, // kg CO2 per unit
  acUsage: {
    0: 0,      // never
    4: 50,     // occasionally
    8: 150,    // daily
  },
  renewableEnergy: 0.7, // 30% reduction when using renewable
  meatMeals: 3.5, // kg CO2 per meal
  dairy: 2.5, // kg CO2 per liter
  localFood: 0.85, // 15% reduction for local food
  waste: 0.5, // kg CO2 per kg of waste
  recycle: 0.7, // 30% reduction for recycling
  water: 0.0003, // kg CO2 per liter
  shopping: 5, // kg CO2 per shopping trip
  onlineOrders: 6, // kg CO2 per order (packaging + delivery)
};

function calculateFallbackFootprint(data: CarbonFormData) {
  // Calculate transportation emissions
  const transportEmissions = 
    data.travelKmPerDay * 30 * EMISSION_FACTORS.transport[data.transportMode] *
    (data.carpool ? EMISSION_FACTORS.carpool : 1);

  // Calculate electricity emissions
  const electricityEmissions = 
    data.electricityUnits * EMISSION_FACTORS.electricity *
    (data.renewableEnergy ? EMISSION_FACTORS.renewableEnergy : 1);

  // Calculate food emissions
  const foodEmissions = 
    (data.meatMealsPerWeek * EMISSION_FACTORS.meatMeals) +
    (data.dairyLitersPerDay * 30 * EMISSION_FACTORS.dairy) *
    (data.localFood ? EMISSION_FACTORS.localFood : 1);

  // Calculate waste emissions
  const wasteEmissions = 
    data.wasteKgPerWeek * 4 * EMISSION_FACTORS.waste *
    (data.recycle ? EMISSION_FACTORS.recycle : 1) +
    data.waterUsageLiters * EMISSION_FACTORS.water;

  // Calculate lifestyle emissions
  const lifestyleEmissions = 
    data.shoppingFreq * EMISSION_FACTORS.shopping +
    data.onlineOrders * EMISSION_FACTORS.onlineOrders;

  const total = 
    transportEmissions + 
    electricityEmissions + 
    foodEmissions + 
    wasteEmissions + 
    lifestyleEmissions;

  return {
    prediction: total,
    emissions_breakdown: {
      transportation: transportEmissions,
      electricity: electricityEmissions,
      diet: foodEmissions,
      waste: wasteEmissions,
      lifestyle: lifestyleEmissions
    },
    recommendations: generateFallbackRecommendations(data)
  };
}

function generateFallbackRecommendations(data: CarbonFormData): string[] {
  const recommendations: string[] = [];

  // Transportation recommendations
  if (data.transportMode === "car") {
    if (!data.carpool) {
      recommendations.push("🚗 Consider carpooling to reduce your transportation emissions");
    }
    recommendations.push("🚲 Try cycling or using public transport for shorter trips");
  }

  // Energy recommendations
  if (!data.renewableEnergy) {
    recommendations.push("⚡ Switch to renewable energy sources for your electricity needs");
  }
  if (data.acUsage > 6) {
    recommendations.push("❄️ Reduce AC usage or adjust temperature by a few degrees");
  }

  // Diet recommendations
  if (data.meatMealsPerWeek > 5) {
    recommendations.push("🥗 Consider having more plant-based meals");
  }
  if (!data.localFood) {
    recommendations.push("🏡 Buy more local produce to reduce transportation emissions");
  }

  // Waste recommendations
  if (!data.recycle) {
    recommendations.push("♻️ Start recycling to reduce waste emissions");
  }
  if (data.wasteKgPerWeek > 5) {
    recommendations.push("🗑️ Try composting and reducing single-use items");
  }

  return recommendations.slice(0, 5);
}

export interface CarbonBreakdown {
  transportation: number;
  electricity: number;
  diet: number;
  waste: number;
  lifestyle: number;
  total: number;
}

export async function calculateCarbonFootprint(data: any) {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'error') {
      throw new Error(result.error || 'Unknown prediction error');
    }

    return {
      prediction: result.prediction,
      emissions_breakdown: result.emissions_breakdown,
      recommendations: result.recommendations
    };
  } catch (error) {
    console.error('Error calculating carbon footprint:', error);
    // Return fallback calculation
    return calculateFallbackFootprint(data);
  }
}


export const getAverageFootprint = () => 850; // Average kg CO2 per month

export const getCategoryAverages = () => ({
  transportation: 180,
  electricity: 250,
  diet: 220,
  waste: 100,
  lifestyle: 100,
});

export const generateSuggestions = (breakdown: CarbonBreakdown, data: CarbonFormData) => {
  const suggestions = [];
  
  // Sort categories by impact
  const categories = [
    { name: "transportation", value: breakdown.transportation },
    { name: "electricity", value: breakdown.electricity },
    { name: "diet", value: breakdown.diet },
    { name: "waste", value: breakdown.waste },
    { name: "lifestyle", value: breakdown.lifestyle },
  ].sort((a, b) => b.value - a.value);

  // Generate personalized suggestions based on highest emissions AND what user is NOT already doing
  const topCategory = categories[0].name;
  const secondCategory = categories[1].name;
  
  // Transportation suggestions - only if user is NOT already doing these things
  if (topCategory === "transportation" || secondCategory === "transportation") {
    if (data.transportMode === "car" && !data.carpool) {
      suggestions.push("🚗 TOP PRIORITY: Carpooling can cut your transport emissions in half!");
    } else if (data.transportMode === "car") {
      suggestions.push("🚌 Consider using public transport 2-3 times per week to reduce emissions by up to 40%");
    }
    if (data.transportMode !== "bicycle" && data.transportMode !== "walk" && data.travelKmPerDay < 10) {
      suggestions.push("🚴 Try cycling or walking for short distances under 10km");
    }
  }
  
  // Electricity suggestions - only suggest what they're NOT doing
  if (topCategory === "electricity" || secondCategory === "electricity") {
    if (!data.renewableEnergy) {
      suggestions.push("⚡ TOP PRIORITY: Switch to renewable energy plans to reduce electricity emissions by 30%");
    }
    if (data.acUsage > 6) {
      suggestions.push("❄️ Use AC efficiently: set to 24°C and use fans to save 20-30% energy");
    } else if (data.acUsage > 3 && data.electricityUnits > 400) {
      suggestions.push("💡 Replace old appliances with energy-efficient models to save up to 40% energy");
    }
    if (data.electricityUnits > 500) {
      suggestions.push("🔌 Unplug devices when not in use - phantom load accounts for 10% of home energy");
    }
  }
  
  // Diet suggestions - only if user is NOT already doing these things
  if (topCategory === "diet" || secondCategory === "diet") {
    if (data.meatMealsPerWeek > 10) {
      suggestions.push("🌱 TOP PRIORITY: Try Meatless Mondays - reducing meat by just 2 meals/week saves ~30kg CO2/month");
    } else if (data.meatMealsPerWeek > 5 && data.meatMealsPerWeek <= 10) {
      suggestions.push("🥗 Great job on reducing meat! Try one more plant-based day per week");
    }
    if (!data.localFood) {
      suggestions.push("🥬 Choose local, seasonal produce to reduce food transportation emissions by 15%");
    }
    if (data.dairyLitersPerDay > 1.5) {
      suggestions.push("🥛 Consider plant-based milk alternatives to reduce dairy emissions");
    }
  }
  
  // Waste suggestions - only if NOT already doing
  if (topCategory === "waste" || secondCategory === "waste") {
    if (!data.recycle) {
      suggestions.push("♻️ TOP PRIORITY: Start recycling! It can reduce waste emissions by 30%");
    }
    if (data.wasteKgPerWeek > 20) {
      suggestions.push("🗑️ Reduce single-use plastics and start composting to cut waste by 50%");
    } else if (data.wasteKgPerWeek > 15 && data.recycle) {
      suggestions.push("🍂 Compost food waste to further reduce landfill emissions");
    }
    if (data.waterUsageLiters > 300) {
      suggestions.push("💧 Install low-flow fixtures to reduce water usage by 30%");
    }
  }
  
  // Lifestyle suggestions - only if applicable
  if (topCategory === "lifestyle" || secondCategory === "lifestyle") {
    if (data.onlineOrders > 15) {
      suggestions.push("📦 TOP PRIORITY: Bundle online orders to reduce delivery emissions by 40%");
    }
    if (data.shoppingFreq > 10) {
      suggestions.push("👕 Buy quality over quantity - fast fashion contributes 10% of global emissions");
    } else if (data.shoppingFreq > 5) {
      suggestions.push("🛍️ Consider second-hand shopping for clothes and furniture");
    }
  }

  // Add tree planting suggestion
  const treesNeeded = Math.ceil(breakdown.total / 25);
  suggestions.push(`🌳 Plant ${treesNeeded} trees this month to offset your carbon footprint`);

  // Remove duplicates and return top 5
  const uniqueSuggestions = [...new Set(suggestions)];
  return uniqueSuggestions.slice(0, 5);
};
