// Types for carbon footprint statistics
export interface CarbonStats {
  average_footprint: number;
  min_footprint: number;
  max_footprint: number;
  percentiles: {
    '25': number;
    '50': number;
    '75': number;
  };
}

// Types for feature importance data
export interface FeatureImportance {
  feature: string;
  importance: number;
}

// Mapping for feature display names
export const featureDisplayNames: { [key: string]: string } = {
  electricityUnits: 'Electricity Usage',
  renewableEnergy: 'Renewable Energy',
  shoppingFreq: 'Shopping Frequency',
  meatMealsPerWeek: 'Meat Consumption',
  travelKmPerDay: 'Daily Travel Distance',
  dairyLitersPerDay: 'Dairy Consumption',
  transportMode: 'Transport Mode',
  wasteKgPerWeek: 'Waste Generation',
  onlineOrders: 'Online Orders',
  waterUsageLiters: 'Water Usage',
  acUsage: 'AC Usage',
  carpool: 'Carpooling',
  recycle: 'Recycling',
  localFood: 'Local Food'
};