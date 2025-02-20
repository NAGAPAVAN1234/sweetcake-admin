
import { Card } from "@/components/ui/card";

interface InventoryHealthProps {
  expiredCount: number;
  lowStockCount: number;
  healthyStockCount: number;
  totalValue: number;
}

const InventoryHealth = ({ 
  expiredCount, 
  lowStockCount, 
  healthyStockCount, 
  totalValue 
}: InventoryHealthProps) => {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Inventory Health</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-red-100 rounded-lg">
          <p className="text-sm text-red-600">Expired Items</p>
          <p className="text-2xl font-bold text-red-700">{expiredCount}</p>
        </div>
        <div className="p-4 bg-yellow-100 rounded-lg">
          <p className="text-sm text-yellow-600">Low Stock Items</p>
          <p className="text-2xl font-bold text-yellow-700">{lowStockCount}</p>
        </div>
        <div className="p-4 bg-green-100 rounded-lg">
          <p className="text-sm text-green-600">Healthy Stock</p>
          <p className="text-2xl font-bold text-green-700">{healthyStockCount}</p>
        </div>
        <div className="p-4 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-600">Total Value</p>
          <p className="text-2xl font-bold text-blue-700">${totalValue.toFixed(2)}</p>
        </div>
      </div>
    </Card>
  );
};

export default InventoryHealth;
