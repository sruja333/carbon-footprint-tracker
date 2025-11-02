import { useState } from "react";
import { Hero } from "@/components/Hero";
import { CarbonForm, CarbonFormData } from "@/components/CarbonForm";
import { Dashboard } from "@/components/Dashboard";
import { calculateCarbonFootprint, generateSuggestions, CarbonBreakdown } from "@/lib/carbonCalculator";
import { Leaf } from "lucide-react";

type AppState = "hero" | "form" | "dashboard";

const Index = () => {
  const [state, setState] = useState<AppState>("hero");
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<{
    breakdown: CarbonBreakdown;
    suggestions: string[];
  } | null>(null);

  const handleGetStarted = () => {
    setState("form");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleFormSubmit = (data: CarbonFormData) => {
    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      const breakdown = calculateCarbonFootprint(data);
      const suggestions = generateSuggestions(breakdown, data);
      
      setResults({ breakdown, suggestions });
      setState("dashboard");
      setIsCalculating(false);
      
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1500);
  };

  const handleReset = () => {
    setState("form");
    setResults(null);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              EcoTrack
            </span>
          </div>
          
          {state !== "hero" && (
            <button
              onClick={() => setState("hero")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Home
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {state === "hero" && <Hero onGetStarted={handleGetStarted} />}
        
        {state === "form" && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">Calculate Your Impact</h2>
              <p className="text-lg text-muted-foreground">
                Answer a few questions about your lifestyle to get your personalized carbon footprint
              </p>
            </div>
            <CarbonForm onSubmit={handleFormSubmit} isCalculating={isCalculating} />
          </div>
        )}
        
        {state === "dashboard" && results && (
          <div className="max-w-6xl mx-auto">
            <Dashboard 
              breakdown={results.breakdown}
              suggestions={results.suggestions}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Emission factors sourced from EPA, CarbonFootprint.com, and FAO
          </p>
          <p className="mt-2">
            Together, we can make a difference for our planet 🌍
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
