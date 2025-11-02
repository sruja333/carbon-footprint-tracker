import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Leaf, TrendingDown, TrendingUp, Lightbulb, RefreshCw } from "lucide-react";
import { CarbonBreakdown, getAverageFootprint } from "@/lib/carbonCalculator";

interface DashboardProps {
  breakdown: CarbonBreakdown;
  suggestions: string[];
  onReset: () => void;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export const Dashboard = ({ breakdown, suggestions, onReset }: DashboardProps) => {
  const average = getAverageFootprint();
  const percentDiff = ((breakdown.total - average) / average * 100);
  const isBelow = percentDiff < 0;

  const pieData = [
    { name: "Transportation", value: breakdown.transportation },
    { name: "Electricity", value: breakdown.electricity },
    { name: "Diet", value: breakdown.diet },
    { name: "Waste & Water", value: breakdown.waste },
    { name: "Lifestyle", value: breakdown.lifestyle },
  ];

  const comparisonData = [
    {
      category: "You",
      value: breakdown.total,
    },
    {
      category: "Average",
      value: average,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Summary Card */}
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Leaf className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Your Carbon Footprint</CardTitle>
          <CardDescription>Monthly estimation based on your inputs</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            {breakdown.total}
          </div>
          <div className="text-2xl text-muted-foreground mb-6">
            kg CO₂ per month
          </div>
          
          <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
            {isBelow ? (
              <>
                <TrendingDown className="w-6 h-6 text-primary" />
                <span className="text-lg font-semibold text-primary">
                  You're {Math.abs(percentDiff).toFixed(1)}% below average!
                </span>
              </>
            ) : (
              <>
                <TrendingUp className="w-6 h-6 text-destructive" />
                <span className="text-lg font-semibold text-destructive">
                  You're {percentDiff.toFixed(1)}% above average
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Emission Breakdown</CardTitle>
            <CardDescription>Where your emissions come from</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-muted-foreground">{item.name}: {item.value} kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>You vs Average</CardTitle>
            <CardDescription>How you compare to others</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="hsl(var(--primary))" name="Carbon Footprint (kg/month)" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Global average: <span className="font-semibold text-foreground">{average} kg CO₂/month</span>
              </p>
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
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>Small changes that make a big impact</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <li 
                key={index} 
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="text-lg mt-0.5">{suggestion.split(" ")[0]}</span>
                <span className="text-sm flex-1">{suggestion.split(" ").slice(1).join(" ")}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <div className="flex justify-center pt-4">
        <Button 
          variant="outline" 
          size="lg"
          onClick={onReset}
          className="gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Calculate Again
        </Button>
      </div>
    </div>
  );
};
