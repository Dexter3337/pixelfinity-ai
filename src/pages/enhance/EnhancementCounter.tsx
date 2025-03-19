
import { Link } from 'react-router-dom';

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
      <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-primary h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(0, 100 - percentUsed)}%` }}
        ></div>
      </div>
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
