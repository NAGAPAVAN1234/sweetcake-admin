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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import TimeFrameSelector from "./inventory/TimeFrameSelector";

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
  const [timeFilter, setTimeFilter] = React.useState<'week' | 'month' | 'year'>('month');

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

  const getFilteredTransactions = () => {
    const now = new Date();
    const filteredData = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.created_at);
      switch (timeFilter) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return transactionDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return transactionDate >= yearAgo;
        default:
          return true;
      }
    });
    return filteredData;
  };

  const exportToCSV = () => {
    const filteredData = getFilteredTransactions();
    const csvContent = [
      ["Date", "Ingredient", "Quantity", "Type", "Notes"],
      ...filteredData.map(transaction => [
        new Date(transaction.created_at).toLocaleDateString(),
        transaction.ingredients?.name,
        `${transaction.quantity} ${transaction.ingredients?.unit}`,
        transaction.transaction_type,
        transaction.notes
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `inventory-transactions-${timeFilter}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading transaction history...</div>;
  }

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <TimeFrameSelector timeFilter={timeFilter} setTimeFilter={setTimeFilter} />
        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}ly Data
        </Button>
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
            {filteredTransactions.map((transaction) => (
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
