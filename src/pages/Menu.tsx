import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const Menu = () => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*");

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
    if (!product.is_available) {
      toast({
        title: "Product Unavailable",
        description: "Sorry, this item is currently not available.",
        variant: "destructive",
      });
      return;
    }

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

  // Get unique categories from products and add "specials" as first category
  const categories = products 
    ? ["all", "specials", ...new Set(products.map(product => product.category || "uncategorized"))]
    : ["all", "specials"];

  // Filter products based on selected category and search query
  const filteredProducts = products?.filter(product => {
    if (selectedCategory === "specials") {
      return product.is_special;
    }
    const matchesCategory = selectedCategory === "all" ? true : product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-foreground mb-6">
            Our Menu
          </h1>
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search our menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-12">
          <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
            <TabsList className="w-full flex flex-wrap justify-center gap-2 p-2 bg-white/50 backdrop-blur-sm rounded-full mb-8">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="capitalize px-6 py-2 rounded-full data-[state=active]:bg-accent data-[state=active]:text-white transition-all duration-300"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="animate-fade-up">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts?.map((product) => (
                    <Card 
                      key={product.id} 
                      className={`overflow-hidden group hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm ${!product.is_available ? 'opacity-75' : ''}`}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={product.image_url || "https://via.placeholder.com/400x300"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {!product.is_available && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                              Currently Unavailable
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold text-primary-foreground">
                            {product.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.is_available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-accent font-bold text-lg">
                            ${product.price}
                          </span>
                          <Button
                            onClick={() => handleAddToCart(product)}
                            className={`${
                              product.is_available 
                                ? 'bg-accent hover:bg-accent-dark' 
                                : 'bg-gray-400 cursor-not-allowed'
                            } text-white transform hover:scale-105 transition-all duration-300`}
                            disabled={!product.is_available}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {product.is_available ? 'Add to Cart' : 'Unavailable'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Menu;
