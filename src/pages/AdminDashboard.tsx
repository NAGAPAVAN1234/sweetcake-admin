import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type OrderStatus = Database["public"]["Enums"]["order_status"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [revenueData, setRevenueData] = useState<any[]>([]);

  const { data: userRole, isLoading: isCheckingRole } = useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data?.role;
    },
  });

  const { data: recentOrders, isLoading: isLoadingOrders, refetch } = useQuery({
    queryKey: ["recentOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          total_amount,
          status,
          user_id,
          profiles!inner (
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: userRole === "admin",
  });

  useEffect(() => {
    if (recentOrders) {
      const processedData = recentOrders.reduce((acc: any[], order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        const existingDate = acc.find(item => item.date === date);
        
        if (existingDate) {
          existingDate.revenue += Number(order.total_amount);
        } else {
          acc.push({
            date,
            revenue: Number(order.total_amount)
          });
        }
        return acc;
      }, []);
      
      setRevenueData(processedData.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
    }
  }, [recentOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status.",
      });
    } else {
      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
      refetch();
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
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

  useEffect(() => {
    if (!isCheckingRole && userRole !== "admin") {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You do not have permission to access the admin dashboard.",
      });
      navigate("/");
    }
  }, [userRole, isCheckingRole, navigate, toast]);

  if (isCheckingRole) {
    return (
      <div className="min-h-screen bg-primary">
        <Navigation />
        <div className="pt-24 text-center">Checking permissions...</div>
      </div>
    );
  }

  if (userRole !== "admin") {
    return null; // Will redirect due to useEffect
  }

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-4xl font-bold text-primary-foreground text-center mb-8">
          Admin Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-accent">
              {recentOrders?.length || 0}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-accent">
              $
              {recentOrders
                ?.reduce((sum, order) => sum + Number(order.total_amount), 0)
                .toFixed(2) || "0.00"}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Pending Orders</h3>
            <p className="text-3xl font-bold text-accent">
              {recentOrders?.filter((order) => order.status === "pending").length ||
                0}
            </p>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Revenue Overview</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Recent Orders</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {order.profiles?.first_name || 'N/A'} {order.profiles?.last_name || ''}
                    </TableCell>
                    <TableCell>${Number(order.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "pending"
                            ? "default"
                            : order.status === "confirmed"
                            ? "secondary"
                            : order.status === "preparing"
                            ? "default"
                            : order.status === "ready"
                            ? "secondary"
                            : order.status === "delivered"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status || "pending"}
                        onValueChange={(value: OrderStatus) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="preparing">Preparing</SelectItem>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
