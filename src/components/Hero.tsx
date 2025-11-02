import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-earth.jpg";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
      
      <div className="container relative z-10 mx-auto px-4 text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full animate-float">
            <Leaf className="w-16 h-16 text-primary" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Track Your Carbon Footprint
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Make a difference today. Understand your environmental impact and get personalized recommendations to live more sustainably.
        </p>
        
        <Button 
          size="lg" 
          className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          onClick={onGetStarted}
        >
          Start Your Journey
        </Button>
      </div>
    </section>
  );
};
