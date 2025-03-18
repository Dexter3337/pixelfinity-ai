
import { useState } from 'react';
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
  Contrast,
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
    description: 'Let AI detect and fix all issues automatically'
  },
  {
    id: 'hdr',
    name: 'HDR Effect',
    icon: <Sun className="h-5 w-5" />,
    description: 'Enhance dynamic range and color depth'
  },
  {
    id: 'night',
    name: 'Night Mode',
    icon: <Moon className="h-5 w-5" />,
    description: 'Optimize dark photos with reduced noise'
  },
  {
    id: 'portrait',
    name: 'Portrait',
    icon: <CameraIcon className="h-5 w-5" />,
    description: 'Perfect for enhancing portrait photos'
  },
  {
    id: 'color',
    name: 'Color Pop',
    icon: <Palette className="h-5 w-5" />,
    description: 'Vibrant colors with balanced tones'
  },
  {
    id: 'detail',
    name: 'Detail Boost',
    icon: <Layers className="h-5 w-5" />,
    description: 'Increase sharpness and fine details'
  },
  {
    id: 'style',
    name: 'Style Transfer',
    icon: <ImageIcon className="h-5 w-5" />,
    description: 'Apply professional photography styles'
  }
];

const EnhancementOptions = ({ 
  onOptionSelected, 
  selectedOption,
  isProcessing
}: EnhancementOptionsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Enhancement Options</h3>
      <p className="text-muted-foreground mb-4">
        Choose how you'd like to enhance your image, or let our AI automatically select the best options.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {enhancementOptions.map((option) => (
          <Card 
            key={option.id}
            className={`hover:border-primary/50 cursor-pointer transition-all ${
              selectedOption === option.id 
                ? 'border-primary/70 bg-primary/5 shadow-sm' 
                : 'border-gray-200'
            }`}
            onClick={() => !isProcessing && onOptionSelected(option.id)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                selectedOption === option.id 
                  ? 'bg-primary/10 text-primary' 
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
          className="w-full rounded-full"
        >
          {isProcessing ? 'Enhancing Image...' : 'Enhance Image'}
        </Button>
      </div>
    </div>
  );
};

export default EnhancementOptions;
