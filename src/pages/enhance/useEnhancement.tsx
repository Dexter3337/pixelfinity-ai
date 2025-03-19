
import { useState, useEffect } from 'react';
import { enhancementEngine } from '@/lib/enhancementEngine';
import { enhanceImage } from '@/lib/imageEnhancement';
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
  const [usingFallback, setUsingFallback] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);

  useEffect(() => {
    const initializeEngine = async () => {
      try {
        setProcessingStage('Initializing enhancement engine...');
        // Try to initialize the enhancement engine
        const success = await enhancementEngine.initialize();
        
        setIsEngineInitialized(success);
        if (success) {
          console.log('Enhancement engine initialized successfully');
          setUsingFallback(false);
          setApiAvailable(true);
        } else {
          console.log('Enhancement engine using fallback mode');
          setUsingFallback(true);
          setApiAvailable(false);
          toast.info('Using local enhancement mode due to connection issues');
        }
      } catch (error) {
        console.error('Enhancement engine initialization error:', error);
        setUsingFallback(true);
        setApiAvailable(false);
        toast.info('Using local enhancement mode due to connection issues');
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
    
    // Apply preset parameters based on the selected enhancement option
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
    
    // Check if API is available
    if (!apiAvailable && !usingFallback) {
      toast.error('Enhancement services are currently unavailable. Please try again later.');
      return;
    }
    
    setIsProcessing(true);
    setProcessingStage('Analyzing image...');
    toast.info('Processing your image with AI enhancement...');
    
    try {
      let result;
      
      // Always use the fallback method from imageEnhancement.ts
      setProcessingStage('Applying enhancement algorithms...');
      result = await enhanceImage(selectedImage, enhancementOption, enhancementParams);
      
      setProcessingStage('Finalizing results...');
      
      if (result && result.metrics) {
        if (result.metrics.improvement < 10) {
          toast.warning('Only minor improvements were possible for this image.');
        } else {
          toast.success('Image enhanced successfully!');
        }
        
        setEnhancementResult(result);
        setEnhancementCount(prevCount => prevCount + 1);
      } else {
        throw new Error('Enhancement result is missing metrics');
      }
      
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast.error('Enhancement failed. Please try again with a different image or option.');
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
    usingFallback,
    apiAvailable,
    handleImageSelected,
    handleEnhancementOptionSelected,
    resetEnhancementParams,
    handleEnhance,
    setEnhancementParams
  };
};
