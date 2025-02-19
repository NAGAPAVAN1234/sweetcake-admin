
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type InventoryTransaction = {
  id: string;
  ingredient_id: string;
  quantity: number;
  transaction_type: string;
  notes: string;
  created_at: string;
  ingredients: {
    name: string;
    unit: string;
  };
};

const EXAMPLE_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: "1",
    ingredient_id: "1",
    quantity: -5,
    transaction_type: "order_usage",
    notes: "Used in order #123",
    created_at: new Date(2024, 3, 15).toISOString(),
    ingredients: {
      name: "Flour",
      unit: "kg"
    }
  },
  {
    id: "2",
    ingredient_id: "2",
    quantity: 10,
    transaction_type: "restock",
    notes: "Weekly restock",
    created_at: new Date(2024, 3, 14).toISOString(),
    ingredients: {
      name: "Sugar",
      unit: "kg"
    }
  },
  {
    id: "3",
    ingredient_id: "3",
    quantity: -2,
    transaction_type: "order_usage",
    notes: "Used in order #124",
    created_at: new Date(2024, 3, 14).toISOString(),
    ingredients: {
      name: "Chocolate",
      unit: "kg"
    }
  },
  {
    id: "4",
    ingredient_id: "1",
    quantity: 15,
    transaction_type: "manual_addition",
    notes: "Emergency stock addition",
    created_at: new Date(2024, 3, 13).toISOString(),
    ingredients: {
      name: "Flour",
      unit: "kg"
    }
  },
  {
    id: "5",
    ingredient_id: "4",
    quantity: -3,
    transaction_type: "order_usage",
    notes: "Used in order #125",
    created_at: new Date(2024, 3, 13).toISOString(),
    ingredients: {
      name: "Butter",
      unit: "kg"
    }
  },
  {
    id: "6",
    ingredient_id: "5",
    quantity: 8,
    transaction_type: "restock",
    notes: "Monthly supplier delivery",
    created_at: new Date(2024, 3, 12).toISOString(),
    ingredients: {
      name: "Eggs",
      unit: "dozen"
    }
  }
];

const InventoryHistory = () => {
  const { data: dbTransactions, isLoading } = useQuery({
    queryKey: ["inventoryTransactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_transactions")
        .select(`
          *,
          ingredients (
            name,
            unit
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as InventoryTransaction[];
    },
  });

  // Use example data if no transactions are found
  const transactions = dbTransactions?.length ? dbTransactions : EXAMPLE_TRANSACTIONS;

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "order_usage":
        return "destructive";
      case "manual_addition":
        return "secondary";
      case "restock":
        return "default";
      default:
        return "default";
    }
  };

  // Process data for charts
  const ingredientUsageData = React.useMemo(() => {
    if (!transactions) return [];
    
    const usage = transactions.reduce((acc, transaction) => {
      const name = transaction.ingredients?.name || 'Unknown';
      if (!acc[name]) {
        acc[name] = { name, usage: 0 };
      }
      acc[name].usage += Math.abs(transaction.quantity);
      return acc;
    }, {} as Record<string, { name: string; usage: number }>);

    return Object.values(usage).sort((a, b) => b.usage - a.usage).slice(0, 5);
  }, [transactions]);

  const transactionTypeData = React.useMemo(() => {
    if (!transactions) return [];
    
    const types = transactions.reduce((acc, transaction) => {
      const type = transaction.transaction_type;
      if (!acc[type]) {
        acc[type] = { name: type, value: 0 };
      }
      acc[type].value++;
      return acc;
    }, {} as Record<string, { name: string; value: number }>);

    return Object.values(types);
  }, [transactions]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (isLoading) {
    return <div className="text-center py-4">Loading transaction history...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Top 5 Most Used Ingredients</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ingredientUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usage" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Transaction Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={transactionTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {transactionTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Ingredient</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{transaction.ingredients?.name}</TableCell>
                <TableCell>
                  {transaction.quantity} {transaction.ingredients?.unit}
                </TableCell>
                <TableCell>
                  <Badge variant={getTransactionTypeColor(transaction.transaction_type)}>
                    {transaction.transaction_type.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InventoryHistory;
