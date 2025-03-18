
import { Share } from 'lucide-react';

const EmptyResultSection = () => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-xl">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Share className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Result Yet</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Upload an image and enhance it to see the before and after comparison here.
        </p>
      </div>
    </div>
  );
};

export default EmptyResultSection;
