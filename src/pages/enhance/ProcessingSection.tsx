
import { Sparkles } from 'lucide-react';

interface ProcessingSectionProps {
  processingStage: string;
}

const ProcessingSection = ({ processingStage }: ProcessingSectionProps) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-xl">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <h3 className="text-lg font-medium mb-2">Enhancing Your Image</h3>
        <p className="text-muted-foreground text-sm mb-4">
          {processingStage || 'Processing with advanced AI algorithms...'}
        </p>
        
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
          <div className="bg-primary h-2 rounded-full animate-progress"></div>
        </div>
        
        <p className="text-xs text-muted-foreground">
          This may take a few moments depending on the image size and complexity.
        </p>
      </div>
    </div>
  );
};

export default ProcessingSection;
