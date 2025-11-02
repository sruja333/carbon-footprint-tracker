import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Home, Utensils, Trash2, ShoppingBag, Loader2 } from "lucide-react";

export interface CarbonFormData {
  travelKmPerDay: number;
  transportMode: string;
  carpool: string;
  electricityUnits: number;
  acUsage: string;
  renewableEnergy: string;
  meatMealsPerWeek: number;
  dairyLitersPerDay: number;
  localFood: string;
  wasteKgPerWeek: number;
  recycle: string;
  waterUsageLiters: number;
  shoppingFreq: number;
  onlineOrders: number;
}

interface CarbonFormProps {
  onSubmit: (data: CarbonFormData) => void;
  isCalculating: boolean;
}

export const CarbonForm = ({ onSubmit, isCalculating }: CarbonFormProps) => {
  const [formData, setFormData] = useState<CarbonFormData>({
    travelKmPerDay: 30,
    transportMode: "car",
    carpool: "no",
    electricityUnits: 300,
    acUsage: "occasionally",
    renewableEnergy: "no",
    meatMealsPerWeek: 7,
    dairyLitersPerDay: 1,
    localFood: "no",
    wasteKgPerWeek: 15,
    recycle: "no",
    waterUsageLiters: 200,
    shoppingFreq: 5,
    onlineOrders: 10,
  });

  const updateField = (field: keyof CarbonFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Travel & Transportation */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Travel & Transportation</CardTitle>
              <CardDescription>Your daily commute and travel habits</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>How many km do you travel per day? ({formData.travelKmPerDay} km)</Label>
            <Slider
              value={[formData.travelKmPerDay]}
              onValueChange={([value]) => updateField("travelKmPerDay", value)}
              max={100}
              step={1}
              className="py-4"
            />
          </div>
          
          <div className="space-y-3">
            <Label>Main mode of transport</Label>
            <Select value={formData.transportMode} onValueChange={(value) => updateField("transportMode", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car">🚗 Car</SelectItem>
                <SelectItem value="bike">🏍️ Bike</SelectItem>
                <SelectItem value="bus">🚌 Bus</SelectItem>
                <SelectItem value="metro">🚇 Metro</SelectItem>
                <SelectItem value="bicycle">🚴 Bicycle</SelectItem>
                <SelectItem value="walk">🚶 Walk</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <Label>Do you carpool?</Label>
            <Select value={formData.carpool} onValueChange={(value) => updateField("carpool", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Home Energy */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Home className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <CardTitle>Home Energy Usage</CardTitle>
              <CardDescription>Electricity and energy consumption</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Monthly electricity units ({formData.electricityUnits} units)</Label>
            <Slider
              value={[formData.electricityUnits]}
              onValueChange={([value]) => updateField("electricityUnits", value)}
              max={1000}
              step={10}
              className="py-4"
            />
          </div>
          
          <div className="space-y-3">
            <Label>Air conditioning usage</Label>
            <Select value={formData.acUsage} onValueChange={(value) => updateField("acUsage", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="occasionally">Occasionally</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <Label>Use renewable energy?</Label>
            <Select value={formData.renewableEnergy} onValueChange={(value) => updateField("renewableEnergy", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Food & Diet */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Utensils className="w-6 h-6 text-accent" />
            </div>
            <div>
              <CardTitle>Food & Diet Habits</CardTitle>
              <CardDescription>Your dietary choices impact</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Non-veg meals per week ({formData.meatMealsPerWeek} meals)</Label>
            <Slider
              value={[formData.meatMealsPerWeek]}
              onValueChange={([value]) => updateField("meatMealsPerWeek", value)}
              max={21}
              step={1}
              className="py-4"
            />
          </div>
          
          <div className="space-y-3">
            <Label>Daily dairy consumption ({formData.dairyLitersPerDay.toFixed(1)} liters)</Label>
            <Slider
              value={[formData.dairyLitersPerDay * 10]}
              onValueChange={([value]) => updateField("dairyLitersPerDay", value / 10)}
              max={30}
              step={1}
              className="py-4"
            />
          </div>
          
          <div className="space-y-3">
            <Label>Prefer local/seasonal food?</Label>
            <Select value={formData.localFood} onValueChange={(value) => updateField("localFood", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Waste & Water */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trash2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Waste & Water</CardTitle>
              <CardDescription>Waste generation and water usage</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Weekly waste generation ({formData.wasteKgPerWeek} kg)</Label>
            <Slider
              value={[formData.wasteKgPerWeek]}
              onValueChange={([value]) => updateField("wasteKgPerWeek", value)}
              max={50}
              step={1}
              className="py-4"
            />
          </div>
          
          <div className="space-y-3">
            <Label>Do you recycle?</Label>
            <Select value={formData.recycle} onValueChange={(value) => updateField("recycle", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <Label>Daily water usage ({formData.waterUsageLiters} liters)</Label>
            <Slider
              value={[formData.waterUsageLiters]}
              onValueChange={([value]) => updateField("waterUsageLiters", value)}
              max={1000}
              step={10}
              className="py-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <CardTitle>Lifestyle Extras</CardTitle>
              <CardDescription>Shopping and consumption habits</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Monthly shopping frequency ({formData.shoppingFreq} times)</Label>
            <Slider
              value={[formData.shoppingFreq]}
              onValueChange={([value]) => updateField("shoppingFreq", value)}
              max={20}
              step={1}
              className="py-4"
            />
          </div>
          
          <div className="space-y-3">
            <Label>Monthly online orders ({formData.onlineOrders} orders)</Label>
            <Slider
              value={[formData.onlineOrders]}
              onValueChange={([value]) => updateField("onlineOrders", value)}
              max={30}
              step={1}
              className="py-4"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-4">
        <Button 
          type="submit" 
          size="lg" 
          className="w-full md:w-auto min-w-[200px] text-lg py-6"
          disabled={isCalculating}
        >
          {isCalculating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Calculating...
            </>
          ) : (
            "Calculate My Footprint"
          )}
        </Button>
      </div>
    </form>
  );
};
