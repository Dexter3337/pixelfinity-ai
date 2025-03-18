
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Download, Share } from 'lucide-react';
import { Link } from 'react-router-dom';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { toast } from 'sonner';

interface ResultSectionProps {
  enhancementResult: any;
  selectedImage: File | null;
}

const ResultSection = ({ enhancementResult, selectedImage }: ResultSectionProps) => {
  const [userRating, setUserRating] = useState<'thumbsUp' | 'thumbsDown' | null>(null);
  
  const handleUserRating = (isPositive: boolean) => {
    setUserRating(isPositive ? 'thumbsUp' : 'thumbsDown');
    
    if (isPositive) {
      toast.success('Thanks for your positive feedback!');
    } else {
      toast.info('Thanks for your feedback. We\'ll use it to improve our enhancement algorithms.');
    }
  };
  
  const handleDownload = () => {
    if (!enhancementResult) return;
    
    const link = document.createElement('a');
    link.href = enhancementResult.after;
    link.download = `enhanced-${selectedImage?.name || 'image'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Image downloaded successfully.');
  };
  
  const handleShare = async () => {
    if (!enhancementResult) return;
    
    try {
      const response = await fetch(enhancementResult.after);
      const blob = await response.blob();
      
      if (navigator.share) {
        await navigator.share({
          files: [new File([blob], 'enhanced-image.jpg', { type: 'image/jpeg' })],
          title: 'Enhanced Image',
          text: 'Check out this image enhanced with PixelEnhance AI!'
        });
        
        toast.success('Image shared successfully.');
      } else {
        toast.error('Sharing is not supported in your browser.');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      toast.error('Failed to share image.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-6 rounded-xl shadow-lg">
        <BeforeAfterSlider 
          beforeImage={enhancementResult.before}
          afterImage={enhancementResult.after}
          metrics={enhancementResult.metrics}
          className="w-full rounded-lg overflow-hidden"
        />
        
        <div className="mt-6 space-y-4">
          {enhancementResult.appliedEnhancements && enhancementResult.appliedEnhancements.length > 0 && (
            <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
              <span className="font-medium">Applied Enhancements:</span>{' '}
              {enhancementResult.appliedEnhancements.join(', ')}
            </div>
          )}
          
          <div className="flex items-center justify-between border-t border-b border-gray-200 py-3">
            <span className="text-sm font-medium">Was this enhancement helpful?</span>
            <div className="flex gap-2">
              <Button
                variant={userRating === 'thumbsUp' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleUserRating(true)}
                className="gap-1.5"
              >
                <ThumbsUp className="h-4 w-4" />
                Yes
              </Button>
              <Button
                variant={userRating === 'thumbsDown' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleUserRating(false)}
                className="gap-1.5"
              >
                <ThumbsDown className="h-4 w-4" />
                No
              </Button>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1 rounded-full"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button 
              className="flex-1 rounded-full"
              onClick={handleShare}
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-6">
        <p className="text-muted-foreground text-sm mb-4">
          Want to enhance more photos? Check out our affordable plans.
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/pricing">
            View Pricing
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ResultSection;
