
import { useState } from 'react';
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Sun, 
  Moon, 
  Sparkles, 
  CameraIcon, 
  ImageIcon,
  Layers,
  Palette,
  RotateCcw,
  Sliders,
  Lock
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from 'react-router-dom';

export type EnhancementOption = 
  | 'auto'
  | 'hdr'
  | 'night'
  | 'portrait'
  | 'color'
  | 'detail'
  | 'style';

export interface EnhancementStrengthParams {
  detailLevel: number;      // 0-100
  colorIntensity: number;   // 0-100
  noiseReduction: number;   // 0-100
  sharpness: number;        // 0-100
  brightness: number;       // -100 to 100
  contrast: number;         // -100 to 100
}

interface EnhancementOptionsProps {
  onOptionSelected: (option: EnhancementOption) => void;
  selectedOption: EnhancementOption;
  isProcessing: boolean;
  onEnhance: () => void;
  enhancementParams: EnhancementStrengthParams;
  onParamsChange: (params: EnhancementStrengthParams) => void;
  hasResult: boolean;
  onResetParams: () => void;
  disabled?: boolean;
}

interface EnhancementItem {
  id: EnhancementOption;
  name: string;
  icon: React.ReactNode;
  description: string;
  premium?: boolean;
}

const enhancementOptions: EnhancementItem[] = [
  {
    id: 'auto',
    name: 'Auto Enhance',
    icon: <Sparkles className="h-5 w-5" />,
    description: 'Our AI analyzes your image and applies optimal adjustments'
  },
  {
    id: 'hdr',
    name: 'HDR Effect',
    icon: <Sun className="h-5 w-5" />,
    description: 'Dramatically expands dynamic range with our advanced tone mapping algorithm',
    premium: true
  },
  {
    id: 'night',
    name: 'Night Mode',
    icon: <Moon className="h-5 w-5" />,
    description: 'Specialized low-light enhancement with noise reduction technology',
    premium: true
  },
  {
    id: 'portrait',
    name: 'Portrait',
    icon: <CameraIcon className="h-5 w-5" />,
    description: 'Smart skin tone preservation with facial feature enhancement',
    premium: true
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
    description: 'Advanced sharpening algorithm with super-resolution for remarkable detail',
    premium: true
  },
  {
    id: 'style',
    name: 'Style Transfer',
    icon: <ImageIcon className="h-5 w-5" />,
    description: 'Professional cinematic color grading with teal-orange contrast',
    premium: true
  }
];

const EnhancementOptions = ({ 
  onOptionSelected, 
  selectedOption,
  isProcessing,
  onEnhance,
  enhancementParams,
  onParamsChange,
  hasResult,
  onResetParams,
  disabled = false
}: EnhancementOptionsProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleParamChange = (param: keyof EnhancementStrengthParams, value: number) => {
    onParamsChange({
      ...enhancementParams,
      [param]: value
    });
  };

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
            } ${disabled && 'opacity-75'}`}
            onClick={() => !isProcessing && !disabled && onOptionSelected(option.id)}
          >
            <CardContent className="p-4 flex items-center gap-3 relative">
              {disabled && option.premium && (
                <div className="absolute top-2 right-2">
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                </div>
              )}
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

      {/* Manual Adjustment Controls */}
      <Accordion type="single" collapsible className={disabled ? 'opacity-75 pointer-events-none' : ''}>
        <AccordionItem value="advanced-controls">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center">
              <Sliders className="h-4 w-4 mr-2" />
              Manual Adjustment Controls
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Detail Level</label>
                    <span className="text-xs text-muted-foreground">{enhancementParams.detailLevel}%</span>
                  </div>
                  <Slider 
                    value={[enhancementParams.detailLevel]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(values) => handleParamChange('detailLevel', values[0])}
                    disabled={isProcessing || disabled}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Color Intensity</label>
                    <span className="text-xs text-muted-foreground">{enhancementParams.colorIntensity}%</span>
                  </div>
                  <Slider 
                    value={[enhancementParams.colorIntensity]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(values) => handleParamChange('colorIntensity', values[0])}
                    disabled={isProcessing || disabled}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Noise Reduction</label>
                    <span className="text-xs text-muted-foreground">{enhancementParams.noiseReduction}%</span>
                  </div>
                  <Slider 
                    value={[enhancementParams.noiseReduction]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(values) => handleParamChange('noiseReduction', values[0])}
                    disabled={isProcessing || disabled}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Sharpness</label>
                    <span className="text-xs text-muted-foreground">{enhancementParams.sharpness}%</span>
                  </div>
                  <Slider 
                    value={[enhancementParams.sharpness]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(values) => handleParamChange('sharpness', values[0])}
                    disabled={isProcessing || disabled}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Brightness</label>
                    <span className="text-xs text-muted-foreground">{enhancementParams.brightness > 0 ? '+' : ''}{enhancementParams.brightness}%</span>
                  </div>
                  <Slider 
                    value={[enhancementParams.brightness]}
                    min={-100}
                    max={100}
                    step={1}
                    onValueChange={(values) => handleParamChange('brightness', values[0])}
                    disabled={isProcessing || disabled}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Contrast</label>
                    <span className="text-xs text-muted-foreground">{enhancementParams.contrast > 0 ? '+' : ''}{enhancementParams.contrast}%</span>
                  </div>
                  <Slider 
                    value={[enhancementParams.contrast]}
                    min={-100}
                    max={100}
                    step={1}
                    onValueChange={(values) => handleParamChange('contrast', values[0])}
                    disabled={isProcessing || disabled}
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onResetParams}
                disabled={isProcessing || disabled}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="pt-4">
        {disabled ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You've reached your free enhancement limit.
            </p>
            <Button 
              asChild
              className="w-full rounded-full text-base py-6"
            >
              <Link to="/pricing">
                Upgrade to Continue
              </Link>
            </Button>
          </div>
        ) : (
          <Button 
            disabled={isProcessing || disabled}
            className="w-full rounded-full text-base py-6"
            onClick={onEnhance}
          >
            {isProcessing ? 'Enhancing Image...' : hasResult ? 'Enhance Again' : 'Enhance Image with AI'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancementOptions;
