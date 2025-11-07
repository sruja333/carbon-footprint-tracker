import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis
} from "recharts";
import { Leaf, TrendingDown, TrendingUp, Lightbulb, RefreshCw, Target } from "lucide-react";
import { CarbonStats, FeatureImportance } from "@/lib/types";
import { useEffect, useState } from "react";

interface DashboardProps {
  prediction: number;
  formData: any;
  suggestions: string[];
  onReset: () => void;
}

const COLORS = {
  pie: ["#00a854", "#00b869", "#00c77e", "#00d693", "#00e6a8"],
  bar: {
    yours: "#046c4e",
    average: "#10b981"
  }
};

export const Dashboard = ({ prediction, formData, suggestions, onReset }: DashboardProps) => {
  const [stats, setStats] = useState<CarbonStats | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);
  
  useEffect(() => {
    // Fetch carbon statistics
    fetch('/data/carbon_stats.json')
      .then(res => res.json())
      .then(data => setStats(data));

    // Load feature importance data
    fetch('/data/feature_importance.json')
      .then(res => res.json())
      .then(data => setFeatureImportance(data));
  }, []);

  if (!stats) return <div>Loading...</div>;

  const percentDiff = ((prediction - stats.average_footprint) / stats.average_footprint * 100);
  const isBelow = percentDiff < 0;

  // Prepare data for category comparison chart
  const categoryComparisonData = [
    { 
      category: 'Transportation',
      yours: formData.emissions_breakdown?.transportation || 0,
      average: stats.average_footprint * 0.27
    },
    { 
      category: 'Electricity',
      yours: formData.emissions_breakdown?.electricity || 0,
      average: stats.average_footprint * 0.29
    },
    { 
      category: 'Diet',
      yours: formData.emissions_breakdown?.diet || 0,
      average: stats.average_footprint * 0.26
    },
    { 
      category: 'Waste & Water',
      yours: formData.emissions_breakdown?.waste || 0,
      average: stats.average_footprint * 0.05
    },
    { 
      category: 'Lifestyle',
      yours: formData.emissions_breakdown?.lifestyle || 0,
      average: stats.average_footprint * 0.12
    }
  ].reverse();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Summary Card */}
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="mb-2">
            <Target className="w-8 h-8 mx-auto text-primary mb-2" />
            <CardTitle>Your Carbon Footprint</CardTitle>
            <CardDescription>Monthly CO₂ emissions estimate</CardDescription>
          </div>
          <div className="text-4xl font-bold text-primary">
            {prediction.toFixed(1)} <span className="text-xl">kg CO₂</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            {isBelow ? (
              <TrendingDown className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingUp className="w-5 h-5 text-red-500" />
            )}
            <span className={isBelow ? "text-green-500" : "text-red-500"}>
              {Math.abs(percentDiff).toFixed(1)}% {isBelow ? "below" : "above"} average
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Emission Breakdown Pie Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Emission Breakdown</CardTitle>
            <CardDescription>Where your emissions come from</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Transportation: 27%', value: formData.emissions_breakdown?.transportation || 0 },
                    { name: 'Electricity: 29%', value: formData.emissions_breakdown?.electricity || 0 },
                    { name: 'Diet: 26%', value: formData.emissions_breakdown?.diet || 0 },
                    { name: 'Waste & Water: 5%', value: formData.emissions_breakdown?.waste || 0 },
                    { name: 'Lifestyle: 12%', value: formData.emissions_breakdown?.lifestyle || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name }) => name}
                  outerRadius={110}
                  fill="#00b869"
                  dataKey="value"
                >
                  {COLORS.pie.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: 'Transportation:', value: `${formData.emissions_breakdown?.transportation?.toFixed(1) || 0} kg` },
                  { label: 'Electricity:', value: `${formData.emissions_breakdown?.electricity?.toFixed(1) || 0} kg` },
                  { label: 'Diet:', value: `${formData.emissions_breakdown?.diet?.toFixed(1) || 0} kg` },
                  { label: 'Waste & Water:', value: `${formData.emissions_breakdown?.waste?.toFixed(1) || 0} kg` },
                  { label: 'Lifestyle:', value: `${formData.emissions_breakdown?.lifestyle?.toFixed(1) || 0} kg` }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span>{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Comparison Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>You vs Average by Category</CardTitle>
            <CardDescription>Compare your emissions in each area</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={categoryComparisonData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <XAxis 
                  type="number"
                  axisLine={true}
                  tickLine={true}
                  domain={[0, 260]}
                />
                <YAxis 
                  dataKey="category" 
                  type="category" 
                  axisLine={false}
                  tickLine={false}
                />
                <Bar 
                  dataKey="yours" 
                  name="Your Footprint" 
                  fill={COLORS.bar.yours}
                  barSize={20}
                />
                <Bar 
                  dataKey="average" 
                  name="Average User" 
                  fill={COLORS.bar.average}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-1 text-sm text-muted-foreground text-center">
              Total average: <span className="font-semibold ml-1">{stats.average_footprint.toFixed(1)} kg CO₂/month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions Card */}
      <Card className="shadow-md border-accent/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Lightbulb className="w-6 h-6 text-accent" />
            </div>
            <div>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Ways to reduce your carbon footprint</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3">
                <Leaf className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">{suggestion}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <div className="flex justify-center pt-4">
        <Button 
          variant="outline"
          onClick={onReset}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Start Over
        </Button>
      </div>
    </div>
  );
};