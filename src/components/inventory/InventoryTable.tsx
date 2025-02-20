
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface Ingredient {
  id: string;
  name: string;
  current_stock: number;
  unit: string;
  minimum_stock: number;
  cost_per_unit: number;
  expiry_date: string | null;
}

interface InventoryTableProps {
  ingredients: Ingredient[];
  getStockStatus: (ingredient: Ingredient) => { label: string; variant: "default" | "destructive" | "warning" };
  isExpiringSoon: (date: string | null) => boolean;
  title?: string;
  className?: string;
}

const InventoryTable = ({
  ingredients,
  getStockStatus,
  isExpiringSoon,
  title,
  className,
}: InventoryTableProps) => {
  if (!ingredients?.length) return null;

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {title && <h2 className="text-xl font-semibold p-4">{title}</h2>}
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
          {ingredients.map((ingredient) => (
            <TableRow key={ingredient.id}>
              <TableCell className="font-medium">{ingredient.name}</TableCell>
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
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryTable;
