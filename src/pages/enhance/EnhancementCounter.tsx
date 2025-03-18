
import { Link } from 'react-router-dom';

interface EnhancementCounterProps {
  enhancementCount: number;
}

const EnhancementCounter = ({ enhancementCount }: EnhancementCounterProps) => {
  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        Enhancements Remaining Today
      </h3>
      <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-primary h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(0, 100 - enhancementCount * 10)}%` }}
        ></div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        You have {Math.max(0, 10 - enhancementCount)} free enhancements remaining today. 
        <Link to="/pricing" className="text-primary hover:underline ml-1">
          Upgrade for more
        </Link>
      </p>
    </div>
  );
};

export default EnhancementCounter;
