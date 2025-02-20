
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data: any[];
  timeFilter: 'week' | 'month' | 'year';
}

const RevenueChart = ({ data, timeFilter }: RevenueChartProps) => {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">
        {timeFilter === 'week' ? 'Weekly' : timeFilter === 'month' ? 'Monthly' : 'Yearly'} Revenue
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={timeFilter === 'week' ? 'day' : timeFilter === 'month' ? 'month' : 'year'} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          {timeFilter === 'week' && <Line type="monotone" dataKey="orders" stroke="#82ca9d" />}
          {timeFilter === 'year' && <Line type="monotone" dataKey="growth" stroke="#82ca9d" />}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default RevenueChart;
