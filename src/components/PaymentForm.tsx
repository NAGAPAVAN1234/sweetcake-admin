
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentFormProps {
  orderId: string | null;
}

const PaymentForm = ({ orderId }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation/${orderId}`,
        },
      });

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Clear the cart after successful payment
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          localStorage.removeItem(`cart_${user.id}`);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/menu")}
        >
          Continue Shopping
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="bg-accent hover:bg-accent-dark"
        >
          {processing ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
