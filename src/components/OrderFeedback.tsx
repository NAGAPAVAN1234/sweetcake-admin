
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OrderFeedbackProps {
  orderId: string;
  onFeedbackSubmitted: () => void;
}

const OrderFeedback = ({ orderId, onFeedbackSubmitted }: OrderFeedbackProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("order_feedback")
        .insert({
          order_id: orderId,
          user_id: user.id,
          rating,
          comment,
        });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });
      onFeedbackSubmitted();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 ${
                value <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Share your experience with this order..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[100px]"
      />
      <Button
        type="submit"
        disabled={rating === 0 || isSubmitting}
        className="w-full bg-accent hover:bg-accent-dark"
      >
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  );
};

export default OrderFeedback;
