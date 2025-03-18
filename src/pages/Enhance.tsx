import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageUploader from '@/components/ImageUploader';
import EnhancementOptions, { EnhancementOption, EnhancementStrengthParams } from '@/components/EnhancementOptions';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { enhancementEngine } from '@/lib/enhancementEngine';
import { toast } from 'sonner';

const DEFAULT_ENHANCEMENT_PARAMS: EnhancementStrengthParams = {
  detailLevel: 70,
  colorIntensity: 60,
  noiseReduction: 50,
  sharpness: 65,
  brightness: 0,
  contrast: 10
};

const Enhance = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [enhancementOption, setEnhancementOption] = useState<EnhancementOption>('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<any | null>(null);
  const [enhancementCount, setEnhancementCount] = useState(0);
  const [enhancementParams, setEnhancementParams] = useState<EnhancementStrengthParams>(DEFAULT_ENHANCEMENT_PARAMS);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [userRating, setUserRating] = useState<'thumbsUp' | 'thumbsDown' | null>(null);
  
  useEffect(() => {
    const initializeEngine = async () => {
      setProcessingStage('Initializing AI models...');
      const success = await enhancementEngine.initialize();
      
      if (success) {
        console.log('Enhancement engine initialized successfully');
        setProcessingStage('');
      } else {
        console.error('Enhancement engine initialization failed');
        toast.error('Failed to initialize enhancement engine. Please reload the page.');
      }
    };
    
    initializeEngine();
  }, []);
  
  const handleImageSelected = (file: File) => {
    setSelectedImage(file);
    setEnhancementResult(null);
    setUserRating(null);
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
    
    setIsProcessing(true);
    setProcessingStage('Analyzing image...');
    toast.info('Processing your image with advanced AI enhancement...');
    
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
      setEnhancementCount(count => count + 1);
      setUserRating(null);
      
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast.error('Enhancement failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };
  
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            
            <h1 className="heading-2 mt-4 mb-2">Enhance Your Image</h1>
            <p className="text-muted-foreground text-lg">
              Upload your photo and let our advanced AI models (Real-ESRGAN & SwinIR) transform your images with stunning detail.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <ImageUploader onImageSelected={handleImageSelected} />
              
              {selectedImage && (
                <EnhancementOptions 
                  selectedOption={enhancementOption}
                  onOptionSelected={handleEnhancementOptionSelected}
                  isProcessing={isProcessing}
                  onEnhance={handleEnhance}
                  enhancementParams={enhancementParams}
                  onParamsChange={setEnhancementParams}
                  hasResult={!!enhancementResult}
                  onResetParams={resetEnhancementParams}
                />
              )}
              
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
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {isProcessing ? (
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
              ) : enhancementResult ? (
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
              ) : (
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
              )}
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          20% { width: 20%; }
          50% { width: 50%; }
          70% { width: 70%; }
          90% { width: 90%; }
          100% { width: 95%; }
        }
        
        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Enhance;
