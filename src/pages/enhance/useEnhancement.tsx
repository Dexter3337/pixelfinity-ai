
import { useState, useEffect } from 'react';
import { enhancementEngine } from '@/lib/enhancementEngine';
import { toast } from 'sonner';
import { EnhancementOption, EnhancementStrengthParams } from '@/components/EnhancementOptions';

const DEFAULT_ENHANCEMENT_PARAMS: EnhancementStrengthParams = {
  detailLevel: 70,
  colorIntensity: 60,
  noiseReduction: 50,
  sharpness: 65,
  brightness: 0,
  contrast: 10
};

// Maximum number of free enhancements per day
const FREE_TIER_LIMIT = 3;

export const useEnhancement = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [enhancementOption, setEnhancementOption] = useState<EnhancementOption>('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<any | null>(null);
  const [enhancementCount, setEnhancementCount] = useState(() => {
    // Initialize from localStorage or default to 0
    const savedCount = localStorage.getItem('enhancementCount');
    return savedCount ? parseInt(savedCount, 10) : 0;
  });
  const [enhancementParams, setEnhancementParams] = useState<EnhancementStrengthParams>(DEFAULT_ENHANCEMENT_PARAMS);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [isEngineInitialized, setIsEngineInitialized] = useState(false);

  useEffect(() => {
    const initializeEngine = async () => {
      try {
        setProcessingStage('Initializing enhancement engine...');
        const success = await enhancementEngine.initialize();
        
        setIsEngineInitialized(success);
        if (success) {
          console.log('Enhancement engine initialized successfully');
        } else {
          console.log('Enhancement engine using fallback mode');
        }
      } catch (error) {
        console.error('Enhancement engine initialization error:', error);
      } finally {
        setProcessingStage('');
      }
    };
    
    initializeEngine();
  }, []);
  
  useEffect(() => {
    // Save enhancement count to localStorage whenever it changes
    localStorage.setItem('enhancementCount', enhancementCount.toString());
  }, [enhancementCount]);
  
  const handleImageSelected = (file: File) => {
    setSelectedImage(file);
    setEnhancementResult(null);
  };
  
  const handleEnhancementOptionSelected = (option: EnhancementOption) => {
    setEnhancementOption(option);
    
    switch (option) {
      case 'hdr':
        setEnhancementParams({
          ...enhancementParams,
          detailLevel: 75,
          contrast: 30,
          brightness: 10,
        });
        break;
      case 'night':
        setEnhancementParams({
          ...enhancementParams,
          noiseReduction: 80,
          brightness: 40,
          contrast: 20,
        });
        break;
      case 'portrait':
        setEnhancementParams({
          ...enhancementParams,
          detailLevel: 65,
          noiseReduction: 60,
          sharpness: 60,
        });
        break;
      case 'color':
        setEnhancementParams({
          ...enhancementParams,
          colorIntensity: 80,
          contrast: 15,
        });
        break;
      case 'detail':
        setEnhancementParams({
          ...enhancementParams,
          detailLevel: 90,
          sharpness: 85,
          noiseReduction: 30,
        });
        break;
      default:
        break;
    }
  };
  
  const resetEnhancementParams = () => {
    setEnhancementParams(DEFAULT_ENHANCEMENT_PARAMS);
    toast.info('Parameters reset to defaults');
  };
  
  const handleEnhance = async () => {
    if (!selectedImage) {
      toast.error('Please upload an image first.');
      return;
    }
    
    // Check if user has reached free tier limit
    if (enhancementCount >= FREE_TIER_LIMIT) {
      toast.error('You have reached your free enhancement limit. Please upgrade to continue.');
      toast.info('Check our pricing page for subscription options.');
      return;
    }
    
    setIsProcessing(true);
    setProcessingStage('Analyzing image...');
    toast.info('Processing your image with AI enhancement...');
    
    try {
      setProcessingStage('Applying enhancement algorithms...');
      const result = await enhancementEngine.enhance(selectedImage, enhancementOption, enhancementParams);
      
      setProcessingStage('Finalizing results...');
      
      if (result.metrics && result.metrics.improvement < 10) {
        toast.warning('Only minor improvements were possible for this image.');
      } else {
        toast.success('Image enhanced successfully!');
      }
      
      setEnhancementResult(result);
      setEnhancementCount(prevCount => prevCount + 1);
      
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast.error('Enhancement failed. Our systems are experiencing issues. Please try again later.');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  return {
    selectedImage,
    enhancementOption,
    isProcessing,
    enhancementResult,
    enhancementCount,
    enhancementParams,
    processingStage,
    isEngineInitialized,
    handleImageSelected,
    handleEnhancementOptionSelected,
    resetEnhancementParams,
    handleEnhance,
    setEnhancementParams
  };
};
