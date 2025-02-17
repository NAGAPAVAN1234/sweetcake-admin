
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import OrderFeedback from "@/components/OrderFeedback";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MyOrders = () => {
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: orders, refetch } = useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            quantity,
            price_at_time,
            product_id,
            products (
              name,
              image_url
            )
          ),
          order_feedback (
            rating,
            comment
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Subscribe to order updates
  useEffect(() => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "confirmed":
        return "secondary";
      case "preparing":
        return "default";
      case "ready":
        return "secondary";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-4xl font-bold text-primary-foreground text-center mb-8">
          My Orders
        </h1>
        <div className="max-w-4xl mx-auto">
          {orders?.map((order) => (
            <Card key={order.id} className="mb-6 p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Order ID: {order.id.slice(0, 8)}...
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>

              <div className="space-y-4">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.products.image_url}
                      alt={item.products.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.products.name}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.price_at_time * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <p className="font-bold">
                  Total: ${Number(order.total_amount).toFixed(2)}
                </p>
                {order.status === "delivered" && !order.order_feedback?.[0] && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => setSelectedOrderId(order.id)}
                        className="bg-accent hover:bg-accent-dark"
                      >
                        Leave Feedback
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Order Feedback</DialogTitle>
                      </DialogHeader>
                      <OrderFeedback
                        orderId={order.id}
                        onFeedbackSubmitted={() => {
                          setSelectedOrderId(null);
                          refetch();
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                )}
                {order.order_feedback?.[0] && (
                  <Badge variant="secondary">Feedback Submitted</Badge>
                )}
              </div>
            </Card>
          ))}

          {orders?.length === 0 && (
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">No orders yet</h2>
              <p className="text-gray-600 mb-6">
                You haven't placed any orders yet.
              </p>
              <Button
                onClick={() => navigate("/menu")}
                className="bg-accent hover:bg-accent-dark"
              >
                Browse Menu
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
