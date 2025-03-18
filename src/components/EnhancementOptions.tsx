
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sun, 
  Moon, 
  Sparkles, 
  CameraIcon, 
  ImageIcon,
  Layers,
  Palette
} from 'lucide-react';

export type EnhancementOption = 
  | 'auto'
  | 'hdr'
  | 'night'
  | 'portrait'
  | 'color'
  | 'detail'
  | 'style';

interface EnhancementOptionsProps {
  onOptionSelected: (option: EnhancementOption) => void;
  selectedOption: EnhancementOption;
  isProcessing: boolean;
  onEnhance: () => void;
}

interface EnhancementItem {
  id: EnhancementOption;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const enhancementOptions: EnhancementItem[] = [
  {
    id: 'auto',
    name: 'Auto Enhance',
    icon: <Sparkles className="h-5 w-5" />,
    description: 'Our AI analyzes your image and applies optimal adjustments using Real-ESRGAN'
  },
  {
    id: 'hdr',
    name: 'HDR Effect',
    icon: <Sun className="h-5 w-5" />,
    description: 'Dramatically expands dynamic range with our advanced tone mapping algorithm'
  },
  {
    id: 'night',
    name: 'Night Mode',
    icon: <Moon className="h-5 w-5" />,
    description: 'Specialized low-light enhancement with SwinIR noise reduction technology'
  },
  {
    id: 'portrait',
    name: 'Portrait',
    icon: <CameraIcon className="h-5 w-5" />,
    description: 'Smart skin tone preservation with facial feature enhancement'
  },
  {
    id: 'color',
    name: 'Color Pop',
    icon: <Palette className="h-5 w-5" />,
    description: 'Adaptive saturation boost that brings vibrant colors while maintaining balance'
  },
  {
    id: 'detail',
    name: 'Detail Boost',
    icon: <Layers className="h-5 w-5" />,
    description: 'Advanced sharpening algorithm with super-resolution for remarkable detail'
  },
  {
    id: 'style',
    name: 'Style Transfer',
    icon: <ImageIcon className="h-5 w-5" />,
    description: 'Professional cinematic color grading with teal-orange contrast'
  }
];

const EnhancementOptions = ({ 
  onOptionSelected, 
  selectedOption,
  isProcessing,
  onEnhance
}: EnhancementOptionsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Enhancement Options</h3>
      <p className="text-muted-foreground mb-4">
        Choose how you'd like to enhance your image, or let our advanced AI automatically select the best options.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {enhancementOptions.map((option) => (
          <Card 
            key={option.id}
            className={`hover:border-primary/50 cursor-pointer transition-all duration-300 ${
              selectedOption === option.id 
                ? 'border-primary shadow-md bg-primary/5' 
                : 'border-gray-200'
            }`}
            onClick={() => !isProcessing && onOptionSelected(option.id)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-full ${
                selectedOption === option.id 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {option.icon}
              </div>
              <div>
                <h4 className="font-medium">{option.name}</h4>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="pt-4">
        <Button 
          disabled={isProcessing}
          className="w-full rounded-full text-base py-6"
          onClick={onEnhance}
        >
          {isProcessing ? 'Enhancing Image...' : 'Enhance Image with AI'}
        </Button>
      </div>
    </div>
  );
};

export default EnhancementOptions;
