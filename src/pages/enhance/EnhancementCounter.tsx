
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';

interface EnhancementCounterProps {
  enhancementCount: number;
}

const EnhancementCounter = ({ enhancementCount }: EnhancementCounterProps) => {
  const maxFreeEnhancements = 3;
  const remaining = Math.max(0, maxFreeEnhancements - enhancementCount);
  const percentUsed = Math.min(100, (enhancementCount / maxFreeEnhancements) * 100);
  
  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Free Enhancements Remaining
        </h3>
        {remaining === 0 && (
          <Link 
            to="/pricing" 
            className="inline-flex items-center text-xs font-medium text-primary hover:underline"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Upgrade for unlimited
          </Link>
        )}
      </div>
      <Progress value={percentUsed} className="h-3" />
      <div className="flex justify-between mt-2">
        <p className="text-xs text-muted-foreground">
          {remaining} of {maxFreeEnhancements} remaining
        </p>
        <p className="text-xs text-muted-foreground">
          {enhancementCount} used
        </p>
      </div>
    </div>
  );
};

export default EnhancementCounter;
