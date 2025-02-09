
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";

const Index = () => {
  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      <Hero />
      <FeaturedProducts />
    </div>
  );
};

export default Index;
