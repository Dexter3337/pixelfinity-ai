import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageUploader from '@/components/ImageUploader';
import EnhancementOptions, { EnhancementOption, QualityOption } from '@/components/EnhancementOptions';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import ProcessingAnimation from '@/components/ProcessingAnimation';
import { enhancementEngine, EnhancementResult, recordImageEnhancement } from '@/lib/imageEnhancement';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const Enhance = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [enhancementOption, setEnhancementOption] = useState<EnhancementOption>('auto');
  const [qualityOption, setQualityOption] = useState<QualityOption>('4x');
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
  const [enhancementCount, setEnhancementCount] = useState(0);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [processingStep, setProcessingStep] = useState('');
  const { user, subscription, refreshUserData } = useAuth();

  useEffect(() => {
    enhancementEngine.initialize()
      .then(success => {
        if (success) {
          console.log('Enhancement engine initialized successfully');
          setApiAvailable(true);
        } else {
          console.error('Enhancement engine initialization failed');
          setApiAvailable(false);
          toast.error('Enhancement services are currently unavailable. Please try again later.');
        }
      });
      
    const toastListener = (event: Event) => {
      if ((event as CustomEvent).detail?.message) {
        setProcessingStep((event as CustomEvent).detail.message);
      }
    };
    
    document.addEventListener('sonner.info', toastListener);
    
    return () => {
      document.removeEventListener('sonner.info', toastListener);
    };
  }, []);

  const handleImageSelected = (file: File) => {
    if (subscription?.remaining_enhancements <= 0 && subscription?.plan !== 'unlimited') {
      toast.error('You have no enhancements remaining. Please upgrade your plan to continue.');
      return;
    }
    
    const maxSizeInBytes = (subscription?.max_file_size || 5) * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error(`File size exceeds ${subscription?.max_file_size || 5}MB limit for your plan. Please upload a smaller image.`);
      return;
    }
    
    setSelectedImage(file);
    setEnhancementResult(null);
  };

  const handleEnhance = async () => {
    if (!selectedImage) {
      toast.error('Please upload an image first.');
      return;
    }
    
    if (!apiAvailable) {
      toast.error('Enhancement services are currently unavailable. Please try again later.');
      return;
    }
    
    if (subscription?.remaining_enhancements <= 0 && subscription?.plan !== 'unlimited') {
      toast.error('You have no enhancements remaining. Please upgrade your plan to continue.');
      return;
    }
    
    setIsProcessing(true);
    setProcessingStep('Analyzing your image...');
    
    try {
      const result = await enhancementEngine.enhance(selectedImage, enhancementOption, qualityOption);
      
      setEnhancementResult(result);
      
      if (user) {
        await recordImageEnhancement(
          user.id,
          result.before,
          result.after,
          enhancementOption,
          qualityOption
        );
        
        await refreshUserData();
      }
      
      toast.success(`Image enhanced successfully with ${qualityOption} quality!`);
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast.error('Enhancement failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!enhancementResult) return;
    
    const link = document.createElement('a');
    link.href = enhancementResult.after;
    link.download = `enhanced-${qualityOption}-${selectedImage?.name || 'image'}.jpg`;
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
          text: 'Check out this image enhanced with Pixelfinity AI!'
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

  const getQualityDetails = () => {
    switch (qualityOption) {
      case '2x':
        return 'Low quality (2x upscale)';
      case '8x':
        return 'High quality (8x upscale)';
      default:
        return 'Medium quality (4x upscale)';
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
              Upload your blurry, low-quality photos and let our advanced AI models transform them with stunning detail.
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
                  onOptionSelected={setEnhancementOption}
                  isProcessing={isProcessing}
                  onEnhance={handleEnhance}
                  qualityOption={qualityOption}
                  onQualitySelected={setQualityOption}
                  apiAvailable={apiAvailable}
                />
              )}
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Enhancements Remaining Today
                </h3>
                <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: subscription?.plan === "unlimited" ? "100%" : 
                      `${Math.max(0, (subscription?.remaining_enhancements / (subscription?.plan === "pro" ? 10 : 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {subscription?.plan === "unlimited" ? (
                    "You have unlimited enhancements with your current plan."
                  ) : (
                    <>
                      You have {subscription?.remaining_enhancements || 0} enhancement{subscription?.remaining_enhancements !== 1 ? "s" : ""} remaining. 
                      <Link to="/pricing" className="text-primary hover:underline ml-1">
                        Upgrade for more
                      </Link>
                    </>
                  )}
                </p>
                
                {!apiAvailable && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-700 text-sm">
                      <strong>Note:</strong> Enhancement services are currently unavailable. Our team is working to restore them as soon as possible.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {enhancementResult ? (
                <div className="space-y-4">
                  <div className="glass-card p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Enhanced Result</h3>
                      <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {getQualityDetails()}
                      </span>
                    </div>
                    
                    <BeforeAfterSlider 
                      beforeImage={enhancementResult.before}
                      afterImage={enhancementResult.after}
                      className="w-full rounded-lg overflow-hidden"
                    />
                    
                    <div className="flex gap-4 mt-6">
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
                      Upload a blurry or low-quality image and enhance it to see the before and after comparison here.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      
      <ProcessingAnimation 
        isVisible={isProcessing}
        currentStep={processingStep}
      />
      
      <Footer />
    </div>
  );
};

export default Enhance;
