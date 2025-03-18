
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageUploader from '@/components/ImageUploader';
import EnhancementOptions, { EnhancementOption } from '@/components/EnhancementOptions';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { enhancementEngine, EnhancementResult } from '@/lib/imageEnhancement';
import { toast } from 'sonner';

const Enhance = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [enhancementOption, setEnhancementOption] = useState<EnhancementOption>('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
  const [enhancementCount, setEnhancementCount] = useState(0);
  
  // Initialize enhancement engine
  useEffect(() => {
    enhancementEngine.initialize()
      .then(success => {
        if (success) {
          console.log('Enhancement engine initialized successfully');
        } else {
          console.error('Enhancement engine initialization failed');
          toast.error('Failed to initialize enhancement engine. Please reload the page.');
        }
      });
  }, []);
  
  const handleImageSelected = (file: File) => {
    setSelectedImage(file);
    setEnhancementResult(null);
  };
  
  const handleEnhance = async () => {
    if (!selectedImage) {
      toast.error('Please upload an image first.');
      return;
    }
    
    setIsProcessing(true);
    toast.info('Processing your image with advanced AI enhancement...');
    
    try {
      // Process the image
      const result = await enhancementEngine.enhance(selectedImage, enhancementOption);
      
      // Update state with result
      setEnhancementResult(result);
      setEnhancementCount(count => count + 1);
      
      toast.success('Image enhanced successfully!');
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast.error('Enhancement failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDownload = () => {
    if (!enhancementResult) return;
    
    // Create a download link
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
      // Convert data URL to blob
      const response = await fetch(enhancementResult.after);
      const blob = await response.blob();
      
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          files: [new File([blob], 'enhanced-image.jpg', { type: 'image/jpeg' })],
          title: 'Enhanced Image',
          text: 'Check out this image enhanced with PixelEnhance AI!'
        });
        
        toast.success('Image shared successfully.');
      } else {
        // Fallback for browsers that don't support Web Share API
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
            {/* Left Column: Upload and Options */}
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
                />
              )}
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Enhancements Remaining Today
                </h3>
                <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(0, 100 - enhancementCount * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  You have {Math.max(0, 1 - enhancementCount)} free enhancements remaining today. 
                  <Link to="/pricing" className="text-primary hover:underline ml-1">
                    Upgrade for more
                  </Link>
                </p>
              </div>
            </motion.div>
            
            {/* Right Column: Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {enhancementResult ? (
                <div className="space-y-4">
                  <div className="glass-card p-6 rounded-xl shadow-lg">
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
    </div>
  );
};

export default Enhance;
