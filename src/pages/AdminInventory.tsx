import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import InventoryHistory from "@/components/InventoryHistory";
import TimeFrameSelector from "@/components/inventory/TimeFrameSelector";
import RevenueChart from "@/components/inventory/RevenueChart";
import ProductPerformance from "@/components/inventory/ProductPerformance";
import InventoryHealth from "@/components/inventory/InventoryHealth";
import InventoryTable from "@/components/inventory/InventoryTable";

type Ingredient = {
  id: string;
  name: string;
  current_stock: number;
  unit: string;
  minimum_stock: number;
  cost_per_unit: number;
  expiry_date: string | null;
  supplier_id: string | null;
  created_at: string;
  updated_at: string;
};

const EXAMPLE_SALES_DATA = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 15000 },
  { month: 'Mar', revenue: 18000 },
  { month: 'Apr', revenue: 16000 },
  { month: 'May', revenue: 21000 },
  { month: 'Jun', revenue: 19000 },
];

const EXAMPLE_TOP_PRODUCTS = [
  { name: 'Chocolate Cake', sales: 150 },
  { name: 'Vanilla Cupcake', sales: 120 },
  { name: 'Red Velvet', sales: 100 },
  { name: 'Carrot Cake', sales: 80 },
  { name: 'Cheesecake', sales: 75 },
];

const EXAMPLE_WEEKLY_SALES = [
  { day: 'Mon', revenue: 2100, orders: 25 },
  { day: 'Tue', revenue: 2400, orders: 30 },
  { month: 'Wed', revenue: 2200, orders: 28 },
  { day: 'Thu', revenue: 2800, orders: 35 },
  { day: 'Fri', revenue: 3200, orders: 40 },
  { day: 'Sat', revenue: 3500, orders: 45 },
  { day: 'Sun', revenue: 2900, orders: 38 },
];

const EXAMPLE_YEARLY_SALES = [
  { year: '2023', revenue: 180000, growth: 15 },
  { year: '2024', revenue: 210000, growth: 16.7 },
];

const EXAMPLE_PRODUCT_METRICS = [
  { 
    name: 'Chocolate Cake',
    sales: 150,
    revenue: 4500,
    profit: 2250,
    rating: 4.8,
    reorderRate: 65
  },
  { 
    name: 'Vanilla Cupcake',
    sales: 120,
    revenue: 3600,
    profit: 1800,
    rating: 4.5,
    reorderRate: 58
  },
];

