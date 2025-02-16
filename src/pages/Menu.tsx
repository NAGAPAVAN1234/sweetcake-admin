
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";

const Menu = () => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true);

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const loadCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const cartData = localStorage.getItem(`cart_${user.id}`);
        if (cartData) {
          setCartItems(JSON.parse(cartData));
        }
      }
    };

    loadCart();
  }, []);

  const handleAddToCart = async (product: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart.",
        variant: "destructive",
      });
      return;
    }

    const updatedCart = [...cartItems];
    const existingItem = updatedCart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      updatedCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: 1
      });
    }

    localStorage.setItem(`cart_${user.id}`, JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    
    toast({
      title: "Added to cart",
      description: "This product has been added to your cart.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary">
        <Navigation />
        <div className="pt-24 text-center">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-4xl font-bold text-primary-foreground text-center mb-8">
          Our Menu
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products?.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-w-16 aspect-h-12">
                <img
                  src={product.image_url || "https://via.placeholder.com/400x300"}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-accent font-bold">${product.price}</span>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="bg-accent hover:bg-accent-dark text-white"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;
