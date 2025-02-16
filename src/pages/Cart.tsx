import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PaymentForm from "@/components/PaymentForm";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const cartData = localStorage.getItem(`cart_${user.id}`);
      if (cartData) {
        setCartItems(JSON.parse(cartData));
      }
      setLoading(false);
    };

    loadCart();
  }, [navigate]);

  const updateCart = async (items: any[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(items));
      setCartItems(items);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    const updatedItems = cartItems.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    );
    updateCart(updatedItems);
  };

  const removeItem = (id: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== id);
    updateCart(updatedItems);
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    });
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          items: cartItems,
          userId: user.id,
        },
      });

      if (error) throw error;

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "There was a problem initiating checkout. Please try again.",
        variant: "destructive",
      });
      console.error("Checkout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-primary">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button
              onClick={() => navigate("/menu")}
              className="bg-accent hover:bg-accent-dark"
            >
              Browse Menu
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-4xl font-bold text-primary-foreground text-center mb-8">
          Your Cart
        </h1>
        <div className="max-w-4xl mx-auto">
          {!clientSecret ? (
            <>
              {cartItems.map((item) => (
                <Card key={item.id} className="mb-4 p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-accent">${item.price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              <Card className="mt-8 p-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-semibold">Total</span>
                  <span className="text-xl font-bold text-accent">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-accent hover:bg-accent-dark"
                >
                  Proceed to Checkout
                </Button>
              </Card>
            </>
          ) : (
            <Card className="p-6">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm orderId={orderId} />
              </Elements>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