const AdminInventory = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('month');
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    current_stock: "",
    unit: "",
    minimum_stock: "",
    cost_per_unit: "",
    expiry_date: "",
  });
  const [transactionData, setTransactionData] = useState({
    quantity: "",
    transaction_type: "manual_addition",
    notes: "",
  });

  const { data: ingredients, isLoading, refetch } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("ingredients").insert([
        {
          name: formData.name,
          current_stock: Number(formData.current_stock),
          unit: formData.unit,
          minimum_stock: Number(formData.minimum_stock),
          cost_per_unit: Number(formData.cost_per_unit),
          expiry_date: formData.expiry_date || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ingredient added successfully",
      });
      setIsDialogOpen(false);
      setFormData({
        name: "",
        current_stock: "",
        unit: "",
        minimum_stock: "",
        cost_per_unit: "",
        expiry_date: "",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add ingredient",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("ingredients")
        .update({
          name: formData.name,
          current_stock: Number(formData.current_stock),
          unit: formData.unit,
          minimum_stock: Number(formData.minimum_stock),
          cost_per_unit: Number(formData.cost_per_unit),
          expiry_date: formData.expiry_date || null,
        })
        .eq("id", selectedIngredient.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ingredient updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedIngredient(null);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ingredient",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("ingredients").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ingredient deleted successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete ingredient",
        variant: "destructive",
      });
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("inventory_transactions").insert([
        {
          ingredient_id: selectedIngredient.id,
          quantity: Number(transactionData.quantity),
          transaction_type: transactionData.transaction_type,
          notes: transactionData.notes,
        },
      ]);

      if (error) throw error;

      const newStock =
        selectedIngredient.current_stock +
        (transactionData.transaction_type === "manual_addition"
          ? Number(transactionData.quantity)
          : -Number(transactionData.quantity));

      const { error: updateError } = await supabase
        .from("ingredients")
        .update({ current_stock: newStock })
        .eq("id", selectedIngredient.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
      setIsTransactionDialogOpen(false);
      setSelectedIngredient(null);
      setTransactionData({
        quantity: "",
        transaction_type: "manual_addition",
        notes: "",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
    }
  };

  const getStockStatus = (ingredient: Ingredient) => {
    const stock = Number(ingredient.current_stock);
    const minimum = Number(ingredient.minimum_stock);
    
    if (stock <= 0) {
      return {
        label: "Out of Stock",
        variant: "destructive" as const,
      };
    } else if (stock <= minimum) {
      return {
        label: "Low Stock",
        variant: "warning" as const,
      };
    }
    return {
      label: "In Stock",
      variant: "default" as const,
    };
  };

  const isExpiringSoon = (date: string | null) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const today = new Date();
    return expiryDate < today;
  };

  const getFilteredSalesData = () => {
    switch(timeFilter) {
      case 'week':
        return EXAMPLE_WEEKLY_SALES;
      case 'year':
        return EXAMPLE_YEARLY_SALES;
      default:
        return EXAMPLE_SALES_DATA;
    }
  };

  const filteredIngredients = ingredients?.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const outOfStockIngredients = filteredIngredients?.filter(
    (ingredient) => ingredient.current_stock <= 0
  );

  const inStockIngredients = filteredIngredients?.filter(
    (ingredient) => ingredient.current_stock > 0
  );

  const expiredIngredients = filteredIngredients?.filter(
    (ingredient) => isExpired(ingredient.expiry_date)
  );

  const lowStockCount = filteredIngredients?.filter(
    (i) => i.current_stock > 0 && i.current_stock <= i.minimum_stock
  ).length || 0;

  const healthyStockCount = filteredIngredients?.filter(
    (i) => i.current_stock > i.minimum_stock
  ).length || 0;

  const totalValue = filteredIngredients?.reduce(
    (sum, i) => sum + i.current_stock * i.cost_per_unit,
    0
  ) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center">Loading inventory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-primary-foreground">
              Inventory Management
            </h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent-dark">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Ingredient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Ingredient</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Ingredient Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Current Stock"
                      value={formData.current_stock}
                      onChange={(e) =>
                        setFormData({ ...formData, current_stock: e.target.value })
                      }
                      required
                    />
                    <Input
                      placeholder="Unit (e.g., kg, L)"
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Minimum Stock"
                      value={formData.minimum_stock}
                      onChange={(e) =>
                        setFormData({ ...formData, minimum_stock: e.target.value })
                      }
                      required
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Cost per Unit"
                      value={formData.cost_per_unit}
                      onChange={(e) =>
                        setFormData({ ...formData, cost_per_unit: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) =>
                      setFormData({ ...formData, expiry_date: e.target.value })
                    }
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-accent text-white">
                      Add Ingredient
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Ingredient</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEdit} className="space-y-4">
                <Input
                  placeholder="Ingredient Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Current Stock"
                    value={formData.current_stock}
                    onChange={(e) =>
                      setFormData({ ...formData, current_stock: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Unit (e.g., kg, L)"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Minimum Stock"
                    value={formData.minimum_stock}
                    onChange={(e) =>
                      setFormData({ ...formData, minimum_stock: e.target.value })
                    }
                    required
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Cost per Unit"
                    value={formData.cost_per_unit}
                    onChange={(e) =>
                      setFormData({ ...formData, cost_per_unit: e.target.value })
                    }
                    required
                  />
                </div>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) =>
                    setFormData({ ...formData, expiry_date: e.target.value })
                  }
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-accent text-white">
                    Update Ingredient
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={transactionData.quantity}
                  onChange={(e) =>
                    setTransactionData({ ...transactionData, quantity: e.target.value })
                  }
                  required
                />
                <Input
                  type="text"
                  placeholder="Transaction Type"
                  value={transactionData.transaction_type}
                  onChange={(e) =>
                    setTransactionData({ ...transactionData, transaction_type: e.target.value })
                  }
                  required
                />
                <Textarea
                  placeholder="Notes"
                  value={transactionData.notes}
                  onChange={(e) =>
                    setTransactionData({ ...transactionData, notes: e.target.value })
                  }
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsTransactionDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-accent text-white">
                    Add Transaction
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Tabs defaultValue="current">
            <TabsList className="mb-4">
              <TabsTrigger value="current">Current Stock</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              <Card className="mb-8">
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search ingredients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </Card>

              <InventoryTable
                ingredients={outOfStockIngredients || []}
                getStockStatus={getStockStatus}
                isExpiringSoon={isExpiringSoon}
                title="Out of Stock Items"
                className="mb-8"
              />

              <InventoryTable
                ingredients={inStockIngredients || []}
                getStockStatus={getStockStatus}
                isExpiringSoon={isExpiringSoon}
                title="Current Stock"
              />
            </TabsContent>

            <TabsContent value="history">
              <InventoryHistory />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-6">
                <TimeFrameSelector
                  timeFilter={timeFilter}
                  setTimeFilter={setTimeFilter}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RevenueChart
                    data={getFilteredSalesData()}
                    timeFilter={timeFilter}
                  />

                  <ProductPerformance products={EXAMPLE_PRODUCT_METRICS} />

                  <InventoryHealth
                    expiredCount={expiredIngredients?.length || 0}
                    lowStockCount={lowStockCount}
                    healthyStockCount={healthyStockCount}
                    totalValue={totalValue}
                  />

                  {/* Stock Movement Chart */}
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Stock Movement Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={EXAMPLE_TOP_PRODUCTS}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sales" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
