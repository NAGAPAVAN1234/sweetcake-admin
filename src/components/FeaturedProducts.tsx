
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const FeaturedProducts = () => {
  const navigate = useNavigate();
  
  const { data: specialProducts, isLoading } = useQuery({
    queryKey: ["special-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_special", true)
        .eq("is_available", true);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !specialProducts?.length) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Today's Specials
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Don't miss out on our specially selected items for today!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specialProducts.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-up"
            >
              <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                <img
                  src={product.image_url || "https://via.placeholder.com/400x300"}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-primary-foreground">
                    {product.name}
                  </h3>
                  <span className="bg-accent text-white px-3 py-1 rounded-full text-sm">
                    Special
                  </span>
                </div>
                <p className="text-primary-foreground/70 mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-accent font-bold">${product.price}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300"
                    onClick={() => navigate("/menu")}
                  >
                    Order Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
