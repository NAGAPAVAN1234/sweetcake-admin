
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

const InventoryHistory = () => {
  const { data: transactions, isLoading } = useQuery({
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

  if (isLoading) {
    return <div className="text-center py-4">Loading transaction history...</div>;
  }

  return (
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
          {!transactions?.length && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryHistory;
