
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface EnhancementCounterProps {
  enhancementCount: number;
}

const EnhancementCounter = ({ enhancementCount }: EnhancementCounterProps) => {
  const maxFreeEnhancements = 3;
  const remaining = Math.max(0, maxFreeEnhancements - enhancementCount);
  const percentUsed = Math.min(100, (enhancementCount / maxFreeEnhancements) * 100);
  
  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        Free Enhancements Remaining Today
      </h3>
      <Progress value={percentUsed} className="h-3" />
      <p className="text-xs text-muted-foreground mt-2">
        You have {remaining} free enhancements remaining. 
        <Link to="/pricing" className="text-primary hover:underline ml-1">
          Upgrade for more
        </Link>
      </p>
    </div>
  );
};

export default EnhancementCounter;
