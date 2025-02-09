
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-primary overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=2048&q=80')] bg-cover bg-center opacity-10" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <span className="inline-block animate-fade-up bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
          Handcrafted with Love
        </span>
        <h1 className="animate-fade-up [animation-delay:200ms] text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
          Baked with Love,
          <br />
          Just for You
        </h1>
        <p className="animate-fade-up [animation-delay:400ms] text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
          Discover our artisanal cakes made with premium ingredients and decorated
          with meticulous attention to detail.
        </p>
        <div className="animate-fade-up [animation-delay:600ms] flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-accent hover:bg-accent-dark text-white transition-all duration-300 group"
          >
            Order Now
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300"
          >
            View Menu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
