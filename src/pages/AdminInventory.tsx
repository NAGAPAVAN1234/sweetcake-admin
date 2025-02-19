
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

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

const AdminInventory = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    current_stock: "",
    unit: "",
    minimum_stock: "",
    cost_per_unit: "",
    expiry_date: "",
  });

  const { data: ingredients, isLoading } = useQuery<Ingredient[]>({
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add ingredient",
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

  const filteredIngredients = ingredients?.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  <div>
                    <Input
                      placeholder="Ingredient Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
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
                  <div>
                    <Input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) =>
                        setFormData({ ...formData, expiry_date: e.target.value })
                      }
                    />
                  </div>
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

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Cost per Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIngredients?.map((ingredient) => (
                  <TableRow key={ingredient.id}>
                    <TableCell className="font-medium">
                      {ingredient.name}
                    </TableCell>
                    <TableCell>
                      {ingredient.current_stock} / {ingredient.minimum_stock}
                    </TableCell>
                    <TableCell>{ingredient.unit}</TableCell>
                    <TableCell>${ingredient.cost_per_unit}</TableCell>
                    <TableCell>
                      <Badge variant={getStockStatus(ingredient).variant}>
                        {getStockStatus(ingredient).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {ingredient.expiry_date ? (
                          <>
                            {new Date(ingredient.expiry_date).toLocaleDateString()}
                            {isExpiringSoon(ingredient.expiry_date) && (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            )}
                          </>
                        ) : (
                          "N/A"
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredIngredients?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No ingredients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
