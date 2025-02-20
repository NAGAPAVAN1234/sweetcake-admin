
import { Button } from "@/components/ui/button";

type TimeFilter = 'week' | 'month' | 'year';

interface TimeFrameSelectorProps {
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
}

const TimeFrameSelector = ({ timeFilter, setTimeFilter }: TimeFrameSelectorProps) => {
  return (
    <div className="flex gap-4 mb-6">
      <Button
        variant={timeFilter === 'week' ? 'default' : 'outline'}
        onClick={() => setTimeFilter('week')}
      >
        Weekly
      </Button>
      <Button
        variant={timeFilter === 'month' ? 'default' : 'outline'}
        onClick={() => setTimeFilter('month')}
      >
        Monthly
      </Button>
      <Button
        variant={timeFilter === 'year' ? 'default' : 'outline'}
        onClick={() => setTimeFilter('year')}
      >
        Yearly
      </Button>
    </div>
  );
};

export default TimeFrameSelector;
