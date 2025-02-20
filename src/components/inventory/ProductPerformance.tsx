
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductMetric {
  name: string;
  sales: number;
  revenue: number;
  rating: number;
  reorderRate: number;
}

interface ProductPerformanceProps {
  products: ProductMetric[];
}

const ProductPerformance = ({ products }: ProductPerformanceProps) => {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Top Products Performance</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Reorder Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.slice(0, 5).map((product) => (
              <TableRow key={product.name}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sales}</TableCell>
                <TableCell>${product.revenue}</TableCell>
                <TableCell>⭐ {product.rating}</TableCell>
                <TableCell>{product.reorderRate}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ProductPerformance;
